/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2012 Zynga Inc.
  Copyright 2012-2014 Sebastian Werner
==================================================================================================
*/

"use strict";

(function()
{
	// Requires DOM interface
	if (jasy.Env.isSet("runtime", "native")) {
		return;
	}

	var measureNode = document.createElement("div");
	var measureStyle = measureNode.style;

	measureStyle.position = "absolute";
	measureStyle.left = measureStyle.top = "-1000px";
	measureStyle.visibility = "hidden";

	var emptyStyles = {};

	var textNode = document.createTextNode('');
	textNode.nodeValue = "";
	measureNode.appendChild(textNode);

	document.body.appendChild(measureNode);

	/**
	 * Utility class to work with text e.g. measuring, formatting, etc.
	 */
	core.Module("core.bom.Text", {

		/**
		 * {Map} Returns the `width` and `height` of the given @text {String} with the given
		 * @styles {Map} (supports `fontFamily`, `fontSize`, `fontStyle` and `lineHeight`).
		 * Supports optional maximum @width {Number ? "auto"} for supporting text wrapping.
		 */
		measure: function(text, styles, width) {

			styles = styles || emptyStyles;

			measureStyle.width = width + "px" || "auto";
			measureStyle.fontFamily = styles.fontFamily || "";
			measureStyle.fontSize = styles.fontFamily || "";
			measureStyle.fontStyle = styles.fontStyle || "";
			measureStyle.lineHeight = styles.lineHeight || "";

			textNode.nodeValue = text;

			return {
				width: measureNode.offsetWidth,
				height: measureNode.offsetHeight
			};
		}

	});

})();
