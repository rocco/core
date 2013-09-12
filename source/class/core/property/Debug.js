/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2012 Zynga Inc.
  Copyright 2012-2013 Sebastian Werner
==================================================================================================
*/

"use strict";

/**
 * This helper class is only included into debug builds and do the
 * generic property checks defined using the property configuration.
 *
 * It's used by both standard property system: core.property.Simple and core.property.Multi.
 */
core.Module("core.property.Debug",
{
	/**
	 * Checks whether the given property @type {String} definition is valid.
	 */
	isValidType : function(type)
	{
		// TODO
	},


	/**
	 * Validates the incoming parameters of a setter method
	 *
	 * - @obj {Object} Object which is modified
	 * - @config {Map} Property configuration
	 * - @args {arguments} List of all arguments send to the setter
	 */
	checkSetter : function(obj, config, args)
	{
		var name = config.name;

		if (args.length == 0) {
			throw new Error("Called set() method of property " + name + " on object " + obj + " with no arguments!");
		}

		if (args.length > 1) {
			throw new Error("Called set() method of property " + name + " on object " + obj + " with too many arguments!");
		}

		var value = args[0];
		if (value == null)
		{
			if (value !== null) {
				throw new Error("Property " + name + " in object " + obj + " got invalid undefined value during set!");
			} else if (!config.nullable) {
				throw new Error("Property " + name + " in object " + obj + " is not nullable!");
			}
		}
		else
		{
			var type = config.type;
			if (type)
			{
				try
				{
					if (type instanceof Array) 
					{
						if (type.indexOf(value) == -1) {
							throw new Error("Value of property must be one of " + type + ". Invalid value: " + value);
						}
					}
					else if (core.Class.isClass(type)) 
					{
						if (!(value instanceof type || core.Class.includesClass(value.constructor, type))) {
							throw new Error("Value of property " + name + " must be instance of or include " + type + ". Invalid value: " + value);
						}
					}
					else if (core.Interface.isInterface(type)) 
					{
						core.Interface.assert(value, type);
					} 
					else
					{
						core.Assert.isType(value, type);
					}
				}
				catch(ex) {
					throw new Error("Could not set() property " + name + " of object " + obj + ": " + ex);
				}
			}
		}
	},


	/**
	 * Validates the incoming parameters of a resetter method
	 *
	 * - @obj {Object} Object which is modified
	 * - @config {Map} Property configuration
	 * - @args {arguments} List of all arguments send to the setter
	 */
	checkResetter : function(obj, config, args)
	{
		if (args.length != 0) {
			throw new Error("Called reset method of property " + config.name + " on " + obj + " with too many arguments!");
		}
	},


	/**
	 * Validates the incoming parameters of a getter method
	 *
	 * - @obj {Object} Object which is queried
	 * - @config {Map} Property configuration
	 * - @args {arguments} List of all arguments send to the setter
	 */
	checkGetter : function(obj, config, args)
	{
		if (args.length != 0) {
			throw new Error("Called get method of property " + config.name + " on " + obj + " with too many arguments!");
		}
	},


	/**
	 * Validates the incoming parameters of a isValid method
	 *
	 * - @obj {Object} Object which is queried
	 * - @config {Map} Property configuration
	 * - @args {arguments} List of all arguments send to the setter
	 */
	checkIsValid : function(obj, config, args)
	{
		if (args.length != 0) {
			throw new Error("Called isValid method of property " + config.name + " on " + obj + " with too many arguments!");
		}
	}
});
