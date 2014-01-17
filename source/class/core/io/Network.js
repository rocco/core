/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2012 Zynga Inc.
  Copyright 2012-2014 Sebastian Werner
--------------------------------------------------------------------------------------------------
  Inspired by: http://remysharp.com/2011/04/19/broken-offline-support/
==================================================================================================
*/

"use strict";

(function(global)
{
	// Detect native support
	var XHR = global.XMLHttpRequest;
	var empty = new Function;
	var isOnline = false;
	var request;

	var updateHandle = null;
	var updateInterval = 1000;

	var abortHandle = null;
	var abortAfter = 5000;


	var setOnline = function(value)
	{
		isOnline = value;
		console.debug("IsOnline: " + isOnline);
		updateHandle = setTimeout(detectOnline, updateInterval);
	};


	var abortRequest = function()
	{
		request.onreadystatechange = empty;
		request.abort();

		setOnline(false);
	};


	var onStateChange = function()
	{
		if (request.readyState == 4)
		{
			request.onreadystatechange = empty;
			clearTimeout(abortHandle);

			var status = request.status;
			setOnline(status >= 200 && status < 300 || status == 304 || status == 1223);
		}
	};


	var detectOnline = function()
	{
		/* global ActiveXObject : false */

		// IE vs. standard XHR creation
		request = XHR ? new XHR : new ActiveXObject("Microsoft.XMLHTTP");
		request.onreadystatechange = onStateChange;
		request.open("HEAD", "//" + location.hostname + "/?rand=" + Math.random(), true);

		// Catch network & other problems
		try {
			abortHandle = setTimeout(abortRequest, abortAfter);
			request.send();
		} catch (e) {
			setOnline(false);
		}
	};


	/**
	 * Generic network monitor and inspection
	 *
	 */
	core.Module("core.io.Network",
	{
		/**
		 * {Boolean} Returns whether the client is online based on the last check
		 */
		isOnline : function() {
			return updateHandle ? isOnline : null;
		},


		/**
		 * Starts the network monitoring with the given @interval {Number?1000} in milliseconds.
		 */
		startMonitoring : function(interval)
		{
			// allow for timeout reconfiguration
			this.stopMonitoring();

			// Reconfigure timeout and start first iteration
			updateInterval = interval || 1000;
			updateHandle = setTimeout(detectOnline, updateInterval);
		},


		/**
		 * Stop network monitoring
		 */
		stopMonitoring : function()
		{
			if (updateHandle)
			{
				// Abort current request...
				abortRequest();

				// ... and stop timer
				clearTimeout(updateHandle);
				updateHandle = null;
			}
		}
	});
})(core.Main.getGlobal());
