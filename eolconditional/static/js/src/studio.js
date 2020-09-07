function EolConditionalStudioXBlock(runtime, element) {

    var handlerUrl = runtime.handlerUrl(element, 'studio_submit');
  
    $(element).find('.save-button').bind('click', function(e) {
      var form_data = new FormData();
      var trigger_component = $(element).find('input[name=trigger_component]').val();
      var conditional_component = $(element).find('textarea[name=conditional_component]').val();
      trigger_component = trigger_component ? trigger_component : 'Componente_no_especificado';
      conditional_component = conditional_component ? conditional_component : 'Componente_no_especificado';
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
  
    $(element).find('.cancel-button').bind('click', function(e) {
      runtime.notify('cancel', {});
      e.preventDefault();
    });

    $(element).find('.refill-button').bind('click', function(e) {
      var id = $(this).attr('id-component');
      id = id.substring(id.lastIndexOf('@')+1,id.length);
      var start = false;
      var ans = "";
      $('li.studio-xblock-wrapper').each(function(){
          dl = $(this).attr('data-locator');
          idblock = dl.substring(dl.lastIndexOf('@')+1,dl.length);
  
          if(start && dl.indexOf('eolconditional') > 0){
              return false;
          }
  
          if(start){
              ans += idblock+"\n";
          }
  
          if(idblock == id){
              start = true;
          }
      });
  
      $('div[data-usage-id*="'+id+'"] textarea.input').val(ans);
      e.preventDefault();
      
    });
  
  }
  