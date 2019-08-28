function EolConditionalXBlock(runtime, element, settings) {


    $(function($) {
        $('.vert').filter('[data-id*="' + settings.location + '"]').hide(); // Hide eolconditional Xblock
        set_visibility();
        var submit_button = $('.submit').filter('[aria-describedby*="' + settings.trigger_component + '"]');
        var submit_button_text = submit_button.find('span:first').text(); // getting 'original state' of submit button
        submit_button.click(query_await);

        function query_await() {
            //TODO: improve this code
            var refreshIntervalId = setInterval(function() {
                let new_submit_button_text = $('.submit').filter('[aria-describedby*="' + settings.trigger_component + '"]').find('span:first').text();
                if (new_submit_button_text == submit_button_text) {
                    clearInterval(refreshIntervalId);
                    set_visibility(scroll = true);
                    submit_button = $('.submit').filter('[aria-describedby*="' + settings.trigger_component + '"]');
                    submit_button.click(query_await);
                };
            }, 500);
        }

        function set_visibility(scroll = false) {
            if (is_visible(settings.trigger_component)) {
                for (const [index, conditional_component] of settings.conditional_component_list.entries()) {
                    let c = $('.vert').filter('[data-id*="' + conditional_component + '"]');
                    c.show();
                    // Scroll page to the first conditional_component on submit
                    if (index == 0 && scroll) {
                        $("html, body").animate({ scrollTop: c.offset().top }, 1000);
                    }
                }
            } else {
                for (conditional_component of settings.conditional_component_list) {
                    let c = $('.vert').filter('[data-id*="' + conditional_component + '"]');
                    c.hide();
                }
            }
        }

        // Set visible if submit button is disabled or answer is correct
        function is_visible(component) {
            return check_disabled(component) || check_status(component);
        }

        // Check if submit button is disabled (finished attempting the problem) and if the problem has been answered
        function check_disabled(component) {
            return $('.submit').filter('[aria-describedby*="' + component + '"]').is(":disabled") && !$('.status').filter('[id*="status_' + component + '"]').hasClass('unanswered');
        }

        // Check if answer is correct
        function check_status(component) {
            let is_correct = true;
            let elements = $('.status').filter('[id*="status_' + component + '"]');
            // Sometimes are more than one status element
            for (let i = 0; i < elements.length; i++) {
                element = elements.eq(i);
                if (element.hasClass('incorrect') || element.hasClass('unanswered')) {
                    is_correct = false;
                    break;
                }
            }
            return is_correct;
        }

    });
}