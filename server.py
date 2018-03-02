"""App to find out where the locals eat."""

from jinja2 import StrictUndefined

from flask import Flask, render_template, request, flash, redirect, session, jsonify, url_for
from flask_debugtoolbar import DebugToolbarExtension
from werkzeug import secure_filename
from model import *
from yelp_api import search, search_hot_new
from restaurant import *
from user import *
from cities import *
from discover import *
from sendgrid import *
from ig import *
import fbg as fb
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
    """Display homepage with all locations for which locals have made lists."""

    # get_cities() returns list of location dictionaries with city, state,
    # lat, lng
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
def logout_user():
    """Log user out of their account."""

    del session['user_id']
    del session['city']
    del session['state']
    del session['username']

    return redirect('/')


@app.route('/signup', methods=['POST'])
def signup_user():
    """Add new user to database."""

    email = request.form.get('email')

    if check_email(email):
        return ''

    password = request.form.get('password')
    username = request.form.get('username')
    zipcode = request.form.get('zipcode')
    user = register_user(email, password, username, zipcode)

    set_session_info(user)

    # create default Favorites list
    add_fav_list(user.user_id, 'Favorites', 'draft', 1)

    # create default profile image
    default_profile_info(user.user_id)

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


# @app.route('/users/<username>')
# def user_page(username):
#     """User profile page."""

#     user = get_user(username)

#     return render_template('profile.html', city=user.city.title(), lsts=user.lists, user=user)


# @app.route('/users/react/<username>')
# def user_page_react(username):
#     """User profile page."""

#     user = get_user(username)

#     user_dict = {
#         'city': user.city.title(),
#         'state': user.state,
#         'username': username
#     }

#     return render_template('profile-react.html', user_dict=user_dict)


@app.route('/get-lists.json')
def get_user_lists():
    """Get lists for a user to display on their profile page."""

    username = request.args.get('username')

    user = get_user(username)

    userLists = []
    userDict = {}

    for lst in user.lists:
        userLists.append(lst.to_dict())

    userDict['userLists'] = userLists

    # return dictionary of list objects.
    return jsonify(userDict)


# @app.route('/add-list', methods=['POST'])
# def add_new_list():
#     """Add list to database in draft status."""

#     name = request.form.get('list-name')
#     status = request.form.get('status')
#     user_id = session['user_id']

#     lst = add_list(name, status, user_id)

#     if lst:
#         return redirect('/users/{}/react/lists/{}'.format(lst.user.username, lst.name))

#     else:
#         flash('You already have a list with this name!')
#         return redirect('/users/{}'.format(session['username']))


@app.route('/add-list.json', methods=['POST'])
def add_new_list():
    """Add list to database in draft status."""

    name = request.form.get('list_name')
    status = request.form.get('status')
    user_id = session['user_id']

    # returns None if user already has list with that name, otherwise returns
    # new list object
    lst = add_list(name, status, user_id)

    if lst:
        return jsonify(lst.to_dict())

    else:
        return 'null'


# @app.route('/search-results.json')
# def do_search():
#     """Get search results using Yelp API."""

#     search_term = request.args.get('term')
#     city = session['city'].title()
#     state = session['state'].title()
#     search_location = city + ', ' + state

#     results = search(search_term, search_location)
#     business_results = results['businesses']

#     results_dict = {'rests': []}

#     for item in business_results:
#         results_dict['rests'].append({'name': item['name'],
#                                       'id': item['id'],
#                                       'location': item['location']['display_address'][0]})

#     return jsonify(results_dict)


# @app.route('/add-restaurant.json', methods=['POST'])
# def add_restaurant():
#     """Add Restaurant to Database."""

#     lst_id = request.form.get('list')
#     yelp_id = request.form.get('id')

#     rest_id = add_new_restaurant(yelp_id)

#     lst_item = add_list_item(rest_id, lst_id, session['user_id'])

#     if lst_item:

#         results_dict = {}
#         results_dict['name'] = lst_item.restaurant.name
#         results_dict['yelp_id'] = lst_item.restaurant.yelp_id
#         results_dict['item_id'] = lst_item.item_id
#         results_dict['yelp_category'] = lst_item.restaurant.yelp_category
#         results_dict['yelp_url'] = lst_item.restaurant.yelp_url
#         results_dict['yelp_photo'] = lst_item.restaurant.yelp_photo

#         return jsonify(results_dict)

#     else:
#         return ''


@app.route('/del-restaurant.json', methods=['POST'])
def delete_restaurant():
    """Remove restaurant from a list."""

    item_id = request.form.get('item_id')
    restaurant = del_list_item(item_id)

    restaurant_dict = {}
    restaurant_dict['name'] = restaurant.name
    restaurant_dict['yelp_id'] = restaurant.yelp_id

    return jsonify(restaurant_dict)


