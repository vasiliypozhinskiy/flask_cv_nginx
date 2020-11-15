from flask import Flask

from flask_mail import Mail

from .config import Config
from .forms import ContactForm


app = Flask(__name__, instance_relative_config=True)

app.config.from_object(Config)

mail = Mail(app)






