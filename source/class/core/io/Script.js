/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2012 Zynga Inc.
  Copyright 2012-2014 Sebastian Werner
==================================================================================================
*/

"use strict";

(function(global)
{
	var doc = global.document;

	// the following is a feature sniff for the ability to set async=false on dynamically created script elements, as proposed to the W3C
	// RE: http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
	var supportsScriptAsync = doc && doc.createElement("script").async === true;

	// Dynamic URI can be shared because we do not support reloading files
	var dynamicExtension = "?r=" + Date.now();

	// Used for shorten calls
	var assignCallback = function(elem, value) {
		elem.onload = elem.onerror = elem.onreadystatechange = value;
	};

	// If native, try to use importScripts; if not available shim importScripts via use of eval and readFileSync.
	if (jasy.Env.isSet("runtime", "native"))
	{
		var importScripts = global.importScripts ? global.importScripts : (function() {
			var Fs = require("fs");
			return function() {
				for (var i=0,ii=arguments.length; i<ii; i++) {
					var uri = arguments[i];
					eval("//@ sourceURL=" + uri + "\n" + Fs.readFileSync(uri, "utf-8"));
				}
			};
		})();
	}

	/**
	 * Generic script loader for features. Could be used for loading feature/class packages after initial load.
	 *
	 * (though limited feature set and file registration not useful for data transaction)
	 */
	core.Module("core.io.Script",
	{
		/** Whether the loader supports parallel requests */
		SUPPORTS_PARALLEL : supportsScriptAsync || jasy.Env.isSet("engine", "gecko") || jasy.Env.isSet("engine", "opera"),

		/** {String|null} URL prefix to prepend to given relative URL. Used by worker script loading */
		URL_PREFIX : null,


		/**
		 * Loads a JavaScript file from the given @uri {String} and fires a
		 * @callback {Function} (in @context {Object?}) when the script was loaded.
		 * Optionally appends an random `GET` parameter to omit caching when
		 * @nocache {Boolean?false} is enabled..
		 */
		load : function(uri, callback, context, nocache)
		{
			if (jasy.Env.isSet("debug"))
			{
				core.Assert.isType(uri, "String");

				if (callback != null) {
					core.Assert.isType(callback, "Function", "Invalid callback method!");
				}

				if (context != null) {
					core.Assert.isType(context, "Object", "Invalid callback context!");
				}

				if (nocache != null) {
					core.Assert.isType(nocache, "Boolean");
				}
			}

			if (jasy.Env.isSet("debug") && nocache == null) {
				nocache = true;
			}

			// Browser-less (e.g. NodeJS) support
			if (jasy.Env.isSet("runtime", "native"))
			{
				importScripts(uri);
				if (callback) {
					callback.call(context||global, uri, false);
				}

				return;
			}
			else if (jasy.Env.isSet("runtime", "worker"))
			{
				if (core.io.Script.URL_PREFIX != null && uri[0] != "/" && uri.indexOf(":/") < 0) {
					uri = core.io.Script.URL_PREFIX + uri;
				}
				try {
					importScripts(uri);
				} catch (e) {
					e.fileName = uri;
					throw e;
				}
				if (callback) {
					callback.call(context||global, uri, false);
				}
			}
			else
			{
				var head = doc.head;
				var elem = doc.createElement("script");

				// load script via 'src' attribute, set onload/onreadystatechange listeners
				assignCallback(elem, function(e)
				{
					if (!e) {
						e = global.event;
					}

					var errornous = e.type === "error";
					if (errornous)
					{
						console.warn("Could not load script: " + uri);
					}
					else if (e.type == "load" || (/loaded|complete/.test(elem.readyState) && (!doc.documentMode || doc.documentMode < 9)))
					{
						// ready
						// jshint -W035
					}
					else
					{
						// not yet ready
						return;
					}

					// Prevent memory leaks
					assignCallback(elem, null);

					// Execute callback
					if (callback) {
						callback.call(context||global, uri, errornous, elem);
					}
				});

				elem.src = nocache ? uri + dynamicExtension : uri;

				if (supportsScriptAsync) {
					elem.async = false;
				}

				head.insertBefore(elem, head.firstChild);
			}
		}
	});
})(core.Main.getGlobal());

