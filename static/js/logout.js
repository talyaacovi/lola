"use strict";


/////////////////////////////////////////////////
////////////////// user logout //////////////////
/////////////////////////////////////////////////


function logoutUser(result) {
    $('#msg-para').html(result);
    $('.logged-out-toggle').show();
    $('.logged-in-toggle').hide();
    // $('#create-list').hide();
    // $('#signup-msg').show();
    // $('#home').show();
}

$('#logout-form').submit(function (evt) {
    evt.preventDefault();
    $.post('/logout', logoutUser);
});

/////////////////////////////////////////////////
////////////////// user login //////////////////
/////////////////////////////////////////////////


$('#login-form-bootstrap').submit(function (evt) {
    evt.preventDefault();
    console.log('in bootstrap form handler');
    let email = evt.target.email.value;
    let password = evt.target.password.value;
    $.post('/login-user', {'email': email, 'password': password}, loginMessage);
});

function loginMessage(result) {
    console.log(result);
    if (result.msg == 'Success') {
        $('#msg-para').html('You have successfully logged in!');
        $('.logged-out-toggle').hide();
        $('.logged-in-toggle').show();
        // $('#home').hide();
        $('#myModal').modal('hide');
        $('#profile-page').attr('href', '/users/' + result.user);
    }
    else if (result == 'Incorrect') {
        $('#myModalMsg').html('Incorrect password, please try again.');
        $('input[name=password').val('');
    }

    else if (result == 'No Account') {
        $('#myModalMsg').html('You do not have an account. Please sign up!');
        // pop open signup modal!
        // $('#login-div').hide();
        // $('#signup-div').show();
    }
}



/////////////////////////////////////////////////
////////////////// user signup //////////////////
/////////////////////////////////////////////////

$('#signup-btn').click(function (evt) {
    $('#signup-div').show();
    $('#login-div').hide();
    $('#msg-para').hide();
});


////////////////// username validation
// to ensure length is greater than 6 characters
// and that username is not already taken.

let usernameValid = true;
let zipcodeValid = true;

$('#username').on('blur', function (evt) {
    let username = evt.target.value;
    $.get('/check-username', {'username': username}, usernameMessage);
});


function usernameMessage(result) {
    if (result == 'True') {
        console.log('username is taken');
        $('#username-correct').hide();
        $('#username-taken').attr('style', 'display: inline');
        usernameValid = false;
    }
    else if (result == 'False') {
        console.log('username is not taken');
        $('#username-taken').hide();
        checkUsernameLength();
    }

}

function checkUsernameLength() {
    let username = $('#username').val();
    if (username.length < 6) {
        $('#username-correct').hide();
        $('#username-length').attr('style', 'display: inline');
        usernameValid = false;
    }
    else if (username.length >= 6) {
        $('#username-length').hide();
        $('#username-correct').attr('style', 'display: inline');
        usernameValid = true;
    }
}


////////////////// zipcode validation


$('#zipcode').on('blur', function (evt) {
    let zipcode = evt.target.value;
    $.get('/check-zipcode', {'zipcode': zipcode}, zipcodeMessage);
});

function zipcodeMessage (result) {
    if (result == 'True') {
        $('#zipcode-invalid').hide();
        $('#zipcode-valid').attr('style', 'display: inline');
        zipcodeValid = true;
    }
    else if (result == 'False') {
        $('#zipcode-valid').hide();
        $('#zipcode-invalid').attr('style', 'display: inline');
        zipcodeValid = false;
    }
}

////////////////// signup form listener to check and submit

$('#signup-form').submit(function (evt) {
    evt.preventDefault();
    if (usernameValid === true && zipcodeValid === true) {
        let email = evt.target.email.value;
        let password = evt.target.password.value;
        let username = evt.target.username.value;
        let zipcode = evt.target.zipcode.value;

        $.post('/signup', {'email': email, 'password': password, 'username': username, 'zipcode': zipcode}, signupUser);
    }

    else {
        alert('Please fix errors!');
    }
});

function signupUser(result) {
    let message = $('#msg-para');

    if (result) {
        message.append('Your account has been created.');
        $('#signup-form').hide();
        $('#home').hide();
        $('#logged-in-nav').show();
        $('#profile-page').attr('href', '/users/' + result);
    }

    else {
        message.append('This email address already has an account.');
        $('#signup-div').hide();
        $('#login-div').show();
        // $('#signup-msg').hide();

    }
}
