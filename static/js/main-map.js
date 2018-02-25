"use strict";

function initMap() {

    // google map with united states as center
    window.map = new google.maps.Map(document.querySelector('#main-map'), {
        center: {lat: 40, lng: -95},
        zoom: 4.4,
        mapTypeControl: false,
        zoomControl: false,
    });

    let infoWindow = new google.maps.InfoWindow({
        width: 150
    });

    // get array of all cities in DB
    let cityArray = $('#city-div li');
    let marker, html, restaurant, inactiveHtml, activeHtml;
    let newLat, newLng, newCenter;

    // iterate over cities in array
    for (let i = 0; i < cityArray.length; i++) {
        let lat = cityArray[i].dataset.lat;
        let lng = cityArray[i].dataset.lng;
        let city = cityArray[i].dataset.city;
        let state = cityArray[i].dataset.state;

        // create map marker for the specific city
        marker = new google.maps.Marker({
                    position: new google.maps.LatLng(lat, lng),
                    map: map,
                    title: 'Hover text',
                    // icon: myImageURL
                });

        // define contents for info window
        activeHtml = (
              '<div class="window-content">' +
                    '<a class="main-markers" href="/cities/' + state + '/' + city + '">' + cityArray[i].innerText + '</a>' +
              '</div>');

        inactiveHtml = (
              '<div class="window-content">' +
                    '<p>' + cityArray[i].innerText + '</p>' +
              '</div>');

        // call function to bind info window to map

        bindInfoWindow(marker, map, infoWindow, activeHtml, inactiveHtml);

    }

    // function adds event listener to markers, closes any opened when one is
    // clicked, sets content based on passed in html, opens info window with
    // new content on the marker that was clicked.
    function bindInfoWindow(marker, map, infoWindow, activeHtml, inactiveHtml) {
        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.close();
            // infoWindow.setContent(html);
            if (isActive) {
                infoWindow.setContent(activeHtml);
            }
            else {
                infoWindow.setContent(inactiveHtml);
            }
            infoWindow.open(map, marker);
        });
    }

}




google.maps.event.addDomListener(window, 'load', initMap);


document.getElementById('map-view-btn').addEventListener('click', function(evt) {
    $('#main-map').show();
    $('#city-div').hide();
});

document.getElementById('list-view-btn').addEventListener('click', function(evt) {
    $('#city-div').show();
    $('#main-map').hide();
});