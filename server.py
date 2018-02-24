"""App to find out where the locals eat."""

from jinja2 import StrictUndefined

from flask import Flask, render_template, request, flash, redirect, session, jsonify, url_for
from flask_debugtoolbar import DebugToolbarExtension
from werkzeug import secure_filename
from model import *
from yelp_api import search
from restaurant import *
from user import *
from cities import *
from compare import *
from sendgrid import *
from ig import *
import json


UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Required to use Flask sessions and the debug toolbar
app.secret_key = "ABC"
# Can comment out below line to avoid jinja errors if variable not defined
app.jinja_env.undefined = StrictUndefined
app.jinja_env.auto_reload = True


@app.route('/')
def index():
    """Homepage."""

    all_locations = get_cities()

    return render_template('homepage.html', all_locations=all_locations)


@app.route('/login-user', methods=['POST'])
def login_user():
    """Log user in to their account."""

    user_email = request.form.get('email')
    email = check_email(user_email)
    user_password = request.form.get('password')

    if email:
        if check_password(email, user_password):
            user = User.query.filter_by(email=email).first()
            set_session_info(user)
            is_active = check_active(user.username)
            return jsonify({'msg': 'Success', 'user': user.username, 'isActive': is_active})
        else:
            return 'Incorrect'
    else:
        return 'No Account'


@app.route('/logout', methods=['POST'])
def logout():
    """Log out user."""

    del session['user_id']
    del session['city']
    del session['state']
    del session['username']

    # flash('You have successfully logged out.')
    # return 'You have successfully logged out.'
    return redirect('/')


@app.route('/signup', methods=['POST'])
def signup():
    """Add new user to database."""

    email = request.form.get('email')

    if check_email(email):
        return ''

    password = request.form.get('password')
    username = request.form.get('username')
    zipcode = request.form.get('zipcode')
    user = register_user(email, password, username, zipcode)

    set_session_info(user)

    add_fav_list(user.user_id, 'Favorites', 'draft', 1)

    return username


@app.route('/check-username')
def do_check_username():
    """Check if username already exists."""

    username = request.args.get('username')

    if check_username(username):
        return 'True'
    else:
        return 'False'


@app.route('/check-email')
def do_check_email():
    """Check if email already exists."""

    email = request.args.get('email')

    if check_email(email):
        return 'True'
    else:
        return 'False'


@app.route('/users/<username>')
def user_page(username):
    """User profile page."""

    user = get_user(username)

    return render_template('profile.html', city=user.city.title(), lsts=user.lists, user=user)


@app.route('/users/react/<username>')
def user_page_react(username):
    """User profile page."""

    user = get_user(username)

    return render_template('profile-react.html', city=user.city.title(), state=user.state, username=username)


@app.route('/get-lists.json')
def get_user_lists():
    """User profile page."""

    username = request.args.get('username')

    user = get_user(username)

    userLists = []
    for lst in user.lists:
        userLists.append(lst.to_dict())

    userDict = {}

    userDict['userLists'] = userLists

    return jsonify(userDict)


@app.route('/add-list', methods=['POST'])
def add_new_list():
    """Add list to database in draft status."""

    name = request.form.get('list-name')
    status = request.form.get('status')
    user_id = session['user_id']

    lst = add_list(name, status, user_id)

    if lst:
        return redirect('/users/{}/react/lists/{}'.format(lst.user.username, lst.name))

    else:
        flash('You already have a list with this name!')
        return redirect('/users/{}'.format(session['username']))


@app.route('/add-list-react.json', methods=['POST'])
def add_new_list_react():
    """Add list to database in draft status."""

    print 'IN REACT ADD NEW LIST ROUTE !!!!!!!!!!!!!!!!!!!!!!!!!!'
    name = request.form.get('list_name')
    status = request.form.get('status')
    user_id = session['user_id']

    lst = add_list(name, status, user_id)

    if lst:
        return jsonify(lst.to_dict())

    else:
        return 'null'


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

    rest_id = add_new_restaurant(yelp_id)

    lst_item = add_list_item(rest_id, lst_id, session['user_id'])

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


