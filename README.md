# EOL Conditional XBlock

![https://github.com/eol-uchile/eol-conditional-xblock/actions](https://github.com/eol-uchile/eol-conditional-xblock/workflows/Python%20application/badge.svg)

XBlock to show/hide one or more conditional component by a trigger component in the Open edX LMS. Editable within Open edx Studio.

## Configurations

LMS Django Admin:
- */admin/waffle/switch/*
    - Add Switch and set Enable: **completion.enable_completion_tracking**

## TESTS
**Prepare tests:**

    > cd .github/
    > docker-compose run lms /openedx/requirements/eolconditional/.github/test.sh

# Screenshots
![Screenshot-example](eolconditional/examples/09-09-2019.png?style=center)
