import requests
import os
import json


def send_mail(receiver, sender, body):
    # API Config
    api_url = 'https://api.sendgrid.com/v3/mail/send'

    # TO
    to_email = receiver

    #FROM
    fom_name = 'Tal'
    fom_email = sender
    from_subject = 'Testing sending restaurant lists!'
    body = body

    headers = {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + os.environ.get('SENDGRID_API_KEY')
    }
    payload = {
        "personalizations": [
            {"to": [
                {
                    "email": to_email
                }
            ]}
        ],
        "from": {
            "email": fom_email,
            "name": fom_name
        },
        "subject": from_subject,
        "content": [{
            "type": "text/html", "value": body
        }]}

    r = requests.post(api_url, data=json.dumps(payload), headers=headers)
    if (r):
        return True
    else:
        return False
