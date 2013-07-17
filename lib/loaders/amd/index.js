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

var mustache = require("mustache"),
    path = require("path"),
    fs = require("fs");

/*
    Adds the npm "requirejs" module folder as an asset serving directory.
    This is so the "require.js" file can be served.
*/

exports.assets = function (root) {

    var modulePath;

    /*
        If there is a local "require.js" file return nothing.
    */

    if (fs.existsSync(path.join(root, "require.js"))) {
        console.log("Using the 'require.js' file found in your application root.");
        return "";
    }

    /*
        Otherwise, get the path to the installed "requirejs" module and use that.
    */

    try {

        modulePath = require.resolve("requirejs");

    } catch (err) {

        /*
            If we could not get the path then exit with instructions.
        */

        console.log("To use AMD run 'npm i requirejs' in your application root.");
        process.exit(1);
    }

    /*
        Return the path so it can be used for serving assets.
    */

    return path.resolve(modulePath, "..", "..");
};

/*
    Wraps the given data object into an AMD module.
*/

exports.module = function (name, data) {

    var template;

    /*
        Read the source file for the "module.js.hb" template
    */

    template = fs.readFileSync(path.join(__dirname, "templates", "module.js.hb"), "utf8");

    /*
        Return the rendered template.
    */

    return mustache.render(template, {name: name, data: JSON.stringify(data, null, 4)});
};

/*
    Returns an index page that uses RequireJS for AMD module loading.
*/

exports.index = function () {

    /*
        Read the source file for the index.hb.html template
    */

    var template = fs.readFileSync(path.join(__dirname, "templates", "index.html.hb"), "utf8");

    /*
        Return the transformed template.
    */

    return template;
};