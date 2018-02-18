import requests
import os
import json


def send_mail(receiver, sender, body, city, state, username, from_name):
    # API Config
    api_url = 'https://api.sendgrid.com/v3/mail/send'

    # TO
    to_email = receiver

    #FROM
    fom_name = from_name
    fom_email = sender
    from_subject = 'Testing sending restaurant lists!'
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
                    "-city-": city + ', ' + state
                },
            }],

        "from": {
            "email": fom_email,
            "name": fom_name
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
