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

var program = require("commander"),
    path = require("path"),
    connect = require("connect"),
    builder = require("./lib/builder"),
    app,
    wrapper,
    confs,
    tmpls;

/*
    Added command line options.
*/

program.version("0.0.1");
program.option("-v, --verbose", "runtime info");
program.option("-l, --loader [loader]", "which module loader to use 'yui' or 'amd'", "yui");
program.option("-p, --port [port]", "which port to use", 3000);
program.option("-r, --root [dir]", "which directory to run from", process.cwd());
program.option("-b, --build [dir]", "build all files for the web app to the given directory");

/*
    Parse the command line inputs.
*/

program.parse(process.argv);

/*
    Convert the program.root to an absolute path.
*/

program.root = path.resolve(program.root);

/*
    TMP: Place holders for loader and middleware modules.
*/

wrapper = require("./lib/loaders/" + program.loader);
confs = require("./lib/middleware/confs");
tmpls = require("./lib/middleware/tmpls");

/*
    Create the connect app.
*/

app = connect();

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

app.use(connect.static(program.root));

/*
    Serve static files from the wrapper assets folder.
*/

app.use(connect.static(wrapper.assets(__dirname)));

/*
    Serve template files as JS modules.
*/

app.use(tmpls.load(program.root, wrapper));

/*
    Serve config files as JS modules.
*/

app.use(confs.load(program.root, wrapper));

/*
    Serve the template "index.html" file from the wrapper middleware.
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

    res.end(wrapper.index(program.root));
});

/*
    Start the application for either building or developement.
*/

if (program.build) {

    /*
        Build the web app if required.
    */

    program.build = path.resolve(program.build);
    console.log("Building to: " + program.build);
    builder.build(program.root, program.build, app);

} else {

    /*
        Start the connect server.
    */

    app.listen(program.port);

    /*
        Log that we have the server started.
    */

    console.log("Running at http://localhost:" + program.port + "/index.html");
}
