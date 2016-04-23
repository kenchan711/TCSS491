/****************************/
/* TCSS 491, Spring 2016    */
/* Assignment 1 - Animation */
/* Tin Chun Chan            */
/* 4/22/2016                */
/****************************/

/*****************************************************************************/

  /***************/
 /*  Animation  */
/***************/
function Animation(spriteSheet, firstSpriteX, firstSpriteY,
        paddingWidth, frameWidth, frameHeight, rowFrameCount,
        frameDuration, totalFrames, loop, scale) {

    this.spriteSheet = spriteSheet;
    this.firstSpriteX = firstSpriteX;
    this.firstSpriteY = firstSpriteY;
    this.paddingWidth = paddingWidth;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.rowFrameCount = rowFrameCount;
    this.frameDuration = frameDuration;
    this.totalFrames = totalFrames;
    this.loop = loop;
    this.scale = scale;

    this.totalTime = frameDuration * totalFrames;
    this.elapsedTime = 0;
}

Animation.prototype.drawFrame = function(tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) {
            this.elapsedTime = 0;
        }
    }

    if (!this.isDone()) {
        var frame = this.currentFrame();
        var xindex = frame % this.rowFrameCount;
        var yindex = Math.floor(frame / this.rowFrameCount);

        ctx.drawImage(this.spriteSheet,
            this.firstSpriteX + xindex * (this.paddingWidth + this.frameWidth),
            this.firstSpriteY + yindex * (this.paddingWidth + this.frameWidth),
            this.frameWidth, this.frameHeight,
            x, y, this.frameWidth * this.scale, this.frameHeight * this.scale);
    }
}

Animation.prototype.isDone = function() {
    return (this.elapsedTime >= this.totalTime);
}

