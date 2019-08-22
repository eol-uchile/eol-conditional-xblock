function EolConditionalStudioXBlock(runtime, element) {

    var handlerUrl = runtime.handlerUrl(element, 'studio_submit');
  
    $(element).find('.save-button').bind('click', function(e) {
      var form_data = new FormData();
      var trigger_component = $(element).find('input[name=trigger_component]').val();
      var conditional_component = $(element).find('input[name=conditional_component]').val();
      trigger_component = trigger_component ? trigger_component : 'Componente no especificado';
      conditional_component = conditional_component ? conditional_component : 'Componente no especificado';
      form_data.append('trigger_component', trigger_component);
      form_data.append('conditional_component', conditional_component);
      runtime.notify('save', {state: 'start'});
  
      $.ajax({
        url: handlerUrl,
        dataType: 'text',
        cache: false,
        contentType: false,
        processData: false,
        data: form_data,
        type: "POST",
        success: function(response){
          runtime.notify('save', {state: 'end'});
        }
      });
      e.preventDefault();
  
    });
  
    $(element).find('.cancel-button').bind('click', function() {
      runtime.notify('cancel', {});
    });
  
  }
  