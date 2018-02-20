import os
import re
from model import Restaurant
import json
import subprocess


def get_instagram_location(name):
    """"""

    restaurant = Restaurant.query.filter_by(name=name).first()
    restaurant_name = restaurant.name
    restaurant_lat = restaurant.lat
    restaurant_lng = restaurant.lng

    ###########################################################################
    # OS.SYSTEM TO RUN COMMAND, PIPE OUTPUT TO TXT FILE, OPEN + READ TXT FILE #
    ###########################################################################

    # os.system('instagram-scraper --search-location ' + restaurant_name + ' > ig_results.txt')

    # with open('ig_results.txt') as f:
    #     results = f.read()
    #     os.system('rm ig_results.txt')
    #     latPattern = re.compile(r"\b(lat: )(.+?)(?=, lng)")
    #     lngPattern = re.compile(r"\b(lng: )(.*)")
    #     locIdPattern = re.compile(r"\b(location-id: )(.+?)(?=,)")

    #     results = results.rstrip().split('\n')

    #     for item in results:
    #         lat = latPattern.search(item)
    #         lng = lngPattern.search(item)
    #         locId = locIdPattern.search(item)

    #         if lat.group(2) == restaurant_lat and lng.group(2) == restaurant_lng:
    #             return locId.group(2)

    #############################################
    # SUBPROCESS TO RUN COMMAND AND READ OUTPUT #
    #############################################

    string = 'instagram-scraper --search-location ' + restaurant_name
    p = subprocess.Popen(string, stdout=subprocess.PIPE, shell=True)

    # REGEX PATTERNS:
    latPattern = re.compile(r"\b(lat: )(.+?)(?=, lng)")
    lngPattern = re.compile(r"\b(lng: )(.*)")
    locIdPattern = re.compile(r"\b(location-id: )(.+?)(?=,)")

    # LOOP TO READ LINE BY LINE OF STDOUT AND DETERMINE IF THERE IS A LAT / LNG
    # MATCH TO THE YELP LAT / LNG
    while True:
        line = p.stdout.readline()
        if line != '':
            lat = latPattern.search(line)
            lng = lngPattern.search(line)
            locId = locIdPattern.search(line)

            if lat.group(2) == restaurant_lat and lng.group(2) == restaurant_lng:
                return locId.group(2)
        else:
            break


def get_instagram_photos(location):
    """"""

    os.system('instagram-scraper --location ' + location + ' --maximum 10 --media-metadata --media-types none --destination ig_photos')

    # with open('/ig_photos/' + location + '.json') as f:
    #     results = f.read()
    #     print 'this may have worked!'
    #     print results
    #     os.system('rm -r ig_photos/')
