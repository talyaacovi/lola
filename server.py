"""App to find out where the locals eat."""

from jinja2 import StrictUndefined

from flask import Flask, render_template, request, flash, redirect, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension
from model import connect_to_db, db, User, Zipcode, Restaurant, List, ListItem
from yelp_api import search, business
from restaurant import *
from user import *
# for your own helper file, can do 'from user import *'

app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = "ABC"
# Can comment out below line to avoid jinja errors if variable not defined
app.jinja_env.undefined = StrictUndefined
app.jinja_env.aut_reload = True


@app.route('/')
def index():
    """Homepage."""

    return render_template('homepage.html')


@app.route('/login', methods=['POST'])
def login():
    """Log user in to their account."""

# other method
    user_email = request.form.get('email')
    email = check_email(user_email)
    user_password = request.form.get('password')

    if email:
        if check_password(email, user_password):
            user = User.query.filter_by(email=email).first()
            flash('You have successfully logged in!')
            set_session_info(user)
            return redirect('/users/{}'.format(user.username))
        else:
            flash('Incorrect password, please try again.')
            return redirect('/')
    else:
        flash('You do not have an account. Sign up here!')
        return redirect('/signup-form')

# original method
    # email = request.form.get('email')
    # user_password = request.form.get('password')

    # user = User.query.filter_by(email=email).first()

    # if user:

    #     if user.password == user_password:
    #         flash('You have successfully logged in!')

    #         set_session_info(user)

    #         return redirect('/users/{}'.format(user.username))

    #     else:
    #         flash('Incorrect password, please try again.')

    #         return redirect('/')

    # flash('You do not have an account. Sign up here!')
    # return redirect('/signup-form')


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

    if check_email(email):
        flash('This email address already has an account. Log in here.')
        return redirect('/')

    password = request.form.get('password')
    username = request.form.get('username')
    # AJAX request to see if username exists?
    zipcode = request.form.get('zipcode')
    city = Zipcode.query.filter_by(zipcode=zipcode).first().city
    state = Zipcode.query.filter_by(zipcode=zipcode).first().state

    user = User(email=email, password=password, username=username,
                city=city, state=state, zipcode=zipcode)

    db.session.add(user)
    db.session.commit()

    # helper function
    set_session_info(user)

    return redirect('/users/{}'.format(user.username))


@app.route('/users/<username>')
def profile_page(username):
    """User profile page."""

    city = session['city'].title()
    lsts = get_user_lists(session['user_id'])
    return render_template('profile.html', city=city, lsts=lsts)


# don't need this app route anymore
# @app.route('/create-list')
# def create_list():
#     """Start a new list."""

#     return render_template('create_list.html')


@app.route('/add-list', methods=['POST'])
def add_list():
    """Add list to database in draft status."""

    name = request.form.get('name')
    status = request.form.get('status')

    lst = List(user_id=session['user_id'],
               name=name,
               status=status)

    user = User.query.filter_by(user_id=session['user_id']).first()

    db.session.add(lst)
    db.session.commit()

    # return redirect('/search')
    return redirect('/users/{}/lists/{}'.format(user.username, lst.list_id))


# @app.route('/search')
# def search_restaurant():
#     """Search for a restaurant."""

#     return render_template('search.html')


@app.route('/search-results.json')
def do_search():
    """Get search results using Yelp API."""

    search_term = request.args.get('term')
    city = session['city'].title()
    state = session['state'].title()
    search_location = city + ', ' + state

    results = search(search_term, search_location)
    business_results = results['businesses']

    results_dict = {'rests': []}

    for item in business_results:
        results_dict['rests'].append({'name': item['name'],
                                      'id': item['id'],
                                      'location': item['location']['display_address'][0]})

    return jsonify(results_dict)


@app.route('/add-restaurant.json', methods=['POST'])
def add_restaurant():
    """Add Restaurant to Database."""

    lst_id = request.form.get('list')
    yelp_id = request.form.get('id')

    results = business(yelp_id)
    restaurant = add_new_restaurant(results, yelp_id)
    lst_item = add_list_item(restaurant.rest_id, lst_id)

    # rest_id = add_new_restaurant(results, yelp_id)
    # rest_name = add_list_item(rest_id, lst_id)

    # if rest_name:
    if lst_item:

        results_dict = {}
        results_dict['name'] = lst_item.restaurant.name
        results_dict['yelp_id'] = lst_item.restaurant.yelp_id
        results_dict['item_id'] = lst_item.item_id
        results_dict['yelp_category'] = lst_item.restaurant.yelp_category
        results_dict['yelp_url'] = lst_item.restaurant.yelp_url
        results_dict['yelp_photo'] = lst_item.restaurant.yelp_photo

        return jsonify(results_dict)

    else:
        return ''


@app.route('/del-restaurant.json', methods=['POST'])
def delete_restaurant():
    """Remove restaurant from a list."""

    item_id = request.form.get('item_id')
    restaurant = del_list_item(item_id)

    restaurant_dict = {}
    restaurant_dict['name'] = restaurant.name
    restaurant_dict['yelp_id'] = restaurant.yelp_id

    return jsonify(restaurant_dict)


@app.route('/users/<username>/lists/<int:lst_id>')
def display_list(username, lst_id):
    """Display list."""

    lst = get_list(lst_id)
    lst_items = get_list_items(lst_id)

    return render_template('list.html', lst=lst, lst_items=lst_items)


if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = True

    connect_to_db(app)

    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(host="0.0.0.0")
