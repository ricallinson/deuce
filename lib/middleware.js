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

/*jslint stupid: true, nomen: true*/

'use strict';

/*
    Module libraries.
*/

var fs = require("fs"),
    path = require("path"),
    libvm = require("vm"),
    Y = require("yui").use("handlebars"),
    yaml = require('js-yaml');

/*
    The root directory of the Web App.
*/

var appRoot = "";

/*
    The YUI Modules config object.
*/

var modulesCfg = {};

/*
    The "index.html" file.
*/

var indexHtml = "";

/*
    The "confs.js" file.
*/

var confsJS = "";

/*
    The "tmpls.js" file.
*/

var tmplsJS = "";

/*
    The "lang/module_local-lang.js" file.
*/

var langsJS = "";

/*
    This function will try and read the requested file returning an Object.

    It will also trim ".ext" from the filePath

    TODO: Add detection for tabs in yml
 */

function readConfigSync(filePath, type) {

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
}

/*
    Returns a YUI Module name from the given path.
 */

function getYuiModuleNameFromPath(fullPath) {
    return fullPath.split("/").slice(-2).join("-");
}

/*
    Returns a relative path to the web app root from an absolute path.
 */

function getRelativePath(fullPath, root) {
    if (!root) {
        root = appRoot;
    }
    return "." + fullPath.slice(root.length);
}

/*
    Reads a YUI Module file and extracts the "name", "version" and "requires" values.
    Updates the provided "modules" object with a YUI Config for the parsed module.
 */

function getYuiModuleConfigFromFile(fullPath, modules, root) {

    var file,
        ctx,
        name = 'n/a',
        yui = {};

    file = fs.readFileSync(fullPath, "utf8");
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
                yui.name = name;
                yui.version = version;
                yui.meta = meta || {};
                if (!yui.meta.requires) {
                    yui.meta.requires = [];
                }
                if (yui.meta.requires.length === 0) {
                    yui.meta.requires = undefined;
                }
            }
        }
    };
    try {
        libvm.runInNewContext(file, ctx, fullPath);
    } catch (e) {
        console.log("Not a YUI Module: " + fullPath);
    }
    if (yui && yui.name) {
        modules[yui.name] = modules[yui.name] || {};
        modules[yui.name].fullpath = getRelativePath(fullPath, root);
        modules[yui.name].requires = yui.meta.requires;
    }
}

/*
    Reads the directory name and makes a fake YUI Module config.
    Updates the provided "modules" object with the YUI Config.

    TODO: Need to make middleware a plugin to this has to be a plugin too.
 */

function getYuiModuleConfigFromDir(fullPath, modules, root) {

    var name;

    name = getYuiModuleNameFromPath(fullPath);

    modules[name] = modules[name] || {};

    modules[name].fullpath = getRelativePath(fullPath, root) + ".js";

    return modules;
}

/*
    Reads the "langs" directory file and makes fake YUI Module config.
    Updates the provided "modules" object with the YUI Config.

    TODO: Need to make middleware a plugin to this has to be a plugin too.
 */

function getYuiModuleConfigFromLangFile(fullPath, modules, root) {

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
    modules[name].fullpath = getRelativePath(fullPath, root) + ".js";

    modules[module] = modules[module] || {};
    modules[module].lang = modules[module].lang || [];
    modules[module].lang.push(langTag);

    return modules;
}

/*
    Walks the user directory and adds a YUI Module for each YUI file found. 
 */

function buildYuiModulesConfig(dir, modules, root) {
    var files,
        name,
        absPath;

    if (!modules) {
        modules = {};
    }

    if (!root) {
        root = dir;
    }

    files = fs.readdirSync(dir);

    for (name in files) {
        if (files.hasOwnProperty(name)) {
            absPath = path.join(dir, files[name]);
            if (/\.js$/.test(absPath)) {
                getYuiModuleConfigFromFile(absPath, modules, root);
            } else if (files[name] === "confs" || files[name] === "tmpls") {
                getYuiModuleConfigFromDir(absPath, modules, root);
            } else if (path.basename(dir) === "langs") {
                getYuiModuleConfigFromLangFile(absPath, modules, root);
            } else if (fs.statSync(absPath).isDirectory()) {
                buildYuiModulesConfig(absPath, modules, root);
            }
        }
    }

    return modules;
}

/*
    Walks the user directory and adds an entry for each asset found the given assets object.
 */

