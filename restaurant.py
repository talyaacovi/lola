"""Helper functions related to adding restaurants and list items."""

from model import Restaurant, ListItem, db, List


def add_new_restaurant(data, yelp_id):
    """Check if restaurant exists in DB before adding it."""

    if not Restaurant.query.filter_by(yelp_id=yelp_id).first():
        name = data['name']
        lat = data['coordinates']['latitude']
        lng = data['coordinates']['longitude']
        yelp_url = data['url'].split('?')[0]
        yelp_category = data['categories'][0]['title']
        yelp_photo = data['image_url']

        restaurant = Restaurant(name=name, lat=lat, lng=lng, yelp_id=yelp_id,
                                yelp_url=yelp_url, yelp_category=yelp_category,
                                yelp_photo=yelp_photo)

        db.session.add(restaurant)
        db.session.commit()

    return Restaurant.query.filter_by(yelp_id=yelp_id).first().rest_id


def add_list_item(rest_id, lst_id):
    """Add list item to DB."""

    if not ListItem.query.filter_by(rest_id=rest_id).first():
        lst_item = ListItem(list_id=lst_id, rest_id=rest_id)

        db.session.add(lst_item)
        db.session.commit()

        restaurant_name = Restaurant.query.filter_by(rest_id=rest_id).first().name

        return restaurant_name

    else:
        return False


def get_list(lst_id):
    """Get list object from DB"""

    lst = List.query.filter_by(list_id=lst_id).first()

    return lst


def get_list_items(lst_id):
    """Get list items from DB"""

    lst_items = ListItem.query.filter(ListItem.list_id == lst_id).all()

    return lst_items
