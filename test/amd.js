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

/*global describe: true, it: true*/

"use strict";

var deuce = require("../lib/deuce"),
    path = require("path"),
    assert = require("assert");

describe("AMD generated config files", function () {

    var server = deuce.createServer(path.join(__dirname, "fixtures"), "amd");

    it("should return the default JS file for AMD", function (done) {

        server.request()
            .get("/confs.js")
            .end(function (res) {
                assert.equal(res.body.indexOf("define("), 38);
                done();
            });
    });
});

describe("AMD generated template files", function () {

    var server = deuce.createServer(path.join(__dirname, "fixtures"), "amd");

    it("should return the default JS file for AMD", function (done) {

        server.request()
            .get("/tmpls.js")
            .end(function (res) {
                assert.equal(res.body.indexOf("define("), 38);
                done();
            });
    });
});

describe("AMD module files", function () {

    var server = deuce.createServer(path.join(__dirname, "fixtures"), "amd");

    it("should return main", function (done) {

        server.request()
            .get("/amd/main.js")
            .end(function (res) {
                assert.equal(res.body.indexOf("define("), 40);
                assert.equal(res.body.indexOf("AMD!"), 75);
                done();
            });
    });

    it("should return subfolder/other", function (done) {

        server.request()
            .get("/amd/subfolder/other.js")
            .end(function (res) {
                assert.equal(res.body.indexOf("define("), 40);
                assert.equal(res.body.indexOf("Other AMD!"), 75);
                done();
            });
    });
});