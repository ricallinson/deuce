/*global define: true*/

"use strict";

define(["jquery", "yql", "handlebars", "confs", "tmpls"], function ($, yql, handlebars, appConfig, tmpls) {

    /*
        Log that the app has been started.
    */

    console.log("Starting News App");

    /*
        Get our configuration files and templates into variables ready for use.
    */

    var indexTmpl = tmpls["index.hb.html"],
        itemsTmpl = tmpls["items.hb.html"],
        i;

    /*
        Load CSS.
    */

    for (i in appConfig.main.css) {
        $("head").append("<link rel=\"stylesheet\" href=\"" + appConfig.main.css[i] + "\" type=\"text/css\" />");
    }

    /*
        Render the index page for the user.
    */

    $("body").html(indexTmpl);

    /*
        Make a YQL call for the news headlines.
    */

    yql(appConfig.main.query, function (res) {

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

        template = handlebars.compile(itemsTmpl);

        /*
            Render the items with the compiled template.
        */

        html = template(items);

        /*
            Add the HTML to the DOM.
        */

        $(".items").html(html);

        /*
            Log that we have finished.
        */

        console.log("Rendering complete");
    });
});