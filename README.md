# YUI3 Offline

__YUI3 Offline__ is a helper tool for building offline web applications with YUI3. It allows you to easily create YUI3 based applications that run locally from the file system. These applications can then be deployed into containers like [Cordova (Phonegap)](http://incubator.apache.org/cordova/) or severed with caching instructions using a [cache manifest](http://en.wikipedia.org/wiki/Cache_manifest_in_HTML5) file.

## Installation

	> git clone https://github.com/capecodehq/yui3-offline.git
	> cd ./yui3-offline
    > ./bin/yui3-offline --help

## Usage

With no options provided __YUI3 Offline__ will start a connect server on localhost port 3000.

	> ./bin/yui3-offline
	> Running at http://localhost:3000/index.html

Once running __YUI3 Offline__ will serve a single [http://localhost:3000/index.html](http://localhost:3000/index.html) page. This page defines a YUI global configuration object which includes all ".js" files that are YUI Modules and were found in or below the application directory. Any ".js" files found which were not YUI Modules will still be available but throw an error on server start. For example, the directory structure below;

	./app
		init.js
		/lib
			/my-yui-module.js
			/not-yui.js

Maps to the following URI's;

	http://localhost:3000/init.js
	http://localhost:3000/lib/my-yui-module.js
	http://localhost:3000/lib/not-yui.js

In addition to the above, all [YUI3 Modules](http://yuilibrary.com/yui/docs/guides/) are a available on the the URI [http://localhost:3000/yui](http://localhost:3000/yui). The version of [YUI3](http://yuilibrary.com/) used is the same as the one installed with __YUI3 Offline__. You can check this by running the following command.

	> npm ls yui

## Helpers

__YUI3 Offline__ comes with some helpers to ease your application creation process.

### YUI.add("init");

When using the generated "index.html", __YUI3 Offline__ will try and [.use()](http://yuilibrary.com/yui/docs/yui/) a module named "init".

	YUI.add("init", function (Y) {
		Y.log("Hello world!");
	});

### ./confs

Any directory that has the name "confs" will be treated as a bucket of configuration files. You can add any number of ".yaml" and ".json" files into this directory. __YUI3 Offline__ will map this directory into a YUI Module where each file found will be represented as an attribute of the module.

	./app
		/group
			/confs
				home.json
				away.yaml

From this directory structure __YUI3 Offline__ will map the URI [http://localhost:3000/group/confs.js](http://localhost:3000/group/confs.js) to a YUI Module like the one below.

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

Any directory that has the name "tmpls" will be treated as a bucket of template files. You can add any number of none "*.js" files into this directory. __YUI3 Offline__ will map this directory into a YUI Module where each file found will be represented as an attribute of the module.

	./app
		/group
			/tmpls
				home.html
				away.html

From this directory structure __YUI3 Offline__ will map the URI [http://localhost:3000/group/tmpls.js](http://localhost:3000/group/tmpls.js) to a YUI Module like the one below.

	YUI.add("group-tmpls", function (Y) {
		Y.namespace("tmpls")["group-tmpls"] = {
	    	"away": "<div>{{key}}</div>",
	    	"home": "<span>{{key}}</span>"
		};
	});
					
### index.html

Unless an "index.html" file is found in the application directory, __YUI3 Offline__ will generate one for you. It uses default settings that can be overridden via configuration found in either a "init.yml" or "init.json" file.

	<html>
	    <head>
	        <title>YUI Offline</title>
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
			<!-- YUI Offline -->
	    </body>
	</html>

### init.yml & init.json

	TODO

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