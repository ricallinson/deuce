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
    This function will try and read the requested file returning an Object.

    It will also trim ".ext" from the filePath
 */

function readConfigSync(filePath, type) {

    var file = ['.yml', '.yaml', '.json'],
        raw,
        obj = {};

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
            } else if (type === 2){ // json
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
        Y.log("Error parsing YUI File: " + fullPath + "\n" + e.stack, "error", name);
    }
    if (yui && yui.name) {
        modules[yui.name] = {
            fullpath: getRelativePath(fullPath, root),
            requires: yui.meta.requires
        };
    }
}

/*
    Reads the "tmpl" directory and makes a fake YUI Module config.
    Updates the provided "modules" object with the YUI Config.
 */

function getYuiModuleConfigFromTmplDir(fullPath, modules, root) {

    var name = getYuiModuleNameFromPath(fullPath);

    modules[name] = {
        fullpath: getRelativePath(fullPath, root) + ".js"
    };

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
                getYuiModuleConfigFromTmplDir(absPath, modules);
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

exports.configure = function (root) {

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
    confsJS = fs.readFileSync(__dirname + "/tmpls/confs.js.hb", "utf8"); // module scope
    tmplsJS = fs.readFileSync(__dirname + "/tmpls/tmpls.js.hb", "utf8"); // module scope
    defaults = readConfigSync(__dirname + "/tmpls/init.yml");
    tmpl = fs.readFileSync(__dirname + "/tmpls/index.html", "utf8"),
    template = Y.Handlebars.compile(tmpl);

    // Find all the YUI modules we have
    buildYuiModulesConfig(appRoot, modulesCfg);

    // Dump for debuging
    console.log(JSON.stringify(modulesCfg, null, 4));

    try {
        config = readConfigSync(appRoot + "/init.yml");
    } catch (err) {
        Y.log(err);
    }

    config = Y.merge(defaults, config);

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
 */

exports.index = function (req, res) {
    res.end(indexHtml);
};

/*
    Converts the URL into a directory, reads all the files in that directory,
    then returns the string content of said files as attributes of a YUI Module.
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
    This will uglify all JS files.

    TODO: This is too simple and does not work. Fix it!
*/

exports.uglify = function () {

    var jsp = require("uglify-js").parser;
    var pro = require("uglify-js").uglify;

    return function (req, res, next) {

        var end;

        if (/\.js$/.test(req.url) === false) {
            next();
            return;
        }

        end = res.end;

        res.end = function (data, encoding) {

            res.end = end;

            var ast = jsp.parse(data); // parse code and get the initial AST
            ast = pro.ast_mangle(ast); // get a new AST with mangled names
            ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
            ast = pro.gen_code(ast); // compressed code here

            res.end(ast, encoding);
        };

        next();
    };
};
