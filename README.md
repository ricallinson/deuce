# YUI3 Offline

YUI3 Offline is a helper tool for building offline web applications with YUI3. It allows you to easily create a javascript applications that run locally from the file system. These applications can then be deployed into containers like [Cordova (Phonegap)](http://incubator.apache.org/cordova/) or severed with caching instructions using a [cache manifest](http://en.wikipedia.org/wiki/Cache_manifest_in_HTML5) file.

## Installation

	> git clone https://github.com/capecodehq/yui3-offline.git
	> cd ./yui3-offline
    > ./bin/yui3-offline --help

	Usage: yui3-offline [options]

    Options:

	-h, --help         output usage information
	-V, --version      output the version number
	-v, --verbose      runtime info
	-p, --port [port]  which port to use
	-r, --root [dir]   which directory to run from
	-b, --build [dir]  build all files for the web app to the given directory
	-u, --uglify       compress all javascript files using uglify

## Usage

With no options provided __YUI3 Offline__ will start a localhost connect server on port 3000.

	> ./bin/yui3-offline
	> Running at http://localhost:3000/index.html

Once running it will serve a single [http://localhost:3000/index.html](http://localhost:3000/index.html) page and YUI3 from the path [http://localhost:3000/yui](http://localhost:3000/yui). The version of [YUI3](http://yuilibrary.com/) used is one installed with __YUI3 Offline__. You can check this by running the following command.

	> npm ls yui

### init.js

Once opened in a browser __YUI3 Offline__ will try and (use)[http://yuilibrary.com/yui/docs/yui/] a module named "init".

	YUI.add("init", function (Y) {
		Y.log("Hello world!");
	});

### index.html

Unless an "index.html" file is found in the application directory root __YUI3 Offline__ will generate one for you. It uses default settings that can be overridden via configuration found in either a "init.yml" or "init.json" file.

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