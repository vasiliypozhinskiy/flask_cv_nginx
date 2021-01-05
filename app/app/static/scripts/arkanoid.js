const canvas = document.getElementById("arkanoid");
const context = canvas.getContext("2d");
const start_button = document.getElementById("start");


let left_arrow_pressed = false;
let right_arrow_pressed = false;
let up_arrow_pressed = false;
let down_arrow_pressed = false;
let space_pressed = false;

document.addEventListener("keydown", function(event)
{
if (event.keyCode == 37) {
    left_arrow_pressed = true;
} else if (event.keyCode == 39) {
    right_arrow_pressed = true;
} else if (event.keyCode == 38) {
    up_arrow_pressed = true;
} else if (event.keyCode == 40) {
    down_arrow_pressed = true;
} else if (event.keyCode == 32) {
    space_pressed = true;
}
});

document.addEventListener("keyup", function(event) {
if (event.keyCode == 37) {
    left_arrow_pressed = false;
} else if (event.keyCode == 39) {
    right_arrow_pressed = false;
} else if (event.keyCode == 38) {
    up_arrow_pressed = false;
} else if (event.keyCode == 40) {
    down_arrow_pressed = false;
} else if (event.keyCode == 32) {
    space_pressed = false;
}
});

const BACKGROUND = new Image(config.CANVAS_WIDTH, config.CANVAS_HEIGHT);
BACKGROUND.src = "/static/images/arkanoid-background.png";

const paddle = new Paddle(context, canvas.width/2 - config.PADDLE_WIDTH / 2, canvas.height - config.PADDLE_HEIGHT - config.OFFSET_Y);
const ball = new Ball(context, canvas.width/2, paddle.y - config.BALL_RADIUS);
const left_torch = new Torch(context, 0, canvas.height);
const right_torch = new Torch(context, canvas.width - 26, canvas.height);

var score_list = [];
var debris_list = [];

const start_sound = "/static/sound/newlvl.wav";
var lives = config.LIVES;
var game_score = 0;
var invulnerability_trigger = false;

function loop(bricks, bonuses, doomguys, score_list, current_lvl) {
    if (ball.invulnerability_duration > 0 && !invulnerability_trigger)
    {
        invulnerability_trigger = true;
        $("canvas").css({"filter": "grayscale(100%) invert(100%)"});
    }
    if (ball.invulnerability_duration == 0 && invulnerability_trigger)
    {
        invulnerability_trigger = false;
        $("canvas").css({"filter": "none"});
    }

    context.drawImage(BACKGROUND, 0, 0);

    if ((lives == 0) && (ball.frame_count == 100))
    {
        game_over();
        return;
    }

    left_torch.draw();
    right_torch.draw();

    for (let i = 0; i < debris_list.length; i++)
    {
        current_debris = debris_list[i];
        current_debris.draw();
        if (current_debris.y > config.CANVAS_HEIGHT)
        {
            debris_list.splice(i, 1);
        }
    }
    if (left_arrow_pressed)
    {
        paddle.speed[0] = -config.PADDLE_SPEED[0];
    }
    if (right_arrow_pressed)
    {
        paddle.speed[0] = config.PADDLE_SPEED[0];
    }
    if (up_arrow_pressed)
    {
        paddle.speed[1] = -config.PADDLE_SPEED[1];
    }
    if (down_arrow_pressed)
    {
        paddle.speed[1] = config.PADDLE_SPEED[1];
    }
    if (space_pressed)
    {
     ball.start();
    }

    paddle.move();
    ball.move(paddle);

    paddle.decrease_bonus_duration();
    ball.decrease_bonus_duration();

    ball.wallCollision();
    ball.friction();

    ball.paddleCollision(paddle);
    if (bricks.length == 0)
    {
        level_complete(current_lvl);
        return;
    }

    for (let i = 0; i < bricks.length; i++)
    {
        current_brick = bricks[i];
        current_brick.draw();
        ball.brickCollision(current_brick);
        if (current_brick.type == "for_delete")
        {
            current_brick.create_score_obj(score_list);
            bricks.splice(i, 1);
        }
    }

    for (let i = 0; i < bonuses.length; i++)
    {
        current_bonus = bonuses[i];
        current_bonus.move();
        current_bonus.draw();
        current_bonus.brickCollision(bricks);
        current_bonus.paddleCollision(paddle);
        current_bonus.ballCollision(ball);
        if (current_bonus.type == "for_delete")
        {
            current_bonus.create_score_obj(score_list);
            bonuses.splice(i, 1);
        }
    }

    for (let i = 0; i < doomguys.length; i++)
    {
        current_doomguy = doomguys[i];
        current_doomguy.move();
        current_doomguy.draw();
        current_doomguy.brickCollision(bricks);
        current_doomguy.checkForShooting();
        current_doomguy.ballCollision();
        current_doomguy.friction();
    }

    paddle.draw();
    ball.random_animation();
    ball.draw();
    draw_hud();
    for (let i = 0; i < score_list.length; i++)
    {
        current_score = score_list[i];
        current_score.draw();
        current_score.move();
        if (current_score.status == "for_delete")
        {
            score_list.splice(i, 1);
        }
    }
    paddle.speed = [0, 0]
    requestAnimationFrame(loop.bind(null, bricks, bonuses,doomguys, score_list, current_lvl));
}

