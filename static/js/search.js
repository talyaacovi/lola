"use strict";

// pseudo-code:

$('#search-btn').click(function (evt) {
    evt.preventDefault();
    $.get('/search-results.json', {'term': $('#search-term').val()}, getResults);
});

function getResults(result) {
    alert('hi');
    // debugger;
    for (let i = 0; i < result.rests.length; i++) {
        let restDiv = $('<div>');
        restDiv.attr('id', result.rests[i].id);
        restDiv.append(result.rests[i].name);
        let btn = $('<button>');
        btn.attr('data-yelp-id', result.rests[i].id);
        btn.append('Add restaurant');
        restDiv.append(btn);
        $('#results-div').append(restDiv);
    }
}