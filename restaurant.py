"""Helper functions related to adding restaurants and list items."""

from model import *
from yelp_api import business
from ig import *
from thread import *
from sqlalchemy import func


def add_new_restaurant(yelp_id):
    """Return restaurant id to create list item."""

    rest = Restaurant.query.filter(Restaurant.yelp_id == yelp_id).first()

    if rest:
        return rest.rest_id
    else:
        # query Yelp API for information related to business with that Yelp ID.
        results = business(yelp_id)

        # parse results for details to store in restaurants table.
        name = results['name']
        lat = results['coordinates']['latitude']
        lng = results['coordinates']['longitude']
        yelp_url = results['url'].split('?')[0]
        yelp_category = results['categories'][0]['title']
        yelp_alias = results['categories'][0]['alias']
        yelp_photo = results['image_url']
        address = results['location']['address1']
        city = results['location']['city']
        state = results['location']['state']

        restaurant = Restaurant(name=name, lat=lat, lng=lng, yelp_id=yelp_id,
                                yelp_url=yelp_url, yelp_category=yelp_category,
                                yelp_alias=yelp_alias, yelp_photo=yelp_photo,
                                address=address, city=city, state=state)

        db.session.add(restaurant)
        db.session.commit()

    return restaurant.rest_id


def add_list_item(rest_id, lst_id, user_id):
    """Add list item to DB."""

    if not ListItem.query.join(List).filter(List.user_id == user_id, ListItem.rest_id == rest_id, List.list_id == lst_id).all():
        lst_item = ListItem(list_id=lst_id, rest_id=rest_id)

        db.session.add(lst_item)
        db.session.commit()

        return lst_item

    else:
        return None


def del_list_item(item_id):
    """Remove list item from DB."""

    lst_item = ListItem.query.get(item_id)
    rest_id = lst_item.rest_id

    db.session.delete(lst_item)
    db.session.commit()

    restaurant = Restaurant.query.get(rest_id)

    return restaurant


def get_list(username, listname):
    """Get list object from DB"""

    user = User.query.filter_by(username=username).first()
    lst = List.query.filter(List.name == listname, List.user_id == user.user_id).first()

    return lst


def get_list_items(lst_id):
    """Get list items from DB"""

    lst_items = ListItem.query.filter(ListItem.list_id == lst_id).all()

    return lst_items


def delete_list(list_id):
    """Delete list from database."""

    lst = List.query.filter_by(list_id=list_id).first()
    list_items = lst.list_items
    lst_name = lst.name

    for item in list_items:
        db.session.delete(item)
        db.session.commit()

    db.session.delete(lst)
    db.session.commit()

    return lst_name + ' has been deleted.'


def add_list(name, status, user_id):
    """Add list to database."""

    lists = User.query.filter_by(user_id=user_id).first().lists

    if check_list(lists, name):
        return None
    else:
        lst = List(user_id=user_id,
                   name=name.lower(),
                   status=status,
                   category_id=2)

        db.session.add(lst)
        db.session.commit()

        return lst


def check_list(lists, name):
    """Check if user already has list with that name."""

    for item in lists:
        if item.name == name.lower():
            return True


def add_fav_list(user_id, name, status, category_id):
    """Create favorite list when user signs up."""

    lst = List(user_id=user_id,
               name=name.lower(),
               status=status,
               category_id=category_id)

    db.session.add(lst)
    db.session.commit()

    return lst


def get_list_items_react(lst_id):
    """get list items for react."""

    lst_items = ListItem.query.filter(ListItem.list_id == lst_id).all()

    restList = []
    for item in lst_items:
        restList.append(item.to_dict())

    restDict = {'restaurants': restList}

    return restDict


def get_list_items_email(lst_items):
    """get restaurants for email."""

    restList = []
    for item in lst_items:
        restaurant = Restaurant.query.filter(Restaurant.yelp_id == item).first()
        restList.append(restaurant.to_dict())

    restDict = {'restaurants': restList}

    return restDict


def get_ranking(yelp_id, city, state):
    """Get ranking of restaurant in that city."""

    restaurants = (db.session.query(Restaurant.yelp_id)
                             .join(ListItem)
                             .join(List)
                             .filter(Restaurant.state == state,
                                     Restaurant.city == city,
                                     List.category_id == 1)
                             .group_by(Restaurant.yelp_id)
                             .order_by(db.desc(func.count(ListItem.rest_id)))
                             .all())
    restaurants = [item[0] for item in restaurants]

    return restaurants.index(yelp_id) + 1
