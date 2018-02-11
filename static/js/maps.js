"use strict";

let eastAustralia = {lat: -34.397, lng: 150.644};

let map = new google.maps.Map(document.querySelector('#map'), {
    center: eastAustralia,
    zoom: 8,
});


// var map;
// function initMap() {
//     map = new google.maps.Map(document.getElementById('map'), {
//         center: eastAustralia,
//         zoom: 8
//     });
// }