// (The MIT License)

// Copyright (c) 2012 Richard S Allinson <rsa@mountainmansoftware.com>

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// 'Software'), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

"use strict";

/*
    Load required modules.
*/

var utils = require("./utils"),
    libpath = require("path"),
    libfs = require("fs"),
    mkdirp = require("mkdirp"),
    request = require("../test/support/http");

/*
    Request the "relPath" from the "server" and write it to "targetDir"
*/

exports.writeFile = function (server, targetDir, relPath, callback) {

    var abspath;

    request(server)
    .request("get", relPath.slice(1))
    .end(function (res) {
        abspath = libpath.join(targetDir, relPath);
        mkdirp(libpath.resolve(abspath, ".."), function () {
            libfs.writeFile(abspath, res.body, callback);
        });
    });
};

exports.emptyFileList = function (server, targetDir, files, callback) {

    var self = this;

    if (files.length <= 0) {
        callback();
        return;
    }

    this.writeFile(server, targetDir, files.shift().relpath, function () {
        self.emptyFileList(server, targetDir, files, callback);
    });
};

/*
    Output all the files from the application into the target directory.
*/

exports.generateApp = function (server, targetDir) {

    var files;

    files = utils.getFileListSync(server.staticPaths);

    files.push({
        relpath: "./index.html"
    });

    this.emptyFileList(server, targetDir, files, function () {
        process.exit(0);
    });
};
