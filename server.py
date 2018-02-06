"""App to find out where the locals eat."""

from jinja2 import StrictUndefined

from flask import Flask, render_template, request, flash, redirect, session
from flask_debugtoolbar import DebugToolbarExtension
from model import connect_to_db, db, User, Zipcode, Restaurant
from yelp_api import search, business

app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = "ABC"
# Can comment out below line to avoid jinja errors if variable not defined
app.jinja_env.undefined = StrictUndefined
app.jinja_env.aut_reload = True


@app.route('/')
def index():
    """Homepage."""

    # if session['user_id']:
        # user = #query user table
        # return render_template('homepage.html', user=user)

    return render_template('homepage.html')


@app.route('/login', methods=['POST'])
def login():
    """Log user in to their account."""

    email = request.form.get('email')
    user_password = request.form.get('password')

    user = User.query.filter_by(email=email).first()

    if user:

        if user.password == user_password:
            flash('You have successfully logged in!')

            session['user_id'] = user.user_id
            session['city'] = user.city
            session['state'] = user.state
            session['username'] = user.username

            return redirect('/users/{}'.format(user.username))

        else:
            flash('Incorrect password, please try again.')

            return redirect('/')

    flash('You do not have an account. Sign up here!')
    return redirect('/signup-form')


@app.route('/logout', methods=['POST'])
def logout():
    """Log out user."""

    del session['user_id']
    del session['city']
    del session['state']
    del session['username']

    return 'You have successfully logged out.'


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

    db.session.add(user)
    db.session.commit()

    session['user_id'] = user.user_id
    session['city'] = user.city
    session['state'] = user.state
    session['username'] = user.username
    # helper function

    return redirect('/users/{}'.format(user.username))


@app.route('/users/<username>')
def profile_page(username):
    """User profile page."""

    city = session['city'].title()
    return render_template('profile.html', city=city)


@app.route('/create-list')
def create_list():
    """Testing Yelp API."""

    return render_template('search.html')


@app.route('/search', methods=['POST'])
def search_yelp():
    """Testing Yelp API."""

    search_term = request.form.get('term')
    city = session['city'].title()
    state = session['state'].title()
    search_location = city + ', ' + state

    results = search(search_term, search_location)
    business_results = results['businesses']

    return render_template('yelp.html', business_results=business_results)


@app.route('/add-restaurant', methods=['POST'])
def add_restaurant():
    """Add Restaurant to Database."""

    yelp_id = request.form.get('restaurant')
    results = business(yelp_id)
    name = results['name']
    lat = results['coordinates']['latitude']
    lng = results['coordinates']['longitude']
    yelp_url = results['url'].split('?')[0]
    yelp_category = results['categories'][0]['title']
    yelp_photo = results['image_url']

    restaurant = Restaurant(name=name, lat=lat, lng=lng, yelp_id=yelp_id,
                            yelp_url=yelp_url, yelp_category=yelp_category,
                            yelp_photo=yelp_photo)

    db.session.add(restaurant)
    db.session.commit()

    flash(restaurant.name + ' has been added!')

    return redirect('/create-list')

# need to make sure Flask knows about application context
# def set_session(user, session):
#     """set session info when user logs in or signs up."""

#     session['user_id'] = user.user_id
#     session['city'] = user.city
#     session['state'] = user.state
#     session['username'] = user.username

#     return session

if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = True

    connect_to_db(app)

    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(host="0.0.0.0")
