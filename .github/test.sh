#!/bin/dash

pip install -e /openedx/requirements/eolconditional

cd /openedx/requirements/eolconditional
cp /openedx/edx-platform/setup.cfg .
mkdir test_root
cd test_root/
ln -s /openedx/staticfiles .

cd /openedx/requirements/eolconditional

DJANGO_SETTINGS_MODULE=lms.envs.test EDXAPP_TEST_MONGO_HOST=mongodb pytest eolconditional/tests.py

rm -rf test_root
