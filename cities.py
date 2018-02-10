"""Helper functions related to Cities."""

from model import *


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
