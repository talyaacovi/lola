"use strict";

$('#add-from-details').submit(function (evt) {
    evt.preventDefault();
    console.log('hi');

    let yelp_id = document.querySelectorAll('[name="yelp_id"]')[0].value;
    let list_id = document.getElementById('list-id').value;

    $.post('/add-restaurant', {'list_id': list_id, 'yelp_id': yelp_id}, successMessage);

});
	
function successMessage(result) {
	$('.add-rest').hide();
	let rest_name = result.rest_name;
	$('#add-alert').show().append('Success! ' + rest_name + ' has been added to your list.');
}