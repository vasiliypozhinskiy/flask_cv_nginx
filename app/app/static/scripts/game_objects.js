var config = get_config();

function get_config()
{
    let config;
    $.ajax({
        async: false,
        url: "/projects/get_config",
        type: "GET",
        success: function(data){
        config = data["config"];
        }
    });
    return config;
}

class Paddle
{
    constructor(context, x, y)
    {
        this.x = x;
        this.y = y;
        this.width = config.PADDLE_WIDTH;
        this.height = config.PADDLE_HEIGHT;
        this.context = context;
        this.speed = [0, 0];

        this.invisibility_duration = 0;
        this.mega_duration = 0;
        this.speed_duration = 0;
        this.mega_activated = false;
    }

    draw()
    {
        if (this.invisibility_duration > 0)
        {
            this.context.globalAlpha = 0.1;
        }
        if (this.mega_activated)
        {
            this.mega_duration -= 1;
            if (this.mega_duration <= 0)
            {
                this.change_size(-100, -20)
                this.mega_activated = false;
            }
        }
        this.context.beginPath();
        this.context.rect(this.x, this.y, this.width, this.height);
        this.context.fillStyle = config.PADDLE_COLOR;
        this.context.strokeStyle = "#1D4B0B";
        this.context.lineWidth = 5;
        this.context.stroke();
        this.context.fill();
        this.context.closePath();
        this.context.globalAlpha = 1;
    }

    change_size(width, height)
    {
        this.width += width;
        this.height += height;
        this.x -= width / 2;
        this.y -= height / 2;

        if (this.x + this.width > config.CANVAS_WIDTH - config.OFFSET_X)
        {
            this.x = config.CANVAS_WIDTH - config.OFFSET_X - this.width;
        }
        if (this.x < config.OFFSET_X)
        {
            this.x = config.OFFSET_X;
        }
        if (this.y + this.height > config.CANVAS_HEIGHT)
        {
            this.y = config.CANVAS_HEIGHT - config.OFFSET_Y - this.height;
        }
        if (this.y < config.CANVAS_HEIGHT - config.PADDLE_ZONE)
        {
            this.y = config.CANVAS_HEIGHT - config.PADDLE_ZONE;
        }
    }

    move()
    {
        if (this.speed_duration > 0)
        {
            this.speed[0] *= 2;
            this.speed[1] *= 2;
        }
        if (this.invulnerability_duration > 0)
        {
            this.speed[0] /= 2;
            this.speed[1] /= 2;
        }
        if ((this.x + this.speed[0] + this.width <= config.CANVAS_WIDTH - config.OFFSET_X)
        && (this.x + this.speed[0] >= config.OFFSET_X))
            {
                this.x += this.speed[0];
            }
            else
            {
                this.speed[0] = 0;
            }
        if ((this.y + this.speed[1] + this.height <= config.CANVAS_HEIGHT - config.OFFSET_Y)
        && (this.y + this.speed[1] >= config.CANVAS_HEIGHT - config.PADDLE_ZONE))
            {
                this.y += this.speed[1];
            }
            else
            {
                this.speed[1] = 0;
            }
    }

    reset()
    {
        this.invisibility_duration = 0;
        this.mega_duration = 0;
        this.speed_duration = 0;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - config.OFFSET_Y;
    }

    decrease_bonus_duration()
    {
        if (this.invisibility_duration > 0)
        {
            this.invisibility_duration -= 1;
        }
        if (this.invulnerability_duration > 0)
        {
            this.mega_duration -= 1;
        }
        if (this.speed_duration > 0)
        {
            this.speed_duration -= 1;
        }
    }
}

class Ball
{ constructor(context, x, y)
    {
        this.context = context;
        this.x = x;
        this.y = y;
        this.radius = config.BALL_RADIUS;
        this.speed = [0, 0];
        this.side_acceleration = 0;
        this.max_speed = config.BALL_MAX_SPEED;
        this.damage = config.BALL_DAMAGE;
        this.hp = config.BALL_HP;

        this.falling = false;
        this.isBallOnPaddle = true;
        this.fall = false;
        this.animation = false;
        this.invisibility_duration = 0;
        this.mega_activated = false;
        this.injured = false;
        this.mega_duration = 0;
        this.speed_duration = 0;
        this.invulnerability_duration = 0;

        this.frame_count = 0;
        this.image = new Image();
        this.image.src = "/static/images/ball.png";


        this.animation1 = new Image();
        this.animation1.src = "/static/images/ball_animation1.png";
        this.animation2 = new Image();
        this.animation2.src = "/static/images/ball_animation2.png";
        this.animation3 = new Image();
        this.animation3.src = "/static/images/ball_animation3.png";

        this.imageLeft = new Image();
        this.imageLeft.src = "/static/images/ballLeft.png";
        this.imageRight = new Image();
        this.imageRight.src = "/static/images/ballRight.png";
        this.imageLeftInjured = new Image();
        this.imageLeftInjured.src = "/static/images/ballLeftHitted.png";
        this.imageRightInjured = new Image();
        this.imageRightInjured.src = "/static/images/ballRightHitted.png";


        this.death1 = new Image();
        this.death1.src = "/static/images/ball_fall1.png";
        this.death2 = new Image();
        this.death2.src = "/static/images/ball_fall2.png";
        this.death2 = new Image();
        this.death2.src = "/static/images/ball_fall2.png";
        this.death3 = new Image();
        this.death3.src = "/static/images/ball_fall3.png";
        this.death4 = new Image();
        this.death4.src = "/static/images/ball_fall4.png";
        this.death5 = new Image();
        this.death5.src = "/static/images/ball_fall5.png";
        this.death6 = new Image();
        this.death6.src = "/static/images/ball_fall6.png";

        this.hit_sound = "/static/sound/hit.wav";
        this.fall_sound = "/static/sound/death.wav";
        this.start_sound = "/static/sound/appear.wav";
        this.attack_sound = "/static/sound/attack.wav";
        this.injured_sound = "/static/sound/injured.wav";
    }