@app.route('/users/<username>/lists/<listname>')
def display_list(username, listname):
    """Display list."""

    lst = get_list(username, listname)

    lst_items = get_list_items(lst.list_id)

    return render_template('list.html', lst=lst, lst_items=lst_items, username=username)


@app.route('/delete-list', methods=['POST'])
def delete():
    """Delete list."""

    print 'in delete list route'

    list_id = request.form.get('list_id')
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


@app.route('/cities/<state>/<city>')
def display_city_page(state, city):
    """Display users and lists for a specific city."""

    all_users = get_users_by_city(state, city)
    restaurant_tuples = count_restaurants_by_city(state, city)
    location = get_city_lat_lng(state, city)

    return render_template('city-page.html',
                           all_users=all_users,
                           city=city,
                           state=state,
                           restaurant_tuples=restaurant_tuples,
                           location=location)


@app.route('/check-zipcode')
def zipcode():
    """Check that zipcode is valid."""

    zipcode = request.args.get('zipcode')

    if check_zipcode(zipcode):
        return 'True'
    else:
        return 'False'


@app.route('/compare')
def do_comparison():
    """Show a logged in user the local they are most similar to."""

    restaurants = get_user_favorite_restaurants()
    if len(restaurants) >= 20:
        most_similar_user_dict = get_most_similar_user(restaurants)
        most_similar_user = most_similar_user_dict.get('name')
        rests_in_common_ids = most_similar_user_dict.get('rest_ids')
        not_common_ids = most_similar_user_dict.get('uncommon')

        rests_in_common = get_common_rests(rests_in_common_ids)
        not_common = get_common_rests(not_common_ids)

        return render_template('compare.html', rests_in_common=rests_in_common, most_similar_user=most_similar_user, not_common=not_common)

    else:
        flash('You must add at least 20 restaurants to your favorites list to access this feature!')
        return redirect('/users/{}/react-lists/favorites'.format(session['username']))


@app.route('/users/<username>/react-lists/<listname>')
def list_react(username, listname):
    """React!"""

    lst = get_list(username, listname)

    return render_template('list-react.html', lst_id=lst.list_id, username=username, lst=lst)


@app.route('/list-items-react.json')
def list_items_react():
    """Get user list items using React."""

    lst_id = request.args.get('lst_id')
    lst_items = get_list_items_react(lst_id)

    print lst_items

    return jsonify(lst_items)


@app.route('/search-results-react.json')
def do_react_search():
    """Get search results using Yelp API and React."""

    search_term = request.args.get('term')
    username = request.args.get('username')
    user_location = get_user_location(username)
    city = user_location[0]
    state = user_location[1]
    search_location = city + ', ' + state

    results = search(search_term, search_location)
    business_results = results['businesses']

    results_dict = {'rests': []}

    for item in business_results:
        results_dict['rests'].append({'name': item['name'],
                                      'id': item['id'],
                                      'location': item['location']['display_address'][0]})

    return jsonify(results_dict)


@app.route('/add-restaurant-react.json', methods=['POST'])
def add_restaurant_react():
    """Add Restaurant to Database using React."""

    # get List ID and the Yelp ID of the restaurant the user wants to add.

    lst_id = request.form.get('lst_id')
    yelp_id = request.form.get('yelp_id')

    # add_new_restaurant function queries the restaurants table for an entry
    # with that Yelp ID and if it doesn't exist, creates it in table.
    # it returns the Restaurant ID.

    rest_id = add_new_restaurant(yelp_id)

    # add_list_item function takes the Restaurant ID, List ID, and User ID
    # and creates a new List Item if the user has not already added that item
    # to their list.
    # returns new ListItem object, or None

    lst_item = add_list_item(rest_id, lst_id, session['user_id'])

    if lst_item:

        return jsonify(lst_item.to_dict())

    else:
        return 'null'


