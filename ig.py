import os
import re
from model import db, Photo, Restaurant
import json
import subprocess
import fbg as fb


def get_instagram_location(rest_id, rest_name, rest_lat, rest_lng, rest_address, rest_city):
    """Get Instagram Location ID based on restaurant name and Yelp lat/lng."""

    #############################################
    # SUBPROCESS TO RUN COMMAND AND READ OUTPUT #
    #############################################

    loc_id = fb.request(rest_name, rest_lat, rest_lng)
    if loc_id:
        return loc_id

    else:
        string = 'instagram-scraper --search-location ' + rest_address + ' ' + rest_name
        p = subprocess.Popen(string, stdout=subprocess.PIPE, shell=True)  # TAKE OUT shell=True

        # REGEX PATTERNS:
        latPattern = re.compile(r"\b(lat: )(.+?)(?=, lng)")
        lngPattern = re.compile(r"\b(lng: )(.*)")
        locIdPattern = re.compile(r"\b(location-id: )(.+?)(?=,)")
        addressPattern = re.compile(r"\b(subtitle: )(.+?)(?=,)")
        cityPattern = re.compile(r"\b(city: )(.+?)(?=,)")

        # LOOP TO READ LINE BY LINE OF STDOUT AND DETERMINE IF THERE IS A LAT / LNG
        # MATCH TO THE YELP LAT / LNG
        while True:
            line = p.stdout.readline()
            if line != '':
                lat = latPattern.search(line)
                lng = lngPattern.search(line)
                locId = locIdPattern.search(line)
                address = addressPattern.search(line)
                city = cityPattern.search(line)

                if (lat.group(2) == rest_lat and lng.group(2) == rest_lng) or (address.group(2) == rest_address and city.group(2) == rest_city):

                    restaurant = Restaurant.query.filter_by(rest_id=rest_id).first()
                    restaurant.ig_loc_id = locId.group(2)
                    db.session.commit()
                    return locId.group(2)

                elif (address.group(2) == rest_address or city.group(2) == rest_city):

                    restaurant = Restaurant.query.filter_by(rest_id=rest_id).first()
                    restaurant.ig_loc_id = locId.group(2)
                    db.session.commit()
                    return locId.group(2)

            else:
                break


# this function scrapes instagram for a specific location ID and creates records
# in the photos table with the returned URLs.
def get_instagram_photos(rest_id, location):
    """"""

    os.system('instagram-scraper --location ' + location + ' --maximum 6 --media-metadata --media-types none --destination ig_photos')

    # try with subprocess:
    # string = 'instagram-scraper --location ' + location + ' --maximum 4 --media-metadata --media-types none --destination ig_photos'
    # p = subprocess.Popen(string, stdout=subprocess.PIPE, shell=True)  # TAKE OUT shell=True
    # p.terminate()

    json_file = 'ig_photos/' + location + '.json'

    with open(json_file) as json_data:
        results = json.load(json_data)
        for result in results:
            url = result['urls'][0]
            photo = Photo(rest_id=rest_id, url=url)

            db.session.add(photo)
            db.session.commit()

    os.system('rm ig_photos/' + location + '.json')

    return 'success'
