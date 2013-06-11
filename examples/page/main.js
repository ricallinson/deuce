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

/*global define*/

"use strict";

define(["page", "tmpls", "handlebars"], function (page, tmpls, handlebars) {

	/*
		Single template for testing.
	*/

	var template = handlebars.compile(tmpls["main.hb.html"]);

	/*
		Route is regex at the mo.
	*/

	page.get("/$", function (req, res, next) {
		res.send(template({title: "Home"}));
	});

	page.get("/one", function (req, res, next) {
		res.send(template({title: "One"}));
	});

	page.get("/two", function (req, res, next) {
		res.send(template({title: "Two"}));
	});

	page.get(".*", function (req) {
		console.log("404: " + req.url);
	});

	page.listen();

});