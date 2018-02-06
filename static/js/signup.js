"use strict";

function successMessage(result) {
    alert(result);
}

function submitSignup(evt) {
    evt.preventDefault();

    var formInputs = {
        'email': $('#email').val(),
        'password': $('#password').val(),
        'zipcode': $('#zipcode').val(),
        'username': $('#username').val()
    };

    $.post('/signup',
           formInputs,
           successMessage);
}

$('#signup-form').on('submit', submitSignup);




function logoutUser(result) {
    $('#logout-msg').html(result);
    $('#flash-msg').hide();
    $('#login').show();
    $('#logout').hide();
    // document.querySelector('#logout-msg').innerHTML(result);
}
// $('#logout-btn').on('click', () => $.get('/logout', logoutUser));
$('#logout-btn').click(function (evt) {
    console.log('yo');
    $.post('/logout', logoutUser);
});