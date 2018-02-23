"use strict";


// this adds a click event listener to the search button, which sends an AJAX
// request with the search term, returning a dictionary with the restaurant name
// and the yelp id, then calls the getResults callback.

// $('#search-btn').click(function (evt) {
//     evt.preventDefault();
//     $.get('/search-results.json', {'term': $('#search-term').val()}, displayResults);
// });



// this gets called after the search results are returned through the AJAX request
// and first empties out the results div and any messages on the page, and then
// creates the search results and buttons to add the restaurant

// function displayResults(result) {

//     $('#results-div').empty();
//     $('#msg-div').empty();

//     for (let i = 0; i < result.rests.length; i++) {
//         let restDiv = $('<div>');
//         restDiv.attr('id', result.rests[i].id);
//         restDiv.append(result.rests[i].name);
//         let restLoc = $('<p>');
//         restLoc.append(result.rests[i].location);
//         let btn = $('<button>');
//         btn.attr('data-yelp-id', result.rests[i].id);
//         btn.attr('class', 'add-btn');
//         btn.append('Add restaurant');
//         restDiv.append(restLoc);
//         restDiv.append(btn);
//         $('#results-div').append(restDiv);
//     }

// within this callback, a click event listener is also getting added to each of
// the add restaurant buttons, which send a post request via AJAX with a payload
// containing the yelp-id and the list-id to add the restaurant to the database
// and the list item to the list items table

//     $('.add-btn').click(function (evt) {
//         evt.preventDefault();
//         // check if yelp_id on button matches any of the yelp_ids in the list
//         $.post('/add-restaurant.json', {'id': $(this).data('yelp-id'), 'list': $('#list_id').val()}, processAjax);
//     });

// }

// this is the callback function for adding a restaurant, which checks if the
// result is an empty string (meaning the restaurant already exists in the list)
// before calling the addRestaurant callback

// function processAjax(result) {
//     if (result) {
//         displayRestaurant(result);
//     }

//     else {
//         $('#msg-div').html('This restaurant already exists in your list.');
//     }
// }

// this callback adds the restaurant to the list and removes it from the results
// it also checks if the list has reached 10, in which case the search box will
// be removed

// function displayRestaurant(result) {
//     $('#msg-div').empty();
//     let newRest = $('<div>');
//     newRest.attr('data-yelp-id', result.yelp_id);
//     newRest.attr('data-item-id', result.item_id);
//     let newName = $('<h3>');
//     newName.append(result.name);
//     let newCat = $('<p>');
//     newCat.append(result.yelp_category);
//     let newUrl = $('<a>');
//     newUrl.attr('href', result.yelp_url);
//     newUrl.append('Yelp');
//     let imgDiv = $('<div>');
//     imgDiv.attr('class', 'yelp-img');
//     let newImg = $('<img>');
//     newImg.attr('src', result.yelp_photo);
//     imgDiv.append(newImg);
//     newRest.append(newName);
//     newRest.append(newCat);
//     newRest.append(newUrl);
//     newRest.append(imgDiv);
//     $('#list-items').append(newRest);
//     $('#' + result.yelp_id).hide();

//     checkListLength();
// }

// this checks the length of the list and hides the search functionality if
// list is greater than or equal to 10.

// function checkListLength() {
//     if ($('#list-items h3').length >= 20) {
//         $('#search-restaurants').hide();
//         $('#results-div').empty();

//     }
//     else {$('#search-restaurants').show();}
// }


// $('#list-items').ready(checkListLength);


// this adds remove buttons to each item on the list if the user clicks on
// the edit button, and adds event listeners to those remove buttons which
// make an AJAX post request with the id of the item that the user wants to
// remove.

// $('#edit-btn').click(function (evt) {
//     let rests = $('#list-items').children();
//     for (let i = 0; i < rests.length; i++) {
//         // debugger;
//         let btn = $('<button>');
//         btn.attr('data-item-id', $(rests[i]).data('item-id'));
//         btn.attr('class', 'del-btn');
//         btn.append('Remove restaurant');
//         $(rests[i]).append(btn);
//     }

//     $('.del-btn').click(function (evt) {
//         evt.preventDefault();
//         $.post('/del-restaurant.json', {'item_id': $(this).data('item-id')}, removeRestaurant);
//     });

//     $('#edit-btn').hide();
//     $('#save-btn').show();

//     $('#save-btn').click(function (evt) {
//         $('.del-btn').remove();
//         $('#save-btn').hide();
//         $('#edit-btn').show();
//         $('#msg-div').empty();
//     });
// });


// this is the callback function for the AJAX post request to remove an item
// from. the list and displays a success message, and removes that item
// from the list on the front-end.

// function removeRestaurant(result) {
//     $('#msg-div').html(result.name + ' has been removed from your list.');
//     $('div').find('[data-yelp-id=' + result.yelp_id + ']').empty();
//     checkListLength();

// }

// this confirms that user wants to delete their list when they submit the
// delete list button.

// $('#del-list').on('submit', function (evt) {
//     var action = confirm('Are you sure you want to delete your list?');
//     if (!action){
//         evt.preventDefault();
//     }
// });