const canvas = document.getElementById("arkanoid");
const context = canvas.getContext("2d");
var requestId = 0;
var stopped = false;
var muted = false;
var fps_enable = false;
var game_ended = false;

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

const paddle = new Paddle(context, canvas.width/2 - config.PADDLE_WIDTH / 2, canvas.height - config.PADDLE_HEIGHT - config.OFFSET_Y);
const ball = new Ball(context, canvas.width/2, paddle.y - config.BALL_RADIUS);
const left_torch = new Torch(context, 0, canvas.height);
const right_torch = new Torch(context, canvas.width - 26, canvas.height);
const SPIKES = new Image();
SPIKES.src = "/static/images/spikes.png";

var bricks = [];
var bonuses = [];
var doomguys = [];
var score_list = [];
var message_list = [];
var debris_list = [];
var current_lvl = 1;

const start_sound = "/static/sound/newlvl.wav";
var lives = config.LIVES;
var game_score = 0;
var last_score = 0;
var invulnerability_trigger = false;

const FRAME_MIN_TIME = (1000/60) * (60 / config.FPS) - (1000/60) * 0.5;

var last_loop;

function start_animation(fps)
{
    last_loop = performance.now();
    loop();
}

function loop() {
    if (!stopped)
    {
        this_loop = performance.now()
        if (this_loop - last_loop < FRAME_MIN_TIME)
        {
            requestAnimationFrame(loop);
            return;
        }
        else
        {
            context.clearRect(0, 0, 800, 600);

            if (ball.invulnerability_duration > 0 && !invulnerability_trigger)
            {
                invulnerability_trigger = true;
                $("#background").css({"filter": "grayscale(100%) invert(100%)"});
                $("canvas").css({"filter": "grayscale(100%) invert(100%)"});
            }
            if (ball.invulnerability_duration == 0 && invulnerability_trigger)
            {
                invulnerability_trigger = false;
                $("#background").css({"filter": "none"});
                $("canvas").css({"filter": "none"});
            }

            if ((lives == 0) && (ball.frame_count == 100))
            {
                $("#background").css({"filter": "none"});
                $("canvas").css({"filter": "none"});
                game_over();
            }

            if (game_ended)
            {
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
                current_lvl += 1;
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

            for (let i = 0; i < message_list.length; i++)
            {
                current_message = message_list[i];
                current_message.draw();
                if (current_message.status == "for_delete")
                {
                    message_list.splice(i, 1);
                }
            }
            paddle.speed = [0, 0]

            context.drawImage(SPIKES, 26, config.CANVAS_HEIGHT - 24);

            if (fps_enable)
            {
                show_fps();
            }

            last_loop = performance.now();
            requestAnimationFrame(loop);
        }
    }
}

function arkanoid_start(lvl)
{
    game_ended = false;
    $("#arkanoid").focus();
    disable_keys();
    $('#top-scores').css({"opacity": "0"});
    $('#add-score-container').css({"opacity": "0"});
    $('#start').attr("disabled", true);
    $('#show-score').attr("disabled", true);
    $.ajax({
        url: "/projects/generate_arkanoid_lvl",
        async: false,
        type: "GET",
        contentType: "application/json",
        data: {"lvl": lvl},
        success: function (data) {
            let new_bricks = create_bricks(data["bricks"]);
            bricks.push.apply(bricks, new_bricks);
//            let new_bonuses = create_bonuses(data["bonuses"]);
//            bonuses.push.apply(bonuses, new_bonuses);
//            let new_doomguys = create_doomguys(data["doomguys"]);
//            doomguys.push.apply(doomguys, new_doomguys);
            bonuses = create_bonuses(data["bonuses"]);
            doomguys = create_doomguys(data["doomguys"]);
            message_list.push(new Message(context, "Level " + lvl));
            play_audio(start_sound);
            start_animation(config.FPS);
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
    bonuses = [];
    doomguys = [];
    paddle.reset();
    ball.reset();
    arkanoid_start(current_lvl);
}

function game_over()
{
    game_ended = true;
    enable_keys();
    $('#start').attr("disabled", false);
    $('#show-score').attr("disabled", false);
    show_score_form(game_score);

    bricks = [];
    bricks = [];
    bonuses = [];
    doomguys = [];
    score_list = [];
    message_list = [];
    debris_list = [];
    ball.reset();
    paddle.reset();
    current_lvl = 1;
    game_score = 0;
    lives = config.LIVES;
}

function draw_hud()
{
    context.textAlign = "end";
    context.fillStyle = "#6F6F6F";
    context.font = "24px roboto";
    context.fillText(" Score: " + game_score, 800, 24);
    context.textAlign = "start";
    context.fillText("Lives: " + lives + " Hp: " + ball.hp, 0, 24);
}

function show_message(text)
{
    context.textAlign = "center";
    context.fillStyle = "#000000";
    context.font = "24px roboto";
    context.fillText(text, config.CANVAS_WIDTH / 2, config.CANVAS_HEIGHT / 2);
}

function show_score_form(score)
{
    last_score = score;
    $("#add-score-container h2").remove();
    $('#add-score-container').css({"opacity": "1"})
    $('#add-score-container').prepend("<h2>Game over</h2><h2>Your score: " + last_score + "</h2>")
}

function add_score()
{
    let username = $("#add-score-form").serialize().split("=")[1]
    if (username.length === 0)
    {
        return;
    }
    $('#add-score-container').css({"opacity": "0"});
    $("#add-score-form")[0].reset();
    $.ajax({
        url: "/projects/add_score",
        async: false,
        type: "POST",
        data: {"score": last_score, "user": username, "date": Date.now()}
    }
    );
    show_score(last_score, username);
}

function show_score(score, user)
{
    let current_user_shown = false;
    if ($('#top-scores').css("opacity") == 0)
    {
    $('#add-score-container').css({"opacity": "0"});
    $.ajax({
        url: "/projects/show_score",
        type: "GET",
        contentType: "application/json",
        success: function(data)
            {
                var rows_count = data.length;
                var decoded_user = decodeURIComponent(user);
                if (data.length > 20)
                {
                    rows_count = 20;
                }
                $('#top-scores').css({"opacity": "1"});
                $("#top-scores tr").remove();
                $("#top-scores").append("<tr><th width='10%'>№</th><th width='50%'>Name</th><th width='20%'>Score</th><th width='10%'>Date</th></tr>")
                for (let i = 0; i < rows_count; i++)
                {
                    if ((score == data[i]["score"])&&(decoded_user == data[i]["username"])&&(!current_user_shown))
                    {
                        current_user_shown = true;
                        $("#top-scores").append("<tr style='color: red'></tr>");
                        $("#top-scores > tr:last").append("<td align='center'>" + (i + 1) + "</td>"
                        + "<td align='center'>" + data[i]["username"] + "</td>"
                        + "<td align='center'>" + data[i]["score"] +"</td>"
                        + "<td align='center'>" + data[i]["date"] +"</td>");
                    } else
                    {
                        $("#top-scores").append("<tr></tr>");
                        $("#top-scores > tr:last").append("<td align='center'>" + (i + 1) + "</td>"
                        + "<td align='center'>" + data[i]["username"] + "</td>"
                        + "<td align='center'>" + data[i]["score"] +"</td>"
                        + "<td align='center'>" + data[i]["date"] +"</td>");
                    }
                }

                if (!current_user_shown && (typeof score != "undefined") && (typeof user != "undefined"))
                {
                    $("#top-scores > tr:last").remove();
                    $("#top-scores > tr:last").remove();
                    $("#top-scores").append("<tr></tr>");
                    $("#top-scores > tr:last").append("<td align='center'>...</td><td align='center'>...</td><td align='center'>...</td><td align='center'>...</td>");
                    for (let i = rows_count; i < data.length; i++)
                    {
                        if ((score == data[i]["score"])&&(decoded_user == data[i]["username"]))
                        {
                            $("#top-scores").append("<tr style='color: red'></tr>");
                            $("#top-scores > tr:last").append("<td align='center'>" + (i + 1) + "</td>"
                            + "<td align='center'>" + data[i]["username"] + "</td>"
                            + "<td align='center'>" + data[i]["score"] +"</td>"
                            + "<td align='center'>" + data[i]["date"] +"</td>");
                            break;
                        }
                    }
                }
            }
        });
        }
        else
        {
            $('#top-scores').css({"opacity": "0"});
        }
}

function fps_switch()
{
    $("#arkanoid").focus();
    fps_enable = !fps_enable;
}

function show_fps()
{
    var currentFPS = Math.round(1000 / (this_loop - last_loop));
    context.textAlign = "center";
    context.fillStyle = "#6F6F6F";
    context.font = "24px roboto";
    context.fillText("FPS: " + currentFPS, 400, 24);
}

function pause(requestId)
{
    $("#arkanoid").focus();
    if (stopped)
    {
        stopped = false;
        start_animation(config.FPS);
    }
    else
    {
        stopped = true;
        cancelAnimationFrame(requestId)
    }
}

function disable_keys()
{
     document.onkeydown = function (e)
     {
         return false;
     }
}

function enable_keys()
{
     document.onkeydown = function (e)
     {
         return true;
     }
}

function mute()
{
    muted = !muted;
}

