"""App to find out where the locals eat."""

from jinja2 import StrictUndefined

from flask import Flask, render_template, request, flash, redirect, session
from flask_debugtoolbar import DebugToolbarExtension
from model import connect_to_db, db, User, Zipcode
# import zipcode

app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = "ABC"
app.jinja_env.undefined = StrictUndefined
app.jinja_env.aut_reload = True


@app.route('/')
def index():
    """Homepage."""

    return render_template('homepage.html')


@app.route('/signup-form')
def signup_page():
    """Display signup page."""

    return render_template('signup.html')


@app.route('/signup', methods=['POST'])
def signup():
    """Add new user to database."""

    email = request.form.get('email')
    password = request.form.get('password')
    username = request.form.get('username')
    zipcode = request.form.get('zipcode')
    city = Zipcode.query.filter_by(zipcode=zipcode).first().city
    state = Zipcode.query.filter_by(zipcode=zipcode).first().state

    user = User(email=email, password=password, username=username,
                city=city, state=state, zipcode=zipcode)
    # convert zipcode to a city and state

    db.session.add(user)
    db.session.commit()

    return redirect('/users/{}'.format(user.user_id))


@app.route('/users/<int:user_id>')
def profile_page(user_id):
    """User profile page."""

    return render_template('profile.html')



if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = True

    connect_to_db(app)

    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(host="0.0.0.0")