# @app.route('/users/<username>/lists/<listname>')
# def display_list(username, listname):
#     """Display list."""

#     lst = get_list(username, listname)

#     lst_items = get_list_items(lst.list_id)

#     return render_template('list.html', lst=lst, lst_items=lst_items, username=username)


@app.route('/delete-list.json', methods=['POST'])
def delete_user_list():
    """Delete list."""

    list_id = request.form.get('list_id')
    message = delete_list(list_id)

    return jsonify(message)


@app.route('/search-city')
def search_city():
    """Handle user search for city form."""

    location = request.args.get('city-name')
    city = location.split(', ')[:-1][0]
    state = location.split(', ')[:-1][1]

    if check_city_state(state, city):
        return redirect('/cities/{}/{}'.format(state.lower(), city.lower()))

    else:
        flash('Sorry, no lists yet! Invite your friends that live in ' + city + ' to create some!')
        return redirect('/')


@app.route('/cities/<state>/<city>')
def display_city_page(state, city):
    """Display users and lists for a specific city."""

    all_users = get_users_by_city(state, city)
    restaurant_tuples = count_restaurants_by_city(state, city)
    location = get_city_lat_lng(state, city)

    return render_template('city.html',
                           all_users=all_users,
                           city=city,
                           state=state,
                           restaurant_tuples=restaurant_tuples,
                           location=location)


@app.route('/check-zipcode')
def do_zipcode_check():
    """Check that zipcode is valid."""

    zipcode = request.args.get('zipcode')

    if check_zipcode(zipcode):
        return 'True'
    else:
        return 'False'


@app.route('/discover')
def do_discover():
    """Show a logged in user the local they are most similar to."""

    restaurants = get_user_favorite_restaurants()
    if len(restaurants) >= 20:
        most_similar_user_dict = get_most_similar_user(restaurants)
        most_similar_user = most_similar_user_dict.get('name')
        rests_in_common_ids = most_similar_user_dict.get('rest_ids')
        not_common_ids = most_similar_user_dict.get('uncommon')
        similar_image = most_similar_user_dict.get('photo')

        rests_in_common = get_common_rests(rests_in_common_ids)
        not_common = get_common_rests(not_common_ids)

        user = User.query.filter_by(user_id=session.get('user_id')).first()

        top_catgs = get_user_top_catgs(user.username)
        # catgs, aliases = zip(*top_catgs)
        # top_catgs_test = ['pizza', 'italian', 'burmese', 'newamerican', 'sushi']

        city = user.city
        state = user.state
        search_location = city + ', ' + state

        hot_and_new = []

        for item in top_catgs:
            catg, alias = item
            results = search_hot_new(search_location, alias)
            for item in results['businesses']:
                ig_loc_id = fb.request(item['name'], str(item['coordinates']['latitude']), str(item['coordinates']['longitude']))
                new_dict = {'name': item['name'],
                            'url': item['url'].split('?')[0],
                            'image': item['image_url'],
                            'yelp_id': item['id'],
                            'address': item['location']['display_address'],
                            'category': catg,
                            'ig_loc_id': ig_loc_id}

                hot_and_new.append(new_dict)

        return render_template('discover.html', hot_and_new=hot_and_new, top_catgs=top_catgs, user_image=user.profiles[0].image_fn, similar_image=similar_image, rests_in_common=rests_in_common, most_similar_user=most_similar_user, not_common=not_common)

    else:
        flash('You must add at least 20 restaurants to your favorites list to access this feature!')
        return redirect('/users/{}/favorites'.format(session['username']))


# @app.route('/users/<username>/react-lists/<listname>')
# def list_react(username, listname):
#     """React!"""

#     lst = get_list(username, listname)

#     return render_template('list-react.html', lst_id=lst.list_id, username=username, lst=lst)


# @app.route('/users/react/<username>/<listname>')
# def list_react(username, listname):
#     """React!"""

#     user = get_user(username)
#     lst = List.query.filter(List.name == listname, List.user_id == user.user_id).first()
#     user_dict = {
#         'listname': listname,
#         'list_id': lst.list_id,
#         'city': user.city.title(),
#         'state': user.state,
#         'username': username
#     }

#     return render_template('profile-react.html', user_dict=user_dict)


@app.route('/list-items.json')
def get_list_items():
    """Get list items for a specific list to display on user profile page."""

    lst_id = request.args.get('lst_id')
    lst_items = get_list_items_react(lst_id)

    return jsonify(lst_items)


@app.route('/search-results.json')
def do_restaurant_search():
    """Get search results using Yelp API."""

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


@app.route('/add-restaurant.json', methods=['POST'])
def add_restaurant():
    """Add restaurant to database and specific list of logged-in user."""

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


