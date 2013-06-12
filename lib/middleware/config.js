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

var readConfigSync = require("../utils").readConfigSync,
    path = require("path"),
    fs = require("fs");

exports.read = function (dir) {

    var files = fs.readdirSync(dir),
        name,
        absPath,
        ext,
        configs = {};

    for (name in files) {
        if (files.hasOwnProperty(name)) {
            absPath = path.join(dir, files[name]);
            ext = path.extname(files[name]);

            if (ext) {
                files[name] = files[name].slice(0, ext.length * -1);
                configs[files[name]] = readConfigSync(absPath);
            }
        }
    }

    return configs;
};

/*
    Configure the middleware.
*/

exports.load = function (root) {

    return function (req, res, next) {

        var configs = {};

        /*
            If the request is not for a config.js file return.
        */

        if (/\/configs\.js$/.test(req.url) === false) {
            next();
            return;
        }

        // Get the directory path from the URL by removing the ".js"
        configs = exports.read(path.join(root, req.url.slice(0, -11)));

        res.setHeader("Content-Type", "application/javascript");
        res.end("define(" + JSON.stringify(configs, null, 4) + ")");
    };
};