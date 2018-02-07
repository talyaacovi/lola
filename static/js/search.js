"use strict";

// pseudo-code:

$('#search-btn').click(function(evt) {

    $.get('/search-results', {'term': $('#search-term').val()}, getResults);
});

function getResults(result) {
    // loop over results
}