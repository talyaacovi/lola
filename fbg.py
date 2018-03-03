import requests
import facebook
import os
import urllib3

API_KEY = os.environ['FACEBOOK_ACCESS_TOKEN']

graph = facebook.GraphAPI(access_token=API_KEY)


def request(query, lat, lng, distance='1600'):
    """Facebook helper function"""

    print 'in my FB helper function'
    print lat, type(lat)
    print lng, type(lng)
    print distance, type(distance)
    search_query = '/search?q=' + query + '&type=place&center=' + lat + ',' + lng + '&' + distance
    print search_query

    data = graph.request('/search?q=' + query + '&type=place&center=' + lat + ',' + lng + '&distance=' + distance)
    if data['data']:
        print data['data'][0]['id']
        return data['data'][0]['id']
