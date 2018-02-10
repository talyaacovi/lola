"""Helper functions related to Cities."""

from model import *
from sqlalchemy import func


def get_cities():
    """Get distinct cities and states for which at least one user exists."""

    all_locations = db.session.query(User.city, User.state).distinct().all()
    return all_locations


def get_users_by_city(state, city):
    """Get all users for a specific city and state."""

    all_users = User.query.filter(User.state == state.upper(), User.city == city.upper()).all()

    return all_users


def get_restaurants_by_city(state, city):
    """Get restaurants added to lists by users of that city."""

    # get list ids for a specific city + state
    restaurants = []

    lsts = List.query.join(User).filter(User.state == state.upper(), User.city == city.upper(), List.category_id == 1).all()
    for lst in lsts:
        for item in lst.list_items:
            restaurants.append(item.restaurant)

    return set(restaurants)


def count_restaurants_by_city(state, city):
    """stuff"""

    restaurants = db.session.query(func.count(ListItem.rest_id), ListItem.rest_id).join(List).join(User).filter(User.state == state.upper(), User.city == city.upper(), List.category_id == 1).group_by(ListItem.rest_id).all()
    restaurants.sort(reverse=True)

    restList = []
    for count, rest_id in restaurants:
        restList.append(Restaurant.query.filter_by(rest_id=rest_id).first())

    return restList

    # sf = db.session.query(ListItem.rest_id, func.count(ListItem.rest_id)).join(List).join(User).filter(User.state == 'CA', User.city == 'SAN FRANCISCO').group_by(ListItem.rest_id).all()
    # restaurants = []
    # for rest_id, count in sf:
    #     newDict = {}
    #     restaurant_object = Restaurant.query.filter_by(rest_id=rest_id).first()
    #     newDict['restaurant']



    # restaurants = {}

    # lsts = List.query.join(User).filter(User.state == 'CA', User.city == 'SAN FRANCISCO', List.category_id == 1).all()
    # for lst in lsts:
    #     for item in lst.list_items:
    #         restaurants[item.restaurant.name] = restaurants.get(item.restaurant.name, 0) + 1

    # return restaurants
