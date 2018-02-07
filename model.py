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

    def __repr__(self):
        """Provide helpful representation of user."""

        return "<User id={} user_name={} city={}, {}>".format(self.user_id,
                                                              self.username,
                                                              self.city,
                                                              self.state)


class List(db.Model):
    """Lists belonging to users."""

    __tablename__ = 'lists'

    list_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer,
                        db.ForeignKey('users.user_id'),
                        nullable=False)
    name = db.Column(db.String(128), nullable=False)
    # lists can be in draft or published status
    status = db.Column(db.String(64), nullable=False)
    # this could be a Boolean flag

    def __repr__(self):
        """Provide helpful representation of list."""

        return "<List id={} name={}>".format(self.list_id, self.name)


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
    # yelp_location = db.Column(db.String(256))
    yelp_url = db.Column(db.String(256))
    yelp_category = db.Column(db.String(128))  # hot_and_new?
    yelp_photo = db.Column(db.String(256))  # or IG photo

    def __repr__(self):
        """Provide helpful representation of restaurant."""

        return "<Rest id={} name={}>".format(self.rest_id, self.name)


class UserRestaurant(db.Model):
    """Restaurants that have been added by users."""

    __tablename__ = 'user_restaurants'

    user_rest_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer,
                        db.ForeignKey('users.user_id'),
                        nullable=False)
    rest_id = db.Column(db.Integer,
                        db.ForeignKey('restaurants.rest_id'),
                        nullable=False)
    fav_dish = db.Column(db.String(128))

    def __repr__(self):
        """Provide helpful representation of user / restaurant relationship."""

        return "<User_rest id={} favorite dish={}>".format(self.user_rest_id,
                                                           self.fav_dish)


class UserRestaurantFavDish(db.Model):
    """Favorite dishes specified by user for certain restaurant."""

    __tablename__ = 'user_restaurant_fav_dishes'

    dish_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer,
                        db.ForeignKey('users.user_id'),
                        nullable=False)
    rest_id = db.Column(db.Integer,
                        db.ForeignKey('restaurants.rest_id'),
                        nullable=False)
    name = db.Column(db.String(128))

    def __repr__(self):
        """Provide helpful representation of favorite dishes."""

        return "<dish id={} name={}>".format(self.dish_id,
                                             self.name)


class Friendship(db.Model):
    """Defines friendships among users based on Facebook data."""

    __tablename__ = 'friendships'

    friendship_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    f_1_id = db.Column(db.Integer,
                       db.ForeignKey('users.user_id'),
                       nullable=False)
    f_2_id = db.Column(db.Integer,
                       db.ForeignKey('users.user_id'),
                       nullable=False)

    def __repr__(self):
        """Provide helpful representation of friendships."""

        return "<Friend 1 id={} Friend 2 id={}>".format(self.f_1_id,
                                                        self.f_2_id)


class Zipcode(db.Model):
    """Table for converting zipcodes to other location info."""

    __tablename__ = 'zipcodes'

    zipcode = db.Column(db.String(128), primary_key=True)
    city = db.Column(db.String(128))
    state = db.Column(db.String(128))
    lat = db.Column(db.String(128))
    lng = db.Column(db.String(128))


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


# class RestaurantPhoto(db.Model):
#     """Store photos for each restaurant."""

#     __tablename__ = 'restaurant_photos'

#     photo_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
#     rest_id = db.Column(db.Integer,
#                         db.ForeignKey('restaurants.rest_id'),
#                         nullable=False)
#     url = db.Column(db.String(256))

#     def __repr__(self):
#         """Provide helpful representation of photo."""

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


def connect_to_db(app):
    """Connect the database to Flask app."""

    # Configure to use PostgreSQL database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///restaurants'
    app.config['SQLALCHEMY_ECHO'] = True
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.app = app
    db.init_app(app)

if __name__ == "__main__":
    # As a convenience, if we run this module interactively, it will leave
    # you in a state of being able to work with the database directly.

    app = Flask(__name__)
    connect_to_db(app)
    print "Connected to DB."
    # db.create_all()
