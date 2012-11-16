
var yaml = require('js-yaml'),
	path = require("path"),
	fs = require("fs");

/*
	Reads the given "filePath" as either a .yml, .yaml or .json
*/

exports.readConfigSync = function readConfigSync(filePath, type) {

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