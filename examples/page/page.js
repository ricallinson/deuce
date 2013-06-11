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

/*global define, window, History*/

"use strict";

define(["jquery"], function ($) {

    var Page;

    Page = function (regex, fn) {
        this.stack = [];
    };

    Page.prototype.get = function(regex, fn) {

        // default route to '/'
        if (typeof regex !== "string") {
            fn = regex;
            regex = ".*";
        }

        if (regex) {
            regex = new RegExp(regex);
        }

        this.stack.push({regex: regex, handle: fn});
    };

    Page.prototype.handle = function (url, out) {

        var self = this,
            index = 0,
            layer,
            request = {},
            response = {};

        request.url = url;

        response.send = function (data) {

            // Set the new content (use animation later)
            $(self.target).html(data);

            // Bind to all new anchors
            $(self.target + " a").click(function (e) {
                var href = $(e.target).attr("href");
                if (href[0] === "/" || href[0] === ".") {
                    e.preventDefault();
                    History.pushState(null, null, href);
                }
            });
        };

        function next(err) {

            // next callback
            layer = self.stack[index];
            index = index + 1;

            if (!layer) {
                // delegate to parent
                if (out) {
                    out(err);
                    return;
                }
                // or deal with here
                if (err) {
                    // unhandled error
                    console.log(err);
                }
                // we are done
                return;
            }

            // try and handle the url
            try {
                if (url === undefined) {
                    url = "/";
                }

                // skip this layer if the route doesn't match.
                if (layer.regex && !layer.regex.test(url)) {
                    next(err);
                    return;
                }

                if (err) {
                    next(err);
                } else {
                    layer.handle(request, response, next);
                }
            } catch (e) {
                next(e);
            }
        }

        // kick-off the work
        next();
    };

    Page.prototype.listen = function (target) {

        var self = this;

        if (!target) {
            this.target = "body";
        }

        // Bind to StateChange Event
        History.Adapter.bind(window, 'statechange', function () { // Note: We are using statechange instead of popstate
            self.handle(History.getState().hash);
        });

        self.handle(History.getState().url);
    };

    return new Page();
});