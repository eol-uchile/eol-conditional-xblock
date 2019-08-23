/* Javascript for EolConditionalXBlock. */
function EolConditionalXBlock(runtime, element, settings) {


    $(function ($) {
        /* Here's where you'd do things on page load. */
        console.log(settings);
        let conditional_component = $('.vert').filter('[data-id*="' + settings.conditional_component + '"]')
        settings.is_visible ? conditional_component.show() : conditional_component.hide();
        
    });
}
