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

/**
 * Module dependencies.
 */

var EventEmitter = require("events").EventEmitter,
    methods = ["get", "post", "put", "delete", "head"],
    connect = require("connect"),
    http = require("http");

function Request(app) {
    var self = this;
    this.data = [];
    this.header = {};
    this.app = app;
    if (!this.server) {
        this.server = http.Server(app);
        this.server.listen(0, function () {
            self.addr = self.server.address();
            self.listening = true;
        });
    }
}

function request(app) {
    return new Request(app);
}

connect.proto.request = function () {
    return request(this);
};

module.exports = request;

/**
 * Inherit from `EventEmitter.prototype`.
 */

Request.prototype.__proto__ = EventEmitter.prototype;

methods.forEach(function (method) {
    Request.prototype[method] = function (path) {
        return this.request(method, path);
    };
});

Request.prototype.set = function (field, val) {
    this.header[field] = val;
    return this;
};

Request.prototype.write = function (data) {
    this.data.push(data);
    return this;
};

Request.prototype.request = function (method, path) {
    this.method = method;
    this.path = path;
    return this;
};

Request.prototype.expect = function (body, fn) {
    var args = arguments;
    this.end(function (res) {
        switch (args.length) {
        case 3:
            res.headers.should.have.property(body.toLowerCase(), args[1]);
            args[2]();
            break;
        default:
            if ("number" === typeof body) {
                res.statusCode.should.equal(body);
            } else {
                res.body.should.equal(body);
            }
            fn();
        }
    });
};

Request.prototype.end = function (fn) {
    var self = this,
        req;

    if (this.listening) {
        req = http.request({
            method: this.method,
            port: this.addr.port,
            host: this.addr.address,
            path: this.path,
            headers: this.header
        });

        this.data.forEach(function (chunk) {
            req.write(chunk);
        });
    
        req.on("response", function (res) {
            var buf = "";
            res.setEncoding("utf8");
            res.on("data", function (chunk) {
                buf += chunk;
            });
            res.on("end", function () {
                res.body = buf;
                fn(res);
            });
        });

        req.end();
    } else {
        this.server.on("listening", function () {
            self.end(fn);
        });
    }

    return this;
};
