"""Utility file to seed ratings database from MovieLens data in seed_data/"""

from model import Zipcode, connect_to_db, db
from server import app


def load_zips():
    """Load users from u.user into database."""

    print "Zipcodes"

    with open('zipcodes.csv') as f:
        for row in f:
            row = row.rstrip()
            zipcode, city, state, lat, lng = row.split(",")

            zipcode = Zipcode(zipcode=zipcode,
                              city=city,
                              state=state,
                              lat=lat,
                              lng=lng)

            db.session.add(zipcode)

    db.session.commit()


if __name__ == "__main__":
    connect_to_db(app)

    load_zips()
