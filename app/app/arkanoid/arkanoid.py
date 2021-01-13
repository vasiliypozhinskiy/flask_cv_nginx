import random

from flask import Blueprint, render_template, jsonify, request

from app.arkanoid.arkanoid_cfg import arkanoidConfig
from app.models import ArkanoidScore
from app import db

arkanoid = Blueprint('arkanoid', __name__, template_folder='templates')


@arkanoid.route('/projects/arkanoid')
def show_arkanoid():
    return render_template('/arkanoid.html')


@arkanoid.route('/get_config')
def get_config():
    return jsonify(config=arkanoidConfig)


@arkanoid.route('/generate_arkanoid_lvl')
def generate_lvl():
    lvl = int(request.args["lvl"])
    bricks = []
    while not bricks:
        for i in range(8):
            for j in range(4):
                x = i * (arkanoidConfig["BRICK_WIDTH"] + arkanoidConfig["BRICK_OFFSET_X"]) + 40
                y = j * (arkanoidConfig["BRICK_HEIGHT"] + arkanoidConfig["BRICK_OFFSET_Y"]) + arkanoidConfig["BRICK_OFFSET_Y"] + 20
                new_brick = generate_brick(x, y, lvl)
                if new_brick:
                    bricks.append(new_brick)
    bonuses = []
    doomguys = generate_doomguys(bricks, lvl)

    for brick in bricks:
        if not brick["has_doomguy"]:
            new_bonus = generate_bonus(brick)
            if new_bonus:
                bonuses.append(new_bonus)
    return jsonify(bricks=bricks, bonuses=bonuses, doomguys=doomguys)


@arkanoid.route('/add_score', methods=['POST'])
def add_score():
    score = int(request.form["score"])
    user = request.form["user"]
    record = ArkanoidScore(username=user, score=score)
    db.session.add(record)
    db.session.commit()
    return "", 204


@arkanoid.route('/show_score')
def show_score():
    query = db.session.query(ArkanoidScore).order_by(ArkanoidScore.score.desc())
    answer = []
    for score in query:
        answer.append(score.as_dict())
    return jsonify(answer)


def generate_brick(x, y, lvl):
    seed = random.randint(0, 100)
    if seed <= 5 + 3 * lvl:
        brick = {"type": 'brown', "x": x, "y": y, "has_doomguy": False}
    elif seed <= 5 + 6 * lvl:
        brick = {"type": 'grey', "x": x, "y": y, "has_doomguy": False}
    elif seed <= 20 + 60 / lvl:
        brick = {"type": 'default', "x": x, "y": y, "has_doomguy": False}
    else:
        return None
    return brick


def generate_doomguys(bricks, count):
    doomguys = []
    seeds = []
    if count > len(bricks):
        count = len(bricks)
    while len(seeds) < count:
        seed = random.randint(0, len(bricks) - 1)
        if seed not in seeds:
            seeds.append(seed)
    for seed in seeds:
        doomguy = {"x": bricks[seed]["x"], "y": bricks[seed]["y"]}
        bricks[seed]["has_doomguy"] = True
        doomguys.append(doomguy)
    return doomguys


def generate_bonus(brick):
    seed = random.randint(0, 100)
    if seed >= 95:
        bonus = {"type": "life", "x": brick["x"], "y": brick["y"]}
    elif seed >= 90:
        bonus = {"type": "invisibility", "x": brick["x"], "y": brick["y"]}
    elif seed >= 85:
        bonus = {"type": "mega", "x": brick["x"], "y": brick["y"]}
    elif seed >= 70:
        bonus = {"type": "hp", "x": brick["x"], "y": brick["y"]}
    elif seed >= 65:
        bonus = {"type": "invulnerability", "x": brick["x"], "y": brick["y"]}
    elif seed >= 60:
        bonus = {"type": "speed", "x": brick["x"], "y": brick["y"]}
    elif seed >= 55:
        bonus = {"type": "barrel", "x": brick["x"], "y": brick["y"]}
    else:
        return None
    return bonus
