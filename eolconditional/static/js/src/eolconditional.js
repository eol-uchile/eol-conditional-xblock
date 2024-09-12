function EolConditionalXBlock(runtime, element, settings) {


    $(function($) {
        var handlerUrl = runtime.handlerUrl(element, 'publish_completion');
        $('.vert').filter('[data-id*="' + settings.location + '"]').hide(); // Hide eolconditional Xblock
        set_visibility();
        var submit_button = $('.submit').filter('[aria-describedby*="' + settings.trigger_component.trim() + '"]');
        var submit_button_text = submit_button.find('span:first').text(); // getting 'original state' of submit button
        var jsdng = false;
        if($('.vert').filter('[data-id*="' + settings.trigger_component.trim() + '"]').find('.jsinput[data-getstate]').length > 0){
            jsdng = true; //is a Javascript Display and Grading problem
            submit_button.attr('no-click','true');
        }
        submit_button.click(query_await);

        function query_await() {
            //TODO: improve this code
            var refreshIntervalId = setInterval(function() {
                if(jsdng){
                    let new_no_click = $('.submit').filter('[aria-describedby*="' + settings.trigger_component.trim() + '"]').attr('no-click');
                    if (new_no_click != 'true') {
                        clearInterval(refreshIntervalId);
                        set_visibility(scroll = true);
                        submit_button = $('.submit').filter('[aria-describedby*="' + settings.trigger_component.trim() + '"]');
                        submit_button.attr('no-click','true');
                        submit_button.click(query_await);
                    };
                }
                else{
                    let new_submit_button_text = $('.submit').filter('[aria-describedby*="' + settings.trigger_component.trim() + '"]').find('span:first').text();
                    if (new_submit_button_text == submit_button_text) {
                        clearInterval(refreshIntervalId);
                        set_visibility(scroll = true);
                        submit_button = $('.submit').filter('[aria-describedby*="' + settings.trigger_component.trim() + '"]');
                        submit_button.click(query_await);
                    };
                }
            }, 500);
        }

        function removeMathJaxFromDiv(div) {
            //Obtain all latex elelemnts of a specific div
            //console.log("Limpiar MathJax");
            var jax = MathJax.Hub.getAllJax(div);
        
            for (var i = 0, m = jax.length; i < m; i++) {
                var tex = jax[i].originalText;
                var isDisplay = (jax[i].root.Get("display") === "block");
        
                // check if use () or []
                if (isDisplay) {
                    tex = "\\[" + tex + "\\]";
                } else {
                    tex = "\\(" + tex + "\\)";
                }
        
                var script = jax[i].SourceElement(); // <script> elemtant that contain mathjax code
                jax[i].Remove(); // Remove mathjax
        
                var preview = script.previousSibling; // preview
                if (preview && preview.className === "MathJax_Preview") {
                    preview.parentNode.removeChild(preview); // Delete preview
                }
        
                script.parentNode.insertBefore(document.createTextNode(tex), script); // insert original text
                script.parentNode.removeChild(script); // remove original script
            }
        }

        function set_visibility(scroll = false) {
            if (is_visible(settings.trigger_component.trim())) {
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
                    if (typeof MathJax !== 'undefined' && MathJax.Hub) {removeMathJaxFromDiv(c[0])};// Delete latex content
                    c.hide();
                }
            }

            if (typeof MathJax !== 'undefined' && MathJax.Hub) {MathJax.Hub.Queue(["Typeset",MathJax.Hub])}; //Reload the latex formulas
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

    });
}