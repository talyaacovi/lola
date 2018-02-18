"use strict";



///////////////////////////////////////////////////////////////////////////
////////////////// send email of list from specific user //////////////////
///////////////////////////////////////////////////////////////////////////


$('#email-form-bootstrap').submit(function (evt) {
    evt.preventDefault();
    let email = evt.target.email.value;
    let from = evt.target.from.value;
    let username = $('#username').val();
    let lstName = document.getElementById('list_name').innerText;

    let lstItems = getYelpIds($('#list-items > div'));

    let payload = {'email': email,
                   'lst_items': lstItems,
                   'username': username,
                   'from': from,
                   'lst_name': lstName};

    $.post('/send-user-list', payload, successMessage);
});


function getYelpIds(lst) {
    let newLst = [];
    for (let i = 0; i < lst.length; i++) {
        newLst.push(lst[i].dataset.yelpId);
    }
    return newLst;
}


function successMessage(result) {
    $('#emailModal').modal('hide');
    $('#msg-para').text(result);
}


///////////////////////////////////////////////////////////////////////////
////////////////// send email of list from specific city //////////////////
///////////////////////////////////////////////////////////////////////////


$('#city-email-form-bootstrap').submit(function (evt) {
    evt.preventDefault();
    let email = evt.target.email.value;
    let from = evt.target.from.value;
    let lstItems = getYelpIds($('#top-restaurants li'));
    let cityState = document.getElementById('city').innerText;

    let payload = {'email': email,
                   'lst_items': lstItems,
                   'from': from,
                   'city_state': cityState};

    $.post('/send-city-list', payload, successMessage);

});


function successMessage(result) {
    $('#emailModal').modal('hide');
    $('#msg-para').text(result);
}