 draw()
 {
    if (this.invisibility_duration > 0)
    {
        this.invisibility_duration -= 1;
        this.context.globalAlpha = 0.1;
    }
    if (this.mega_activated && this.mega_duration == 0)
    {
        this.mega_activated = false;
        this.change_size()
    }
    if (this.fall || this.animation)
    {
        this.frame_count += 1;
    }

    if (this.side_acceleration > 0)
    {
        if (!this.injured)
        {
            this.context.drawImage(this.imageRight, this.x - this.radius, this.y - this.radius);
        }
        else
        {
            this.context.drawImage(this.imageRightInjured, this.x - this.radius, this.y - this.radius);
        }
        this.context.globalAlpha = 1;
        return;
    }

    if (this.side_acceleration < 0)
    {
        if (!this.injured)
        {
            this.context.drawImage(this.imageLeft, this.x - this.radius, this.y - this.radius);
        }
        else
        {
            this.context.drawImage(this.imageLeftInjured, this.x - this.radius, this.y - this.radius);
        }
        this.context.globalAlpha = 1;
        return;
    }

    if (this.frame_count == 0)
    {
        this.context.drawImage(this.image, this.x - this.radius, this.y - this.radius);
        this.context.globalAlpha = 1;
        return;
    }

    if (this.animation && this.frame_count <= 10)
    {
        this.context.drawImage(this.animation1, this.x - this.radius, this.y - this.radius);
        this.context.globalAlpha = 1;
        return;
    }

    if (this.animation && this.frame_count <= 20)
    {
        this.context.drawImage(this.animation2, this.x - this.radius, this.y - this.radius);
        this.context.globalAlpha = 1;
        return;
    }

    if (this.animation && this.frame_count <= 30)
    {
        this.context.drawImage(this.animation3, this.x - this.radius, this.y - this.radius);
        this.context.globalAlpha = 1;
        return;
    }

    if (this.animation && this.frame_count <= 40)
    {
        this.context.drawImage(this.animation2, this.x - this.radius, this.y - this.radius);
        this.context.globalAlpha = 1;
        return;
    }
    if (this.animation && this.frame_count <= 50)
    {
        this.context.drawImage(this.animation1, this.x - this.radius, this.y - this.radius);
        this.context.globalAlpha = 1;
        return;
    }

    if (this.fall && this.frame_count <= 60)
    {
        this.context.drawImage(this.death1, this.x - this.radius, config.CANVAS_HEIGHT - this.death1.height);
        this.context.globalAlpha = 1;
        return;
    }
    if (this.fall && this.frame_count <= 70)
    {
        this.context.drawImage(this.death2, this.x - this.radius, config.CANVAS_HEIGHT - this.death2.height);
        this.context.globalAlpha = 1;
        return;
    }
    if (this.fall && this.frame_count <= 80)
    {
        this.context.drawImage(this.death3, this.x - this.radius, config.CANVAS_HEIGHT - this.death3.height);
        this.context.globalAlpha = 1;
        return;
    }
    if (this.fall && this.frame_count <= 90)
    {
        this.context.drawImage(this.death4, this.x - this.radius, config.CANVAS_HEIGHT - this.death4.height);
        this.context.globalAlpha = 1;
        return;
    }
    if (this.fall && this.frame_count <= 100)
    {
        this.context.drawImage(this.death5, this.x - this.radius, config.CANVAS_HEIGHT - this.death5.height);
        this.context.globalAlpha = 1;
        return;
    }
    if (this.fall && this.frame_count <= 110)
    {
        this.context.drawImage(this.death6, this.x - this.radius, config.CANVAS_HEIGHT - this.death6.height);
        this.context.globalAlpha = 1;
        return;
    }

 }

 change_size()
 {
    if (this.mega_activated)
    {
        this.radius = 33;
        this.image.src = "/static/images/bigBall.png";

        this.animation1.src = "/static/images/bigBall_animation1.png";
        this.animation2.src = "/static/images/bigBall_animation2.png";
        this.animation3.src = "/static/images/bigBall_animation3.png";

        this.imageLeft.src = "/static/images/bigBallLeft.png";
        this.imageRight.src = "/static/images/bigBallRight.png";
        this.imageLeftInjured.src = "/static/images/bigBallLeftHitted.png";
        this.imageRightInjured.src = "/static/images/bigBallRightHitted.png";

        this.death1.src = "/static/images/bigBall_fall1.png";
        this.death2.src = "/static/images/bigBall_fall2.png";
        this.death2.src = "/static/images/bigBall_fall2.png";
        this.death3.src = "/static/images/bigBall_fall3.png";
        this.death4.src = "/static/images/bigBall_fall4.png";
        this.death5.src = "/static/images/bigBall_fall5.png";
        this.death6.src = "/static/images/bigBall_fall6.png";
    }
    else
    {
        this.radius = config.BALL_RADIUS;
        this.image.src = "/static/images/ball.png";

        this.animation1.src = "/static/images/ball_animation1.png";
        this.animation2.src = "/static/images/ball_animation2.png";
        this.animation3.src = "/static/images/ball_animation3.png";

        this.imageLeft.src = "/static/images/ballLeft.png";
        this.imageRight.src = "/static/images/ballRight.png";
        this.imageLeftInjured.src = "/static/images/ballLeftHitted.png";
        this.imageRightInjured.src = "/static/images/ballRightHitted.png";

        this.death1.src = "/static/images/ball_fall1.png";
        this.death2.src = "/static/images/ball_fall2.png";
        this.death2.src = "/static/images/ball_fall2.png";
        this.death3.src = "/static/images/ball_fall3.png";
        this.death4.src = "/static/images/ball_fall4.png";
        this.death5.src = "/static/images/ball_fall5.png";
        this.death6.src = "/static/images/ball_fall6.png";
    }
 }

 random_animation()
 {
    if (!this.animation)
    {
        let seed = Math.random();
        if (seed < 0.001)
        {
            this.animation = true;
            play_audio(this.attack_sound);
        }
    }
    else
    {
        if (this.frame_count == 50)
        {
            this.animation = false;
            this.frame_count = 0;
        }
    }
 }

 wallCollision()
 {
    if (this.x + this.radius > config.CANVAS_WIDTH)
        {
            this.speed[0] = -Math.abs(this.speed[0]);
            this.x = config.CANVAS_WIDTH - this.radius;
            play_audio(this.hit_sound);
            this.side_acceleration /= 2;
        }

    if (this.x - this.radius < 0)
        {
            this.speed[0] = Math.abs(this.speed[0]);
            this.x = this.radius;
            this.side_acceleration /= 2;
            play_audio(this.hit_sound);
        }

    if (this.y - this.radius < 0)
        {
            this.speed[1] = Math.abs(this.speed[1]);
            this.y = this.radius;
            this.side_acceleration /= 2;
            play_audio(this.hit_sound);
        }
    if ((this.y + this.radius >= config.CANVAS_HEIGHT)
       || (this.x + this.radius < 0)
       || (this.x - this.radius > config.CANVAS_WIDTH)
       || (this.y + this.radius < 0))
        {
            if (!this.fall)
            {
                this.speed = [0, 0];
                this.side_acceleration = 0;
                this.fall = true;
                this.frame_count = 50;
                play_audio(this.fall_sound);
                lives -= 1;
            }
            if (this.frame_count > 100)
            {
                this.reset(paddle);
            }
        }
 }

