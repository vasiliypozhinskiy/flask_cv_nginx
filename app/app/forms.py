from wtforms import Form, StringField, TextAreaField
from wtforms.validators import DataRequired


class ContactForm(Form):
    title = StringField('Topic:', validators=[DataRequired()])
    text = TextAreaField('Type message here:', validators=[DataRequired()])

