"""Models and database functions for final project."""

from flask_sqlalchemy import SQLAlchemy
from flask import Flask

# This is the connection to the PostgreSQL database; we're getting this through
# the Flask-SQLAlchemy helper library. On this, we can find the `session`
# object, where we do most of our interactions (like committing, etc.)

db = SQLAlchemy()


##############################################################################
# Model definitions

class User(db.Model):
    """Users that have created an account for the local favorites site."""

    __tablename__ = 'users'

    user_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    email = db.Column(db.String(128), nullable=False, unique=True)
    password = db.Column(db.String(128), nullable=False)
    username = db.Column(db.String(128), nullable=False, unique=True)
    city = db.Column(db.String(64), nullable=False)
    state = db.Column(db.String(64), nullable=False)
    zipcode = db.Column(db.String(64), nullable=False)
    # profile_filename = db.Column(db.String(128))
    # profile_url = db.Column(db.String(128))

    def __repr__(self):
        """Provide helpful representation of user."""

        return "<User id={} user_name={} city={}, {}>".format(self.user_id,
                                                              self.username,
                                                              self.city,
                                                              self.state)


class Profile(db.Model):
    """Users that have created an account for the local favorites site."""

    __tablename__ = 'profiles'

    profile_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer,
                        db.ForeignKey('users.user_id'),
                        nullable=False)
    image_fn = db.Column(db.String(256))
    image_url = db.Column(db.String(256))
    fav_rest = db.Column(db.String(128))
    fav_dish = db.Column(db.String(128))
    fav_city = db.Column(db.String(128))

    user = db.relationship('User', backref='profiles')

    def to_dict(self):
        """Return dict of profile info."""

        return {'profile_id': self.profile_id,
                'user_id': self.user_id,
                'image_fn': self.image_fn,
                'image_url': self.image_url,
                'fav_rest': self.fav_rest,
                'fav_dish': self.fav_dish,
                'fav_city': self.fav_city}

    def __repr__(self):
        """Provide helpful representation of user profile."""

        return "<User id={} fav_rest={} fav_dish={} fav_city={}>".format(self.user_id,
                                                                         self.fav_rest,
                                                                         self.fav_dish,
                                                                         self.fav_city)


class List(db.Model):
    """Lists belonging to users."""

    __tablename__ = 'lists'

    list_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer,
                        db.ForeignKey('users.user_id'),
                        nullable=False)
    name = db.Column(db.String(128), nullable=False)
    status = db.Column(db.String(64), nullable=False)
    category_id = db.Column(db.Integer,
                            db.ForeignKey('list_categories.list_c_id'))

    user = db.relationship('User', backref='lists')
    list_category = db.relationship('ListCategory', backref='lists')

    def to_dict(self):
        """Return dict of list."""

        return {'list_id': self.list_id,
                'user_id': self.user_id,
                'name': self.name,
                'category_id': self.category_id}

    def __repr__(self):
        """Provide helpful representation of list."""

        return "<List id={} name={}>".format(self.list_id, self.name)


class ListCategory(db.Model):
    """Category of list."""

    __tablename__ = 'list_categories'

    list_c_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    category = db.Column(db.String(128))

    def __repr__(self):
        """Provide helpful representation of list category."""

        return "<Category id={} name={}>".format(self.list_c_id, self.category)


class ListItem(db.Model):
    """Restaurant items belonging to a specific user-created list."""

    __tablename__ = 'list_items'

    item_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    list_id = db.Column(db.Integer,
                        db.ForeignKey('lists.list_id'),
                        nullable=False)
    rest_id = db.Column(db.Integer,
                        db.ForeignKey('restaurants.rest_id'),
                        nullable=False)
    ordinal = db.Column(db.Integer)

    lst = db.relationship('List', backref='list_items')
    restaurant = db.relationship('Restaurant', backref='list_items')

    def to_dict(self):
        """Return dict of list item."""

        return {'rest_name': self.restaurant.name,
                'yelp_id': self.restaurant.yelp_id,
                'item_id': self.item_id,
                'yelp_category': self.restaurant.yelp_category,
                'yelp_url': self.restaurant.yelp_url,
                'image': self.restaurant.yelp_photo}

    def __repr__(self):
        """Provide helpful representation of list items."""

        return "<Item id={}>".format(self.item_id)


class Restaurant(db.Model):
    """Restaurants that have been added by users."""

    __tablename__ = 'restaurants'

    rest_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    lat = db.Column(db.String(128), nullable=False)
    lng = db.Column(db.String(128), nullable=False)
    # yelp_rating = db.Column(db.Integer)
    # yelp_price = db.Column(db.String(64))
    yelp_id = db.Column(db.String(128))
    yelp_url = db.Column(db.String(256))
    yelp_category = db.Column(db.String(128))
    yelp_photo = db.Column(db.String(256))
    address = db.Column(db.String(128))
    city = db.Column(db.String(128))
    state = db.Column(db.String(128))

    ig_loc_id = db.Column(db.String(256))

    def to_dict(self):
        """Return dict of list item."""

        return {'rest_name': self.name,
                'yelp_id': self.yelp_id,
                'yelp_category': self.yelp_category,
                'yelp_url': self.yelp_url,
                'image': self.yelp_photo,
                'lat': self.lat,
                'lng': self.lng,
                'address': self.address,
                'city': self.city,
                'state': self.state}

    def __repr__(self):
        """Provide helpful representation of restaurant."""

        return "<Rest id={} name={}>".format(self.rest_id, self.name)


class Zipcode(db.Model):
    """Table for converting zipcodes to other location info."""

    __tablename__ = 'zipcodes'

    zipcode = db.Column(db.String(128), primary_key=True)
    city = db.Column(db.String(128))
    state = db.Column(db.String(128))
    lat = db.Column(db.String(128))
    lng = db.Column(db.String(128))


