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

/*jslint stupid: true, nomen: true*/

'use strict';

var program = require("commander"),
	connect = require("connect"),
    serveFavicon = require('serve-favicon'),
    logger = require('morgan'),
    serveStatic = require('serve-static'),
	path = require("path"),
    fs = require("fs"),
    middleware = {},
    app;

program.version("0.0.1");
program.option("-v, --verbose", "runtime info");
program.option("-p, --port [port]", "which port to use", 3000);
program.option("-r, --root [dir]", "which directory to run from", process.cwd());
program.option("-b, --build [dir]", "build all files for the web app to the given directory");
program.option("-u, --uglify", "compress all javascript files using uglify");

program.parse(process.argv);

/*
    Auto-load bundled middleware with getters.
*/

fs.readdirSync(__dirname + '/middleware').forEach(function (filename) {
    var name;
    if (!/\.js$/.test(filename)) {
        return;
    }
    name = path.basename(filename, '.js');
    function load() {
        return require('./middleware/' + name);
    }
    middleware.__defineGetter__(name, load);
});

/*
	Start the connect server.
*/

app = connect()
    // .use(serveFavicon())
    .use(logger("dev"))
    .use(serveStatic(program.root))
    .use(middleware.tmpls(program.root))
    .use(middleware.langs(program.root))
    .use(middleware.configs(program.root))
    .use(serveStatic(path.join(__dirname, "assets")))
    .use("/index.html", middleware.index());

if (program.build) {
    console.log("Building to: " + program.build);
    require("./build").build(app, process.cwd(), program.build);
} else {
    app.listen(program.port);
    console.log("Running at http://localhost:" + program.port + "/index.html");
}
