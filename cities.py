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


def check_city_state(state, city):
    """Check if registered user exists in that city state combination."""

    return User.query.filter(User.state == state.upper(), User.city == city.upper()).all()


# def get_restaurants_by_city(state, city):
#     """Get restaurants added to lists by users of that city."""

#     restaurants = []

#     lsts = List.query.join(User).filter(User.state == state.upper(), User.city == city.upper(), List.category_id == 1).all()
#     for lst in lsts:
#         for item in lst.list_items:
#             restaurants.append(item.restaurant)

#     return set(restaurants)


def count_restaurants_by_city(state, city):
    """Get top 10 restaurants for a specific city."""

    restaurants = db.session.query(func.count(ListItem.rest_id), ListItem.rest_id).join(List).join(User).filter(User.state == state.upper(), User.city == city.upper(), List.category_id == 1).group_by(ListItem.rest_id).all()
    restaurants.sort(reverse=True)

    restList = []
    for count, rest_id in restaurants:
        restList.append(Restaurant.query.filter_by(rest_id=rest_id).first())

    return restList[:10]


def get_city_lat_lng(state, city):
    """Get lat and lng coordinates for a city."""

    location = Zipcode.query.filter(Zipcode.city == city.upper(), Zipcode.state == state.upper()).first()

    return location
