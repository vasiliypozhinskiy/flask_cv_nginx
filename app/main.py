from app import app
from app.projects.projects import projects
from app.arkanoid.arkanoid import arkanoid
from app.view import *

app.register_blueprint(arkanoid, url_prefix='/projects')
app.register_blueprint(projects, url_prefix='/projects')

if __name__ == "__main__":
    app.run()