function buildAssetsConfig(dir, assets, root) {
    var files,
        name,
        absPath;

    if (!assets) {
        assets = {};
    }

    if (!root) {
        root = dir;
    }

    files = fs.readdirSync(dir);

    for (name in files) {
        if (files.hasOwnProperty(name)) {
            absPath = path.join(dir, files[name]);
            if (fs.statSync(absPath).isDirectory()) {
                buildAssetsConfig(absPath, assets);
            } else if (/\.js$/.test(absPath) === false && files[name][0] !== ".") {
                assets[getRelativePath(absPath, root)] = {
                    fullpath: absPath
                };
            }
        }
    }

    return assets;
}

/*
    Configure the runner before accepting requests
*/

exports.configure = function (root, options) {

    var tmpl,
        template,
        defaults,
        config = {};

    if (root[0] === '.') {
        root = path.join(process.cwd(), root);
    }

    // Set the modules web app root
    appRoot = path.normalize(root); // module scope

    // If any of these error we're fucked
    langsJS = fs.readFileSync(__dirname + "/tmpls/langs.js.hb", "utf8"); // module scope
    confsJS = fs.readFileSync(__dirname + "/tmpls/confs.js.hb", "utf8"); // module scope
    tmplsJS = fs.readFileSync(__dirname + "/tmpls/tmpls.js.hb", "utf8"); // module scope
    defaults = readConfigSync(__dirname + "/tmpls/init.yml");
    tmpl = fs.readFileSync(__dirname + "/tmpls/index.html", "utf8");
    template = Y.Handlebars.compile(tmpl);

    // Find all the YUI modules we have
    buildYuiModulesConfig(appRoot, modulesCfg);

    try {
        config = readConfigSync(appRoot + "/init.yml");
    } catch (err) {
        console.log(err);
    }

    config = Y.merge(defaults, config);

    // Set the first module to use if we got it in options
    if (typeof options.module === "string") {
        config.module = options.module;
    }

    // Dump for debuging
    if (options.verbose) {
        console.log("YUI Global Config: ", JSON.stringify(modulesCfg, null, 4));
        console.log("Startup Config: ", JSON.stringify(config, null, 4));
    }

    // Make sure we have an YUI conbject to build from
    if (!config.yui) {
        config.yui = {};
    }

    // Make sure we have a modules object
    if (!config.yui.modules) {
        config.yui.modules = {};
    }

    // Add all the found modules to the YUI config
    config.yui.modules = Y.merge(config.yui.modules, modulesCfg);

    // Now convert the YUI Config to a tring so it can be servered
    config.yui = JSON.stringify(config.yui);

    // If we have any html.head items convert them to a string
    if (config.html && config.html.head) {
        config.html.head = config.html.head.join("\n");
    }

    // If we have any html.body items convert them to a string
    if (config.html && config.html.body) {
        config.html.body = config.html.body.join("\n");
    }

    indexHtml = template(config);
};

/*
    Outputs the wep app as single files to the given directory
*/

exports.build = function (dir, callback) {

    var name,
        urls = {},
        bash = "\n",
        curl = "",
        exec = require('child_process').exec,
        url,
        commands = [],
        step = require('step');

    if (dir[0] === '.') {
        dir = path.join(process.cwd(), dir);
    } else {
        dir = path.join(process.cwd());
    }

    // Get all the assets we have to serve
    urls = buildAssetsConfig(appRoot);

    // Grab a list of all the YUI Modules we've found
    for (url in urls) {
        if (urls.hasOwnProperty(url)) {
            urls[url].fullpath = path.join(dir, url);
        }
    }

    // Now add the "index.html" file to the urls
    urls["index.html"] = {
        fullpath: path.join(dir, "index.html")
    };

    // Grab a list of all the YUI Modules we've found
    for (name in modulesCfg) {
        if (modulesCfg.hasOwnProperty(name)) {
            urls[modulesCfg[name].fullpath] = {
                fullpath: path.join(dir, modulesCfg[name].fullpath)
            };
        }
    }

    bash += "mkdir -p " + path.join(dir) + "\n";
    bash += "cp -r " + path.join(__dirname, "/../", "node_modules", "yui*") + " " + path.join(dir, "yui") + "\n";

    console.log(bash, "\nCopying YUI files.");

    // First copy all YUI files to the build directory.
    exec(bash, function (error, stdout, stderr) {

        console.log(stdout, stderr);

        step(
            function () {
                var group = this.group(),
                    url;
                // Now save the result of each url to the build directory.
                for (url in urls) {
                    if (urls.hasOwnProperty(url)) {
                        curl = "curl http://localhost:3000/" + path.join(url) + " --output \"" + urls[url].fullpath + "\" --create-dirs";
                        console.log(curl);
                        exec(curl, group());
                    }
                }
            },
            function () {
                console.log("Build finished: " + dir);
                callback(0);
            }
        );
    });
};

