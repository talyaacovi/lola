"use strict";

$('#add-from-details').submit(function (evt) {
    evt.preventDefault();
    console.log('hi');

    let yelp_id = document.querySelectorAll('[name="yelp_id"]')[0].value;
    let list_id = document.getElementById('list-id').value;
    console.log(list_id)

    $.post('/add-restaurant', {'list_id': list_id, 'yelp_id': yelp_id}, successMessage);

});
	
function successMessage(result) {
	console.log('hi');
	$('.add-rest').hide();
}