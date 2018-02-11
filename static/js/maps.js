"use strict";

let city = {lat: $('#city').data('lat'), lng: $('#city').data('lng')};

let map = new google.maps.Map(document.querySelector('#map'), {
    center: city,
    zoom: 12,
    mapTypeControl: false,
});





function addMarker(lat, lng) {
    // let myImageURL = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
    let nearSydney = new google.maps.LatLng(lat, lng);
    let marker = new google.maps.Marker({
      position: nearSydney,
      map: map,
      title: 'Hover text',
      // icon: myImageURL
  });
  return marker;
}

let restArray = $('#top-restaurants li');

for (let i = 0; i < restArray.length; i++) {
    let lat = restArray[i].dataset.lat;
    let lng = restArray[i].dataset.lng;

    addMarker(lat, lng);
    // let marker = addMarker(lat, lng);
}
// var map;
// function initMap() {
//     map = new google.maps.Map(document.getElementById('map'), {
//         center: eastAustralia,
//         zoom: 8
//     });
// }