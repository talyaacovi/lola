import requests
import facebook
import os
import urllib3

API_KEY = os.environ['FACEBOOK_ACCESS_TOKEN']

graph = facebook.GraphAPI(access_token=API_KEY)


def request(query, lat, lng, distance='1600'):
    """Get location ID for a place by querying Facebook Graph API."""

    data = graph.request('/search?q=' + query + '&type=place&center=' + lat + ',' + lng + '&distance=' + distance)
    if data['data']:
        return data['data'][0]['id']
