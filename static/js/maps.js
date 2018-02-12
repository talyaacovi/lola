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
  });
  return marker;
}

let restArray = $('#top-restaurants li');

for (let i = 0; i < restArray.length; i++) {
    let lat = restArray[i].dataset.lat;
    let lng = restArray[i].dataset.lng;

    addMarker(lat, lng);
}


function addInfoWindow() {

  let contentString = '<div id="content">' +
    '<h1>All my custom content</h1>' +
    '</div>';

  let infoWindow = new google.maps.InfoWindow({
    content: contentString,
    maxWidth: 200
  });

  marker.addListener('click', function() {
    infoWindow.open(map, marker);
  });
}