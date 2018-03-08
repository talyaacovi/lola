"use strict";


// clear message paragraph whenever user clicks on a modal.

$('.modal').click(function (evt) {
    $('#msg-para').text('');
});

/////////////////////////////////////////////////
////////////////// user login //////////////////
/////////////////////////////////////////////////



// AJAX POST REQUEST FOR LOGIN, returns:
// 'Incorrect' if wrong password
// 'No Account' if no account exists for that email
// {'msg': 'Success', 'user': user.username, 'isActive': is_active} if login
// successful. isActive is boolean true / false if user has added at least
// 5 restaurants to their favorites list.

$('#login-form').submit(function (evt) {
    evt.preventDefault();
    let email = evt.target.email.value;
    let password = evt.target.password.value;

    $.post('/login-user', {'email': email, 'password': password}, loginMessage);
});

function loginMessage(result) {
    if (result.msg == 'Success') {
        $('.logged-out-toggle').hide();
        $('.logged-in-toggle').show();
        $('#main-home-div').show();
        $('#loginModal').modal('hide');
        $('#icons').hide();
        $('#profile-page').attr('href', '/users/' + result.user);

        if (result.isActive === 'True') {
            isActive = true; // global variable defined in base.html
            $('#homepage-alert').show().append('You have successfully logged in!');
            // debugger;
            // $('body').addClass('home-background');
            $('body').addClass('main-background');
            $('.navbar').addClass('home-nav');
            $('.row-first').hide();
        }
        else {
            $('#search-div').hide();
            $('#city-div').hide();
            $('#view-controls').hide();
            $('.row-first').hide();
            $('#main-map').show();
            $('#inactive-homepage-alert').show().append('You have successfully logged in! Please add at least 5 restaurants to your <a href="/users/' + result.user + '/favorites">Favorites</a> list to access more content.');
            $('body').addClass('main-background');
            $('.navbar').addClass('home-nav');
            $('.row-first').hide();
        }
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

    if (result) {
        $('.logged-out-toggle').hide();
        $('.logged-in-toggle').show();
        $('#main-home-div').show();
        $('#signupModal').modal('hide');
        $('#profile-page').attr('href', '/users/' + result);
        $('#search-div').hide();
        $('#icons').hide();
        $('#view-controls').hide();
        $('#homepage-alert').show().append('Your account has been created! Please add at least 5 restaurants to your <a href="/users/' + result + '/favorites">Favorites</a> list to access more content.');

    }

    else {
        $('#signupModal').modal('hide');
        $('#loginModal').modal('show');
        $('#loginModalMsg').html('This email address already has an account. Please login.');

    }
}