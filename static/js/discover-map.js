"use strict";

function initMap() {

    // get latitude and longitude for the city

    let city = {lat: $('#hot-new-rests').data('lat'), lng: $('#hot-new-rests').data('lng')};

    // google map with city as center
    window.map = new google.maps.Map(document.querySelector('#discover-map'), {
        center: city,
        zoom: 12.2,
        mapTypeControl: false,
        styles: MAPSTYLES
    });

    let infoWindow = new google.maps.InfoWindow({
        width: 150
    });

    // get array of all restaurants in list
    let restArray = $('#hot-new-rests li');
    let marker, html, restaurant, url;
    let newLat, newLng, newCenter;

    // iterate over restaurants in array
    for (let i = 0; i < restArray.length; i++) {
        let lat = restArray[i].dataset.lat;
        let lng = restArray[i].dataset.lng;
        let ig_loc_id = restArray[i].dataset.ig;
        let yelp_id = restArray[i].dataset.yelpId;


        // create map marker for the specific restaurant
        marker = new google.maps.Marker({
                    position: new google.maps.LatLng(lat, lng),
                    map: map,
                    title: 'Hover text',
                    icon: '/static/img/popsicle-marker.png'
                });

        if (ig_loc_id) {
            url = "https://www.instagram.com/explore/locations/" + ig_loc_id;
        }
        else {
            url = "https://www.yelp.com/biz/" + yelp_id;
        }
        // define contents for info window
        html = (
              '<div class="window-content">' +
                    '<p><a href="/restaurants/' + yelp_id  + '">' + restArray[i].innerText + '</a></p>' +
              '</div>');

        restaurant = restArray[i];

        // call function to bind info window to map
        bindInfoWindow(restaurant, marker, map, infoWindow, html);

    }

    // function adds event listener to markers, closes any opened when one is
    // clicked, sets content based on passed in html, opens info window with
    // new content on the marker that was clicked.
    function bindInfoWindow(restaurant, marker, map, infoWindow, html) {
        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.close();
            infoWindow.setContent(html);
            infoWindow.open(map, marker);
        });
        restaurant.addEventListener('click', function () {
            infoWindow.close();
            infoWindow.setContent(html);
            infoWindow.open(map, marker);
        });

    }

}




google.maps.event.addDomListener(window, 'load', initMap);