@app.route('/delete-restaurant-react.json', methods=['POST'])
def delete_restaurant_react():
    """Delete Restaurant to Database using React."""

    item_id = request.form.get('item_id')
    del_list_item(item_id)

    lst_id = request.form.get('lst_id')
    lst_items = get_list_items_react(lst_id)

    return jsonify(lst_items)


@app.route('/send-user-list', methods=['POST'])
def send_user_list():
    """Send user list to email address."""

    to_email = request.form.get('email')
    from_name = request.form.get('from')
    username = request.form.get('username')
    lst_items = request.form.getlist('lst_items[]')
    lst_name = request.form.get('lst_name')

    location = get_user_location(username)

    lst_items_dict = get_list_items_email(lst_items)
    restaurants = lst_items_dict['restaurants']

    from_email = 'talyaacovi@gmail.com'
    email_body = ""

    city = location[0].title()
    state = location[1]

    for index, item in enumerate(restaurants):
        email_body = email_body + str(index + 1) + '. ' + '<a href="' + item['yelp_url'] + '">' + item['rest_name'] + '</a>' + "<br/>"

    if lst_name == 'Favorites':
        list_type = 'favorite restaurants'
    else:
        list_type = 'favorite ' + lst_name.lower()

    send_user_list_email(to_email, from_email, email_body, city, state, username, from_name, list_type)

    return 'Email sent to ' + to_email + ' !'


@app.route('/send-city-list', methods=['POST'])
def send_city_list():
    """Send city list to email address."""

    lst_items = request.form.getlist('lst_items[]')
    to_email = request.form.get('email')
    from_name = request.form.get('from')
    city_state = request.form.get('city_state')

    lst_items_dict = get_list_items_email(lst_items)
    restaurants = lst_items_dict['restaurants']

    from_email = 'talyaacovi@gmail.com'
    email_body = ""

    for index, item in enumerate(restaurants):
        email_body = email_body + str(index + 1) + '. ' + '<a href="' + item['yelp_url'] + '">' + item['rest_name'] + '</a>' + "<br/>"

    send_city_list_email(to_email, from_email, email_body, city_state, from_name)

    return 'Email sent to ' + to_email + ' !'


@app.route('/check-active', methods=['POST'])
def check_active_user_id():
    """"""

    user_id = session.get('user_id')
    is_active = check_user_id(user_id)

    return is_active


@app.route('/instagram-react')
def get_ig_data():
    """"""

    # FLASK THREADING VERSION
    yelp_id = request.args.get('yelp_id')

    restaurant = Restaurant.query.filter_by(yelp_id=yelp_id).first()

    if not restaurant.ig_loc_id:
        loc_id = get_instagram_location(restaurant.rest_id,
                                        restaurant.name,
                                        restaurant.lat,
                                        restaurant.lng,
                                        restaurant.address,
                                        restaurant.city)

        if loc_id:
            restaurant.ig_loc_id = loc_id

            successMsg = get_instagram_photos(restaurant.rest_id, loc_id)

            return successMsg

    return ''


@app.route('/restaurants/<yelp_id>')
def restaurant_detail(yelp_id):
    """Details page for a restaurant, Instagram photos."""

    restaurant = Restaurant.query.filter_by(yelp_id=yelp_id).first()
    ig_photos = restaurant.photos

    return render_template('restaurant-details.html', restaurant=restaurant, ig_photos=ig_photos)


@app.route('/user-info-react.json')
def get_user_info():
    """Get user profile info."""

    username = request.args.get('username')
    user = User.query.filter_by(username=username).first()
    profile_info = user.profiles[0].to_dict()

    return jsonify(profile_info)


@app.route('/upload-profile-image', methods=['POST'])
def upload_profile_image():
    """User profile page."""

    username = request.form.get('username')
    image = request.files['image']
    user = User.query.filter_by(username=username).first()
    print user

    if image:
        filename = secure_filename(image.filename)
        user.profiles[0].image_url = filename
        image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        db.session.commit()

    return 'did it'


if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = True
    connect_to_db(app)
    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(host="0.0.0.0", threaded=True)
