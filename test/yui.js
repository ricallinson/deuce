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
    loaderYui = require("../lib/loaders/yui"),
    assert = require("assert");

describe("YUI generated config files", function () {

    var server = deuce.createServer(path.join(__dirname, "fixtures"), "yui");

    it("should return the default JS file for YUI", function (done) {

        server.request()
            .get("/subfolder/subsubfolder/confs.js")
            .end(function (res) {
                assert.equal(res.body.indexOf("YUI.add(\"subfolder/subsubfolder/confs\""), 35);
                done();
            });
    });

    it("should return the default JS file for YUI", function (done) {

        server.request()
            .get("/confs.js")
            .end(function (res) {
                assert.equal(res.body.indexOf("YUI.add(\"confs\""), 35);
                done();
            });
    });
});

describe("YUI module files", function () {

    var server = deuce.createServer(path.join(__dirname, "fixtures"), "amd");

    it("should return main", function (done) {

        server.request()
            .get("/yui/main.js")
            .end(function (res) {
                assert.equal(res.body.indexOf("YUI.add(\"main\""), 37);
                assert.equal(res.body.indexOf("YUI!"), 76);
                done();
            });
    });

    it("should return all1", function (done) {

        server.request()
            .get("/yui/subfolder/requires.js")
            .end(function (res) {
                assert.equal(res.body.indexOf("YUI.add(\"all1\""), 37);
                assert.equal(res.body.indexOf("Subfolder YUI!"), 76);
                done();
            });
    });
});

describe("YUI generated template files", function () {

    var server = deuce.createServer(path.join(__dirname, "fixtures"), "yui");

    it("should return the default JS file for YUI", function (done) {

        server.request()
            .get("/subfolder/subsubfolder/tmpls.js")
            .end(function (res) {
                assert.equal(res.body.indexOf("YUI.add(\"subfolder/subsubfolder/tmpls\""), 35);
                done();
            });
    });

    it("should return the default JS file for YUI", function (done) {

        server.request()
            .get("/tmpls.js")
            .end(function (res) {
                assert.equal(res.body.indexOf("YUI.add(\"tmpls\""), 35);
                done();
            });
    });
});

describe("loaderYui.getYuiModuleConfigFromDir()", function () {

    it("should return confs.js", function () {

        var root = path.join(__dirname, "fixtures"),
            fullPath = path.join(root, "confs"),
            config = loaderYui.getYuiModuleConfigFromDir(fullPath, root);

        assert.equal(config.name, "confs");
        assert.equal(config.fullpath, "./confs");
    });
});

describe("loaderYui.getYuiModuleConfigFromFile()", function () {

    it("should return main", function () {

        var root = path.join(__dirname, "fixtures"),
            fullPath = path.join(root, "yui", "main.js"),
            config = loaderYui.getYuiModuleConfigFromFile(fullPath, root);

        assert.equal(config.name, "main");
        assert.equal(config.fullpath, "./yui/main.js");
        assert.equal(config.requires, undefined);
    });

    it("should return all1", function () {

        var root = path.join(__dirname, "fixtures"),
            fullPath = path.join(root, "yui", "subfolder", "requires.js"),
            config = loaderYui.getYuiModuleConfigFromFile(fullPath, root);

        assert.equal(config.name, "all1");
        assert.equal(config.fullpath, "./yui/subfolder/requires.js");
        assert.equal(config.requires, undefined);
    });

    it("should return all2", function () {

        var root = path.join(__dirname, "fixtures"),
            fullPath = path.join(root, "yui", "subfolder", "requires-other.js"),
            config = loaderYui.getYuiModuleConfigFromFile(fullPath, root);

        assert.equal(config.name, "all2");
        assert.equal(config.fullpath, "./yui/subfolder/requires-other.js");
        assert.equal(config.requires[0], "other");
    });

    it("should return empty object as it a use", function () {

        var root = path.join(__dirname, "fixtures"),
            fullPath = path.join(root, "yui", "subfolder", "use.js"),
            config = loaderYui.getYuiModuleConfigFromFile(fullPath, root);

        assert.equal(config.fullpath, undefined);
    });

    it("should return empty object as it a console", function () {

        var root = path.join(__dirname, "fixtures"),
            fullPath = path.join(root, "yui", "subfolder", "console.js"),
            config = loaderYui.getYuiModuleConfigFromFile(fullPath, root);

        assert.equal(config.fullpath, undefined);
    });

    it("should return empty object as it a CSS file", function () {

        var root = path.join(__dirname, "fixtures"),
            fullPath = path.join(root, "yui", "subfolder", "other.css"),
            config = loaderYui.getYuiModuleConfigFromFile(fullPath, root);

        assert.equal(config.fullpath, undefined);
    });
});

