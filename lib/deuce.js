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

var connect = require("connect"),
    confs = require("./middleware/confs"),
    tmpls = require("./middleware/tmpls");

/*
    Create a deuce server.
*/

exports.createServer = function (root, loaderType) {

    var app,
        loader;

    /*
        Create the connect app.
    */

    app = connect();

    /*
        Load the loader module to use.
    */

    loader = require("./loaders/" + loaderType);

    /*
        Add an attribute to store static root paths
    */

    app.staticPaths = [];

    /*
        Serve a fave icon.
    */

    app.use(connect.favicon());

    /*
        Log all requests.
    */

    app.use(connect.logger("dev"));

    /*
        Serve static files from the application root.
    */

    app.staticPaths.push(root);

    app.use(connect.static(root));

    /*
        Serve static files from the loader assets folder.
    */

    if (loader.assets(root)) {
        app.staticPaths.push(loader.assets(root));
        app.use(connect.static(loader.assets(root)));
    }

    /*
        Serve template files as JS modules.
    */

    app.use(tmpls.load(root, loader));

    /*
        Serve config files as JS modules.
    */

    app.use(confs.load(root, loader));

    /*
        Serve the template "index.html" file from the loader middleware.
        This only happens if nothing above has served the path "/index.html".
    */

    app.use("/index.html", function (req, res) {

        /*
            Set the Content-Type returned to JS.
        */

        res.setHeader("Content-Type", "text/html");

        /*
            Return the index.html file.
        */

        res.end(loader.index(root));
    });

    /*
        return the configured connect application.
    */

    return app;
};