Animation.prototype.currentFrame = function() {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

  /****************/
 /*  Background  */
/****************/
function Background(game, spritesheet, scale) {
    this.x = 0;
    this.y = 0;
    this.game = game;
    this.ctx = game.ctx;
    this.spritesheet = spritesheet;
    this.scale = scale;
};

Background.prototype.draw = function() {
    this.ctx.drawImage(this.spritesheet, this.x, this.y,
            this.spritesheet.width * this.scale,
            this.spritesheet.height * this.scale);
};

Background.prototype.update = function() {
};

/*****************************************************************************/

  /****************/
 /*  AgumonIdle  */
/****************/
function AgumonIdle(game, spritesheet) {
    this.animation = new Animation(spritesheet, 2, 141, 2, 48, 48, 10, 0.15,
            18, true, 1.75);
    this.x = 408; // background width(1200) * scale(0.75) / 2 - agumon width(48) * scale(1.75) / 2
    this.y = 206; // "scaled background floor"(290) - agumon height(48) * scale(1.75)
    this.speed = 100;
    this.game = game;
    this.ctx = game.ctx;
}

AgumonIdle.prototype.draw = function() {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

AgumonIdle.prototype.update = function() {
}

  /****************/
 /*  AgumonWalk  */
/****************/
function AgumonWalk(game, spritesheet) {
    this.animation = new Animation(spritesheet, 502, 141, 2, 48, 48, 10, 0.15,
            16, true, 1.75);
    this.x = 0;
    this.y = game.surfaceHeight - (this.animation.frameHeight *
            this.animation.scale);
    this.speed = 50;
    this.reverse = false;

    this.game = game;
    this.ctx = game.ctx;
}

AgumonWalk.prototype.draw = function () {
    if (this.reverse) {
        this.ctx.save()
        this.ctx.scale(-1, 1);
        this.x = -this.x - this.animation.frameWidth * this.animation.scale;
    }
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    if (this.reverse) {
        this.x = -this.x - this.animation.frameWidth * this.animation.scale;
        this.ctx.restore();
    }
}

AgumonWalk.prototype.update = function () {
    if (this.x > 900 - this.animation.frameWidth * this.animation.scale) {
        this.speed = -this.speed;
        this.reverse = true;
    } else if (this.x < 0) {
        this.speed = Math.abs(this.speed);
        this.reverse = false;
    }

    if (!this.animation.isDone()) {
        this.x += this.game.clockTick * this.speed;
    }
}

  /****************/
 /*  AgumonRun   */
/****************/
function AgumonRun(game, spritesheet) {
    this.animation = new Animation(spritesheet, 502, 141, 2, 48, 48, 10,
            0.0375, 16, false, 1.75);
    this.x = 580;
    this.y = 206; // "scaled background floor"(290) - agumon height(48) * scale(1.75)
    this.speed = 150;
    this.game = game;
    this.ctx = game.ctx;
}

AgumonRun.prototype.draw = function () {
    console.log("run x: " + this.x);
    console.log(this.game.timer.gameTime);
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

AgumonRun.prototype.update = function () {
    if (!this.animation.isDone()) {
        this.x += this.game.clockTick * this.speed;
    }
}

  /****************/
 /*  AgumonStop  */
/****************/
function AgumonStop(game, spritesheet) {
    this.animation = new Animation(spritesheet, 858, 250, 2, 48, 48, 2, 0.15,
            2, false, 1.75);
    this.x = null;
    this.y = 206; // "scaled background floor"(290) - agumon height(48) * scale(1.75)
    this.speed = 50;
    this.game = game;
    this.ctx = game.ctx;
    this.lastEntity = this.game.entities[3]; // AgumonRun
}

AgumonStop.prototype.draw = function () {
    console.log("stop x: " + this.x);
    if (this.lastEntity.animation.isDone() && this.x !== null) {
        this.animation.drawFrame(this.game.clockTick, this.ctx, this.x,this.y);
    }
}

AgumonStop.prototype.update = function () {
    console.log("update stop x: " + this.x);
    if (this.lastEntity.animation.isDone() && !this.animation.isDone()) {
        if (this.x === null) {
            this.x = this.lastEntity.x;
        }
        this.x += this.game.clockTick * this.speed;
    }
}

  /****************/
 /*  AgumonJump  */
/****************/
function AgumonJump(game, spritesheet) {
    this.animation = new Animation(spritesheet, 2, 250, 2, 48, 48, 8, 0.15,
            8, false, 1.75);
    this.x = 750;
    this.y = 206; // "scaled background floor"(290) - agumon height(48) * scale(1.75)
    this.speed = 100;
    this.game = game;
    this.ctx = game.ctx;
    this.lastEntity = this.game.entities[3]; // AgumonRun
}

AgumonJump.prototype.draw = function () {
    if (this.lastEntity.animation.isDone()) {
        this.ctx.save();
        this.ctx.scale(-1, 1);
        this.animation.drawFrame(this.game.clockTick, this.ctx, -this.x -
                (this.animation.frameWidth * this.animation.scale), this.y);
        this.ctx.restore();
    }
}

AgumonJump.prototype.update = function () {
}

  /*******************/ 
 /*  AgumonStunned  */
/*******************/
function AgumonStunned(game, spritesheet) {
    this.animation = new Animation(spritesheet, 502, 713, 2, 48, 48, 5, 0.15,
            5, false, 1.75);
    this.x = null;
    this.y = 206; // "scaled background floor"(290) - agumon height(48) * scale(1.75)
    this.speed = 100;
    this.game = game;
    this.ctx = game.ctx;
    this.lastEntity = this.game.entities[4]; // AgumonStop
}

AgumonStunned.prototype.draw = function () {
    if (this.lastEntity.animation.isDone() && this.x !== null) {
        this.animation.drawFrame(this.game.clockTick, this.ctx, this.x,this.y);
    }
}

AgumonStunned.prototype.update = function () {
    if (this.lastEntity.animation.isDone() && !this.animation.isDone()) {
        if (this.x === null) {
            this.x = this.lastEntity.x;
        }
    }
}

  /*****************/
 /*  AgumonCombo  */
/*****************/
function AgumonCombo(game, spritesheet) {
    this.animation = new Animation(spritesheet, 2, 545, 2, 48, 48, 7, 0.15,
            11, false, 1.75);
    this.x = 200;
    this.y = 206; // "scaled background floor"(290) - agumon height(48) * scale(1.75)
    this.speed = 100;
    this.game = game;
    this.ctx = game.ctx;
}

AgumonCombo.prototype.draw = function() {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

AgumonCombo.prototype.update = function() {
}

  /***************/
 /*  AgumonWin  */
/***************/
function AgumonWin(game, spritesheet) {
    this.animation = new Animation(spritesheet, 502, 881, 2, 48, 48, 9, 0.15,
            9, false, 1.75);
    this.x = null;
    this.y = 206; // "scaled background floor"(290) - agumon height(48) * scale(1.75)
    this.speed = 100;
    this.game = game;
    this.ctx = game.ctx;
    this.lastEntity = this.game.entities[7]; // AgumonCombo
}

AgumonWin.prototype.draw = function () {
    if (this.lastEntity.animation.isDone() && this.x !== null) {
        this.animation.drawFrame(this.game.clockTick, this.ctx, this.x,this.y);
    }
}

AgumonWin.prototype.update = function () {
    if (this.lastEntity.animation.isDone() && !this.animation.isDone()) {
        if (this.x === null) {
            this.x = this.lastEntity.x;
        }
    }
}

/*****************************************************************************/

  /**********/
 /*  Main  */
/**********/
var AM = new AssetManager();
AM.queueDownload("./img/AnimationBackground.jpg");
AM.queueDownload("./img/Agumon.png");

AM.downloadAll(function() {
    var canvas = document.getElementById("animationWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine,
            AM.getAsset("./img/AnimationBackground.jpg"), 0.75));
    gameEngine.addEntity(new AgumonIdle(gameEngine,
            AM.getAsset("./img/Agumon.png")));
    gameEngine.addEntity(new AgumonWalk(gameEngine,
            AM.getAsset("./img/Agumon.png")));
    gameEngine.addEntity(new AgumonRun(gameEngine,
            AM.getAsset("./img/Agumon.png")));
    gameEngine.addEntity(new AgumonStop(gameEngine,
            AM.getAsset("./img/Agumon.png")));
    gameEngine.addEntity(new AgumonJump(gameEngine,
            AM.getAsset("./img/Agumon.png")));
    gameEngine.addEntity(new AgumonStunned(gameEngine,
            AM.getAsset("./img/Agumon.png")));
    gameEngine.addEntity(new AgumonCombo(gameEngine,
            AM.getAsset("./img/Agumon.png")));
    gameEngine.addEntity(new AgumonWin(gameEngine,
            AM.getAsset("./img/Agumon.png")));

    console.log("All Done!");
});