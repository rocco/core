/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2012 Zynga Inc.
  Copyright 2012-2013 Sebastian Werner
==================================================================================================
*/

"use strict";

if (jasy.Env.isSet("runtime", "browser"))
{

(function()
{
	/**
	 * {Boolean} Returns whether the given @string {String} is a valid CSS class name.
	 */
	var isValid = function(string) {
		return typeof string == "string" && string.length != 0 && !(/\s/.test(string));
	};

	// Verify incoming parameters
	if (jasy.Env.isSet("debug"))
	{
		var validate = function(args)
		{
			core.Assert.isEqual(args.length, 2);
			core.dom.Node.assertIsNode(args[0]);
			if (!isValid(args[1])) {
				throw new Error("Invalid CSS class name!");
			}
		};
	}

	// Support new classList interface
	if ("classList" in document.createElement("div"))
	{
		/**
		 * Adds the @className {String} to the given @elem {Element}.
		 */
		var addClass = function(elem, className)
		{
			if (jasy.Env.isSet("debug")) {
				validate(arguments);
			}

			elem.classList.add(className);
		};

		/**
		 * Removes the @className {String} from the given @elem {Element}.
		 */
		var removeClass = function(elem, className)
		{
			if (jasy.Env.isSet("debug")) {
				validate(arguments);
			}

			elem.classList.remove(className);
		};

		/**
		 * {Boolean} Returns whether @className {String} is applied to the given @elem {Element}.
		 */
		var containsClass = function(elem, className)
		{
			if (jasy.Env.isSet("debug")) {
				validate(arguments);
			}

			return elem.classList.contains(className);
		};

		/**
		 * Toggles the @className {String} for the given @elem {Element}.
		 */
		var toggleClass = function(elem, className)
		{
			if (jasy.Env.isSet("debug")) {
				validate(arguments);
			}

			elem.classList.toggle(className);
		};
	}
	else
	{

		var space = " ";

		var addClass = function(elem, className)
		{
			if (jasy.Env.isSet("debug")) {
				validate(arguments);
			}

			if (!containsClass(elem, className)) {
				elem.className += space + className;
			}
		};

		var removeClass = function(elem, className)
		{
			if (jasy.Env.isSet("debug")) {
				validate(arguments);
			}

			elem.className = (space + elem.className + space).replace(className, "")
		};

		var containsClass = function(elem, className)
		{
			if (jasy.Env.isSet("debug")) {
				validate(arguments);
			}

		  return elem.className && (elem.className == className || (space + elem.className + space).indexOf(space + className + space) !== -1);
		};

		var toggleClass = function(elem, className)
		{
			if (jasy.Env.isSet("debug")) {
				validate(arguments);
			}

			if (containsClass(elem, className)) {
				removeClass(elem, className);
			} else {
				elem.className += space + className;
			}
		};
	}


	/**
	 * Adds/removes the @className {String} for the given @elem {Element} depending
	 * on whether @enabled is `true` or `false`.
	 */
	var setClass = function(elem, className, enabled) {
		return enabled ? addClass(elem, className) : removeClass(elem, className);
	};


	/**
	 * Managing class names on DOM nodes the easy way.
	 *
	 * Makes use of high-performance `classList` interface in modern browsers:
	 * https://developer.mozilla.org/en/DOM/element.classList
	 */
	core.Module("core.bom.ClassName",
	{
		isValid: isValid,
		add : addClass,
		remove : removeClass,
		contains : containsClass,
		toggle : toggleClass,
		set : setClass
	});

})();

}

