
$(function () {
    $('#save').click(function () {
        console.log('save');
        var data = new FormData();
        fd.append('file', $('#id_fname').files[0]);
        $.ajax({
            url: '.',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function(data){
                alert(data);
            }
        });
        return false;
    });
});
