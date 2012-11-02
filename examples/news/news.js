YUI.add("init", function (Y) {

	Y.YQL("select title, description, link from rss where url=\"http://rss.news.yahoo.com/rss/topstories\"", function (raw) {
		
		var items = [{title: "Oops"}, {title: "Oops"}, {title: "Oops"}, {title: "Oops"}, {title: "Oops"}, {title: "Oops"}],
			template,
			colors = ["#216477", "#009999", "#1D7373", "#057D9F", "#006363"],
			nodes;

		if (raw.query && raw.query.results ) {
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