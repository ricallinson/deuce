
var readConfigSync = require("../utils").readConfigSync,
    path = require("path"),
    fs = require("fs");

/*
    Configure the middleware
*/

module.exports = function (root) {

    return function (req, res, next) {

        var file,
            langs;

        /*
            If the request is not for a /nls/ directory then return.
        */

        if (/\/nls\//.test(req.url) === false) {
            next();
            return;
        }

        // Get the directory path from the URL by removing the ".js"
        file = path.join(root, req.url.slice(0, -3));

        langs = readConfigSync(file);

        res.setHeader("Content-Type", "application/javascript");
        res.end("define(" + JSON.stringify(langs, null, 4) + ")");
    }
};