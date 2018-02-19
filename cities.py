"""Helper functions related to Cities."""

from model import *
from sqlalchemy import func


def get_cities():
    """Get distinct cities and states for which at least one user exists."""

    all_locations = db.session.query(User.city, User.state).distinct().all()

    # [{'city': 'san francisco', 'state': 'CA', 'lat': 'lat'}, {'city'}]

    location_list = []

    for city, state in all_locations:
        location_obj = get_city_lat_lng(state, city)
        location_dict = {'city': city,
                         'state': state,
                         'lat': location_obj.lat,
                         'lng': location_obj.lng}
        location_list.append(location_dict)

    return location_list


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

    # query to get COUNT with Restaurant object.
    # restaurants = (db.session.query(Restaurant, func.count(ListItem.rest_id))
    #                          .join(ListItem)
    #                          .join(List)
    #                          .join(User)
    #                          .filter(User.state == 'CA',
    #                                  User.city == 'SAN FRANCISCO',
    #                                  List.category_id == 1)
    #                          .group_by(Restaurant.rest_id)
    #                          .order_by(db.desc(func.count(ListItem.rest_id)))
    #                          .limit(10).all())

    restaurants = (db.session.query(Restaurant)
                             .join(ListItem)
                             .join(List)
                             .join(User)
                             .filter(User.state == state.upper(),
                                     User.city == city.upper(),
                                     List.category_id == 1)
                             .group_by(Restaurant.rest_id)
                             .order_by(db.desc(func.count(ListItem.rest_id)))
                             .limit(10)
                             .all())

    return restaurants


def get_city_lat_lng(state, city):
    """Get lat and lng coordinates for a city."""

    location = Zipcode.query.filter(Zipcode.city == city.upper(), Zipcode.state == state.upper()).first()

    return location
