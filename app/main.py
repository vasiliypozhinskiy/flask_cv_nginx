from app import app
from app.projects.projects import projects
from app.view import *

app.register_blueprint(projects, url_prefix='/projects')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port="8080")