 paddleCollision(paddle)
 {
    if ((!this.fall) && (this.y + this.radius > paddle.y) && (this.y - this.radius < paddle.y + paddle.height)
       && (this.x + this.radius > paddle.x) && (this.x - this.radius < paddle.x + paddle.width))
       {
            play_audio(this.hit_sound);
            //hit top
            if ((this.x + this.radius > paddle.x) && (this.x - this.radius < paddle.x + paddle.width) && (this.y < paddle.y))
            {
                let collidePoint = this.x - (paddle.x + paddle.width / 2);
                collidePoint = collidePoint / (paddle.width / 2);
                let angle = collidePoint *  (Math.PI / 6);
                this.speed[0] = config.BALL_MAX_SPEED * Math.sin(angle);
                this.speed[1] = - config.BALL_MAX_SPEED + Math.abs(this.speed[0]);
                this.y = paddle.y - this.radius;
                this.side_acceleration = paddle.speed[0] / 2;
                return;
            }

            //hit left
            if (this.x < paddle.x)
            {
                this.speed[0] = - Math.abs(this.speed[0]);
                this.x = paddle.x - this.radius;
                return;
            }
            //hit right
            if  (this.x > paddle.x + paddle.width)
            {
                this.speed[0] = Math.abs(this.speed[0]);
                this.x = paddle.x + paddle.width + this.radius;
                return;
            }
            //hit bottom
            if ((this.x + this.radius > paddle.x) && (this.x - this.radius < paddle.x + paddle.width) && (this.y > paddle.y))
            {
                this.speed[1] = - this.speed[1];
                this.y = paddle.y + paddle.height + this.radius;
                return;
            }
       }
 }

 friction()
 {
    let shift = config.FRICTION
    if (this.side_acceleration > shift)
    {
        this.side_acceleration -= shift;
    }
    if (this.side_acceleration < -shift)
    {
        this.side_acceleration += shift;
    }
    if (this.side_acceleration < shift && this.side_acceleration > -shift)
    {
        this.side_acceleration = 0;
        this.injured = false;
    }
 }

 brickCollision(brick)
 {
    if ((this.y + this.radius > brick.y) && (this.y - this.radius < brick.y + brick.height)
       && (this.x + this.radius > brick.x) && (this.x - this.radius < brick.x + brick.width))
        {
            brick.collision(this.damage);
            play_audio(this.hit_sound);
            this.side_acceleration /= 2;

            if ((this.x + this.radius - this.speed[0] <= brick.x) || (this.x - this.radius - this.speed[0] >= brick.x + brick.width))
            {
                this.speed[0] = -this.speed[0];
            }
            if ((this.y + this.radius - this.speed[1] <= brick.y) || (this.y - this.radius - this.speed[1] >= brick.y + brick.height))
            {

                this.speed[1] = -this.speed[1];
            }
        }

 }

 reset()
 {
    if (this.fall)
    {
        this.hp = config.BALL_HP;
    }
    this.isBallOnPaddle = true;
    this.fall = false;
    this.falling = false;
    this.x = paddle.x + paddle.width / 2;
    this.y = paddle.y - this.radius;
    this.frame_count = 0;
    this.invisibility_duration = 0;
    this.mega_duration = 0;
    this.speed_duration = 0;
    this.invulnerability_duration = 0;
 }

 move()
 {
    if (this.falling)
    {
        this.x += this.speed[0] + this.side_acceleration;
        this.speed[1] += config.FALLING_SPEED * 5;
        this.y += this.speed[1];
        return;
    }
    if (this.isBallOnPaddle)
    {
        this.x = paddle.x + paddle.width / 2;
        this.y = paddle.y - this.radius;
    }
    else
    {
        this.x += this.speed[0] + this.side_acceleration;
        this.y += this.speed[1];
        if (this.speed_duration > 0)
        {
            this.x += this.speed[0];
            this.y += this.speed[1];
        }

    }
 }
 start()
 {
    if (this.isBallOnPaddle)
    {
        play_audio(this.start_sound);
        this.speed[0] = (Math.random() * (this.max_speed - 2) * 2) - (this.max_speed - 2);
        this.speed[1] = -this.max_speed + Math.abs(this.speed[0]);
        this.side_acceleration = 0;
        this.isBallOnPaddle = false;
    }
 }

 decrease_bonus_duration()
 {
        if (this.mega_duration > 0)
        {
            this.mega_duration -= 1;
        }
        if (this.speed_duration > 0)
        {
            this.speed_duration -= 1;
        }
        if (this.invulnerability_duration > 0)
        {
            this.invulnerability_duration -= 1;
        }
 }

}

class Brick
{
    constructor (context, type, x, y)
    {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 50;
        this.context = context;
        this.hp = 10;
        this.score = 10;

        this.break_sound = "/static/sound/brick.wav";
    }

    collision(damage)
    {
    this.hp -= damage;
    if (this.hp <= 0)
        {
            this.type = "for_delete";
            play_audio(this.break_sound);
            this.create_debris();
            game_score += this.score;
        }
    }

    create_score_obj(score_list)
    {
        score_list.push(new Score_obj(this.context, this.score, this.x + this.width / 2, this.y + this.height / 2));
    }

    create_debris()
    {
        debris_list.push(new Debris(this.context, this.image1.src, this.x, this.y));
    }
}

class DefaultBrick extends Brick
{
    constructor(context, type, x, y)
    {
        super(context, type, x, y)
        this.hp = 20;
        this.score = 10;

        this.image1 = new Image(this.width, this.height);
        this.image1.src = "/static/images/default brick 1.png";
        this.image2 = new Image(this.width, this.height);
        this.image2.src = "/static/images/default brick 2.png";
    }

    draw()
    {
        if (this.hp == 20)
        {
            this.context.drawImage(this.image1, this.x, this.y);
        }
        if (this.hp < 20 && this.hp > 0)
        {
            this.context.drawImage(this.image2, this.x, this.y);
        }
        this.context.beginPath();
        this.context.rect(this.x, this.y, this.width, this.height);
        this.context.strokeStyle = "black";
        this.context.lineWidth = 3;
        this.context.stroke();
        this.context.closePath();
    }
}

class BrownBrick extends Brick
{
    constructor(context, type, x, y)
    {
        super(context, type, x, y)
        this.hp = 40;
        this.score = 20;

        this.width = 80;
        this.height = 50;
        this.image1 = new Image(this.width, this.height);
        this.image1.src = "/static/images/brown brick 1.png";
        this.image2 = new Image(this.width, this.height);
        this.image2.src = "/static/images/brown brick 2.png";
        this.image3 = new Image(this.width, this.height);
        this.image3.src = "/static/images/brown brick 3.png";
        this.image4 = new Image(this.width, this.height);
        this.image4.src = "/static/images/brown brick 4.png";
    }

    draw()
    {
        if (this.hp == 40)
        {
            this.context.drawImage(this.image1, this.x, this.y);
        }
        if (this.hp < 40 && this.hp >= 30)
        {
            this.context.drawImage(this.image2, this.x, this.y);
        }
        if (this.hp < 30 && this.hp >= 20)
        {
            this.context.drawImage(this.image3, this.x, this.y);
        }
        if (this.hp < 20 && this.hp > 0)
        {
            this.context.drawImage(this.image4, this.x, this.y);
        }
        this.context.beginPath();
        this.context.rect(this.x, this.y, this.width, this.height);
        this.context.strokeStyle = "black";
        this.context.lineWidth = 3;
        this.context.stroke();
        this.context.closePath();
    }
}

class GreyBrick extends Brick
{
    constructor(context, type, x, y)
    {
        super(context, type, x, y)
        this.hp = 40;
        this.score = 20;

        this.width = 80;
        this.height = 50;
        this.image1 = new Image(this.width, this.height);
        this.image1.src = "/static/images/Grey brick 1.png";
        this.image2 = new Image(this.width, this.height);
        this.image2.src = "/static/images/Grey brick 2.png";
        this.image3 = new Image(this.width, this.height);
        this.image3.src = "/static/images/Grey brick 3.png";
        this.image4 = new Image(this.width, this.height);
        this.image4.src = "/static/images/Grey brick 4.png";
    }

