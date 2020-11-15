from flask import Blueprint, render_template

from app.view import projects_dict

projects = Blueprint('projects', __name__, template_folder='templates')


@projects.route('/<slug>')
def show_project(slug):
    return render_template(f'/projects/{projects_dict[slug]}.html')
