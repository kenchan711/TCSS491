/*******************************/
/* TCSS 491, Spring 2016       */
/* Assignment 2 - Intereaction */
/* Tin Chun Chan               */
/* 05/13/2016                  */
/*******************************/

/*****************************************************************************/

  /******************/
 /*  AssetManager  */
/******************/
function AssetManager() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = [];
    this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function (path) {
    console.log("Queueing " + path);
    this.downloadQueue.push(path);
}

AssetManager.prototype.isDone = function () {
    return this.downloadQueue.length === this.successCount + this.errorCount;
}

AssetManager.prototype.downloadAll = function (callback) {
    var that = this;

    var img = new Image();
    img.addEventListener("load", function () {
        console.log("Loaded " + this.src);
        that.successCount++;
    });
    img.addEventListener("error", function () {
        console.log("Error loading " + this.src);
        that.errorCount++;
    });

    var i = 0;
    while (!this.isDone()) {
        var path = this.downloadQueue[i];
        console.log(path);

        img.src = path;
        this.cache[path] = img;
        i++;
    }
    callback();
}

AssetManager.prototype.getAsset = function (path) {
    return this.cache[path];
}