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

var yaml = require("js-yaml"),
    path = require("path"),
    fs = require("fs");

/*
    Reads the given "filePath" as either a .yml, .yaml or .json
    and returns it's contents as an object.
*/

exports.readConfigFileSync = function (filePath) {

    var ext = path.extname(filePath),
        raw,
        obj = {};

    try {

        raw = fs.readFileSync(filePath, "utf8");

        if (ext === ".yml" || ext === ".yaml") {
            obj = yaml.load(raw);
        }

        if (ext === ".json") {
            obj = JSON.parse(raw);
        }

    } catch (err) {
        console.log(err);
    }

    return obj;
};

/*
    Walks the given directory and extracts all yml, yaml and json files
    returning their content in an object.
*/

exports.readConfigDirSync = function (dir) {

    var files,
        name,
        absPath,
        ext,
        key,
        configs = {};

    /*
        Get a list of all the files in the given directory.
    */

    files = fs.readdirSync(dir);

    /*
        For each file try and read it as configuration.
    */

    for (name in files) {

        /*
            Create the absolute path to the file.
        */

        absPath = path.join(dir, files[name]);

        /*
            Get the extension from the file.
        */

        ext = path.extname(files[name]);

        /*
            If the extension is a value then try and read the configuration.
        */

        if (ext) {

            /*
                Get the name of the file to use as the key in the returned object.
            */

            key = files[name].slice(0, ext.length * -1);

            /*
                Read the configuration from the file and assign it to the key.
            */

            configs[key] = exports.readConfigFileSync(absPath);
        }
    }

    return configs;
};

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

        var configs;

        /*
            If the request is not for a config.js file return.
        */

        if (/\/confs\.js$/.test(req.url) === false) {
            next();
            return;
        }

        /*
            Get the directory path from the URL by removing the ".js"
        */

        configs = exports.readConfigDirSync(path.join(root, req.url.slice(0, -3)));

        /*
            Set the Content-Type returned to JS.
        */

        res.setHeader("Content-Type", "application/javascript");

        /*
            Write the output as a define statement (to be changed to a handler).
        */

        res.end(wrapper.module(JSON.stringify(configs, null, 4)));
    };
};