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
	Adds the npm "requirejs" module folder as an asset serving directory.
	This is so the "require.js" file can be served.
*/

exports.assets = function () {

	var modulePath;

	try {

		/*
			Get the path to the installed "requirejs" module.
		*/

		modulePath = require.resolve("yui");

	} catch (err) {

		/*
			If we could not get the path then exit with instructions.
		*/

		console.log("To use AMD run 'npm i yui' in your application root.");
		process.exit(1);
	}

	/*
		Return the path so it can be used for serving assets.
	*/

	return path.resolve(modulePath, "..");
};

/*
	Wraps the given string into an YUI module.
*/

exports.module = function (str) {
	return str;
};

/*
	Returns an index page that uses YUI module loading.
*/

exports.index = function () {

	/*
		Read the source file for the index.hb.html template
	*/

	var template = fs.readFileSync(path.join(__dirname, "templates", "index.hb.html"), "utf8");

	/*
		Return the transformed template.
	*/

	return template;
};