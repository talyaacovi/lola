"""App to find out where the locals eat."""

from jinja2 import StrictUndefined

from flask import Flask, render_template, request, flash, redirect, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension
from model import *
from yelp_api import search, business
from restaurant import *
from user import *
from cities import *
# for your own helper file, can do 'from user import *'

app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = "ABC"
# Can comment out below line to avoid jinja errors if variable not defined
app.jinja_env.undefined = StrictUndefined
app.jinja_env.auto_reload = True


@app.route('/')
def index():
    """Homepage."""

    return render_template('homepage.html')


@app.route('/login', methods=['POST'])
def login():
    """Log user in to their account."""

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


@app.route('/logout', methods=['POST'])
def logout():
    """Log out user."""

    print 'here i am'

    del session['user_id']
    del session['city']
    del session['state']
    del session['username']

    flash('You have successfully logged out.')

    return redirect('/')


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
    zipcode = request.form.get('zipcode')
    user = register_user(email, password, username, zipcode)
    # AJAX request to see if username exists?

    set_session_info(user)

    fav_list = add_fav_list(user.user_id, 'Favorites', 'draft', 1)

    return redirect('/users/{}/lists/{}'.format(user.username, fav_list.list_id))


@app.route('/check-username')
def do_check_username():
    """Check if username already exists."""

    username = request.args.get('username')

    if check_username(username):
        return 'True'
    else:
        return 'False'


@app.route('/users/<username>')
def profile_page(username):
    """User profile page."""

    user = get_user(username)
    return render_template('profile.html', city=user.city.title(), lsts=user.lists, user=user)


@app.route('/add-list', methods=['POST'])
def add_new_list():
    """Add list to database in draft status."""

    name = request.form.get('list-name')
    status = request.form.get('status')
    user_id = session['user_id']

    lst = add_list(name, status, user_id)

    if lst:
        return redirect('/users/{}/lists/{}'.format(lst.user.username, lst.list_id))

    else:
        flash('You already have a list with this name!')
        return redirect('/users/{}'.format(session['username']))


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
    lst_item = add_list_item(restaurant.rest_id, lst_id, session['user_id'])

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

    return render_template('list.html', lst=lst, lst_items=lst_items, username=username)


@app.route('/delete-list', methods=['POST'])
def delete():
    """Delete list."""

    list_id = request.form.get('list_id')
    print list_id
    message = delete_list(list_id)
    flash(message)

    return redirect('/users/{}'.format(session['username']))


@app.route('/search-city')
def search_city():
    """Handle user search for city form."""

    location = request.args.get('city-name')
    city = location.split(', ')[:-1][0]
    state = location.split(', ')[:-1][1]

    if check_city_state(state, city):
        return redirect('/cities/{}/{}'.format(state.lower(), city.lower()))

    else:
        flash('Lists for ' + city + ' have not yet been created. Invite your friends!')
        return redirect('/')


@app.route('/cities')
def cities():
    """List all cities with lists created."""

    all_locations = get_cities()

    return render_template('cities.html', all_locations=all_locations)


@app.route('/cities/<state>/<city>')
def display_city_page(state, city):
    """Display users and lists for a specific city."""

    all_users = get_users_by_city(state, city)
    all_restaurants = count_restaurants_by_city(state, city)
    location = get_city_lat_lng(state, city)

    return render_template('city-page.html',
                           all_users=all_users,
                           city=city,
                           all_restaurants=all_restaurants,
                           location=location)


@app.route('/check-zipcode')
def zipcode():
    """Check that zipcode is valid."""

    zipcode = request.args.get('zipcode')

    if check_zipcode(zipcode):
        return 'True'
    else:
        return 'False'


@app.route('/list-react')
def list_react():
    """React!"""

    return render_template('list-react.html')


if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = True
    connect_to_db(app)
    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(host="0.0.0.0")
