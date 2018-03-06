"""Yelp API helper functions."""

import os
import requests
from urllib import quote

API_KEY = os.environ['YELP_API_KEY']

API_HOST = 'https://api.yelp.com'
SEARCH_PATH = '/v3/businesses/search'
BUSINESS_PATH = '/v3/businesses/'


SEARCH_LIMIT = 5


def request(host, path, api_key, url_params=None):
    """Make request to Yelp Fusion API."""
    url_params = url_params or {}
    # url = '{0}{1}'.format(host, quote(path.encode('utf8')))
    # url = 'https://api.yelp.com/v3/businesses/search'
    url = '{}{}'.format(host, quote(path.encode('utf8')))
    # to authenticate API calls with the API key,
    # set the authorization HTTP header value as Bearer API_KEY
    headers = {
        'Authorization': 'Bearer %s' % api_key,
    }
    print(u'Querying {0} ...'.format(url))

    response = requests.request('GET', url, headers=headers, params=url_params)

    return response.json()


def search(term, location):
    """Query the Search endpoint of the Yelp Fusion API."""

    api_key = API_KEY

    url_params = {
        'term': term.replace(' ', '+'),
        'location': location.replace(' ', '+'),
        'limit': SEARCH_LIMIT,
        'categories': 'restaurants'
    }
    return request(API_HOST, SEARCH_PATH, api_key, url_params=url_params)


def search_hot_new(location, categories):
    """Query the Search endpoint of Yelp Fusion API with 'hot and new' flag."""

    api_key = API_KEY

    url_params = {
        'location': location.replace(' ', '+'),
        'limit': 10,
        'attributes': 'hot_and_new',
        'categories': categories
    }
    return request(API_HOST, SEARCH_PATH, api_key, url_params=url_params)


def business(business_id):
    """Query the Business endpoint of the Yelp Fusion API."""

    api_key = API_KEY

    business_path = BUSINESS_PATH + business_id

    return request(API_HOST, business_path, api_key)
