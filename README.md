# EOL Conditional XBlock

![Coverage Status](/coverage-badge.svg)


![https://github.com/eol-uchile/eol-conditional-xblock/actions](https://github.com/eol-uchile/eol-conditional-xblock/workflows/Python%20application/badge.svg)

XBlock to show/hide one or more conditional component by a trigger component in the Open edX LMS. Editable within Open edx Studio.

## Configurations

LMS Django Admin:
- */admin/waffle/switch/*
    - Add Switch and set Enable: **completion.enable_completion_tracking**

## TESTS
**Prepare tests:**

- Install **act** following the instructions in [https://nektosact.com/installation/index.html](https://nektosact.com/installation/index.html)

**Run tests:**
- In a terminal at the root of the project
    ```
    act -W .github/workflows/pythonapp.yml
    ```

# Screenshots
![Screenshot-example](eolconditional/examples/09-09-2019.png?style=center)