    draw()
    {
        if (this.hp == 40)
        {
            this.context.drawImage(this.image1, this.x, this.y);
        }
        if (this.hp < 40 && this.hp >= 30)
        {
            this.context.drawImage(this.image2, this.x, this.y);
        }
        if (this.hp < 30 && this.hp >= 20)
        {
            this.context.drawImage(this.image3, this.x, this.y);
        }
        if (this.hp < 20 && this.hp > 0)
        {
            this.context.drawImage(this.image4, this.x, this.y);
        }
        this.context.beginPath();
        this.context.rect(this.x, this.y, this.width, this.height);
        this.context.strokeStyle = "black";
        this.context.lineWidth = 3;
        this.context.stroke();
        this.context.closePath();
    }

    collision(damage)
    {
    this.hp -= damage;
    if (this.hp <= 0)
        {
            this.type = "for_delete";
            play_audio(this.break_sound);
            this.create_debris();
            game_score += this.score;
            let seed = Math.random();
            if (seed > 0.8)
            {
                bonuses.push(new LifeBonus(context, "life", this.x, this.y + this.height / 2));
            }
            else if (seed > 0.6)
            {
                bonuses.push(new InvisibilityBonus(context, "invisibility", this.x, this.y + this.height / 2));
            }
            else if (seed > 0.5)
            {
                bonuses.push(new MegaBonus(context, "mega", this.x, this.y + this.height / 2));
            }
            else if (seed > 0.4)
            {
                bonuses.push(new SpeedBonus(context, "hp", this.x, this.y + this.height / 2));
            }
            else if (seed > 0.3)
            {
                bonuses.push(new InvulnerabilityBonus(context, "invulnerability", this.x, this.y + this.height / 2));
            }
            else if (seed > 0.2)
            {
                bonuses.push(new HpBonus(context, "speed", this.x, this.y + this.height / 2));
            }
            else
            {
                bonuses.push(new Barrel(context, "barrel", this.x, this.y + this.height / 2));
            }
        }
    }
}

class Bonus
{
    constructor(context, type, x, y)
    {
        this.context = context;
        this.type = type;
        this.x = x + 40;
        this.radius = config.BONUS_RADIUS;
        this.y = y - this.radius;
        this.speed = [0, 0];
        this.onBrick = true;
        this.frame_count = Math.floor(Math.random() * (41));

        this.was_ball_collision = false;
        this.was_paddle_collision = false;
    }

    draw()
    {
        if (this.frame_count < 40)
        {
            this.frame_count ++;
        }
        else
        {
            this.frame_count = 0;
        }
        if (this.frame_count <= 10)
        {
            this.context.drawImage(this.animation1, this.x - this.radius, this.y - this.radius);
            return;
        }

        if (this.frame_count <= 20)
        {
            this.context.drawImage(this.animation2, this.x - this.radius, this.y - this.radius);
            return;
        }

        if (this.frame_count <= 30)
        {
            this.context.drawImage(this.animation3, this.x - this.radius, this.y - this.radius);
            return;
        }

        if (this.frame_count <= 40)
        {
            this.context.drawImage(this.animation2, this.x - this.radius, this.y - this.radius);
            return;
        }
    }

    move()
    {
        if (!this.onBrick)
        {
            this.y += this.speed[1];
            this.speed[1] += config.FALLING_SPEED;
        }
        if (this.y + this.radius > config.CANVAS_HEIGHT)
        {
            this.type = "for_delete";
        }
    }

    brickCollision(bricks)
    {
        this.onBrick = false;
        for (let i = 0; i < bricks.length; i++)
        {
            let brick = bricks[i];
            if ((this.y + this.radius > brick.y) && (this.y - this.radius < brick.y + brick.height)
             && (this.x + this.radius > brick.x) && (this.x - this.radius < brick.x + brick.width))
            {
                this.onBrick = true;
                this.speed = [0, 0];
            }
        }
    }

    create_score_obj(score_list)
    {
        if (this.score > 0)
        {
            score_list.push(new Score_obj(this.context, this.score, this.x, this.y));
        }
    }
}


class LifeBonus extends Bonus
{
    constructor(context, type, x, y)
    {
        super(context, type, x, y)
        this.ball_item_up_sound = "/static/sound/getpow.wav";
        this.paddle_item_up_sound = "/static/sound/itemup.wav"

        this.animation1 = new Image();
        this.animation1.src = "/static/images/life bonus1.png";
        this.animation2 = new Image();
        this.animation2.src = "/static/images/life bonus2.png";
        this.animation3 = new Image();
        this.animation3.src = "/static/images/life bonus3.png";
        this.animation4 = new Image();
        this.animation4.src = "/static/images/life bonus4.png";

    }

    paddleCollision(paddle)
    {
       if ((this.y + this.radius > paddle.y) && (this.y - this.radius < paddle.y + paddle.height)
             && (this.x + this.radius > paddle.x) && (this.x - this.radius < paddle.x + paddle.width))
       {
            play_audio(this.paddle_item_up_sound);
            lives += 1;
            this.type = "for_delete";
       }
    }

    ballCollision(ball)
    {
        let distX = this.x - ball.x;
        let distY = this.y - ball.y;
        let distance = Math.sqrt(distX * distX + distY * distY);
        if (distance <= this.radius + ball.radius)
        {
            play_audio(this.ball_item_up_sound);
            lives += 1;
            if (ball.hp < config.BALL_HP)
            {
                ball.hp = config.BALL_HP;
                ball.falling = false;
            }
            this.type = "for_delete";
        }
    }
}

class InvisibilityBonus extends Bonus
{
    constructor(context, type, x, y)
    {
        super(context, type, x, y)
        this.ball_item_up_sound = "/static/sound/getpow.wav";
        this.paddle_item_up_sound = "/static/sound/itemup.wav";

        this.animation1 = new Image();
        this.animation1.src = "/static/images/invisibility1.png";
        this.animation2 = new Image();
        this.animation2.src = "/static/images/invisibility2.png";
        this.animation3 = new Image();
        this.animation3.src = "/static/images/invisibility3.png";
        this.animation4 = new Image();
        this.animation4.src = "/static/images/invisibility4.png";

        this.duration = 500;
        this.score = 50;
    }

    paddleCollision(paddle)
    {
       if ((this.y + this.radius > paddle.y) && (this.y - this.radius < paddle.y + paddle.height)
             && (this.x + this.radius > paddle.x) && (this.x - this.radius < paddle.x + paddle.width))
       {
            this.was_paddle_collision = true;
            play_audio(this.paddle_item_up_sound);
            paddle.invisibility_duration += this.duration;
            game_score += this.score;
            this.type = "for_delete";
       }
    }

