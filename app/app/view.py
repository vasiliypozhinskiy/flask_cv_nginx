import os
from flask import render_template, request, redirect, url_for, flash, send_from_directory

from app import app
from .forms import ContactForm

from app.mail import send_email

projects_dict = {'virtual-owl-museum': 'Virtual owl museum', 'packing': 'Packing',
                 'get-recipe': 'Get recipe', 'project-planner': 'Project planner', 'arkanoid': 'Arkanoid',
                 'typing-trainer': 'Typing trainer'}


@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')


@app.route('/contacts', methods=['POST', 'GET'])
def contacts():
    form = ContactForm(request.form)
    if request.method == "POST":
        send_email(form.title.data, form.text.data)
        flash("Message sent", "success")
        return redirect(url_for('contacts'))
    return render_template('contacts.html', form=form)


@app.route('/typing-trainer')
def typing_trainer():
    return render_template('')


@app.route('/media/<path:filename>')
def download_file(filename):
    print(filename)
    return send_from_directory(os.path.join(app.root_path, 'static/media'), filename)


@app.context_processor
def inject_project_list():
    return dict(project_dict=projects_dict)
