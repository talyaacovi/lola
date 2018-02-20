from unittest import TestCase
from server import app
from model import connect_to_db, db, example_data


class FlaskTests(TestCase):

    def setUp(self):
        """Stuff to do before every test."""

        self.client = app.test_client()
        app.config['TESTING'] = True
        connect_to_db(app, "postgresql:///testdb")

        db.create_all()
        example_data()

    def tearDown(self):
        """Do at end of every test."""

        db.session.close()
        db.drop_all()

    def test_correct_login(self):
        result = self.client.post('/login-user', data={'email': 'talyaacovi@gmail.com',
                                                       'password': 'password'})
        self.assertIn('"msg": "Success"', result.data)

    def test_incorrect_login(self):
        result = self.client.post('/login-user', data={'email': 'talyaacovi@gmail.com',
                                                       'password': 'password1'})
        self.assertIn('Incorrect', result.data)

    def test_unregistered_login(self):
        result = self.client.post('/login-user', data={'email': 'bob@gmail.com',
                                                       'password': 'password'})
        self.assertIn('No Account', result.data)

    def test_homepage(self):
        result = self.client.get('/')
        self.assertEqual(result.status_code, 200)
        self.assertIn('<h1>Where do the locals eat?</h1>', result.data)

if __name__ == '__main__':
    # If called like a script, run our tests
    import unittest
    unittest.main()