class Photo(db.Model):
    """Store photos for each restaurant."""

    __tablename__ = 'photos'

    photo_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    rest_id = db.Column(db.Integer,
                        db.ForeignKey('restaurants.rest_id'),
                        nullable=False)
    url = db.Column(db.String(512))

    restaurant = db.relationship('Restaurant', backref='photos')

    def __repr__(self):
        """Provide helpful representation of photo."""

        return "<id={} rest_id={}>".format(self.photo_id, self.rest_id)


##############################################################################
# TBD Tables

# class GoodForCatg(db.Model):
#     """Categories that restaurants can be good for."""

#     __tablename__ = 'good_for_catgs'

#     g_f_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
#     name = db.Column(db.String(128), nullable=False)

#     def __repr__(self):
#         """Provide helpful representation of categories."""

#         return "<id={} name={}>".format(self.g_f_id, self.name)


# class UserRestaurantGoodForCatg(db.Model):
#     """What category users have indicated a specific restaurant is good for."""

#     __tablename__ = 'user_restaurant_good_for_catgs'

#     u_g_f_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
#     user_id = db.Column(db.Integer,
#                         db.ForeignKey('users.user_id'),
#                         nullable=False)
#     g_f_id = db.Column(db.Integer,
#                        db.ForeignKey('good_for_catgs.g_f_id'),
#                        nullable=False)
#     rest_id = db.Column(db.Integer,
#                         db.ForeignKey('restaurants.rest_id'),
#                         nullable=False)

#     def __repr__(self):
#         """Provide helpful representation of user-selected category."""

#         return "<id={} user_id={}>".format(self.u_g_f_id, self.user_id)


# class RestaurantLike(db.Model):
#     """What category users have indicated a specific restaurant is good for."""

#     __tablename__ = 'restaurant-likes'

#     like_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
#     user_id = db.Column(db.Integer,
#                         db.ForeignKey('users.user_id'),
#                         nullable=False)
#     rest_id = db.Column(db.Integer,
#                         db.ForeignKey('restaurants.rest_id'),
#                         nullable=False)

#     def __repr__(self):
#         """Provide helpful representation of user-selected category."""

#         return "<id={} user_id={}>".format(self.u_g_f_id, self.user_id)

# class UserRestaurant(db.Model):
#     """Restaurants that have been added by users."""

#     __tablename__ = 'user_restaurants'

#     user_rest_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
#     user_id = db.Column(db.Integer,
#                         db.ForeignKey('users.user_id'),
#                         nullable=False)
#     rest_id = db.Column(db.Integer,
#                         db.ForeignKey('restaurants.rest_id'),
#                         nullable=False)
#     fav_dish = db.Column(db.String(128))

#     def __repr__(self):
#         """Provide helpful representation of user / restaurant relationship."""

#         return "<User_rest id={} favorite dish={}>".format(self.user_rest_id,
#                                                            self.fav_dish)


# class UserRestaurantFavDish(db.Model):
#     """Favorite dishes specified by user for certain restaurant."""

#     __tablename__ = 'user_restaurant_fav_dishes'

#     dish_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
#     user_id = db.Column(db.Integer,
#                         db.ForeignKey('users.user_id'),
#                         nullable=False)
#     rest_id = db.Column(db.Integer,
#                         db.ForeignKey('restaurants.rest_id'),
#                         nullable=False)
#     name = db.Column(db.String(128))

#     def __repr__(self):
#         """Provide helpful representation of favorite dishes."""

#         return "<dish id={} name={}>".format(self.dish_id,
#                                              self.name)


# class Friendship(db.Model):
#     """Defines friendships among users based on Facebook data."""

#     __tablename__ = 'friendships'

#     friendship_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
#     f_1_id = db.Column(db.Integer,
#                        db.ForeignKey('users.user_id'),
#                        nullable=False)
#     f_2_id = db.Column(db.Integer,
#                        db.ForeignKey('users.user_id'),
#                        nullable=False)

#     def __repr__(self):
#         """Provide helpful representation of friendships."""

#         return "<Friend 1 id={} Friend 2 id={}>".format(self.f_1_id,
#                                                         self.f_2_id)


def connect_to_db(app, db_uri='postgresql:///restaurants'):
    """Connect the database to Flask app."""

    # Configure to use PostgreSQL database
    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    app.config['SQLALCHEMY_ECHO'] = False
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False
    db.app = app
    db.init_app(app)


def example_data():
    """Create some sample data for testing."""

    tal = User(email='talyaacovi@gmail.com', password='password', username='talyaac', city='SAN FRANCISCO', state='CA', zipcode='94103')
    logan = User(email='loganbestwick@gmail.com', password='password', username='logan', city='SAN FRANCISCO', state='CA', zipcode='94103')
    fred = User(email='fred@gmail.com', password='password', username='fred', city='SEATTLE', state='WA', zipcode='98105')

    sf = Zipcode(zipcode='94103', city='SAN FRANCISCO', state='CA', lat='37.77', lng='122.41')
    seattle = Zipcode(zipcode='98105', city='SEATTLE', state='WA', lat='47.66', lng='122.29')
    sf_2 = Zipcode(zipcode='94117', city='SAN FRANCISCO', state='CA', lat='37.76', lng='122.44')

    favorites = ListCategory(category='favorites')

    db.session.add_all([tal, logan, fred, sf, seattle, sf_2, favorites])
    db.session.commit()


if __name__ == "__main__":
    # As a convenience, if we run this module interactively, it will leave
    # you in a state of being able to work with the database directly.

    app = Flask(__name__)
    connect_to_db(app)
    print "Connected to DB."
    # db.create_all()
