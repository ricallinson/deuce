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

var dive = require("diveSync"),
    path = require("path");

/*
    Functions to handle files.
*/

exports.handlers = {};

/*
    If we have a "confs" directory then add it as a js file.
*/

exports.handlers.confs = function (fullpath) {
    return {
        abspath: fullpath,
        type: "confs"
    };
};

/*
    If we have a "confs" directory then add it as a js file.
*/

exports.handlers.tmpls = function (fullpath) {
    return {
        abspath: fullpath,
        type: "tmpls"
    };
};

/*
    If there was nothing to do just add the file.
*/

exports.handlers.standard = function (fullpath) {
    return {
        abspath: fullpath,
        type: path.extname(fullpath)
    };
};

/*
    Returns an array of objects representing every file.
*/

exports.getFileListSync = function (fullPath) {

    var list = [];

    dive(fullPath, {recursive: true}, function (err, file) {

        var basename;

        if (err) {
            throw new Error(err);
        }

        basename = path.basename(path.resolve(file, ".."));

        if (typeof exports.handlers[basename] === "function") {
            list.push(exports.handlers[basename](file));
        } else {
            list.push(exports.handlers.standard(file));
        }

    });

    return list;
};

/*
    Returns a Module name from the given path.
*/

exports.getModuleNameFromPath = function (fullPath, root) {
    return exports.getRelativePath(fullPath.replace(path.extname(fullPath), ""), root).slice(2);
};

/*
    Returns a relative path to the web app root from an absolute path.
*/

exports.getRelativePath = function (fullPath, root) {
    return "." + fullPath.slice(root.length);
};