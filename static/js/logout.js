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


// username validation to ensure length is greater than 6 characters and that
// username is not already taken.

$('#username').on('blur', function (evt) {
    let username = evt.target.value;
    $.get('/check-username', {'username': username}, usernameMessage);
});


function usernameMessage(result) {
    if (result == 'True') {
        $('#username-correct').hide();
        $('#username-taken').attr('style', 'display: inline');
    }
    else if (result == 'False') {
        $('#username-taken').hide();
        checkUsernameLength();
    }

}

function checkUsernameLength() {
    let username = $('#username').val();
    if (username.length < 6) {
        $('#username-correct').hide();
        $('#username-length').attr('style', 'display: inline');
    }
    else if (username.length >= 6) {
        $('#username-length').hide();
        $('#username-correct').attr('style', 'display: inline');
    }
}


// $('#username').on('blur', function (evt) {
//     let username = evt.target.value;
//     if (username.length < 6) {
//         $('#username-length').attr('style', 'display: inline');
//     }
//     else if (username.length >= 6) {
//         $('#username-length').hide();
//     }
// });


// zipcode validation


$('#zipcode').on('blur', function (evt) {
    let zipcode = evt.target.value;
    $.get('/check-zipcode', {'zipcode': zipcode}, zipcodeMessage);
});

function zipcodeMessage (result) {
    if (result == 'True') {
        $('#zipcode-invalid').hide();
        $('#zipcode-valid').attr('style', 'display: inline');
    }
    else if (result == 'False') {
        $('#zipcode-valid').hide();
        $('#zipcode-invalid').attr('style', 'display: inline');
    }
}