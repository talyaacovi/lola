"""Helper functions related to comparing and recommending."""

from model import *
from flask import session


def get_user_favorite_restaurants():
    """stuff."""

    my_restaurants = (db.session.query(Restaurant.rest_id)
                      .join(ListItem)
                      .join(List)
                      .join(User)
                      .filter(User.user_id == session['user_id'],
                              List.category_id == 1)
                      .group_by(Restaurant.rest_id)
                      .all())
    return my_restaurants


def get_most_similar_user(my_restaurants):
    """more stuff!"""

    my_restaurants_list = list(map(lambda x: x[0], my_restaurants))

    users = (db.session.query(User)
             .join(List)
             .join(ListItem)
             .filter(User.state == session['state'],
                     User.city == session['city'],
                     User.user_id != session['user_id'],
                     List.category_id == 1)
             .all())

    max_points = 0
    most_similar_user = {}

    for user in users:
        user_restaurants = (db.session.query(Restaurant.rest_id)
                            .join(ListItem)
                            .join(List)
                            .join(User)
                            .filter(User.user_id == user.user_id,
                                    List.category_id == 1)
                            .group_by(Restaurant.rest_id)
                            .all())

        user_restaurants_list = list(map(lambda x: x[0], user_restaurants))
        similar_restaurants = [x for x in user_restaurants_list if x in my_restaurants_list]
        dissimilar_restaurants = [x for x in user_restaurants_list if x not in my_restaurants_list]

        points = 10 * len(similar_restaurants)

        if points > max_points:
            max_points = points
            most_similar_user['name'] = user.username
            most_similar_user['photo'] = user.profiles[0].image_fn
            most_similar_user['rest_ids'] = similar_restaurants
            most_similar_user['uncommon'] = dissimilar_restaurants

    return most_similar_user


def get_common_rests(rests_in_common_ids):
    """More more stuff!"""

    rest_objects = []
    for rest in rests_in_common_ids:
        rest_objects.append(Restaurant.query.filter_by(rest_id=rest).first())

    return rest_objects
