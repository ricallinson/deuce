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
    utils = require("../../utils"),
    fs = require("fs"),
    libvm = require("vm"),
    mustache = require("mustache");

/*
    Reads the directory name and returns a fake YUI Module config.
*/

exports.getYuiModuleConfigFromDir = function (fullPath, root) {

    var module = {};

    module.name = utils.getModuleNameFromPath(fullPath);
    module.fullpath = utils.getRelativePath(fullPath, root) + ".js";

    return module;
};

/*
    Reads the "langs" directory file and returns fake YUI Module config.

    Note: This function generates side-effects. Need to refactor.
*/

exports.getYuiModuleConfigFromLangFile = function (fullPath, root, modules) {

    var name,
        module,
        langTag;

    if (path.extname(fullPath)) {
        fullPath = fullPath.slice(0, path.extname(fullPath).length * -1);
    }

    name = "lang/" + path.basename(fullPath);
    module = path.basename(fullPath).split("_").slice(0, -1).join("_") || path.basename(fullPath);
    langTag = path.basename(fullPath).split("_").slice(-1).join("_");

    if (module === langTag) {
        langTag = "en";
    }

    modules[name] = modules[name] || {};
    modules[name].fullpath = utils.getRelativePath(fullPath, root) + ".js";

    modules[module] = modules[module] || {};
    modules[module].lang = modules[module].lang || [];
    modules[module].lang.push(langTag);

    return modules;
};

/*
    Returns a YUI module config if the given "fullpath" is a YUI module file.
*/

exports.getYuiModuleConfigFromFile = function (fullPath, root) {

    var file,
        ctx,
        config = {},
        module = {};

    /*
        Read the source file into a string.
    */

    file = fs.readFileSync(fullPath, "utf8");

    /*
        Create a context for the YUI module to be loaded into.
    */

    ctx = {
        console: {
            log: function () {}
        },
        window: {},
        document: {},
        YUI: {
            ENV: {},
            config: {},
            use: function () {},
            add: function (name, fn, version, meta) {
                config.name = name;
                config.version = version;
                config.meta = meta || {};
                if (!config.meta.requires) {
                    config.meta.requires = [];
                }
                if (config.meta.requires.length === 0) {
                    config.meta.requires = undefined;
                }
            }
        }
    };

    try {
        libvm.runInNewContext(file, ctx, fullPath);
    } catch (e) {
        console.log("Not a YUI Module: " + fullPath);
    }
    if (config && config.name) {
        module.name = config.name;
        module.fullpath = utils.getRelativePath(fullPath, root);
        module.requires = config.meta.requires;
    }

    return module;
};

/*
    Walks the given directory and finds all YUI Modules returning a YUI module configuration object.

    Note: This function's cyclomatic complexity is too high! Need to refactor.
*/

exports.buildYuiModulesConfig = function (dir, root, modules) {

    var files,
        name,
        absPath,
        module;

    if (!modules) {
        modules = {};
    }

    if (!root) {
        root = dir;
    }

    files = fs.readdirSync(dir);

    for (name in files) {

        absPath = path.join(dir, files[name]);

        if (/\.js$/.test(absPath)) {

            module = exports.getYuiModuleConfigFromFile(absPath, root);

            modules[module.name] = {
                fullpath: module.fullpath,
                requires: module.requires
            };

        } else if (files[name] === "confs" || files[name] === "tmpls") {

            module = exports.getYuiModuleConfigFromDir(absPath, root);

            modules[module.name] = {
                fullpath: module.fullpath,
                requires: module.requires
            };

        } else if (path.basename(dir) === "langs") {

            exports.getYuiModuleConfigFromLangFile(absPath, root, modules);

        } else if (fs.statSync(absPath).isDirectory()) {

            exports.buildYuiModulesConfig(absPath, root, modules);
        }
    }

    return modules;
};

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

exports.module = function (name, data) {

    var template;

    /*
        Read the source file for the "module.js.hb" template
    */

    template = fs.readFileSync(path.join(__dirname, "templates", "module.js.hb"), "utf8");

    /*
        Return the rendered template.
    */

    return mustache.render(template, {name: name, data: JSON.stringify(data, null, 4)});
};

/*
    Returns an index page that uses YUI for module loading.
*/

exports.index = function (root) {

    var template,
        config;

    /*
        Load the default YUI configuration.
    */

    config = require(path.join(__dirname, "templates", "config.yaml"));

    /*
        Read the source file for the "index.html.hb" template
    */

    template = fs.readFileSync(path.join(__dirname, "templates", "index.html.hb"), "utf8");

    /*
        Walk the application directory for YUI files and add them to the config.
    */

    config.modules = exports.buildYuiModulesConfig(root);

    /*
        Return the rendered template.
    */

    return mustache.render(template, JSON.stringify(config, null, 4));
};