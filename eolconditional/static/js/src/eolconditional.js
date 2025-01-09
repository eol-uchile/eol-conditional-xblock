function EolConditionalXBlock(runtime, element, settings) {

    let triggers = (settings.trigger_component.trim()).split("_")
    let submit_buttons = {}

    $(function($) {
        var handlerUrl = runtime.handlerUrl(element, 'publish_completion');
        $('.vert').filter('[data-id*="' + settings.location + '"]').hide(); // Hide eolconditional Xblock

        console.log("Primera revisión");
        if (check_buttons())
        {
            if(check_buttons){ set_visibility(action = "reveal",scroll = false) };
        }else{
            if(check_buttons){ set_visibility(action = "hide",scroll = false) };
        }


        triggers.forEach(trigger => {

            let subbtn = {
                "jsdng" : false,
                "element" : null,
                "text": "",
                "done": false
            }

            subbtn["element"] = $('.submit').filter('[aria-describedby*="' + trigger.trim() + '"]');
            subbtn["text"] = subbtn["element"].find('span:first').text();// getting 'original state' of submit button
            
            if($('.vert').filter('[data-id*="' + trigger.trim() + '"]').find('.jsinput[data-getstate]').length > 0){
                subbtn["jsdng"] = true; //is a Javascript Display and Grading problem
                subbtn["element"].attr('no-click','true');
            }

            subbtn["element"].click(() => query_await(trigger));

            submit_buttons[trigger] = subbtn
        });

        function query_await(triggercode) {
            //TODO: improve this code
            console.log("Query await")
            var refreshIntervalId = setInterval(function() {
                if(submit_buttons[triggercode]["jsdng"]){
                    let new_no_click = $('.submit').filter('[aria-describedby*="' + triggercode.trim() + '"]').attr('no-click');
                    if (new_no_click != 'true') {
                        if(check_buttons()){ set_visibility(action = "reveal",scroll = true) };
                        submit_buttons[triggercode]["element"] = $('.submit').filter('[aria-describedby*="' + triggercode.trim() + '"]');
                        submit_buttons[triggercode]["element"] .attr('no-click','true');
                        submit_buttons[triggercode]["element"].click(() => query_await(triggercode));
                    };
                }
                else{
                    let new_submit_button_text = $('.submit').filter('[aria-describedby*="' + triggercode.trim() + '"]').find('span:first').text();
                    if (new_submit_button_text == submit_buttons[triggercode]["text"] ) {
                        clearInterval(refreshIntervalId);
                        if(check_buttons()){ set_visibility(action = "reveal",scroll = true) };
                        submit_buttons[triggercode]["element"] = $('.submit').filter('[aria-describedby*="' + triggercode.trim() + '"]');
                        submit_buttons[triggercode]["element"].click(() => query_await(triggercode));
                    };
                }
            }, 500);
        }

        function check_buttons()
        {
            //console.log("check buttons");
            let allbuttonsready = true

            triggers.forEach(trigger => {

                //console.log(is_visible(trigger.trim()) );

                if ( is_visible(trigger.trim()) )
                {
                    //console.log("not visible");
                    $.ajax({
                        type: "POST",
                        url: handlerUrl,
                        data: JSON.stringify({
                            completion: 1.0,
                        }),
                    }).then(
                        (response) => {
                            //console.log("Respuesta...");
                            //console.log(response);
                        },
                    );

                }else
                {
                    //console.log("visible");
                    allbuttonsready = false
                }
            
            });
            return allbuttonsready;
        }

        

        function set_visibility(action = "hide",scroll = false) {
            //console.log("Set visibility...")
            if (action == "reveal"){
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