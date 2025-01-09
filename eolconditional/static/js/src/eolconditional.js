function EolConditionalXBlock(runtime, element, settings) {

    let triggers = (settings.trigger_component.trim()).split("_")
    let submit_buttons = {}

    $(function($) {
        var handlerUrl = runtime.handlerUrl(element, 'publish_completion');
        $('.vert').filter('[data-id*="' + settings.location + '"]').hide(); // Hide eolconditional Xblock

        set_visibility();


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
            if (submit_buttons[triggercode]["done"]) {
                console.log(`Trigger ${triggercode} ya completado, no se ejecuta de nuevo.`);
                return; // Si ya está completado, no hacemos nada
            }
        
            var refreshIntervalId = setInterval(function () {
                if (submit_buttons[triggercode]["jsdng"]) {
                    // Es un problema de Javascript Display and Grading
                    let new_no_click = $('.submit').filter('[aria-describedby*="' + triggercode.trim() + '"]').attr('no-click');
                    if (new_no_click !== 'true') {
                        console.log(`Trigger ${triggercode} completado (JS Grading).`);
                        submit_buttons[triggercode]["done"] = true;
                        clearInterval(refreshIntervalId);
                        set_visibility(scroll = true);
                    }
                } else {
                    // No es un problema de Javascript Display and Grading
                    let new_submit_button_text = $('.submit').filter('[aria-describedby*="' + triggercode.trim() + '"]').find('span:first').text();
                    if (new_submit_button_text === submit_buttons[triggercode]["text"]) {
                        console.log(`Trigger ${triggercode} completado.`);
                        submit_buttons[triggercode]["done"] = true;
                        clearInterval(refreshIntervalId);
                        set_visibility(scroll = true);
                    }
                }
            }, 500);
        }
        

        function set_visibility(scroll = false) {
            //console.log("Set visibility...")
            if (is_visible(triggers[0].trim())) {
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