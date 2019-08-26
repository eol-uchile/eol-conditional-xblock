import json
import pkg_resources

from django.template import Context, Template

from webob import Response

from xblock.core import XBlock
from xblock.fields import Integer, String, Boolean, Scope
from xblock.fragment import Fragment

# Make '_' a no-op so we can scrape strings
_ = lambda text: text


class EolConditionalXBlock(XBlock):

    display_name = String(
        display_name=_("Display Name"),
        help=_("Display name for this module"),
        default="Eol Conditional XBlock",
        scope=Scope.settings,
    )

    icon_class = String(
        default="other",
        scope=Scope.settings,
    )

    trigger_component = String(
        display_name = _("Id Componente Gatillante"),
        help = _("Indica el id del componente (problema) gatillante. Recuerda que son 32 caracteres alfanumericos, ejemplo: 4950f7e5541645aa920227e6dc0ea322"),
        default = "None",
        scope = Scope.settings,
    )

    conditional_component = String(
        display_name = _("Id Componente Condicional"),
        help = _("Indica el id del componente condicional. Recuerda que son 32 caracteres alfanumericos, ejemplo: 4950f7e5541645aa920227e6dc0ea322"),
        default = "None",
        scope = Scope.settings,
    )

    has_author_view = True

    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    def student_view(self, context=None):
        context_html = self.get_context()
        template = self.render_template('static/html/eolconditional.html', context_html)
        frag = Fragment(template)
        frag.add_css(self.resource_string("static/css/eolconditional.css"))
        frag.add_javascript(self.resource_string("static/js/src/eolconditional.js"))
        settings = {
            'trigger_component'     : self.trigger_component,
            'conditional_component' : self.conditional_component,
            'location'              : self.location
        }
        frag.initialize_js('EolConditionalXBlock', json_args=settings)
        return frag

    def studio_view(self, context=None):
        context_html = self.get_context()
        template = self.render_template('static/html/studio.html', context_html)
        frag = Fragment(template)
        frag.add_css(self.resource_string("static/css/eolconditional.css"))
        frag.add_javascript(self.resource_string("static/js/src/studio.js"))
        frag.initialize_js('EolConditionalStudioXBlock')
        return frag
    
    def author_view(self, context=None):
        context_html = self.get_context()
        template = self.render_template('static/html/author_view.html', context_html)
        frag = Fragment(template)
        frag.add_css(self.resource_string("static/css/eolconditional.css"))
        return frag

    @XBlock.handler
    def studio_submit(self, request, suffix=''):
        self.trigger_component = request.params['trigger_component']
        self.conditional_component = request.params['conditional_component']
        return Response(json.dumps({'result': 'success'}), content_type='application/json')

    def get_context(self):
        return {
            'field_trigger_component': self.fields['trigger_component'],
            'field_conditional_component': self.fields['conditional_component'],
            'xblock': self
        }

    def render_template(self, template_path, context):
        template_str = self.resource_string(template_path)
        template = Template(template_str)
        return template.render(Context(context))


    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("EolConditionalXBlock",
             """<eolconditional/>
             """),
        ]
