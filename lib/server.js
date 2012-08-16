/*jslint nomen: true*/

'use strict';

var program = require("commander"),
	connect = require("connect"),
	runner = require("./fetcher"),
	path = require("path");

program.version("0.0.1");
program.option("-p, --port [port]", "which port to use", 3000);
program.option("-r, --root [dir]", "which directory to run from", process.cwd());
program.option("-b, --build [dir]", "build all files for the web app");

program.parse(process.argv);

runner.configure(program.root);

/*
	Start the connect server
*/

connect()
    .use(connect.favicon())
    .use(connect.logger("dev"))
    .use(connect.static(program.root))
    .use(runner.confs)
    .use(runner.tmpls)
    .use("/yui/", connect.static(path.join(__dirname, "/../", "/node_modules/yui/")))
    .use("/index.html", runner.index)
    .listen(program.port);

console.log("Running at http://localhost:" + program.port + "/");

/*
	Build the web app if required
*/

if (program.build) {
	console.log("Building to: " + program.build);
	runner.build(program.build, function (exitCode) {
		process.exit(exitCode);
	});
}
