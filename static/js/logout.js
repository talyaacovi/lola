"use strict";

function logoutUser(result) {
    $('#logout-msg').html(result);
    $('#login').show();
    $('#logout').hide();
}
$('#logout-btn').click(function (evt) {
    console.log('yo');
    $.post('/logout', logoutUser);
});