@app.route('/delete-restaurant.json', methods=['POST'])
def delete_restaurant_react():
    """Delete restaurant from specific list of logged-in user."""

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
    print to_email, from_name, username, lst_items, lst_name

    location = get_user_location(username)

    lst_items_dict = get_list_items_email(lst_items)
    restaurants = lst_items_dict['restaurants']

    from_email = 'talyaacovi@gmail.com'
    email_body = ""

    city = location[0].title()
    state = location[1]

    for index, item in enumerate(restaurants):
        email_body = email_body + str(index + 1) + '. ' + '<a href="' + item['yelp_url'] + '">' + item['rest_name'] + '</a>' + "<br/>"

    if lst_name == 'favorites' or lst_name == 'Favorites':
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
def do_check_active_user_id():
    """Check if logged-in user has added at least 5 restaurants to favorites."""

    user_id = session.get('user_id')
    is_active = check_user_id(user_id)

    return is_active


@app.route('/instagram-photos')
def get_instagram_data():
    """Get location ID + photos with Facebook Graph API and IG scraper."""

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
            db.session.commit()

            successMsg = get_instagram_photos(restaurant.rest_id, loc_id)

            return successMsg

    return ''


@app.route('/restaurants/<yelp_id>')
def show_restaurant_details(yelp_id):
    """Details page for a restaurant with Instagram photos."""

    restaurant = Restaurant.query.filter_by(yelp_id=yelp_id).first()
    ig_photos = restaurant.photos

    if not ig_photos:
        results = business(yelp_id)
        yelp_photos = results['photos']
        return render_template('restaurant.html', ig_photos=ig_photos, yelp_photos=yelp_photos, restaurant=restaurant)

    return render_template('restaurant.html', ig_photos=ig_photos, restaurant=restaurant, ig_loc_id=restaurant.ig_loc_id)


@app.route('/user-info.json')
def get_user_info():
    """Get user profile info."""

    username = request.args.get('username')
    user = User.query.filter_by(username=username).first()
    profile_info = user.profiles[0].to_dict()

    return jsonify(profile_info)


# @app.route('/update-profile-info', methods=['POST'])
# def update_profile_info():
#     """Update user profile info."""

#     favRest = request.form.get('favRest')
#     favDish = request.form.get('favDish')
#     favCity = request.form.get('favCity')
#     username = request.form.get('username')

#     user = User.query.filter_by(username=username).first()
#     user_profile = user.profiles[0]
#     user_profile.fav_rest = favRest
#     user_profile.fav_dish = favDish
#     user_profile.fav_city = favCity

#     db.session.commit()

#     return jsonify(user.profiles[0].to_dict())


@app.route('/user-profile-image.json')
def get_user_profile_image():
    """Get user profile info."""

    username = request.args.get('username')
    user = User.query.filter_by(username=username).first()
    profile_image = user.profiles[0].image_fn

    return jsonify(profile_image)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# @app.route('/upload-profile-image', methods=['POST'])
# def upload_profile_image():
#     """User profile page."""

#     username = request.form.get('username')
#     file = request.files['image']
#     user = User.query.filter_by(username=username).first()

#     if file and allowed_file(file.filename):
#         filename = secure_filename(file.filename)
#         user.profiles[0].image_fn = filename
#         file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
#         db.session.commit()

#         return jsonify(filename)

#     else:
#         return ''


@app.route('/update-profile-info.json', methods=['POST'])
def update_profile_info():
    """Update user profile info and image."""

    username = request.form.get('username')
    favRest = request.form.get('favRest')
    favDish = request.form.get('favDish')
    favCity = request.form.get('favCity')

    user = User.query.filter_by(username=username).first()
    user_profile = user.profiles[0]
    user_profile.fav_rest = favRest
    user_profile.fav_dish = favDish
    user_profile.fav_city = favCity

    db.session.commit()

    user_dict = user.profiles[0].to_dict()

    file = request.files.get('image')

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        user.profiles[0].image_fn = filename
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        db.session.commit()
        user_dict['filename'] = filename

    else:
        user_dict['filename'] = user_profile.image_fn

    return jsonify(user_dict)


@app.route('/users/<username>')
def new_user_page_react(username):
    """User profile page with no lists expanded."""

    user = get_user(username)

    user_dict = {
        'city': user.city.title(),
        'state': user.state,
        'username': username
    }

    return render_template('profile.html', user_dict=user_dict)


@app.route('/users/<username>/<listname>')
def new_list_react(username, listname):
    """User profile page with specific list expanded."""

    user = get_user(username)
    lst = List.query.filter(List.name == listname, List.user_id == user.user_id).first()
    user_dict = {
        'listname': listname.title(),
        'list_id': lst.list_id,
        'city': user.city.title(),
        'state': user.state,
        'username': username
    }

    return render_template('profile.html', user_dict=user_dict)


if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = True
    connect_to_db(app)
    # Use the DebugToolbar
    # DebugToolbarExtension(app)

    app.run(host="0.0.0.0", threaded=True)
