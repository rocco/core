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
	/** {Map} Internal map of delegates for building URLs */
	var delegates = {};

	// Internal data storage
	var profile = null;
	var assets = {};
	var sprites = {};

	/** {Map} Expands internal type names to user readable ones */
	var typeExpansion =
	{
		i: "image",
		a: "audio",
		v: "video",
		f: "font",
		t: "text",
		b: "binary",
		o: "other"
	};


	/**
	 * {Array} Resolves the given @id {String} into the stored entry of the asset data base.
	 */
	var resolve = function(id)
	{
		if (id.constructor == Object) {
			return id;
		}

		if (jasy.Env.isSet("debug")) {
			core.Assert.isType(id, "String");
		}

		// Support placeholders for environment variables
		if (id.indexOf("{{") !== -1)
		{
			id = id.replace(/{{([a-zA-Z0-9]+)}}/g, function(match, field) {
				return jasy.Env.getValue(field);
			});
		}

		var splits = id.split("/");
		var current = assets;
		for (var i=0, l=splits.length; current && i<l; i++) {
			current = current[splits[i]];
		}

		return current || null;
	};


	/**
	 * {String} Returns the URI for the given @entry {Map} (as returned by #resolve) and @id {String}.
	 */
	var entryToUri = function(entry, id)
	{
		if (jasy.Env.isSet("debug"))
		{
			core.Assert.isType(id, "String", "Unknown asset ID: " + id);
			core.Assert.isType(entry, "Map", "Invalid entry: " + entry + " for asset ID: " + id);
		}

		// Support placeholders for environment variables
		if (id.indexOf("{{") !== -1)
		{
			id = id.replace(/{{([a-zA-Z0-9]+)}}/g, function(match, field) {
				return jasy.Env.getValue(field);
			});
		}

		var delegate = delegates[profile.name];
		if (delegate) {
			var url = delegate(profile, id, entry);
		} else if (entry.h) {
			var url = (profile.root || "") + entry.h + id.slice(id.lastIndexOf("."));
		} else {
			var url = (profile.root || "") + (entry.u || id);
		}

		return url;
	};


	/**
	 * Merged two data maps @src {Map} and @dst {Map} recursively by using as much of
	 * the original data as possible (no copying). Will never override existing values!
	 */
	var mergeData = function(src, dst)
	{
		for (var key in src)
		{
			var srcValue = src[key];
			var dstValue = dst[key];

			// Just use value from source (works for folders and files)
			if (dstValue == null) {
				dst[key] = srcValue;
			}

			// Deep merge
			else if (srcValue.constructor === Object && dstValue.constructor === Object) {
				mergeData(srcValue, dstValue);
			}
		}
	};


	/**
	 * Jasy interface to asset API.
	 */
	core.Module("jasy.Asset",
	{
		resolve : resolve,
		entryToUri : entryToUri,

		/**
		 * {String} Returns the sprite ID for the given data @spriteNumber {Integer} and image
		 * @assetId {String}.
		 */
		resolveSprite : function(spriteNumber, assetId)
		{
			if (jasy.Env.isSet("debug"))
			{
				core.Assert.isType(spriteNumber, "Number");
				core.Assert.isType(assetId, "String");
			}

			// Sprite data format: index, left, top
			var spriteId = sprites[spriteNumber];

			// Explicit root path
			if (spriteId.charAt(0) == "/") {
				spriteId = spriteId.slice(1);
			}

			// Local path (same folder as requested image)
			else if (spriteId.indexOf("/") == -1)
			{
				var pos = assetId.lastIndexOf("/");
				if (pos != -1) {
					spriteId = assetId.slice(0, pos+1) + spriteId;
				}
			}

			return spriteId;
		},


		/**
		 * Adds the given asset @data {Map}. This is typically generated and called by Jasy.
		 */
		addData : function(data)
		{
			// Validate input data
			if (jasy.Env.isSet("debug"))
			{
				core.Assert.isType(data, "Map", "Asset data must be a map.");
				core.Assert.isType(data.profile, "Map", "Asset data must define a profile for accessing assets.");
				core.Assert.isType(data.assets, "Map", "Asset data must define a structure of assets under the assets keys.");

				if ("sprites" in data) {
					core.Assert.isType(data.sprites, "Array", "Sprite data inside assets must be delivered as an Array.");
				}
			}

			// Initial data
			if (!profile)
			{
				profile = data.profile;
				assets = data.assets;
				sprites = data.sprites;
			}

			// Inject data
			else
			{
				mergeData(data.assets, assets);
				mergeData(data.sprites, sprites);
			}
		},


		/**
		 * Resets the internal state of the asset class.
		 */
		resetData : function() {
			profile = assets = sprites = null;
		},


		/**
		 * Registers a @delegate {Function} for URL construction of the given @profile {String}.
		 * The @delegate is called with the parameters `profile`, `id` and `entry` and should return a fully qualified URL.
		 */
		registerDelegate : function(profile, delegate)
		{
			// Validate input data
			if (jasy.Env.isSet("debug"))
			{
				core.Assert.isType(profile, "String");
				core.Assert.isType(delegate, "Function");
			}

			delegates[profile] = delegate;
		},


		/**
		 * {Boolean} Whether the registry has information about the given asset @id {String}.
		 */
		has : function(id)
		{
			if (jasy.Env.isSet("debug")) {
				core.Assert.isType(id, "String");
			}

			return !!(resolve(id));
		},


		/**
		 * {String} Returns the type of the given asset @id {String}. One of
		 * `image`, `audio`, `video`, `font`, `text`, `binary`, `other`.
		 */
		getType : function(id)
		{
			if (jasy.Env.isSet("debug")) {
				core.Assert.isType(id, "String", "Invalid asset ID (no string): " + id + "!");
			}

			var entry = resolve(id);
			if (jasy.Env.isSet("debug") && !entry) {
				throw new Error("Could not figure out size of unknown image: " + id);
			}

			return typeExpansion[entry.t] || "other";
		},


		/**
		 * {String} Returns the URI for the given asset @id {String}
		 */
		toUri : function(id)
		{
			if (jasy.Env.isSet("debug")) {
				core.Assert.isType(id, "String");
			}

			var resolved = resolve(id);
			if (jasy.Env.isSet("debug")) {
				core.Assert.isNotNull(resolved, "Failed to resolve asset ID: " + id);
			}

			return entryToUri(resolved, id);
		}
	});

})();