/*
    Returns an "index.html" page the application.

    TODO: Need to make middleware a plugin.
 */

exports.index = function (req, res) {
    res.end(indexHtml);
};

/*
    Converts the URL into a directory, reads all the files in that directory,
    then returns the string content of said files as attributes of a YUI Module.

    TODO: Need to make middleware a plugin.
 */

exports.confs = function (req, res, next) {

    var dir,
        files,
        module,
        confs = {},
        name,
        template,
        absPath;

    if (/\/confs\.js$/.test(req.url) === false) {
        next();
        return;
    }

    dir = path.join(appRoot, req.url.slice(0, -3));
    files = fs.readdirSync(dir);

    for (name in files) {
        if (files.hasOwnProperty(name)) {
            absPath = path.join(dir, files[name]);

            if (path.extname(files[name])) {
                files[name] = files[name].slice(0, path.extname(files[name]).length * -1);
            }

            confs[files[name]] = readConfigSync(absPath);
        }
    }

    name = getYuiModuleNameFromPath(dir);

    template = Y.Handlebars.compile(confsJS);

    res.setHeader("Content-Type", "application/javascript");
    res.end(template({
        name: name,
        confs: JSON.stringify(confs, null, 4)
    }));
};

/*
    Converts the URL into a directory, reads all the files in that directory,
    then returns the string content of said files as attributes of a YUI Module.

    TODO: Need to make middleware a plugin.
 */

exports.tmpls = function (req, res, next) {

    var dir,
        files,
        module,
        tmpls = {},
        name,
        template,
        absPath;

    if (/\/tmpls\.js$/.test(req.url) === false) {
        next();
        return;
    }

    dir = path.join(appRoot, req.url.slice(0, -3));
    files = fs.readdirSync(dir);

    for (name in files) {
        if (files.hasOwnProperty(name)) {
            absPath = path.join(dir, files[name]);
            tmpls[files[name]] = fs.readFileSync(absPath, "utf8");
        }
    }

    name = getYuiModuleNameFromPath(dir);

    template = Y.Handlebars.compile(tmplsJS);

    res.setHeader("Content-Type", "application/javascript");
    res.end(template({
        name: name,
        tmpls: JSON.stringify(tmpls, null, 4)
    }));
};

/*
    Converts the URL into a directory, read the matching file
    in that directory, then return said file as YUI Lang Module.

    TODO: Need to make middleware a plugin.
 */

exports.langs = function (req, res, next) {

    var dir,
        files,
        module,
        langTag,
        langs,
        tmpls = {},
        name,
        template,
        absPath;

    if (/\/langs\//.test(req.url) === false) {
        next();
        return;
    }

    dir = path.join(appRoot, req.url.slice(0, -3));

    name = "lang/" + path.basename(dir);
    module = path.basename(dir).split("_").slice(0, -1).join("_") || path.basename(dir);
    langTag = path.basename(dir).split("_").slice(-1).join("_");
    langs = readConfigSync(dir);

    if (module === langTag) {
        langTag = "en";
    }

    if (!langs) {
        next();
        return;
    }

    template = Y.Handlebars.compile(langsJS);

    res.setHeader("Content-Type", "application/javascript");
    res.end(template({
        name: name,
        module: module,
        langTag: langTag,
        langs: JSON.stringify(langs, null, 4)
    }));
};

/*
    This will uglify all JS files.

    TODO: Need to make middleware a plugin.
*/

exports.uglify = function (uglify) {

    var jsp = require("uglify-js").parser,
        pro = require("uglify-js").uglify;

    return function (req, res, next) {

        var buffer = "",
            write,
            end;

        if (!uglify || /\.js$/.test(req.url) === false) {// || /^\/yui\//.test(req.url) === true) {
            next();
            return;
        }

        write = res.write;
        end = res.end;

        res.write = function (data, encoding) {
            buffer += data.toString();
        };

        res.end = function (data, encoding) {

            var ast;

            if (data) {
                buffer += data.toString();
            }

            try {
                ast = jsp.parse(buffer); // parse code and get the initial AST
                ast = pro.ast_mangle(ast); // get a new AST with mangled names
                ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
                ast = pro.gen_code(ast); // compressed code here
            } catch (err) {
                console.log(err);
                ast = buffer;
            }

            res.write = write;
            res.end = end;

            res.setHeader("Content-Length", ast.length);
            res.end(ast, encoding);
        };

        next();
    };
};
