"use strict";

// pseudo-code:

$('#search-btn').click(function (evt) {
    evt.preventDefault();
    $.get('/search-results.json', {'term': $('#search-term').val()}, getResults);
});

function getResults(result) {

    $('#results-div').empty();

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
        $.post('/add-restaurant.json', {'id': $(this).data('yelp-id'), 'list': $('#list_id').val()}, addRestaurant);
    });

}

function addRestaurant(result) {
    let newRest = $('<p>');
    newRest.append(result.name);
    $('#list-items').append(newRest);
    $('#' + result.id).hide();

}


