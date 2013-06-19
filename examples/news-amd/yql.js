/*global define: true*/

"use strict";

define(["jquery"], function ($) {

    /*
        Accepts a YQL query and a callback function.
    */

    return function (query, callback) {

        /*
            If no query was passed, exit.
        */

        if (!query) {
            console.log("No query was passed.");
            callback();
            return;
        }

        /*
            Take the provided query, and add it to a YQL uri.
        */

        var uri = "http://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(query) + "&format=json";

        /*
            Pass the YQL uri and the callback function to jQuery getJSON.
        */

        $.getJSON(uri, callback);
    };
});