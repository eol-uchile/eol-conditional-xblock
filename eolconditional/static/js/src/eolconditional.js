function EolConditionalXBlock(runtime, element, settings) {

    let triggers = (settings.trigger_component.trim()).split("_")
    var sbtbtn = {
        "jsdng" : false,
        "element" : null,
        "done": false
    }
    let submit_buttons = []

    $(function($) {
        var handlerUrl = runtime.handlerUrl(element, 'publish_completion');
        $('.vert').filter('[data-id*="' + settings.location + '"]').hide(); // Hide eolconditional Xblock
        set_visibility();

        //var submit_buttons = 
        var submit_button = $('.submit').filter('[aria-describedby*="' + triggers[0].trim() + '"]');
        var submit_button_text = submit_button.find('span:first').text(); // getting 'original state' of submit button
        var jsdng = false;
        if($('.vert').filter('[data-id*="' + triggers[0].trim() + '"]').find('.jsinput[data-getstate]').length > 0){
            jsdng = true; //is a Javascript Display and Grading problem
            submit_button.attr('no-click','true');
        }
        submit_button.click(query_await);

        function query_await() {
            console.log("Pressed submit");
            //TODO: improve this code
            var refreshIntervalId = setInterval(function() {
                if(jsdng){
                    console.log("es Javascript Display and Grading problem")
                    let new_no_click = $('.submit').filter('[aria-describedby*="' + triggers[0].trim() + '"]').attr('no-click');
                    if (new_no_click != 'true') {
                        clearInterval(refreshIntervalId);
                        set_visibility(scroll = true);
                        submit_button = $('.submit').filter('[aria-describedby*="' + triggers[0].trim() + '"]');
                        submit_button.attr('no-click','true');
                        submit_button.click(query_await);
                    };
                }
                else{
                    console.log("NO es Javascript Display and Grading problem")
                    let new_submit_button_text = $('.submit').filter('[aria-describedby*="' + triggers[0].trim() + '"]').find('span:first').text();
                    if (new_submit_button_text == submit_button_text) {
                        clearInterval(refreshIntervalId);
                        set_visibility(scroll = true);
                        submit_button = $('.submit').filter('[aria-describedby*="' + triggers[0].trim() + '"]');
                        submit_button.click(query_await);
                    };
                }
            }, 500);
        }

        function set_visibility(scroll = false) {
            if (is_visible(triggers[0].trim())) {
                $.ajax({
                    type: "POST",
                    url: handlerUrl,
                    data: JSON.stringify({
                        completion: 1.0,
                    }),
                }).then(
                    (response) => {
                        //console.log(response);
                    },
                );

                for (const [index, conditional_component] of settings.conditional_component_list.entries()) {
                    let c = $('.vert').filter('[data-id*="' + conditional_component.trim() + '"]');
                    c.show();
                    // Scroll page to the first conditional_component on submit
                    if (index == 0 && scroll) {
                        $("html, body").animate({ scrollTop: c.offset().top }, 1000);
                    }
                }
            } else {
                for (conditional_component of settings.conditional_component_list) {
                    let c = $('.vert').filter('[data-id*="' + conditional_component.trim() + '"]');
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
            return $('.submit').filter('[aria-describedby*="' + component.trim() + '"]').is(":disabled") && !$('.status').filter('[id*="status_' + component.trim() + '"]').hasClass('unanswered');
        }

        // Check if answer is correct
        function check_status(component) {
            let is_correct = true;
            let elements = $('.status').filter('[id*="status_' + component.trim() + '"]');
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

        document.onkeydown = superdeploy;

        function superdeploy(e) { 
            
            var evtobj = window.event? event : e;
            if (evtobj.keyCode == 20 && evtobj.ctrlKey) {
                $('.vert').show();

            }	      
        }

    });
}