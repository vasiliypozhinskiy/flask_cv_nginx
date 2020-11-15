from threading import Thread

from flask_mail import Message

from app import app, mail


def send_async_email(msg):
    with app.app_context():
        mail.send(msg)


def send_email(subject, text_body):
    msg = Message(subject, recipients=['vpozhinskii@mail.ru'])
    msg.body = text_body
    thread = Thread(target=send_async_email, args=[msg])
    thread.start()