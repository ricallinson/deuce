# Deuce

__Deuce__ is a developer tool for building serverless web applications with YUI. It allows you to easily create YUI based applications that run locally from the file system. These applications can then be deployed into containers like [Cordova (Phonegap)](http://incubator.apache.org/cordova/) or severed with caching instructions using a [cache manifest](http://en.wikipedia.org/wiki/Cache_manifest_in_HTML5) file.

## Installation
    
    > npm install deuce -g
    > deuce -h

## Usage

With no options provided __Deuce__ will start a connect server on localhost port 3000.

    > deuce
    > Running at http://localhost:3000/index.html

Once running __Deuce__ will serve a single [http://localhost:3000/index.html](http://localhost:3000/index.html) page.

    ./app
        main.js

## Helpers

__Deuce__ comes with some helpers to ease your application creation process.

### main.js

When using the generated "index.html", __Deuce__ will load the "main.js" module automatically.

    define(function () {
        console.log("Hello world!");
    });

### ./configs

Any directory that has the name "configs" will be treated as a bucket of configuration files. You can add any number of ".yaml" and/or ".json" files into this directory. __Deuce__ will map this directory into a module where each file found will be represented as an attribute of the module. For example;

    ./app
        /group
            /configs
                home.json
                away.yaml

With this directory structure __Deuce__ will map the URI [http://localhost:3000/group/confs.js](http://localhost:3000/group/confs.js) to a module like the one below.

    define("group/configs", {
        "away": {
            "key": "val"
        },
        "home": {
            "key": "val"
        }
    });

### ./tmpls

Any directory that has the name "tmpls" will be treated as a bucket of template files. You can add any number of none ".js" files into this directory. __Deuce__ will map this directory into a module where each file found will be represented as an attribute of the module.  For example;

    ./app
        /group
            /tmpls
                home.html
                away.html

With this directory structure __Deuce__ will map the URI [http://localhost:3000/group/tmpls.js](http://localhost:3000/group/tmpls.js) to a module like the one below.

    define("group/tmpls", {
        "away": "<div>{{key}}</div>",
        "home": "<span>{{key}}</span>"
    });

### ./langs

Any directory that has the name "langs" will be treated as a directory of [YUI Language Modules](http://yuilibrary.com/yui/docs/intl/). You can add any number of ".yaml" and ".json" files into this directory. __Deuce__ will map each file into a YUI Language Module where each file found will become a different language. For example;

    ./app
        /group
            /langs
                module.yaml
                /en-us
                    module.yaml
                /fr-fr
                    module.yaml

With this directory structure __Deuce__ will generate the following URI's where each URI is a language module.

    http://localhost:3000/group/langs/module.yaml
    http://localhost:3000/group/langs/en-us/module.yaml
    http://localhost:3000/group/langs/fr-fr/module.yaml

# License

Deuce is released under the MIT license.

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