/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2012 Zynga Inc.
  Copyright 2012-2014 Sebastian Werner
==================================================================================================
*/

"use strict";

/**
 * Parses the URL of the location at loadtime into parameters and make them easily available via {#get()}.
 */
core.Module("core.detect.Param",
{
	get : (function()
	{
		if (jasy.Env.isSet("runtime", "browser")) {
			var items = location.search.substring(1).split("&");
		} else {
			var items = ""; // TODO: NodeJS support
		}

		var map = {};

		var translate =
		{
			"true" : true,
			"false" : false,
			"null" : null
		};

		for (var i=0, l=items.length; i<l; i++)
		{
			var item = items[i];
			var pos = item.indexOf("=");

			var name = pos == -1 ? item : item.substring(0, pos);
			var value = pos == -1 ? true : item.substring(pos+1);

			if (value in translate) {
				value = translate[value];
			} else if ("" + parseFloat(value, 10) == value) {
				value = parseFloat(value, 10);
			}

			map[name] = value;
		}

		// Cleanup temporary reference types
		items = translate = null;

		/**
		 * {String} Returns the value of the given parameter @name {String}.
		 */
		return function get(name) {
			return name in map ? map[name] : null;
		}
	})()
});
