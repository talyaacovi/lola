"""Helper functions related to Users."""

from model import User, List
from flask import session


def check_email(user_email):
    """checks if email already exists in DB when user logs in or signs up."""

    return User.query.filter_by(email=user_email).first()


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


def get_user_lists(user_id):
    """Get lists belonging to a user."""

    lsts = List.query.filter_by(user_id=user_id).all()
    return lsts
