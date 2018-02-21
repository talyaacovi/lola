import os
import re
from model import db, Photo
import json
import subprocess


def get_instagram_location(rest_id, rest_name, rest_lat, rest_lng):
    """Get Instagram Location ID based on restaurant name and Yelp lat/lng."""

    print 'in my get IG location stuff!!!!!!!!!'
    # restaurant = Restaurant.query.filter_by(yelp_id=yelp_id).first()
    # restaurant_name = restaurant.name
    # restaurant_lat = restaurant.lat
    # restaurant_lng = restaurant.lng

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

    string = 'instagram-scraper --search-location ' + rest_name
    p = subprocess.Popen(string, stdout=subprocess.PIPE, shell=True)

    # NEED TO ADD EXCEPTION FOR IF LOCATION ID NOT FOUND

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

            print lat.group(2)
            print rest_lat
            print lng.group(2)
            print rest_lng
            print locId.group(2)

            if lat.group(2) == rest_lat and lng.group(2) == rest_lng:
                return locId.group(2)
        else:
            break


# this function scrapes instagram for a specific location ID and creates records
# in the photos table with the returned URLs.
def get_instagram_photos(rest_id, location):
    """"""

    os.system('instagram-scraper --location ' + location + ' --maximum 4 --media-metadata --media-types none --destination ig_photos')

    # if using subprocess, can try p.terminate()

    json_file = 'ig_photos/' + location + '.json'

    with open(json_file) as json_data:
        results = json.load(json_data)
        for result in results:
            url = result['urls'][0]
            photo = Photo(rest_id=rest_id, url=url)

            db.session.add(photo)
            db.session.commit()

    os.system('rm -R ig_photos/')
    return 'success'


# this function scrapes instagram for a specific location ID and appends URL
# results to a list which is returned to render on the page.
def get_instagram_photos_test(rest_id, location):
    """"""

    os.system('instagram-scraper --location ' + location + ' --maximum 4 --media-metadata --media-types none --destination ig_photos')

    # if using subprocess, can try p.terminate()

    json_file = 'ig_photos/' + location + '.json'

    photo_list = []

    with open(json_file) as json_data:
        results = json.load(json_data)
        for result in results:
            photo_list.append(result['urls'][0])

    os.system('rm -R ig_photos/')

    return photo_list


# pink onion location ID: 1179108628832028

# LOCATION RESPONSE FROM YELP FOR SPECIFIC BUSINESS ID:
# u'location':
#     {u'cross_streets': u'York St & Hampshire St',
#     u'city': u'San Francisco',
#     u'display_address': [u'2501 Mariposa St', u'San Francisco, CA 94110'],
#     u'country': u'US',
#     u'address2': u'',
#     u'address3': None,
#     u'state': u'CA',
#     u'address1': u'2501 Mariposa St',
#     u'zip_code': u'94110'}

# # JSON FILE FOR ONE RESULT:
# a list of dictionaries
# each dictionary has these keys:
#     edge_liked_by           {u'count': 46}
#     tags                    [u'sfeats', u'sfrestaurants', u'sanfransiscofood', u'sicilianfood']
#     taken_at_timestamp      1489016232
#     owner                   {u'id': u'3258662596'}
#     id                      u'1466296893453577079'
#     edge_media_to_caption   {u'edges':
#                                 [{u'node': {u'text': u'Where can you enjoy great food made with Amphora Nueva products? Check out Pink Onion SF. This salad made with our blood orange fused oil was spectacular! @pinkonionpizza #sfeats #sicilianfood #sfrestaurants #sanfransiscofood'}}]}
#     dimensions              {u'width': 1080, u'height': 1080}
#     display_url             u'https://instagram.fsnc1-1.fna.fbcdn.net/vp/f0141bbc960d069d8856bac3144df70b/5B05A583/t51.2885-15/e35/17817412_1364674040283324_1574237133256785920_n.jpg'
#     edge_media_to_comment   {u'count': 4}
#     urls                    [u'https://instagram.fsnc1-1.fna.fbcdn.net/vp/f0141bbc960d069d8856bac3144df70b/5B05A583/t51.2885-15/e35/17817412_1364674040283324_1574237133256785920_n.jpg']
#     thumbnail_src           u'https://instagram.fsnc1-1.fna.fbcdn.net/vp/d8dd1056a6862b5f3cb2a3cc778409de/5B0C0CA9/t51.2885-15/s640x640/sh0.08/e35/17817412_1364674040283324_1574237133256785920_n.jpg'
#     shortcode               u'BRZVUF9jyt3'
#     is_video                False

# [{u'urls':
# [u'https://instagram.fsnc1-1.fna.fbcdn.net/vp/f0141bbc960d069d8856bac3144df70b/5B05A583/t51.2885-15/e35/17817412_1364674040283324_1574237133256785920_n.jpg'],
# u'edge_media_to_caption':
#     {u'edges':
#         [{u'node': {u'text': u'Where can you enjoy great food made with Amphora Nueva products? Check out Pink Onion SF. This salad made with our blood orange fused oil was spectacular! @pinkonionpizza #sfeats #sicilianfood #sfrestaurants #sanfransiscofood'}}]},
#         u'dimensions': {u'width': 1080, u'height': 1080},
#         u'display_url': u'https://instagram.fsnc1-1.fna.fbcdn.net/vp/f0141bbc960d069d8856bac3144df70b/5B05A583/t51.2885-15/e35/17817412_1364674040283324_1574237133256785920_n.jpg',
#         u'edge_media_to_comment': {u'count': 4}, u'tags': [u'sfeats', u'sfrestaurants', u'sanfransiscofood', u'sicilianfood'],
#         u'taken_at_timestamp': 1489016232, u'edge_liked_by': {u'count': 46}, u'shortcode': u'BRZVUF9jyt3', u'owner': {u'id': u'3258662596'},
#         u'thumbnail_src': u'https://instagram.fsnc1-1.fna.fbcdn.net/vp/d8dd1056a6862b5f3cb2a3cc778409de/5B0C0CA9/t51.2885-15/s640x640/sh0.08/e35/17817412_1364674040283324_1574237133256785920_n.jpg',
#         u'is_video': False, u'id': u'1466296893453577079'}]
