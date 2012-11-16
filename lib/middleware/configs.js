
var readConfigSync = require("../utils").readConfigSync,
	path = require("path"),
	fs = require("fs"),
	template = "";

/*
	Configure the middleware
*/

module.exports = function (root) {

	return function (req, res, next) {

		var dir,
			files,
			name,
			absPath,
			configs = {};

		/*
			If the request is not for a config.js file return.
		*/

		if (/\/configs\.js$/.test(req.url) === false) {
	        next();
	        return;
	    }

	    // Get the directory path from the URL by removing the ".js"
	    dir = path.join(root, req.url.slice(0, -3));

	    files = fs.readdirSync(dir);

	    for (name in files) {
	        if (files.hasOwnProperty(name)) {
	            absPath = path.join(dir, files[name]);

	            if (path.extname(files[name])) {
	                files[name] = files[name].slice(0, path.extname(files[name]).length * -1);
	            }

	            configs[files[name]] = readConfigSync(absPath);
	        }
	    }

	    res.setHeader("Content-Type", "application/javascript");
		res.end("define(" + JSON.stringify(configs, null, 4) + ")");
	}
};