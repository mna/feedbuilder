$(function(){
    $('a[data-item-id]').live('click', function() {
        $('#hidId').val($(this).attr('data-item-id'));
        $('#theForm').filter(':enabled').submit(); 
    });
});
