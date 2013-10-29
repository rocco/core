/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2012 Zynga Inc.
  Copyright 2012-2013 Sebastian Werner
==================================================================================================
*/

"use strict";

(function()
{
	/**
	 * {String} Returns the extension of the given @filename {String}
	 */
	var extractExtension = function(filename)
	{
		// Filter out query string and find last dot to split extension
		var result = filename.match(/\.([^\.\?]+)(?:\?|$)/);

		// Extension found
		if (result != null) {
			return result[1];
		}

		// Support for callback params in URI (JSON-P)
		if (filename.indexOf("callback=") != -1) {
			return "jsonp";
		}

		return null;
	};


	/**
	 * Generic URLs loader queue with support for different type "backend" modules.
	 *
	 * Uses parallel loading where available and load all other resources
	 * sequentially. Sequential loading is done by type so that multiple
	 * different types are loaded in parallel.
	 *
	 * Loader module need to implement the following interface:
	 *
	 * * method load(uri, callback, context, nocache) which calls the callback like callback.call(context, uri, errornous, data)
	 * * constant `SUPPORTS_PARALLEL` with a boolean value whether the loader supports parallel loading
	 */
	core.Module("core.io.Queue",
	{
		/**
		 * Loads the given @uris {String[]} and optionally executes the given @callback {Function}
		 * with the @context {Object?null} after all are completed. One can optionally disable the
		 * browser caching using enforced get parameters via the @nocache {Boolean?false} flag. Typically
		 * the matching loader is figured out automatically based on the file extension but can be
		 * controlled using the @type {String?} parameter.
		 */
		load : function(uris, callback, context, nocache, type)
		{
			if (jasy.Env.isSet("debug"))
			{
				core.Assert.isType(uris, "Array");

				if (callback != null) {
					core.Assert.isType(callback, "Function", "Invalid callback method!");
				}

				if (context != null) {
					core.Assert.isType(context, "Object", "Invalid callback context!");
				}

				if (nocache != null) {
					core.Assert.isType(nocache, "Boolean");
				}

				if (type != null) {
					core.Assert.isType(type, "String");
				}
			}

			// Keys are all URIs which are currently loading
			var loading = {};

			// Data cache for callback return
			var cache = {};

			/**
			 * Maps extensions to loader classes
			 *
			 * #optional(core.io.Script)
			 * #optional(core.io.StyleSheet)
			 * #optional(core.io.Jsonp)
			 * #optional(core.io.Text)
			 * #optional(core.io.Image)
			 */
			var typeLoader =
			{
				js : core.io.Script,
				css : core.io.StyleSheet,
				jsonp : core.io.Jsonp,
				json : core.io.Text,
				txt : core.io.Text,
				md : core.io.Text,
				html : core.io.Text,
				png : core.io.Image,
				jpeg : core.io.Image,
				jpg : core.io.Image,
				gif : core.io.Image
			};

			/**
			 * Registers the given @uri {String} as being loaded and deals with error reports (@errornous {Boolean?false})
			 * and @data {var?null} delivered by the loader.
			 */
			var onLoad = function(uri, errornous, data)
			{
				if (jasy.Env.isSet("debug"))
				{
					core.Assert.isType(uri, "String", "Got invalid URI from loader!");

					if (errornous != null) {
						core.Assert.isType(errornous, "Boolean", "Got invalid errornous flag from loader for uri: " + uri);
					}
				}

				delete loading[uri];

				// Make data available for callback
				if (data != null) {
					cache[uri] = data;
				}

				// Check whether there is more to load
				for (var queued in loading) {
					return;
				}

				// Execute callback
				if (callback) {
					context ? callback.call(context, cache) : callback(cache);
				}
			};

			var executeDirectly = !!callback;
			var autoType = !type;

			// List of sequential items sorted by type
			var sequential = {};

			// Process all URIs
			for (var i=0, l=uris.length; i<l; i++)
			{
				var currentUri = uris[i];

				if (jasy.Env.isSet("debug") && (currentUri === "" || currentUri == null)) {
					throw new Error("Invalid URI to load: " + currentUri);
				}

				if (autoType)
				{
					type = extractExtension(currentUri);

					if (jasy.Env.isSet("debug") && (!type || !typeLoader[type])) {
						throw new Error("Could not figure out loader to use for URI: " + currentUri);
					}
				}

				var loader = typeLoader[type];

				// As we are waiting for things to load, we can't execute the callback directly anymore
				executeDirectly = false;

				// When script is not being loaded already, then start with it here
				// (Otherwise we just added the callback to the queue and wait for it to be executed)
				if (!loading[currentUri])
				{
					// Register globally as loading
					loading[currentUri] = true;

					// Differenciate between loader capabilities
					if (loader.SUPPORTS_PARALLEL)
					{
						loader.load(currentUri, onLoad, null, nocache);
					}
					else
					{
						// Sort in the URI into a type specific queue
						if (sequential[type]) {
							sequential[type].push(currentUri);
						} else {
							sequential[type] = [currentUri];
						}
					}
				}
			}

			// If all scripts are loaded already, just execute the callback
			if (executeDirectly)
			{
				// Nothing to load, execute callback directly
				context ? callback.call(context, cache) : callback(cache);
			}
			else
			{
				/**
				 * Loads the next URI for the given @type {String}
				 */
				var loadNext = function(type)
				{
					var uri = sequential[type].shift();
					if (uri)
					{
						typeLoader[type].load(uri, function(uri, errornous, data)
						{
							onLoad(uri, errornous, data);
							loadNext(type);
						},
						null, nocache);
					}
				};

				// Load and execute first item in each queue
				for (var type in sequential) {
					loadNext(type);
				}
			}
		}
	});
})();