    ballCollision(ball)
    {
        let distX = this.x - ball.x;
        let distY = this.y - ball.y;
        let distance = Math.sqrt(distX * distX + distY * distY);
        if (distance <= this.radius + ball.radius)
        {
            this.was_ball_collision = true;
            play_audio(this.ball_item_up_sound);
            ball.invisibility_duration += this.duration;
            game_score += this.score * 2;
            this.type = "for_delete";
        }
    }

    create_score_obj(score_list)
    {
        if (this.was_paddle_collision)
        {
            score_list.push(new Score_obj(this.context, this.score, this.x, this.y));
        }
        if (this.was_ball_collision)
        {
            score_list.push(new Score_obj(this.context, this.score * 2, this.x, this.y));
        }
    }
}

class MegaBonus extends Bonus
{
    constructor(context, type, x, y)
    {
        super(context, type, x, y)
        this.ball_item_up_sound = "/static/sound/getpow.wav";
        this.paddle_item_up_sound = "/static/sound/itemup.wav";

        this.animation1 = new Image();
        this.animation1.src = "/static/images/mega1.png";
        this.animation2 = new Image();
        this.animation2.src = "/static/images/mega2.png";
        this.animation3 = new Image();
        this.animation3.src = "/static/images/mega3.png";
        this.animation4 = new Image();
        this.animation4.src = "/static/images/mega4.png";

        this.duration = 500;
    }

    paddleCollision(paddle)
    {
       if ((this.y + this.radius > paddle.y) && (this.y - this.radius < paddle.y + paddle.height)
             && (this.x + this.radius > paddle.x) && (this.x - this.radius < paddle.x + paddle.width))
       {
            play_audio(this.paddle_item_up_sound);
            paddle.mega_duration += this.duration;
            if (!paddle.mega_activated)
            {
                paddle.mega_activated = true;
                paddle.change_size(100, 20);
            }
            this.type = "for_delete";
       }
    }

    ballCollision(ball)
    {
        let distX = this.x - ball.x;
        let distY = this.y - ball.y;
        let distance = Math.sqrt(distX * distX + distY * distY);
        if (distance <= this.radius + ball.radius)
        {
            play_audio(this.ball_item_up_sound);
            ball.mega_duration += this.duration;
            if (!ball.mega_activated)
            {
                ball.mega_activated = true;
                ball.change_size();
            }
            this.type = "for_delete";
        }
    }
}

class SpeedBonus extends Bonus
{
    constructor(context, type, x, y)
    {
        super(context, type, x, y)
        this.ball_item_up_sound = "/static/sound/getpow.wav";
        this.paddle_item_up_sound = "/static/sound/itemup.wav";

        this.animation1 = new Image();
        this.animation1.src = "/static/images/speed1.png";
        this.animation2 = new Image();
        this.animation2.src = "/static/images/speed2.png";
        this.animation3 = new Image();
        this.animation3.src = "/static/images/speed3.png";
        this.animation4 = new Image();
        this.animation4.src = "/static/images/speed4.png";

        this.duration = 200;
        this.score = 25;

    }

    paddleCollision(paddle)
    {
       if ((this.y + this.radius > paddle.y) && (this.y - this.radius < paddle.y + paddle.height)
             && (this.x + this.radius > paddle.x) && (this.x - this.radius < paddle.x + paddle.width))
       {
            this.was_paddle_collision = true;
            play_audio(this.paddle_item_up_sound);
            paddle.speed_duration += this.duration;
            game_score += this.score;
            this.type = "for_delete";
       }
    }

    ballCollision(ball)
    {
        let distX = this.x - ball.x;
        let distY = this.y - ball.y;
        let distance = Math.sqrt(distX * distX + distY * distY);
        if (distance <= this.radius + ball.radius)
        {
            this.was_ball_collision = true;
            play_audio(this.ball_item_up_sound);
            ball.speed_duration += this.duration;
            game_score += this.score * 2;
            this.type = "for_delete";
        }
    }

    create_score_obj(score_list)
    {
        if (this.was_paddle_collision)
        {
            score_list.push(new Score_obj(this.context, this.score, this.x, this.y));
        }
        if (this.was_ball_collision)
        {
            score_list.push(new Score_obj(this.context, this.score * 2, this.x, this.y));
        }
    }
}

class InvulnerabilityBonus extends Bonus
{
    constructor(context, type, x, y)
    {
        super(context, type, x, y)
        this.ball_item_up_sound = "/static/sound/getpow.wav";
        this.paddle_item_up_sound = "/static/sound/itemup.wav";

        this.animation1 = new Image();
        this.animation1.src = "/static/images/invulnerability1.png";
        this.animation2 = new Image();
        this.animation2.src = "/static/images/invulnerability2.png";
        this.animation3 = new Image();
        this.animation3.src = "/static/images/invulnerability3.png";
        this.animation4 = new Image();
        this.animation4.src = "/static/images/invulnerability4.png";

        this.duration = 1000;
        this.score = 100;
    }

    paddleCollision(paddle)
    {
       if ((this.y + this.radius > paddle.y) && (this.y - this.radius < paddle.y + paddle.height)
             && (this.x + this.radius > paddle.x) && (this.x - this.radius < paddle.x + paddle.width))
       {
            this.was_paddle_collision = true;
            play_audio(this.paddle_item_up_sound);
            game_score += this.score;
            this.type = "for_delete";
       }
    }

    ballCollision(ball)
    {
        let distX = this.x - ball.x;
        let distY = this.y - ball.y;
        let distance = Math.sqrt(distX * distX + distY * distY);
        if (distance <= this.radius + ball.radius)
        {
            this.was_ball_collision = true;
            play_audio(this.ball_item_up_sound);
            ball.invulnerability_duration += this.duration;
            this.type = "for_delete";
        }
    }

    create_score_obj(score_list)
    {
        if (this.was_paddle_collision)
        {
            score_list.push(new Score_obj(this.context, this.score, this.x, this.y));
        }
    }
}

class HpBonus extends Bonus
{
    constructor(context, type, x, y)
    {
        super(context, type, x, y)
        this.radius = 18;
        this.ball_item_up_sound = "/static/sound/getpow.wav";
        this.paddle_item_up_sound = "/static/sound/itemup.wav";

        this.animation1 = new Image();
        this.animation1.src = "/static/images/hp1.png";
        this.animation2 = new Image();
        this.animation2.src = "/static/images/hp2.png";
        this.animation3 = new Image();
        this.animation3.src = "/static/images/hp3.png";
        this.animation4 = new Image();
        this.animation4.src = "/static/images/hp4.png";
    }

    paddleCollision(paddle)
    {
       if ((this.y + this.radius > paddle.y) && (this.y - this.radius < paddle.y + paddle.height)
             && (this.x + this.radius > paddle.x) && (this.x - this.radius < paddle.x + paddle.width))
       {
            this.was_paddle_collision = true;
            play_audio(this.paddle_item_up_sound);
            ball.hp += 1;
            this.type = "for_delete";
       }
    }

    ballCollision(ball)
    {
        let distX = this.x - ball.x;
        let distY = this.y - ball.y;
        let distance = Math.sqrt(distX * distX + distY * distY);
        if (distance <= this.radius + ball.radius)
        {
            this.was_ball_collision = true;
            play_audio(this.ball_item_up_sound);
            ball.hp += 2;
            ball.falling = false;
            this.type = "for_delete";
        }
    }
}

