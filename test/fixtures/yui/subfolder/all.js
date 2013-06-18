/*jshint yui: true*/

"use strict";

YUI.add("all1", function (Y) {
	Y.log("Subfolder YUI!");
}, "0.0.1", {
	requires: []
});

YUI.add("all2", function (Y) {
	Y.log("Subfolder YUI!");
}, "0.0.1", {
	requires: ["other"]
});

YUI.use("all1", "all2", function (Y) {
	Y.log("Subfolder use YUI!");
});

console.log("YUI file finding is trapping this log message.");