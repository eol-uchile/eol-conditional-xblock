# -*- coding: utf-8 -*-

# Python Standard Libraries
import json
import logging

# Installed packages (via pip)
from django.test import Client
from mock import patch, Mock
from util.testing import UrlResetMixin

# Edx dependencies
from student.roles import CourseStaffRole
from student.tests.factories import UserFactory, CourseEnrollmentFactory
from xblock.field_data import DictFieldData
from xmodule.modulestore.tests.django_utils import ModuleStoreTestCase
from xmodule.modulestore.tests.factories import CourseFactory

# Internal project dependencies
from .eolconditional import EolConditionalXBlock

logger = logging.getLogger(__name__)

XBLOCK_RUNTIME_USER_ID = 99

class TestRequest(object):
    # pylint: disable=too-few-public-methods
    """
    Module helper for @json_handler
    """
    method = None
    body = None
    success = None
    params = None

class TestEolConditionalXBlock(UrlResetMixin, ModuleStoreTestCase):

    def make_an_xblock(self, **kw):
        """
        Helper method that creates a EolConditional XBlock
        """
        course = self.course
        runtime = Mock(
            course_id=course.id,
            service=Mock(
                return_value=Mock(_catalog={}),
            ),
            user_id=XBLOCK_RUNTIME_USER_ID,
        )
        scope_ids = Mock()
        field_data = DictFieldData(kw)
        xblock = EolConditionalXBlock(runtime, field_data, scope_ids)
        xblock.xmodule_runtime = runtime
        xblock.location = course.id  # Example of location
        xblock._edited_by = XBLOCK_RUNTIME_USER_ID
        return xblock

    def setUp(self):

        super(TestEolConditionalXBlock, self).setUp()

        # create a course
        self.course = CourseFactory.create(org='mss', course='999',
                                           display_name='xblock tests')

        # create Xblock
        self.xblock = self.make_an_xblock()
        # Patch the comment client user save method so it does not try
        # to create a new cc user when creating a django user
        with patch('student.models.cc.User.save'):
            uname = 'student'
            email = 'student@edx.org'
            password = 'test'

            # Create and enroll student
            self.student = UserFactory(
                username=uname, password=password, email=email)
            CourseEnrollmentFactory(
                user=self.student, course_id=self.course.id)

            # Create and Enroll staff user
            self.staff_user = UserFactory(
                username='staff_user',
                password='test',
                email='staff@edx.org',
                is_staff=True)
            CourseEnrollmentFactory(
                user=self.staff_user,
                course_id=self.course.id)
            CourseStaffRole(self.course.id).add_users(self.staff_user)

            # Log the student in
            self.client = Client()
            self.assertTrue(self.client.login(username=uname, password=password))

            # Log the user staff in
            self.staff_client = Client()
            self.assertTrue(
                self.staff_client.login(
                    username='staff_user',
                    password='test'))

    def test_workbench_scenarios(self):
        """
            Checks workbench scenarios title and basic scenario
        """
        result_title = 'EolConditionalXBlock'
        basic_scenario = "<eolconditional/>"
        test_result = self.xblock.workbench_scenarios()
        self.assertEqual(result_title, test_result[0][0])
        self.assertIn(basic_scenario, test_result[0][1])

    
    def test_validate_default_field_data(self):
        """
            Validate that xblock is created successfully
        """
        self.assertEqual(self.xblock.trigger_component, 'None')
        self.assertEqual(self.xblock.conditional_component, 'None')
        self.assertEqual(isinstance(self.xblock.get_conditional_component_list(), list), True)

    def test_student_view(self):
        """
            Check if xblock template loaded correctly
        """
        student_view = self.xblock.student_view()
        student_view_html = student_view.content
        self.assertIn('Eol Conditional XBlock', student_view_html)

    def test_studio_submit(self):
        """
            Test studio submit @XBlock.handler (CMS)
        """
        request = TestRequest()
        request.method = 'POST'
        post_data = {
            'trigger_component': 'trigger_component',
            'conditional_component': 'conditional_component'
        }
        data = json.dumps(post_data)
        request.body = data
        request.params = post_data
        response = self.xblock.studio_submit(request)
        self.assertEqual(self.xblock.trigger_component, 'trigger_component')
        self.assertEqual(self.xblock.conditional_component, 'conditional_component')


    def test_publish_completion(self):
        """
            Test publish completion @XBlock.json_handler
        """
        request = TestRequest()
        request.method = 'POST'
        post_data = {
            'completion': 0.5,
            'dispatch':'test'
        }
        data = json.dumps(post_data)
        request.body = data.encode('utf-8')
        response = self.xblock.publish_completion(request)
        self.assertEqual(response.json_body['result'], "ok")
    
    def test_publish_completion_error_completion_data_range(self):
        """
            Test publish completion @XBlock.json_handler error in completion data range
        """
        request = TestRequest()
        request.method = 'POST'
        post_data = {
            'completion': 2.5,
            'dispatch':'test'
        }
        data = json.dumps(post_data)
        request.body = data.encode('utf-8')
        response = self.xblock.publish_completion(request)
        self.assertEqual(response.json_body['error'], "Invalid completion value 2.5. Must be in range [0.0, 1.0]")
    
    def test_publish_completion_error_completion_data_type(self):
        """
            Test publish completion @XBlock.json_handler error in completion data type
        """
        request = TestRequest()
        request.method = 'POST'
        post_data = {
            'completion': '2.5',
            'dispatch':'test'
        }
        data = json.dumps(post_data)
        request.body = data.encode('utf-8')
        response = self.xblock.publish_completion(request)
        self.assertEqual(response.json_body['error'], "Invalid completion value 2.5. Must be a float in range [0.0, 1.0]")
    
    def test_publish_completion_completion_service_is_none(self):
        """
            Test publish completion @XBlock.json_handler error in No completion service found
        """
        # Mock runtime.service to return None
        self.xblock.runtime.service = Mock(return_value=None)
        request = TestRequest()
        request.method = 'POST'
        data = json.dumps({})
        request.body = data.encode('utf-8')
        response = self.xblock.publish_completion(request)
        self.assertEqual(response.json_body['error'], "No completion service found")
    
    def test_publish_completion_completion_service_completion_tracking_enabled_False(self):
        """
            Test publish completion @XBlock.json_handler error in Completion tracking is not enabled
        """
        # Mock runtime.service.completion_tracking_enabled to return False
        mock_completion_service = Mock()
        mock_completion_service.completion_tracking_enabled.return_value = False
        self.xblock.runtime.service = Mock(return_value=mock_completion_service)
        request = TestRequest()
        request.method = 'POST'
        data = json.dumps({})
        request.body = data.encode('utf-8')
        response = self.xblock.publish_completion(request)
        self.assertEqual(response.json_body['error'], "Completion tracking is not enabled and API calls are unexpected")

    def test_studio_view_render(self):
        """
            Check if xblock studio template loaded correctly
        """
        studio_view = self.xblock.studio_view()
        studio_view_html = studio_view.content
        self.assertIn('id="settings-tab"', studio_view_html)

    def test_author_view_render(self):
        """
            Check if xblock  author template loaded correctly
        """
        author_view = self.xblock.author_view()
        author_view_html = author_view.content
        self.assertIn('class="eolconditional_block"', author_view_html)
