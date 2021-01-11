import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.getenv('FLASKCV_SECRET_KEY')
    DEBUG = True
    MAIL_DEFAULT_SENDER = 'flaskcv@gmail.com'
    MAIL_USERNAME = 'flaskcv@gmail.com'
    MAIL_PORT = '465'
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_USE_SSL = True
    MAIL_PASSWORD = os.getenv('FLASKCV_MAIL_PASSWORD')
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False