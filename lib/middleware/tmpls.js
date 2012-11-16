
var path = require("path"),
    fs = require("fs");

/*
    Configure the middleware
*/

module.exports = function (root) {

    return function (req, res, next) {

        var dir,
            files,
            name,
            absPath,
            tmpls = {};

        /*
            If the request is not for a config.js file return.
        */

        if (/\/tmpls\.js$/.test(req.url) === false) {
            next();
            return;
        }

        // Get the directory path from the URL by removing the ".js"
        dir = path.join(root, req.url.slice(0, -3));

        files = fs.readdirSync(dir);

        for (name in files) {
            if (files.hasOwnProperty(name)) {
                absPath = path.join(dir, files[name]);
                tmpls[files[name]] = fs.readFileSync(absPath, "utf8");
            }
        }

        res.setHeader("Content-Type", "application/javascript");
        res.end("define(" + JSON.stringify(tmpls, null, 4) + ")");
    }
};