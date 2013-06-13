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

var utils = require("./utils"),
	path = require("path"),
	fs = require('fs');

/*
	Handle request.
*/

exports.handle = function (from, to, app) {

	var req,
		res;

	console.log(from);

	/*
    	Make a request object.
    */

    req = {
    	url: from.replace(".", ""),
    	headers: [],
    	method: "GET"
    };

    /*
    	Make a response object.
    */

    try {
    	// need to make the directories before calling this.
    	res = fs.createWriteStream(to);
    } catch (err) {
    	return;
    }

    res.setHeader = function () {};
    res.getHeader = function () {};
    res.end = function () {
		console.log(req);
	};

    app.handle(req, res);
};

/*
	Generates the final output of the application into the give directory.
*/

exports.build = function (srcPath, destPath, app) {

	var files,
        current,
        from,
        to;

    files = utils.getFileListSync(srcPath);

    for (current in files) {

        from = utils.getRelativePath(files[current].abspath, srcPath);
        to = path.join(destPath, utils.getRelativePath(files[current].abspath, srcPath));

        exports.handle(from, to, app);
    }
};