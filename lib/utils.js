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

var path = require("path"),
    fs = require("fs");

/*
    Returns an array of objects representing every file.

    Note: This function's cyclomatic complexity is too high! Need to refactor.

    There is a bug in here!
*/

exports.getFileListSync = function (fullPath, root, list) {

    var files,
        name,
        absPath,
        builtPath;

    /*
        If there was no list provided make it an array.
    */

    if (!list) {
        list = [];
    }

    /*
        If there was no "root" provided use the "fullPath".
    */

    if (!root) {
        root = fullPath;
    }

    /*
        Read the given directory into an array.
    */

    files = fs.readdirSync(fullPath);

    /*
        Iterate over the array to check each path.
    */

    for (name in files) {

        /*
            Create the absolute path to the file or directory.
        */

        absPath = path.join(fullPath, files[name]);

        /*
            Check the absolute path to see if we have any special things to do.
        */

        if (files[name] === "confs") {

            /*
                If we have a "confs" directory then add it as a js file.
            */

            builtPath = {
                abspath: absPath + ".js",
                type: "confs"
            };

        } else if (files[name] === "tmpls") {

            /*
                If we have a "tmpls" directory then add it as a js file.
            */

            builtPath = {
                abspath: absPath + ".js",
                type: "tmpls"
            };

        } else if (path.basename(fullPath) === "langs") {

            /*
                If we have a "langs" directory then add each file as a js file.
            */

            builtPath = {
                abspath: absPath.replace(path.extname(absPath), ".js"),
                type: "langs"
            };

        } else if (fs.statSync(absPath).isDirectory()) {

            /*
                If the absolute path is a directory folow it.
            */

            exports.getFileListSync(absPath, root, list);

        } else {

            /*
                If there was nothing to do just add the file.
            */

            builtPath = {
                abspath: absPath,
                type: path.extname(absPath)
            };
        }

        /*
            Add the final path to the list.
        */

        list.push(builtPath);
    }

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