describe("loaderYui.buildYuiModuleConfig()", function () {

    it("should return confs", function () {

        var root = path.join(__dirname, "fixtures"),
            file = {
                abspath: path.join(root, "confs.js"),
                type: "confs"
            },
            config = loaderYui.buildYuiModuleConfig(file, root);

        assert.equal(config.name, "confs");
        assert.equal(config.fullpath, "./confs.js");
    });

    it("should return tmpls", function () {

        var root = path.join(__dirname, "fixtures"),
            file = {
                abspath: path.join(root, "tmpls.js"),
                type: "tmpls"
            },
            config = loaderYui.buildYuiModuleConfig(file, root);

        assert.equal(config.name, "tmpls");
        assert.equal(config.fullpath, "./tmpls.js");
    });

    it("should return undefined", function () {

        var root = path.join(__dirname, "fixtures"),
            file = {
                abspath: path.join(root, "yui", "main.js"),
                type: ".js"
            },
            config = loaderYui.buildYuiModuleConfig(file, root);

        assert.equal(config.name, "main");
        assert.equal(config.fullpath, "./yui/main.js");
    });

    it("should return undefined", function () {

        var root = path.join(__dirname, "fixtures"),
            file = {
                abspath: path.join(root, "confs", "empty"),
                type: ""
            },
            config = loaderYui.buildYuiModuleConfig(file, root);

        assert.equal(config, undefined);
    });
});

describe("loaderYui.buildYuiModulesConfig()", function () {

    it("should return", function () {

        var root = path.join(__dirname, "fixtures"),
            config = loaderYui.buildYuiModulesConfig(root);

        // console.log(config);

        // fixtures/amd
        assert.equal(config.amd, undefined);

        // fixtures/confs
        assert.equal(config.confs.fullpath, "./confs.js");
        assert.equal(config.confs.requires, undefined);

        // fixtures/subfolder/confs
        assert.equal(config["subfolder/confs"].fullpath, "./subfolder/confs.js");
        assert.equal(config["subfolder/confs"].requires, undefined);

        // fixtures/subfolder/tmpls
        assert.equal(config["subfolder/tmpls"].fullpath, "./subfolder/tmpls.js");
        assert.equal(config["subfolder/tmpls"].requires, undefined);

        // fixtures/subfolder/tmpls
        assert.equal(config["subfolder/tmpls"].fullpath, "./subfolder/tmpls.js");
        assert.equal(config["subfolder/tmpls"].requires, undefined);

        // fixtures/subfolder/subsubfolder/confs
        assert.equal(config["subfolder/subsubfolder/confs"].fullpath, "./subfolder/subsubfolder/confs.js");
        assert.equal(config["subfolder/subsubfolder/confs"].requires, undefined);

        // fixtures/subfolder/subsubfolder/tmpls
        assert.equal(config["subfolder/subsubfolder/tmpls"].fullpath, "./subfolder/subsubfolder/tmpls.js");
        assert.equal(config["subfolder/subsubfolder/tmpls"].requires, undefined);

        // fixtures/yui/main.js
        assert.equal(config.main.fullpath, "./yui/main.js");
        assert.equal(config.main.requires, undefined);

        // fixtures/yui/subfolder/requires.js
        assert.equal(config.all1.fullpath, "./yui/subfolder/requires.js");
        assert.equal(config.all1.requires, undefined);

        // fixtures/yui/subfolder/requires-other.js
        assert.equal(config.all2.fullpath, "./yui/subfolder/requires-other.js");
        assert.equal(config.all2.requires[0], "other");

        // fixtures/yui/subfolder/console.js
        assert.equal(config.console, undefined);

        // fixtures/yui/subfolder/use.js
        assert.equal(config.use, undefined);

        // fixtures/yui/subfolder/other.css
        assert.equal(config.other, undefined);
    });
});