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

var confdir = require("confdir"),
    path = require("path"),
    utils = require("../utils");

/*
    Returns the loaded middleware.
*/

exports.load = function (root, wrapper) {

    /*
        Return a connect function handler that converts a
        directory of yml, yaml and json files into a single JS object.
    */

    return function (req, res, next) {

        /*
            Holds the final configuration.
        */

        var fullPath,
            name,
            config;

        /*
            If the request is not for a confs.js file return.
        */

        if (/\/confs\.js$/.test(req.url) === false) {
            next();
            return;
        }

        /*
            Get the path to the config directory.
        */

        fullPath = path.join(root, req.url.slice(0, -3));

        /*
            get the name of the wouldbe configuration module.
        */

        name = utils.getModuleNameFromPath(fullPath, root);

        /*
            Get all the configs as strings on an object.
        */

        try {
            config = confdir.read(fullPath);
        } catch (err) {
            next();
            return;
        }

        /*
            Set the Content-Type returned to JS.
        */

        res.setHeader("Content-Type", "application/javascript");

        /*
            Write the output as a define statement (to be changed to a handler).
        */

        res.end(wrapper.module(name, config));
    };
};