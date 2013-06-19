/*jshint yui: true*/

"use strict";

YUI.add("main", function (Y) {

	/*
		Log that the app has been started.
	*/

	Y.log("Starting News App");

	/*
		Get our configuration files and templates into variables ready for use.
	*/

	var appConfig = Y.confs,
		indexTmpl = Y.tmpls["index.hb.html"],
		itemsTmpl = Y.tmpls["items.hb.html"];

	/*
		Load CSS.
	*/

	Y.Get.css(appConfig.main.css, function () {

		/*
			Render the index page for the user.
		*/

		Y.one("body").setContent(indexTmpl);
	});

	/*
		Make a YQL call for the news headlines.
	*/

	Y.YQL(appConfig.main.query, function (res) {

		var items,
			template,
			html;

		/*
			Extract the items from our YQL result object.
		*/

		try {
			items = res.query.results.item;
		} catch (err) {
			items = [appConfig.main.error];
		}

		/*
			Compile the handlebars template ready for use.
		*/

		template = Y.Handlebars.compile(itemsTmpl);

		/*
			Render the items with the compiled template.
		*/

		html = template(items);

		/*
			Add the HTML to the DOM.
		*/

		Y.one(".items").setContent(html);

		/*
			Log that we have finished.
		*/

		Y.log("Rendering complete");
	});

}, "", {
	requires: ["node", "yql", "handlebars", "confs", "tmpls"]
});