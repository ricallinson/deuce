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

/*global define*/

"use strict";

define(["jquery"/*history*/], function ($) {

	var stack = [];

	function page(regex, fn) {

		// default route to '/'
	    if ('string' !== typeof regex) {
	        fn = regex;
	        regex = null;
	    }

	    if (regex) {
	        regex = new RegExp(regex);
	    }

	    stack.push({regex: regex, handle: fn});
	}

	page.handle = function (url, out) {

		var index = 0,
	        layer;

	    function next(err) {

	        // next callback
	        layer = stack[index];
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
	                layer.handle(url, next);
	            }
	        } catch (e) {
	            next(e);
	        }
	    }

	    // kick-off the work
	    next();
	}

	page.listen = function (target) {

		if (!target) {
			target = "body";
		}

		// Bind to StateChange Event
	    History.Adapter.bind(window, 'statechange', function () { // Note: We are using statechange instead of popstate
	        page.handle(History.getState().hash);
	    });

	    // Bind to all click events
	    $(target + " a").click(function (e) {
	    	e.preventDefault();
	    	History.pushState(null, null, $(e.target).attr("href"));
	    });

		page.handle(History.getState().url);
	}

	// History.pushState(null, null , "?page=" + path + "+me=to");

    return page;
});