class Barrel
{
    constructor(context, type, x, y)
    {
        this.context = context;
        this.width = 23;
        this.height = 33;
        this.x = x + config.BRICK_WIDTH / 2 - this.width / 2;
        this.y = y - this.height;
        this.frame_count = 0;
        this.onBrick = true;
        this.onPaddle = false;
        this.explode = false;
        this.type = type;
        this.speed = [0, 0];
        this.score = 50;

        this.image = new Image();
        this.image.src = "/static/images/barrel.png";
        this.animation1 = new Image();
        this.animation1.src = "/static/images/barrel_explosion1.png";
        this.animation2 = new Image();
        this.animation2.src = "/static/images/barrel_explosion2.png";
        this.animation3 = new Image();
        this.animation3.src = "/static/images/barrel_explosion3.png";

        this.explode_sound = "/static/sound/barrel.wav";
    }

    draw()
    {
        if (this.explode && this.frame_count <= 15)
        {
            this.frame_count++;
        }

        if (this.explode && this.frame_count > 15)
        {
            this.type = "for_delete";
        }

        if (this.frame_count == 0)
        {
            context.drawImage(this.image, this.x, this.y);
            return;
        }

        if (this.frame_count <= 5)
        {
            let width_diff = (this.width - this.animation1.width) / 2;
            let height_diff = this.height - this.animation1.height;
            context.drawImage(this.animation1, this.x + width_diff, this.y + height_diff);
            return;
        }
        if (this.frame_count <= 10)
        {
            let width_diff = (this.width - this.animation2.width) / 2;
            let height_diff = this.height - this.animation2.height;
            context.drawImage(this.animation2, this.x + width_diff, this.y + height_diff);
            return;
        }
        if (this.frame_count <= 15)
        {
            let width_diff = (this.width - this.animation3.width) / 2;
            let height_diff = this.height - this.animation3.height;
            context.drawImage(this.animation3, this.x + width_diff, this.y + height_diff);
            return;
        }
    }

    move()
    {
        if (!this.onBrick && !this.onPaddle)
        {
            this.y += this.speed[1];
            this.speed[1] += config.FALLING_SPEED;
        }

        if (this.y + this.height > config.CANVAS_HEIGHT)
        {
            if (!this.explode)
            {
                play_audio(this.explode_sound);
            }
            this.speed = [0, 0];
            this.explode = true;
        }
        if (this.onPaddle)
        {
            this.y = paddle.y - this.height;
            this.x += paddle.speed[0];
        }
    }

    brickCollision(bricks)
    {
        this.onBrick = false;
        for (let i = 0; i < bricks.length; i++)
        {
            let brick = bricks[i];
            if ((this.y + this.height > brick.y) && (this.y < brick.y + brick.height)
             && (this.x + this.width > brick.x) && (this.x < brick.x + brick.width) && (this.y < brick.y))
            {
                this.onBrick = true;
                this.speed[1] = 0;
            }
        }
    }

    ballCollision()
    {
       if ((!this.dead) && (!ball.fall) && (ball.y + ball.radius > this.y) && (ball.y - ball.radius < this.y + this.height)
       && (ball.x + ball.radius > this.x) && (ball.x - ball.radius < this.x + this.width) && !this.explode)
       {
        play_audio(this.explode_sound);
        this.explode = true;
        ball.speed[0] = - ball.speed[0];
        ball.speed[1] = - ball.speed[1];

        if (ball.x < this.x)
        {
            ball.side_acceleration -= 10;
        }
        else
        {
            ball.side_acceleration += 10;
        }
        if (ball.hp > 0 && ball.invulnerability_duration == 0)
        {
            ball.hp -= 1;
        }
        if (ball.hp == 0)
        {
            ball.falling = true;
        }
       }
    }

    paddleCollision()
    {
        if ((this.y + this.height > paddle.y) && (this.y < paddle.y + paddle.height)
             && (this.x + this.width > paddle.x) && (this.x < paddle.x + paddle.width))
            {
                this.onPaddle = true;
                this.speed[1] = 0;
            }
        if ((this.x + this.width < paddle.x) || (this.x > paddle.x + paddle.width))
            {
                this.onPaddle = false;
            }
    }

    create_score_obj()
    {
        if (this.y + this.height > config.CANVAS_HEIGHT)
        {
            score_list.push(new Score_obj(this.context, this.score, this.x, this.y));
        }
    }
}

class Doomguy
{
    constructor(context, x, y)
    {
        this.context = context;
        this.x = x + 30;
        this.height = 40;
        this.width = 30;
        this.y = y - this.height;
        this.frame_count = Math.floor(Math.random() * (120));
        this.onBrick = true;
        this.dead = false;
        this.shooting = false;
        this.speed = [0, 0];
        this.score = 100;

        this.animation1 = new Image();
        this.animation1.src = "/static/images/doomguy1.png";
        this.animation2 = new Image();
        this.animation2.src = "/static/images/doomguy2.png";
        this.animation3 = new Image();
        this.animation3.src = "/static/images/doomguy3.png";
        this.animation4 = new Image();
        this.animation4.src = "/static/images/doomguy4.png";

        this.fire_left_1 = new Image();
        this.fire_left_1.src = "/static/images/doomguy_fire_left1.png";
        this.fire_left_2 = new Image();
        this.fire_left_2.src = "/static/images/doomguy_fire_left2.png";
        this.fire_right_1 = new Image();
        this.fire_right_1.src = "/static/images/doomguy_fire_right1.png";
        this.fire_right_2 = new Image();
        this.fire_right_2.src = "/static/images/doomguy_fire_right2.png";

        this.death1 = new Image();
        this.death1.src = "/static/images/doomguy_death1.png";
        this.death2 = new Image();
        this.death2.src = "/static/images/doomguy_death2.png";
        this.death3 = new Image();
        this.death3.src = "/static/images/doomguy_death3.png";
        this.death4 = new Image();
        this.death4.src = "/static/images/doomguy_death4.png";
        this.death5 = new Image();
        this.death5.src = "/static/images/doomguy_death5.png";
        this.death6 = new Image();
        this.death6.src = "/static/images/doomguy_death6.png";

        this.fire = "/static/sound/fire.wav";
        this.death_sound_1 = "/static/sound/doomguy_death1.wav";
        this.death_sound_2 = "/static/sound/doomguy_death2.wav";
    }

