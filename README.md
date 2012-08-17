# YUI3 Offline

__YUI3 Offline__ is a developer tool for building offline web applications with YUI. It allows you to easily create YUI based applications that run locally from the file system. These applications can then be deployed into containers like [Cordova (Phonegap)](http://incubator.apache.org/cordova/) or severed with caching instructions using a [cache manifest](http://en.wikipedia.org/wiki/Cache_manifest_in_HTML5) file.

## Installation

	> git clone https://github.com/capecodehq/yui3-offline.git
	> cd ./yui3-offline
	> npm install .
    > ./bin/yui3-offline --help

## Usage

With no options provided __YUI3 Offline__ will start a connect server on localhost port 3000.

	> ./bin/yui3-offline
	> Running at http://localhost:3000/index.html

Once running __YUI3 Offline__ will serve a single [http://localhost:3000/index.html](http://localhost:3000/index.html) page. This page defines a YUI global configuration object which includes all ".js" files that are YUI Modules and were found in or below the application directory. Any ".js" files found which were not YUI Modules will still be available but called out on server start. For example, the directory structure below;

	./app
		init.js
		/lib
			/my-yui-module.js
			/not-yui.js

When used with __YUI3 Offline__;

	> cd ./app
	> yui3-offline

Serves the following URI's;

	http://localhost:3000/index.html
	http://localhost:3000/init.js
	http://localhost:3000/lib/my-yui-module.js
	http://localhost:3000/lib/not-yui.js

In addition to the above, all [YUI Modules](http://yuilibrary.com/yui/docs/guides/) are a available on the the URI [http://localhost:3000/yui](http://localhost:3000/yui). The version of [YUI](http://yuilibrary.com/) used is the same as the one installed with __YUI3 Offline__. You can check this by running the following command.

	> npm ls yui

## Helpers

__YUI3 Offline__ comes with some helpers to ease your application creation process.

### YUI.add("init");

When using the generated "index.html", __YUI3 Offline__ will try and [.use()](http://yuilibrary.com/yui/docs/yui/) a module named "init". In your application directory you can create a ".js" file with any name and insert following.

	YUI.add("init", function (Y) {
		Y.log("Hello world!");
	});

When you start __YUI3 Offline__ if will load the "init" module automatically.

### ./confs

Any directory that has the name "confs" will be treated as a bucket of configuration files. You can add any number of ".yaml" and ".json" files into this directory. __YUI3 Offline__ will map this directory into a YUI Module where each file found will be represented as an attribute of the module. For example;

	./app
		/group
			/confs
				home.json
				away.yaml

With this directory structure __YUI3 Offline__ will map the URI [http://localhost:3000/group/confs.js](http://localhost:3000/group/confs.js) to a YUI Module like the one below. The name of the YUI Module is the parent directory appended with the string "-confs".

	YUI.add("group-confs", function (Y) {
		Y.namespace("confs")["group-confs"] = {
	    	"away": {
	        	"key": "val"
	    	},
	    	"home": {
	        	"key": "val"
	    	}
		};
	});

### ./tmpls

Any directory that has the name "tmpls" will be treated as a bucket of template files. You can add any number of none ".js" files into this directory. __YUI3 Offline__ will map this directory into a YUI Module where each file found will be represented as an attribute of the module.  For example;

	./app
		/group
			/tmpls
				home.html
				away.html

With this directory structure __YUI3 Offline__ will map the URI [http://localhost:3000/group/tmpls.js](http://localhost:3000/group/tmpls.js) to a YUI Module like the one below. The name of the YUI Module is the parent directory appended with the string "-tmpls".

	YUI.add("group-tmpls", function (Y) {
		Y.namespace("tmpls")["group-tmpls"] = {
	    	"away": "<div>{{key}}</div>",
	    	"home": "<span>{{key}}</span>"
		};
	});

### ./langs

Any directory that has the name "langs" will be treated as a directory of [YUI Language Modules](http://yuilibrary.com/yui/docs/intl/). You can add any number of ".yaml" and ".json" files into this directory. __YUI3 Offline__ will map each file into a YUI Language Module where each file found will become a different language. For example;

	./app
		/group
			/langs
				module_en.yaml
				module_en-US.json
				module_en-GB.yaml

With this directory structure __YUI3 Offline__ will generate the following URI's where each URI is a YUI Language Module.

	http://localhost:3000/group/langs/module_en.js
	http://localhost:3000/group/langs/module_en-US.js
	http://localhost:3000/group/langs/module_en-GB.js

## Customize

__YUI3 Offline__ attempts to provide sensible defaults. However, if these do not meet your requirements here are some options that may help you.

### init.yml & init.json

You can provide either an "init.yaml" or an "init.json" in the your application directory root.

	./app
		init.yaml
		init.js

If __YUI3 Offline__ encounters one of these at server start it will use the values defined there in place of its defaults. Below are the currently supported keys;

	# The URL to use for loading YUI
	url: "./yui/yui/yui.js"

	# The "YUI.GlobalConfig" that will be used
	yui:
	    debug: true
	    combine: false
	    base: "./yui/"

	# Arrays to hold strings that you want in either
	# the <head> or <body> tags of the html page
	html:
	    head: 
	        - "<title>YUI Offline</title>"
	    body:
	        - "<!-- YUI Offline -->"

### index.html

Unless an "index.html" file is found in the application directory root, __YUI3 Offline__ will generate one for you. It uses default settings that can be overridden via the configuration files "init.yaml" or "init.json".

	<html>
	    <head>
	        <title>YUI3 Offline</title>
	        <script src="./yui/yui/yui.js"></script>
	        <script type="text/javascript">
	        	YUI.GlobalConfig = {
					"debug":true,
					"combine":false,
					"base":"./yui/",
					"modules":{
						"init":{
							"fullpath":"./init.js"
						}
					}
				};
				YUI().use("init");
	        </script>
	    </head>
	    <body>
			<!-- YUI3 Offline -->
	    </body>
	</html>

# License

yui3-offline is released under the MIT license.

(The MIT License)

Copyright (c) 2012 Richard S Allinson <rsa@mountainmansoftware.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.