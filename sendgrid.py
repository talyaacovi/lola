import requests
import os
import json


def send_user_list_email(receiver, sender, body, city, state, username, from_name, list_type):
    # API Config
    api_url = 'https://api.sendgrid.com/v3/mail/send'

    # TO
    to_email = receiver

    #FROM
    from_name = from_name
    fom_email = sender
    from_subject = 'Restaurant List'
    body = body

    headers = {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + os.environ.get('SENDGRID_API_KEY')
    }
    payload = {

        "personalizations": [
            {
                "to": [
                    {
                        "email": to_email
                    }
                ],
                "substitutions": {
                    "-name-": username,
                    "-city-": city + ', ' + state,
                    "-from-": from_name,
                    "-type-": list_type
                },
            }],

        "from": {
            "email": fom_email,
            "name": from_name
        },

        "subject": from_subject,

        "content": [{
            "type": "text/html", "value": body
        }],

        "template_id": "bf87a489-971d-466c-9d75-72f0bf9d8d45"
        }

    r = requests.post(api_url, data=json.dumps(payload), headers=headers)
    if (r):
        return True
    else:
        return False


def send_city_list_email(receiver, sender, body, city_state, from_name):
    # API Config
    api_url = 'https://api.sendgrid.com/v3/mail/send'

    # TO
    to_email = receiver

    #FROM
    from_name = from_name
    fom_email = sender
    from_subject = 'Top Restaurants In ' + city_state
    body = body

    headers = {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + os.environ.get('SENDGRID_API_KEY')
    }
    payload = {

        "personalizations": [
            {
                "to": [
                    {
                        "email": to_email
                    }
                ],
                "substitutions": {
                    "-city-": city_state,
                    "-from-": from_name
                },
            }],

        "from": {
            "email": fom_email,
            "name": from_name
        },

        "subject": from_subject,

        "content": [{
            "type": "text/html", "value": body
        }],

        "template_id": "0aaf36d5-b4fc-440e-8d86-504768797c7e"
        }

    r = requests.post(api_url, data=json.dumps(payload), headers=headers)
    if (r):
        return True
    else:
        return False
