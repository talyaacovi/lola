"use strict";



$('.modal').click(function (evt) {
    $('#msg-para').text('');
});


/////////////////////////////////////////////////
////////////////// user logout //////////////////
/////////////////////////////////////////////////


// function logoutUser(result) {
//     $('#msg-para').html(result);
//     $('.logged-out-toggle').show();
//     $('.logged-in-toggle').hide();
//     $('#create-list').hide();
//     // $('#signup-msg').show();
//     // $('#home').show();
// }

// $('#logout-form').submit(function (evt) {
//     evt.preventDefault();
//     $.post('/logout', logoutUser);
// });

/////////////////////////////////////////////////
////////////////// user login //////////////////
/////////////////////////////////////////////////


$('#login-form-bootstrap').submit(function (evt) {
    evt.preventDefault();
    let email = evt.target.email.value;
    let password = evt.target.password.value;
    $.post('/login-user', {'email': email, 'password': password}, loginMessage);
});

function loginMessage(result) {
    if (result.msg == 'Success') {
        $('#msg-para').html('You have successfully logged in!');
        $('.logged-out-toggle').hide();
        $('.logged-in-toggle').show();
        $('#main-home-div').show();
        $('#loginModal').modal('hide');
        $('#profile-page').attr('href', '/users/' + result.user);
    }
    else if (result == 'Incorrect') {
        $('#loginModalMsg').html('Incorrect password, please try again.');
        $('input[name=password').val('');
    }

    else if (result == 'No Account') {
        let userEmail = $('#LoginEmail').val();
        $('#loginModal').modal('hide');
        $('#signupModal').modal('show');
        $('#SignupEmail').val(userEmail);
        $('#signupModalMsg').html('You do not have an account. Please sign up!');
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

$('#SignupUsername').on('blur', function (evt) {
    let username = evt.target.value;
    $.get('/check-username', {'username': username}, usernameMessage);
});


function usernameMessage(result) {
    if (result == 'True') {
        $('#SignupUsername').parent('div').addClass('has-error');
        $('#usernameHelpBlock').text('This username is already taken.');
        usernameValid = false;
    }
    else if (result == 'False') {
        $('#SignupUsername').parent('div').removeClass('has-error');
        $('#SignupUsername').parent('div').addClass('has-success');
        $('#usernameHelpBlock').text('');
        checkUsernameLength();
    }

}

function checkUsernameLength() {
    let username = $('#SignupUsername').val();
    if (username.length < 6) {
        $('#SignupUsername').parent('div').addClass('has-error');
        $('#usernameHelpBlock').text('Username should be at least 6 characters.');
        usernameValid = false;
    }
    else if (username.length >= 6) {
        $('#SignupUsername').parent('div').removeClass('has-error');
        $('#SignupUsername').parent('div').addClass('has-success');
        $('#usernameHelpBlock').text('');
        usernameValid = true;
    }
}


////////////////// UNDER CONSTRUCTION: zipcode validation


// $('#zipcode').on('blur', function (evt) {
//     let zipcode = evt.target.value;
//     $.get('/check-zipcode', {'zipcode': zipcode}, zipcodeMessage);
// });

// function zipcodeMessage (result) {
//     if (result == 'True') {
//         $('#zipcode-invalid').hide();
//         $('#zipcode-valid').attr('style', 'display: inline');
//         zipcodeValid = true;
//     }
//     else if (result == 'False') {
//         $('#zipcode-valid').hide();
//         $('#zipcode-invalid').attr('style', 'display: inline');
//         zipcodeValid = false;
//     }
// }


////////////////// email validation


$('#SignupEmail').on('blur', function (evt) {
    let email = evt.target.value;
    $.get('/check-email', {'email': email}, emailMessage);
});

function emailMessage (result) {
    if (result == 'True') {
        $('#signupModal').modal('hide');
        $('#loginModal').modal('show');
        $('#loginModalMsg').html('This email address already has an account. Please login.');
    }
    else if (result == 'False') {
        $('#SignupEmail').parent('div').addClass('has-success');
    }
}


////////////////// signup form listener to check and submit

$('#signup-form-bootstrap').submit(function (evt) {
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
        $('.logged-out-toggle').hide();
        $('.logged-in-toggle').show();
        $('#signupModal').modal('hide');
        $('#profile-page').attr('href', '/users/' + result);
        $('#main-home-div').show();
    }



    else {
        $('#signupModal').modal('hide');
        $('#loginModal').modal('show');
        $('#loginModalMsg').html('This email address already has an account. Please login.');

    }
}
