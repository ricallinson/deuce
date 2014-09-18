"use strict";

var divelib = require("diveSync"),
    pathlib = require("path"),
    fslib = require("fs"),
    mkdirp = require("mkdirp"),
    request = require("supertest");

exports.writeFile = function (app, url, dest, callback) {
    request(app).get('/' + url).end(function (err, res) {
        console.log(res);
        if (url.indexOf("")) {

        }
        var abspath = pathlib.join(dest, url);
        mkdirp(pathlib.resolve(abspath, ".."), function () {
            fslib.writeFile(abspath, res.text, callback);
        });
    });
};

exports.generteFiles = function (app, urls, dest, callback) {
    var self = this;
    if (urls.length <= 0) {
        callback();
        return;
    }
    this.writeFile(app, urls.shift(), dest, function () {
        self.generteFiles(app, urls, dest, callback);
    });
};

exports.getFiles = function (fullpath) {
    var list = [];
    divelib(fullpath, {recursive: true}, function (err, file) {
        if (err) {
            throw new Error(err);
        }
        list.push(pathlib.relative(fullpath, file));
    });
    return list;
};

exports.build = function (app, source, dest) {
    var urls = this.getFiles(source);
    urls.push('require.js');
    this.generteFiles(app, urls, dest, function () {
        process.exit(0);
    });
};
