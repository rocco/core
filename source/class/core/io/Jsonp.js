/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2012 Zynga Inc.
  Copyright 2012-2014 Sebastian Werner
--------------------------------------------------------------------------------------------------
  Based on the work of Andrea Giammarchi
  Copright WebReflection Essential - Mit Style
==================================================================================================
*/

"use strict";

if (jasy.Env.isSet("runtime", "browser"))
{
	(function(global, doc)
	{
		var id = 0;
		var prefix = "__JSONP__";
		var head = doc.head;

		// Dynamic URI can be shared because we do not support reloading files
		var dynamicExtension = "&r=" + Date.now();

		/**
		 * Async JSON-P loader
		 *
		 */
		core.Module("core.io.Jsonp",
		{
			/** {Boolean} Whether the loader supports parallel requests. Always true for images. */
			SUPPORTS_PARALLEL : true,

			/**
			 * Loads an JSONP via the given @uri {String} and fires a @callback {Function} (in the given @context {Object?})
			 * when the data was loaded.
			 *
			 * Optionally appends an random `GET` parameter to omit caching when @nocache {Boolean?false} is enabled.
			 */
			load : function load(uri, callback, context, nocache)
			{
				if (core.io.Util.isRelativeUrl(uri)) {
					uri = jasy.Env.getValue("jasy.url") + uri;
				}

				function JSONPResponse()
				{
					try {
						delete global[src];
					} catch(e) {
						global[src] = null;
					}

					head.removeChild(script);
					callback.apply(context||global, arguments);
				}

				var src = prefix + id++;
				var script = doc.createElement("script");

				global[src] = JSONPResponse;

				head.insertBefore(script, head.lastChild);
				script.src = uri + "=" + src + (nocache ? dynamicExtension : "");
			}
		});
	})(core.Main.getGlobal());
}