    draw()
    {
        if (!this.shooting && !this.dead && this.frame_count <= 120)
        {
            this.frame_count++;
        }
        if(!this.shooting && !this.dead && this.frame_count > 120)
        {
            this.frame_count = 0;
        }

        if (this.dead && this.frame_count < 60)
        {
            this.frame_count++;
        }

        if (this.shooting && this.frame_count <= 120)
        {
            this.frame_count++;
        }
        if (this.shooting && this.frame_count > 120)
        {
            this.shooting = false;
            this.frame_count = 0;
        }

        if (!this.dead && this.shooting && this.frame_count <= 10)
        {
            if (this.x < ball.x)
            {
                this.context.drawImage(this.fire_right_1, this.x, this.y);
                return;
            }
            if (this.x > ball.x)
            {
                this.context.drawImage(this.fire_left_1, this.x, this.y);
                return;
            }
        }
        if (!this.dead && this.shooting && this.frame_count <= 40)
        {
            if (this.x < ball.x)
            {
                this.context.drawImage(this.fire_right_2, this.x, this.y);
                return;
            }
            if (this.x > ball.x)
            {
                this.context.drawImage(this.fire_left_2, this.x, this.y);
                return;
            }
        }
        if (!this.dead && this.shooting && this.frame_count <= 120)
        {
            if (this.x < ball.x)
            {
                this.context.drawImage(this.fire_right_1, this.x, this.y);
                return;
            }
            if (this.x > ball.x)
            {
                this.context.drawImage(this.fire_left_1, this.x, this.y);
                return;
            }
        }

        if (!this.dead && this.frame_count <= 30)
        {
            this.context.drawImage(this.animation1, this.x, this.y);
            return;
        }
        if (!this.dead && this.frame_count <= 60)
        {
            this.context.drawImage(this.animation2, this.x, this.y);
            return;
        }
        if (!this.dead && this.frame_count <= 90)
        {
            this.context.drawImage(this.animation3, this.x, this.y);
            return;
        }
        if (!this.dead && this.frame_count <= 120)
        {
            this.context.drawImage(this.animation2, this.x, this.y);
            return;
        }

        if (this.dead && this.frame_count <= 10)
        {
            let height_diff = this.height - this.death1.height;
            this.context.drawImage(this.death1, this.x, this.y + height_diff);
            return;
        }
        if (this.dead && this.frame_count <= 20)
        {
            let height_diff = this.height - this.death2.height;
            this.context.drawImage(this.death2, this.x, this.y + height_diff);
            return;
        }
        if (this.dead && this.frame_count <= 30)
        {
            let height_diff = this.height - this.death3.height;
            this.context.drawImage(this.death3, this.x, this.y + height_diff);
            return;
        }
        if (this.dead && this.frame_count <= 40)
        {
            let height_diff = this.height - this.death4.height;
            this.context.drawImage(this.death4, this.x, this.y + height_diff);
            return;
        }
        if (this.dead && this.frame_count <= 50)
        {
            let height_diff = this.height - this.death5.height;
            this.context.drawImage(this.death5, this.x, this.y + height_diff);
            return;
        }
        if (this.dead && this.frame_count <= 60)
        {
            let height_diff = this.height - this.death6.height;
            this.context.drawImage(this.death6, this.x, this.y + height_diff);
            return;
        }
    }

    move()
    {
        if (!this.onBrick)
        {
            this.y += this.speed[1];
            this.speed[1] += config.FALLING_SPEED;
        }

        if(this.x > 0 && this.x + this.width < config.CANVAS_WIDTH)
            {
                this.x += this.speed[0];
            }

        if (this.y + this.height > config.CANVAS_HEIGHT)
        {
            this.speed = [0, 0];
            if (!this.dead)
            {
                this.frame_count = 0;
                this.dead = true;
                play_audio(this.death_sound_2);
                game_score += this.score;
                score_list.push(new Score_obj(this.context, this.score, this.x + this.width / 2, this.y + this.height / 2));
            }
        }
    }

    friction()
    {
        let shift = config.FRICTION

        if (this.speed[0] > shift)
        {
            this.speed[0] -= shift;
        }
        if (this.speed[0] < -shift)
        {
            this.speed[0] += shift;
        }
        if (this.speed[0] < shift && this.speed[0] > -shift)
        {
            this.speed[0] = 0;
        }
    }

    brickCollision(bricks)
    {
        this.onBrick = false;
        for (let i = 0; i < bricks.length; i++)
        {
            let brick = bricks[i];
            if ((this.y + this.height > brick.y) && (this.y < brick.y + brick.height)
             && (this.x - this.width / 2 > brick.x) && (this.x + this.width / 2 < brick.x + brick.width)
             && (this.y + this.height - 5 <= brick.y))
            {
                this.onBrick = true;
                this.speed[1] = 0;
            }
        }
    }

    ballCollision()
    {
       if ((!this.dead) && (!ball.fall) && (ball.y + ball.radius > this.y) && (ball.y - ball.radius < this.y + this.height)
       && (ball.x + ball.radius > this.x) && (ball.x - ball.radius < this.x + this.width))
       {
            this.frame_count = 0;
            this.dead = true;
            play_audio(this.death_sound_1);
            play_audio(ball.attack_sound);
            if (this.x < ball.x)
            {
                this.speed[0] = -3;
            }
            else
            {
                this.speed[0] = 3;
            }
            ball.animation = true;
            game_score += this.score * 2;
            score_list.push(new Score_obj(this.context, this.score * 2, this.x + this.width / 2, this.y + this.height / 2));
       }
    }

    checkForShooting()
    {
        if (this.onBrick && !this.dead)
        {
            let distX = this.x - ball.x;
            let distY = this.y - ball.y;
            let distance = Math.sqrt(distX * distX + distY * distY);
            if ((distance <= ball.radius + 100) && (this.y < ball.y + 10) && (this.y + this.height > ball.y + ball.radius - 10))
            {
                if (!this.shooting && ball.invisibility_duration == 0)
                {
                    this.shooting = true;
                    ball.injured = true;
                    play_audio(this.fire);
                    play_audio(ball.injured_sound);
                    this.frame_count = 0;
                    if (this.x < ball.x)
                    {
                        if (ball.mega_activated)
                        {
                            ball.side_acceleration += 2;
                        }
                        else
                        {
                            ball.side_acceleration += 10;
                        }
                    }
                    else
                    {
                        if (ball.mega_activated)
                        {
                            ball.side_acceleration -= 2;
                        }
                        else
                        {
                            ball.side_acceleration -= 10;
                        }
                    }
                    if (ball.hp > 0 && ball.invulnerability_duration == 0)
                    {
                        ball.hp -= 1;
                    }
                    if (ball.hp == 0)
                    {
                        ball.falling = true;
                    }
                }
            }
        }
    }
}

class Torch
{
    constructor(context, x, y)
    {
        this.context = context;
        this.x = x;
        this.width = 26;
        this.height = 96;
        this.y = y - this.height;
        this.frame_count = Math.floor(Math.random() * 41);

        this.animation1 = new Image();
        this.animation1.src = "/static/images/torch1.png";
        this.animation2 = new Image();
        this.animation2.src = "/static/images/torch2.png";
        this.animation3 = new Image();
        this.animation3.src = "/static/images/torch3.png";
        this.animation4 = new Image();
        this.animation4.src = "/static/images/torch4.png";
    }

    draw()
    {
       if (this.frame_count < 40)
        {
            this.frame_count ++;
        }
        else
        {
            this.frame_count = 0;
        }
        if (this.frame_count <= 10)
        {
            this.context.drawImage(this.animation1, this.x, this.y);
            return;
        }

        if (this.frame_count <= 20)
        {
            this.context.drawImage(this.animation2, this.x, this.y);
            return;
        }

        if (this.frame_count <= 30)
        {
            this.context.drawImage(this.animation3, this.x, this.y);
            return;
        }

        if (this.frame_count <= 40)
        {
            this.context.drawImage(this.animation4, this.x, this.y);
            return;
        }
    }
}

