"""Helper functions related to Users."""

from model import *
from flask import session
from sqlalchemy import func
import bcrypt


def check_email(user_email):
    """Check if email already exists in DB when user logs in or signs up."""

    user = User.query.filter_by(email=user_email).first()
    if user:
        return user.email


def check_password(user_email, user_password):
    """Check password when user logs in."""

    password = User.query.filter_by(email=user_email).first().password

    if password == user_password:
        return True

    else:
        if bcrypt.checkpw(user_password.encode('utf-8'), password.encode('utf-8')):
            return True


def check_username(username):
    """Check if username already exists."""

    if User.query.filter_by(username=username).first():
        return True
    else:
        return False


def check_zipcode(zipcode):
    """Check if zipcode is valid."""

    if Zipcode.query.filter_by(zipcode=zipcode).first():
        return True
    else:
        return False


def set_session_info(user):
    """Sets session data after successful login or signup."""

    session['user_id'] = user.user_id
    session['city'] = user.city
    session['state'] = user.state
    session['username'] = user.username

    # g for global 'from flask import g'
    # kind of like session (sent back and forth with every response)
    # g never leaves back-end, gives more security, can store an object on g (can't with session)
    # can't store entire user object with session, but can with g
    # before_request decorater tells Flask whenever you get a request, run me first
    # in a before_request, have a function that looks in session for user_id, if so, grabs it
    # gets user_object from database and puts it on g
    # g gets wiped in between requests


def get_user(username):
    """Get user by username."""

    user = User.query.filter_by(username=username).first()

    return user


def get_user_location(username):
    """Get city and state for a username."""

    return db.session.query(User.city, User.state).filter(User.username == username).first()


def register_user(email, password, username, zipcode):
    """Add a new user."""

    city = Zipcode.query.filter_by(zipcode=zipcode).first().city
    state = Zipcode.query.filter_by(zipcode=zipcode).first().state

    pw = password
    hashed = bcrypt.hashpw(pw.encode('utf8'), bcrypt.gensalt())
    print hashed

    user = User(email=email, password=hashed, username=username,
                city=city, state=state, zipcode=zipcode)

    db.session.add(user)
    db.session.commit()

    return user


def default_profile_info(user_id):
    """Set default profile info for a new user."""

    profile = Profile(user_id=user_id, image_fn='default.png')

    db.session.add(profile)
    db.session.commit()


def check_active(username):
    """Check if user is active."""

    favorites = (db.session.query(User.username, func.count(ListItem.item_id))
                           .join(List)
                           .join(ListItem)
                           .filter(User.username == username,
                                   List.category_id == 1)
                           .group_by(User.username)
                           .all())

    if favorites and int(favorites[0][1]) >= 5:
        return 'True'
    else:
        return 'False'


def check_user_id(user_id):
    """Check if user has at least 5 restaurants in Favorites list."""

    favorites = (db.session.query(ListItem.item_id)
                           .join(List)
                           .join(User)
                           .filter(User.user_id == user_id,
                                   List.category_id == 1)
                           .count())

    if int(favorites) >= 5:
        return 'True'
    else:
        return 'False'
