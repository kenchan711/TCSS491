/*******************************/
/* TCSS 491, Spring 2016       */
/* Assignment 2 - Intereaction */
/* Tin Chun Chan               */
/* 05/13/2016                  */
/*******************************/

/*****************************************************************************/

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game, friction, isFood, acceleration) {
    this.friction = friction;
    this.isFood = isFood;
    if (isFood) {
        this.radius = 3;
        this.acceleration = 0;
        this.maxSpeed = 0;
        this.color = "White";
        this.visualRadius = 0;
    } else {
        this.radius = 7;
        this.acceleration = acceleration;
        this.maxSpeed = 1000 / this.radius;
        this.color = "Blue";
        this.visualRadius = 50;
    }
    Entity.call(this, game, this.radius + Math.random() * (650 - this.radius * 2), this.radius + Math.random() * (650 - this.radius * 2));

    this.velocity = {
        x: Math.random() * 1000,
        y: Math.random() * 1000
    };

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
}
Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > 650;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 650;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
    //  console.log(this.velocity);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * this.friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 650 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * this.friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 650 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * this.friction;
            this.velocity.y = ent.velocity.y * this.friction;
            ent.velocity.x = temp.x * this.friction;
            ent.velocity.y = temp.y * this.friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;

            if (ent.isFood || this.radius / ent.radius > 1.3) {
                ent.removeFromWorld = true;
                this.radius *= 1.1;
                this.visualRadius *= 1.1;
                this.maxSpeed = 1000 / this.radius;
            }
        }

        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            //chase
            if ((ent.isFood || this.radius / ent.radius > 1.3) && dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * this.acceleration / (dist * dist);
                this.velocity.y += difY * this.acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > this.maxSpeed) {
                    var ratio = this.maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            //dodge
            if ((this.isFood || ent.radius / this.radius > 1.3) && dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * this.acceleration / (dist * dist);
                this.velocity.y -= difY * this.acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > this.maxSpeed) {
                    var ratio = this.maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                } 
            }
        }
    }

    this.velocity.x -= (1 - this.friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - this.friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
};

  /**********/
 /*  Main  */
/**********/
var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById("interactionWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    for (var i = 0; i < 100; i++) {
        gameEngine.addEntity(new Circle(gameEngine, 1, true, 1000000));

    }
    for (var i = 0; i < 25; i++) {
        gameEngine.addEntity(new Circle(gameEngine, 1, false, 1000000));
    }
    gameEngine.init(ctx);
    gameEngine.start();
}); 
