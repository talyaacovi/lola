"""Helper functions related to Users."""

from model import *
from flask import session


def check_email(user_email):
    """checks if email already exists in DB when user logs in or signs up."""

    user = User.query.filter_by(email=user_email).first()
    if user:
        return user.email


def check_password(user_email, user_password):
    """checks pw"""

    password = User.query.filter_by(email=user_email).first().password
    if password == user_password:
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


def register_user(email, password, username, zipcode):
    """Add user."""

    city = Zipcode.query.filter_by(zipcode=zipcode).first().city
    state = Zipcode.query.filter_by(zipcode=zipcode).first().state

    user = User(email=email, password=password, username=username,
                city=city, state=state, zipcode=zipcode)

    db.session.add(user)
    db.session.commit()

    return user
