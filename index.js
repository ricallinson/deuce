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
    deuce = require("./lib/deuce"),
    path = require("path"),
    server;

/*
    Added command line options.
*/

program.version("0.0.1");
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
    Get the deuce server.
*/

server = deuce.createServer(program.root, program.loader);

/*
    Start the application for either building or developement.
*/

if (program.build) {

    /*
        Build the web server if required.
    */

    program.build = path.resolve(program.build);

    /*
        Log that we are going to do something.
    */

    console.log("(Not working yet) Building to: " + program.build);

    /*
        Give the server and destination directory to the build module.
    */

    require("./lib/build").generateApp(server, program.build);

} else {

    /*
        Start the connect server.
    */

    server.listen(program.port);

    /*
        Log that we have the server started.
    */

    console.log("Running at http://localhost:" + program.port + "/index.html");
}
