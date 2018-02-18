"use strict";



$('#email-form-bootstrap').submit(function (evt) {
    evt.preventDefault();
    let email = evt.target.email.value;
    let from = evt.target.from.value;
    // let lst_id = $('#list_id').val();
    let username = $('#username').val();

    // let myItems = $('#list-items h3');
    // let lstItems = createList($('#list-items h3'));
    // let lstUrls = getUrls($('#list-items a'));

    let lstItems = getYelpIds($('#list-items > div'));

    let payload = {'email': email,
                   'lst_items': lstItems,
                   'username': username,
                   'from': from};
    // console.log(JSON.stringify({'list': lstItems}));

    console.log(payload);
    // for (let i = 0; i < myItems.length; i++) {
    //     console.log(myItems[i].textContent);
    // }

    $.post('/send-list-email', payload, successMessage);
});


function getYelpIds(lst) {
    let newLst = [];
    for (let i = 0; i < lst.length; i++) {
        newLst.push(lst[i].dataset.yelpId);
    }
    return newLst;
}

// function createList(lst) {
//     let newLst = [];
//     for (let i = 0; i < lst.length; i++) {
//         newLst.push(lst[i].textContent);
//     }
//     return newLst;
// }


// function getUrls(lst) {
//     let newLst = [];
//     for (let i = 0; i < lst.length; i++) {
//         newLst.push(lst[i].href);
//     }
//     return newLst;
// }

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