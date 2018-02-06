"""Utility file to seed ratings database from MovieLens data in seed_data/"""

from model import Zipcode, connect_to_db, db
from server import app


def load_zips():
    """Load users from u.user into database."""

    print "Zipcodes"

    for row in open('zipcodes.csv'):
        row = row.rstrip()
        zipcode, city, state = row.split(",")

        zipcode = Zipcode(zipcode=zipcode,
                          city=city,
                          state=state)

        # We need to add to the session or it won't ever be stored
        db.session.add(zipcode)

    db.session.commit()


if __name__ == "__main__":
    connect_to_db(app)

    load_zips()
