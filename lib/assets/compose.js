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

define(function () {

	/*
		This function calls "apply" on the "key" in the "map" object
		and adds the result to the "done" object as attribute "key".

		If the attribute "params" is found on the object "cfg" it is 
		assumed to be an array of items and they will be passed to 
		function being called.
	*/

	function execute(done, map, key, cfg, fn) {

		var
			/*
				Create and empty array for use by require().
			*/

			requires = [],

			/*
				Copy the params array by calling concat().
				We do this so any changes made to it are not shared.
			*/

			args = cfg.params.concat(),

			/*
				The array created from the string discribing an AMD file.
			*/

			callableStringAsArray,

			/*
				The function name that may be used if we require an AMD file.
			*/

			callableFuncName;

		/*
			If our attribute in the map is a string we assume it is 
			an AMD file and it will need to be loaded using require().
		*/

		if (typeof map[key] === "string") {

			/*
				The string could be in one of two formats.

				AMD File: "my/amd/file"

				or;

				AMD File + Function Name: "my/amd/file.func"
			*/

			callableStringAsArray = map[key].split(".");

			/*
				The will always be a first item in the array at it will be our AMD file to load.
			*/

			requires = [callableStringAsArray[0]];

			/*
				If there is a second array item it is the function name we have to call.
			*/

			if (callableStringAsArray.length === 2) {
				callableFuncName = callableStringAsArray[1];
			}
		}

		/*
			The AMD file is loaded here. Even if we don't have an AMD file 
			to load we still call require using an empty array.
		*/

		require(requires, function (callable) {

			/*
				As we don't know if a module was loaded we check.
				If one was not loaded then we assume the original 
				attribute in the map is a function we can call.
			*/

			if (!callable) {
				callable = map[key];
			} else if (callableFuncName) {
				callable = callable[callableFuncName];
			}

			/*
				We may have some arguments to pass to the function we are 
				about to call "apply()" on so the callback function is
				appended to the the "args" array we made earlier.
			*/

			args.push(function (data) {
				done[key] = data;
				done.COUNT = done.COUNT - 1;
				if (done.COUNT <= 0) {
					delete done.COUNT;
					fn(done);
				}
			});

			/*
				Finally we call "apply()" passing in the scope we
				got from the "cfg" object and the "args" array we built above.
			*/

			callable.apply(cfg.scope, args);
		});
	}

	/*
		This function marshals the execution of each item in the map.
	*/

	function compose(map, fn, cfg) {

		var key,
			done = {
				COUNT: 0
			};

		/*
			Make sure the value of "cfg" is an object.
		*/

		if (!cfg) {
			cfg = {};
		}

		/*
			If no scope was provided in "cfg" set it to "undefined".
		*/

		if (!cfg.scope) {
			cfg.scope = undefined;
		}

		/*
			If no "params" array was provided in "cfg" add one.
		*/

		if (!cfg.params) {
			cfg.params = [];
		}

		/*
			Set a "COUNT" attribute on the "done" object.
			This is used to confirm when all the items in the map are "executed".
		*/

		for (key in map) {
			if (map.hasOwnProperty(key)) {
				done.COUNT = done.COUNT + 1;
			}
		}

		/*
			Finally pass all out inputs into the "execute" function to do the work.
		*/

		for (key in map) {
			if (map.hasOwnProperty(key)) {
				execute(done, map, key, cfg, fn);
			}
		}
	}

	return compose;
});