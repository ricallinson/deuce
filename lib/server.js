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

/*jslint nomen: true*/

'use strict';

var program = require("commander"),
	connect = require("connect"),
	middleware = require("./middleware"),
	path = require("path");

program.version("0.0.1");
program.option("-v, --verbose", "runtime info");
program.option("-p, --port [port]", "which port to use", 3000);
program.option("-r, --root [dir]", "which directory to run from", process.cwd());
program.option("-m, --module [module]", "the YUI Module name to .use() first");
program.option("-b, --build [dir]", "build all files for the web app to the given directory");
program.option("-u, --uglify", "compress all javascript files using uglify");

program.parse(process.argv);

middleware.configure(program.root, {
    module: program.module,
    verbose: program.verbose
});

/*
	Start the connect server
*/

connect()
    .use(connect.favicon())
    .use(connect.logger("dev"))
    .use(middleware.uglify(program.uglify))
    .use(connect.static(program.root))
    .use(middleware.langs)
    .use(middleware.confs)
    .use(middleware.tmpls)
    .use("/yui/", connect.static(path.join(__dirname, "/../", "/node_modules/yui/")))
    .use("/index.html", middleware.index)
    .listen(program.port);

console.log("Running at http://localhost:" + program.port + "/index.html");

/*
	Build the web app if required
*/

if (program.build) {
	console.log("Building to: " + program.build);
	middleware.build(program.build, function (exitCode) {
		process.exit(exitCode);
	});
}
