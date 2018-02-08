"use strict";

// pseudo-code:

$('#search-btn').click(function (evt) {
    evt.preventDefault();
    $.get('/search-results.json', {'term': $('#search-term').val()}, getResults);
});

function getResults(result) {

    $('#results-div').empty();
    $('#msg-div').empty();

    for (let i = 0; i < result.rests.length; i++) {
        let restDiv = $('<div>');
        restDiv.attr('id', result.rests[i].id);
        restDiv.append(result.rests[i].name);
        let btn = $('<button>');
        btn.attr('data-yelp-id', result.rests[i].id);
        btn.attr('class', 'add-btn');
        btn.attr('style', 'margin: 10px;');
        btn.append('Add restaurant');
        restDiv.append(btn);
        $('#results-div').append(restDiv);
    }


    $('.add-btn').click(function (evt) {
        evt.preventDefault();
        // check if yelp_id on button matches any of the yelp_ids in the list
        $.post('/add-restaurant.json', {'id': $(this).data('yelp-id'), 'list': $('#list_id').val()}, processAjax);
    });

}

function processAjax(result) {
    if (result) {
        addRestaurant(result);
    }

    else {
        $('#msg-div').html('This restaurant already exists in your list.');
    }
}

function addRestaurant(result) {
    $('#msg-div').empty();
    let newRest = $('<p>');
    newRest.append(result.name);
    $('#list-items').append(newRest);
    $('#' + result.id).hide();

}


