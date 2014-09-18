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

/*jslint stupid: true*/

"use strict";

var yaml = require('js-yaml'),
	path = require("path"),
	fs = require("fs");

/*
	Reads the given "filePath" as either a .yml, .yaml or .json
*/

exports.readConfigSync = function (filePath, type) {

    var file = ['.yml', '.yaml', '.json'],
        raw,
        obj;

    if (path.extname(filePath)) {
        filePath = filePath.slice(0, path.extname(filePath).length * -1);
    }

    if (!type) {
        type = 0;
    }

    try {
        raw = fs.readFileSync(filePath + file[type], 'utf8');
        try {
            if (type === 0 || type === 1) { // yml
                obj = yaml.load(raw);
            } else if (type === 2) { // json
                obj = JSON.parse(raw);
            }
        } catch (parseErr) {
            throw new Error(parseErr);
        }
    } catch (err) {
        if (type < file.length - 1) {
            return readConfigSync(filePath, type + 1);
        }
    }

    return obj;
};

exports.copyFile = function (source, target, cb) {

  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
};