class Debris
{
    constructor(context, image_src, x, y)
    {
        this.context = context;
        this.x = [x, x, x, x];
        this.y = [y, y, y, y];
        this.width = config.BRICK_WIDTH;
        this.height = config.BRICK_HEIGHT;
        this.image = new Image();
        this.image.src = image_src;
        this.degrees = [0, 0, 0, 0];
        this.speed_x = [0, 0, 0, 0];
        this.speed_y = [0, 0, 0, 0];

        this.clip_line1_1 = [Math.floor(Math.random() * this.width) - this.width / 2, -this.height / 2];
        this.clip_line1_2 = [Math.floor(Math.random() * this.width) - this.width / 2, this.height / 2];
        this.clip_line2_1 = [-this.width / 2, Math.floor(Math.random() * this.height) - this.height / 2];
        this.clip_line2_2 = [this.width / 2, Math.floor(Math.random() * this.height) - this.height / 2];
        this.intersection = this.findIntersectionPoint(this.clip_line1_1[0], this.clip_line1_2[0], this.clip_line1_1[1], this.clip_line1_2[1],
        this.clip_line2_1[0], this.clip_line2_2[0], this.clip_line2_1[1], this.clip_line2_1[1]);
    }

    draw()
    {
        this.context.strokeStyle = "black";
        this.context.lineWidth = 3;

        for(let i = 0; i < 4; i++)
        {
            this.context.save();
            this.context.translate(this.x[i] + this.width / 2, this.y[i] + this.height / 2);
            this.context.rotate(this.degrees[i] * Math.PI / 180);
            this.create_shard(i);
            this.context.drawImage(this.image, -this.width / 2, -this.height / 2);
            this.context.closePath();
            this.draw_crack(i);
            this.context.restore();
            if (i <= 1)
            {
                this.degrees[i] = (this.degrees[i] + Math.random() * 3) % 360;
                this.x[i] -= this.speed_x[i] + Math.random() * 1.5;
            }
            else
            {
                this.degrees[i] = (this.degrees[i] - Math.random() * 3) % 360;
                this.x[i] += this.speed_x[i] + Math.random() * 1.5;
            }
            this.y[i] += this.speed_y[i];
            this.speed_y[i] += config.FALLING_SPEED + Math.random() / 5;
        }
    }

    create_shard(i)
    {
        if (i == 0)
        {
            this.context.beginPath();
            this.context.moveTo(-this.width / 2, this.height / 2);
            this.context.lineTo(this.intersection[0], this.intersection[1]);
            this.context.lineTo(this.width / 2, this.height / 2);
            this.context.clip();
        }
        if (i == 1)
        {
            this.context.beginPath();
            this.context.moveTo(-this.width / 2, this.height / 2);
            this.context.lineTo(this.intersection[0], this.intersection[1]);
            this.context.lineTo(-this.width / 2, -this.height / 2);
            this.context.clip();
        }
        if (i == 2)
        {
            this.context.beginPath();
            this.context.moveTo(this.width / 2, -this.height / 2);
            this.context.lineTo(this.intersection[0], this.intersection[1]);
            this.context.lineTo(this.width / 2, this.height / 2);
            this.context.clip();
        }
        if (i == 3)
        {
            this.context.beginPath();
            this.context.moveTo(-this.width / 2, -this.height / 2);
            this.context.lineTo(this.intersection[0], this.intersection[1]);
            this.context.lineTo(this.width / 2, -this.height / 2);
            this.context.clip();
        }
    }

    draw_crack(i)
    {
        if (i == 0)
        {
            this.context.beginPath();
            this.context.moveTo(-this.width / 2, this.height / 2);
            this.context.lineTo(this.intersection[0], this.intersection[1]);
            this.context.lineTo(this.width / 2, this.height / 2);
            this.context.closePath();
            this.context.stroke();
        }
        if (i == 1)
        {
            this.context.beginPath();
            this.context.moveTo(-this.width / 2, this.height / 2);
            this.context.lineTo(this.intersection[0], this.intersection[1]);
            this.context.lineTo(-this.width / 2, -this.height / 2);
            this.context.closePath();
            this.context.stroke();
        }
        if (i == 2)
        {
            this.context.beginPath();
            this.context.moveTo(this.width / 2, -this.height / 2);
            this.context.lineTo(this.intersection[0], this.intersection[1]);
            this.context.lineTo(this.width / 2, this.height / 2);
            this.context.closePath();
            this.context.stroke();
        }
        if (i == 3)
        {
            this.context.beginPath();
            this.context.moveTo(-this.width / 2, -this.height / 2);
            this.context.lineTo(this.intersection[0], this.intersection[1]);
            this.context.lineTo(this.width / 2, -this.height / 2);
            this.context.closePath();
            this.context.stroke();
        }
    }

    findIntersectionPoint(X11, X12, Y11, Y12, X21, X22, Y21, Y22)
    {
        let a1 = Y11 - Y12;
        let b1 = X12 - X11;
        let a2 = Y21 - Y22;
        let b2 = X22 - X21;

        let d = a1 * b2 - a2 * b1;


        let c1 = Y12 * X11 - X12 * Y11;
        let c2 = Y22 * X21 - X22 * Y21;

        let xi = (b1 * c2 - b2 * c1) / d;
        let yi = (a2 * c1 - a1 * c2) / d;
        return [xi, yi];
    }
}

class Score_obj
{
    constructor(context, score, x, y)
    {
        this.context = context;
        this.score = score;
        this.x = x;
        this.y = y;
        this.font = "24px roboto";
        this.opacity = 1;
        this.status = "exist"
    }

    draw()
    {
        this.context.textAlign = "center";
        this.context.fillStyle = "#000000";
        this.context.font = this.font;
        this.context.globalAlpha = this.opacity;
        this.context.fillText(this.score, this.x, this.y);
        this.context.globalAlpha = 1;
        this.opacity -= 0.05;
        if (this.opacity <= 0)
        {
            this.status = "for_delete";
        }
    }

    move()
    {
        this.y -= 1;
    }
}

class Message
{
    constructor(context, text)
    {
        this.context = context;
        this.font = "36px roboto";
        this.opacity = 1;
        this.text = text;
        this.status = "exist"
    }

    draw()
    {
        this.context.textAlign = "center";
        this.context.fillStyle = "#000000";
        this.context.font = this.font;
        this.context.globalAlpha = this.opacity;
        this.context.fillText(this.text, config.CANVAS_WIDTH / 2, config.CANVAS_HEIGHT / 2);
        this.context.globalAlpha = 1;
        this.opacity -= 0.002;
        if (this.opacity <= 0)
        {
            this.status = "for_delete";
        }
    }
}

function play_audio(path)
{
    if (!muted)
    {
        audio = new Audio(path);
        audio.play();
    }
}




