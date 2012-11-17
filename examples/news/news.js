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

/*global YUI*/

"use strict";

YUI.add("init", function (Y) {

    Y.YQL("select title, description, link from rss where url=\"http://rss.news.yahoo.com/rss/topstories\"", function (raw) {

        var items = [{title: "Oops"}, {title: "Oops"}, {title: "Oops"}, {title: "Oops"}, {title: "Oops"}, {title: "Oops"}],
            template,
            colors = ["#216477", "#009999", "#1D7373", "#057D9F", "#006363"],
            nodes;

        if (raw.query && raw.query.results) {
            items = raw.query.results.item;
        }

        template = Y.Handlebars.compile(Y.tmpls["news-tmpls"]["items.hb.html"]);

        Y.one("body").setContent(template({items: items}));

        Y.all("li").each(function (node) {
            node.setStyle("background", colors[0]);
            node.show(true);
            node.removeClass("hidden");
            colors.push(colors.shift());
        });

        Y.one(".items").delegate("click", function (e) {
            var item = e.currentTarget,
                news = item.one(".preview");

            item.ancestor(".items").all(".preview").transition({
                duration: 0.75,
                easing: 'ease-in',
                height: 0
            });

            item.one(".preview").transition({
                duration: 0.75,
                easing: 'ease-out',
                height: item.one(".preview").getDOMNode().scrollHeight
            });

        }, "li");
    });

}, "", {
    requires: ["yql", "news-tmpls", "handlebars", "node", "transition"]
});