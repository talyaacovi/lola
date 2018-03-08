# summary

Lola is the foodie friend you wish you had in every city.
The app helps travelers answer the question __Where do the locals eat?__ and lets
locals keep track of their favorite restaurants.

![Lola Homepage](/static/img/README/home.png)

***

# features

After signing up with their zipcode, new users are prompted to add at least
5 restaurants to the default 'Favorites' list before unlocking more site content.

From their profile page, users can edit existing lists and create new ones, using
search powered by the Yelp API. They can also update their profile information.

![Profile page](/static/img/README/profile.png)

Travelers can view a ranked list of top restaurants in a particular city based on
the knowledge and popular vote of locals, with locations plotted using the Google Maps
API.

![City page list](/static/img/README/city3.png)
![City page map](/static/img/README/city2.png)

Any list on the site can be shared via email using the SendGrid API -- this is
especially helpful for anyone who has an old, unmaintained email in their inbox
that they have to find and forward whenever someone is visiting and asks for recommendations!

![Email list](/static/img/README/email.png)

All restaurants have a details page which includes a link to Yelp reviews, photos from
Instagram, and a link directly into the Instagram feed for that location.

![Restaurant page](/static/img/README/restaurant.png)

Find out which fellow local you are most similar to, what your top categories are,
and get recommendations for new restaurants based on both!

![Discover page](/static/img/README/discover3.png)

***

# technologies

* Python
* PostgreSQL + SQLAlchemy
* Flask + Jinja
* ReactJS
* JavaScript
* jQuery
* Bootstrap + CSS + HTML

# APIs

* Yelp Fusion
* SendGrid
* Google Maps
* Facebook Graph
* [Instagram Scraper](https://github.com/rarcega/instagram-scraper)

(dependencies are listed in requirements.txt)

***

# email example

![Email example](/static/img/README/email2.png)

***

# about the developer

Tal's inspiration for this app came from wanting to solve 3 problems:

1. keeping track of her favorite restaurants in San Franciso to easily share
with friends (and friends of friends...and friends of friends of friends...) who
come to visit and want recommendations.
2. figuring out where the locals eat when visiting a new city.
3. quick access to lovely Instagram photos of the food and ambiance at a
restaurant.

Tal's favorite restaurants in San Francisco are The Morris, La Ciccia, and
Liholiho Yacht Club.

Connect on LinkedIn [here](https://www.linkedin.com/in/tal-yaacovi/).