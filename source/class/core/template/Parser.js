/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2012 Zynga Inc.
  Copyright 2012-2013 Sebastian Werner
--------------------------------------------------------------------------------------------------
  Based on the work of:
  Hogan.JS by Twitter, Inc.
  https://github.com/twitter/hogan.js
  Licensed under the Apache License, Version 2.0
  http://www.apache.org/licenses/LICENSE-2.0
==================================================================================================
*/

"use strict";

(function()
{
	var tagSplitter = /(\{\{[^\{\}}]*\}\})/;
	var tagMatcher = /^\{\{\s*([#\^\/\?\!\<\>\$\=_]?)\s*([^\{\}}]*?)\s*\}\}$/;


	/**
	 * {Array} Processes a list of @tokens {String[]} to create a tree.
	 * Optional @stack {Array?} is used internally during recursion.
	 */
	function buildTree(tokens, stack)
	{
		var instructions = [];
		var opener = null;
		var token = null;

		while (tokens.length > 0)
		{
			token = tokens.shift();

			// Sections (and inverted sections) are stored structured in the tree
			if (token.tag == "#" || token.tag == "^" || token.tag == "?")
			{
				stack.push(token);
				token.nodes = buildTree(tokens, stack);
				instructions.push(token);
			}
			else if (token.tag == "/")
			{
				if (jasy.Env.isSet("debug") && stack.length === 0) {
					throw new Error("Closing tag without opener: /" + token.name);
				}

				opener = stack.pop();

				if (jasy.Env.isSet("debug") && token.name != opener.name) {
					throw new Error("Nesting error: " + opener.name + " vs. " + token.name);
				}

				return instructions;
			}

			// All other tokens are just copied into the structure
			else
			{
				instructions.push(token);
			}
		}

		if (jasy.Env.isSet("debug") && stack.length > 0) {
			throw new Error("Missing closing tag: " + stack.pop().name);
		}

		return instructions;
	}


	/**
	 * This is the Parser of the template engine and transforms the template text into a tree of tokens.
	 */
	core.Module("core.template.Parser",
	{
		/**
		 * {String[]} Tokenizer for template @text {String}. Returns an array of tokens
		 * where tags are returned as an object with the keys `tag` and `name` while
		 * normal strings are kept as strings.
		 *
		 * Optionally you can keep white spaces (line breaks,
		 * leading, trailing, etc.) by enabling @nostrip {Boolean?false}.
		 */
		tokenize: function(text, nostrip)
		{
			if (jasy.Env.isSet("debug"))
			{
				core.Assert.isType(text, "String", "Template text must be type of string.");

				if (nostrip != null) {
					core.Assert.isType(nostrip, "Boolean", "Nostrip must be type of boolean.");
				}
			}

			if (nostrip !== true)
			{
				var splits = text.split("\n");
				for (var i=0, l=splits.length; i<l; i++) {
					splits[i] = splits[i].trim();
				}

				text = splits.join("");
			}

			var tokens = [];
			var splitted = text.split(tagSplitter);
			var matched;

			for (var i=0, l=splitted.length; i<l; i++)
			{
				var segment = splitted[i];
				if (segment.charAt(0) == "{" && (matched = tagMatcher.exec(segment)))
				{
					var tag = matched[1] || "$";

					// Ignore comment types
					if (tag != "!")
					{
						tokens.push({
							tag: tag,
							name: matched[2]
						});
					}
				}
				else if (segment != "")
				{
					// Only add non-empty strings
					tokens.push(segment);
				}
			}

			return tokens;
		},


		/**
		 * {String[]} Returns the token tree of the given template @text {String}.
		 *
		 * A token holds the following information:
		 *
		 * - `tag`: tag of the token
		 * - `name`: name of the token
		 * - `nodes`: children of the node
		 *
		 * Optionally you can keep white spaces (line breaks,
		 * leading, trailing, etc.) by enabling @nostrip {Boolean?false}.
		 */
		parse: function(text, nostrip) {
			return buildTree(this.tokenize(text, nostrip), []);
		}
	});
})();

