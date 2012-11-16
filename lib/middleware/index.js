
var path = require("path"),
	fs = require("fs"),
	template = "";

/*
	Read the source file for the index.hb.html template
*/

template = fs.readFileSync(path.join(__dirname, "..", "templates", "index.hb.html"), "utf8");

/*
	Configure the middleware
*/

module.exports = function (options) {

	return function (req, res, next) {
		res.end(template);
	}
};