function arkanoid_start(lvl)
{
    var current_lvl = lvl;
    start_button.disabled = true;
    $.ajax({
        url: "/projects/generate_arkanoid_lvl",
        type: "GET",
        contentType: "application/json",
        data: {"lvl": lvl},
        success: function (data) {
            let bricks = create_bricks(data["bricks"]);
            let bonuses = create_bonuses(data["bonuses"]);
            let doomguys = create_doomguys(data["doomguys"]);
            play_audio(start_sound);
            loop(bricks, bonuses, doomguys, score_list, current_lvl);
        }
    });
}

function create_bricks(bricks_list)
{
    let bricks = [];
    for (let i = 0; i < bricks_list.length; i++)
    {
            brick = bricks_list[i];
            if (brick["type"] == "brown")
            {
                current_brick = new BrownBrick(context, brick["type"], brick["x"], brick["y"]);
            }
            if (brick["type"] == "default")
            {
                current_brick = new DefaultBrick(context, brick["type"], brick["x"], brick["y"]);
            }
            if (brick["type"] == "grey")
            {
                current_brick = new GreyBrick(context, brick["type"], brick["x"], brick["y"]);
            }
            bricks.push(current_brick);
    }
    return bricks;
}

function create_bonuses(bonuses_list)
{
    let bonuses = [];
    for (let i = 0; i < bonuses_list.length; i++)
    {
        bonus = bonuses_list[i];
        if (bonus["type"] == "life")
        {
            current_bonus = new LifeBonus(context, bonus["type"], bonus["x"], bonus["y"])
        }
        if (bonus["type"] == "invisibility")
        {
            current_bonus = new InvisibilityBonus(context, bonus["type"], bonus["x"], bonus["y"])
        }
        if (bonus["type"] == "mega")
        {
            current_bonus = new MegaBonus(context, bonus["type"], bonus["x"], bonus["y"])
        }
        if (bonus["type"] == "speed")
        {
            current_bonus = new SpeedBonus(context, bonus["type"], bonus["x"], bonus["y"])
        }
        if (bonus["type"] == "invulnerability")
        {
            current_bonus = new InvulnerabilityBonus(context, bonus["type"], bonus["x"], bonus["y"])
        }
        if (bonus["type"] == "hp")
        {
            current_bonus = new HpBonus(context, bonus["type"], bonus["x"], bonus["y"])
        }
        if (bonus["type"] == "barrel")
        {
            current_bonus = new Barrel(context, bonus["type"], bonus["x"], bonus["y"])
        }
        bonuses.push(current_bonus);
    }
    return bonuses;
}

function create_doomguys(doomguys_list)
{
    let doomguys = [];
    for (let i = 0; i < doomguys_list.length; i++)
    {
        doomguy = doomguys_list[i];
        current_doomguy = new Doomguy(context, doomguy["x"], doomguy["y"]);
        doomguys.push(current_doomguy);
    }
    return doomguys;
}

function level_complete(current_lvl)
{
    paddle.reset();
    ball.reset(paddle);
    console.log("level " + current_lvl + " complete");
    arkanoid_start(current_lvl + 1);
}

function game_over()
{
    console.log("You score: " + game_score);
    game_score = 0;
    lives = config.LIVES;
    start_button.disabled = false;
}

function draw_hud()
{
    context.textAlign = "end";
    context.fillStyle = "#6F6F6F";
    context.font = "24px roboto";
    context.fillText("Lives left: " + lives + " Score: " + game_score, 800, 24);
    context.textAlign = "start";
    context.fillText("Hp: " + ball.hp, 0, 24);
}


