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


def get_user_lists(user_id):
    """Get lists belonging to a user."""

    lsts = List.query.filter_by(user_id=user_id).all()
    return lsts
