"use strict";



$('#email-form-bootstrap').submit(function (evt) {
    evt.preventDefault();
    console.log('in bootstrap email list handler');
    let email = evt.target.email.value;
    let lst_id = $('#list_id').val();
    $.post('/send-list-email', {'email': email, 'lst_id': lst_id}, successMessage);
});


function successMessage(result) {
    $('#emailModal').modal('hide');
    $('#msg-para').text(result);
}