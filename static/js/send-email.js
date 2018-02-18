"use strict";



$('#email-form-bootstrap').submit(function (evt) {
    evt.preventDefault();
    let email = evt.target.email.value;
    let from = evt.target.from.value;
    let lst_id = $('#list_id').val();
    let username = $('#username').val();

    $.post('/send-list-email', {'email': email, 'lst_id': lst_id, 'username': username, 'from': from}, successMessage);
});


function successMessage(result) {
    $('#emailModal').modal('hide');
    $('#msg-para').text(result);
}



$('#city-email-form-bootstrap').submit(function (evt) {
    evt.preventDefault();
    let email = evt.target.email.value;
    let lst_items = $('#top-restaurants li');

    let lst = [];

    for (let i = 0; i < lst_items.length; i++) {
        lst.push(lst_items[i].textContent);
    }

    $.post('/send-city-email', {'email': email, 'lst_items': lst}, successMessage);
});


function successMessage(result) {
    $('#emailModal').modal('hide');
    $('#msg-para').text(result);
}