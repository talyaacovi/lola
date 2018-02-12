"use strict";

function initMap() {

    // get latitude and longitude for the city

    let city = {lat: $('#city').data('lat'), lng: $('#city').data('lng')};

    // google map with city as center
    window.map = new google.maps.Map(document.querySelector('#map'), {
        center: city,
        zoom: 12,
        mapTypeControl: false,
    });

    let infoWindow = new google.maps.InfoWindow({
        width: 150
    });

    // get array of all restaurants in list
    let restArray = $('#top-restaurants li');
    let marker, html, restaurant;
    let newLat, newLng, newCenter;

    // iterate over restaurants in array
    for (let i = 0; i < restArray.length; i++) {
        let lat = restArray[i].dataset.lat;
        let lng = restArray[i].dataset.lng;
        // restArray[i].addEventListener('click', changeMapCenter);


        // create map marker for the specific restaurant
        marker = new google.maps.Marker({
                    position: new google.maps.LatLng(lat, lng),
                    map: map,
                    title: 'Hover text',
                    // icon: myImageURL
                });

        // define contents for info window
        html = (
              '<div class="window-content">' +
                    '<p>' + restArray[i].innerText + '</p>' +
              '</div>');

        restaurant = restArray[i];

        // call function to bind info window to map
        bindInfoWindow(marker, map, infoWindow, html);
        changeMapCenter(restaurant, marker, map, infoWindow, html);

    }

    // function adds event listener to markers, closes any opened when one is
    // clicked, sets content based on passed in html, opens info window with
    // new content on the marker that was clicked.
    function bindInfoWindow(marker, map, infoWindow, html) {
        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.close();
            infoWindow.setContent(html);
            infoWindow.open(map, marker);
        });
    }

    function changeMapCenter(restaurant, marker, map, infoWindow, html) {
        restaurant.addEventListener('click', function () {
            infoWindow.close();
            infoWindow.setContent(html);
            infoWindow.open(map, marker);

            // let newLat = parseFloat(evt.target.dataset.lat);
            // let newLng = parseFloat(evt.target.dataset.lng);
            newLat = parseFloat(restaurant.getAttribute('data-lat'));
            newLng = parseFloat(restaurant.getAttribute('data-lng'));

            newCenter = {lat: newLat, lng: newLng};
            map.setCenter(newCenter);
            map.setZoom(14);
        });

    }

}




google.maps.event.addDomListener(window, 'load', initMap);


