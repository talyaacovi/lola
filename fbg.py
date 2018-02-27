import requests
import facebook
import os
import urllib3

API_KEY = os.environ['FACEBOOK_ACCESS_TOKEN']

graph = facebook.GraphAPI(access_token=API_KEY)


def request(query, lat, lng, distance='15000'):
    """Facebook helper function"""

    print 'in my FB helper function'
    data = graph.request('/search?q=' + query + '&type=place&center=' + lat + ',' + lng + '&' + distance)

    if data['data']:
        return data['data'][0]['id']
