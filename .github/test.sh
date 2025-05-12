#!/bin/bash

set -e

pip install --src /openedx/venv/src -e /openedx/requirements/app
pip install pytest-cov genbadge[coverage]

cd /openedx/requirements/app

mkdir test_root
ln -s /openedx/staticfiles ./test_root/

DJANGO_SETTINGS_MODULE=lms.envs.test EDXAPP_TEST_MONGO_HOST=mongodb pytest eolconditional/tests.py

rm -rf test_root

genbadge coverage
