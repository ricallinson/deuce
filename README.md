# Deuce

[![Build Status](https://secure.travis-ci.org/ricallinson/deuce.png?branch=master)](http://travis-ci.org/ricallinson/deuce)

__Deuce__ is a developer tool for building serverless single page web applications with JavaScript. It allows you to  create applications that run locally from the file system. These applications can then be deployed into containers like [Cordova (Phonegap)](http://incubator.apache.org/cordova/) or severed with caching instructions using a [cache manifest](http://en.wikipedia.org/wiki/Cache_manifest_in_HTML5) file.

## Developer Installation
	
	git clone git@github.com:ricallinson/deuce.git
	cd ./deuce
	npm i

## Examples

For a YUI example;

	./bin/deuce --root ./examples/news-yui

For an AMD, Jquery example;

	./bin/deuce --loader amd --root ./examples/news-amd

# Info

## EMFILE error

If you get an "EMFILE error" when running the build command on osx it's because you have too many files open. You can work around this by running the following command which increase the number of files you can open.

	ulimit -S -n 5000

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