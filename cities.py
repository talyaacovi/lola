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

    all_locations = db.session.query(User.city, User.state).distinct().all()
    return all_locations