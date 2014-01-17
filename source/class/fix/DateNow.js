/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2012 Zynga Inc.
  Copyright 2012-2014 Sebastian Werner
==================================================================================================
*/

"use strict";

/** Adds the pretty essential `Date.now()` method from ES5 if it is missing. */
core.Main.addStatics("Date",
{
	/**
	 * {Number} Returns the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
	 *
	 * See also: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now
	 */
	now: function() {
		return +new Date;
	}
});
