/* 
==================================================================================================
  Jasy - JavaScript Tooling Framework
  Copyright 2010-2011 Sebastian Werner
==================================================================================================
*/

/**
 * This helper class is only included into debug builds and do the 
 * generic property checks defined using the property configuration.
 *
 * It's used by both standard property system: core.property.Simple and core.property.Multi.
 *
 * @require {fix.Console}
 */
core.Module("core.property.Debug",
{
	/**
	 * Validates the incoming parameters of a setter method
	 * 
	 * @param obj {Object} Object which is modified
	 * @param config {Map} Property configuration
	 * @param args {arguments} List of all arguments send to the setter
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
					if (type instanceof Array) {
						core.Test.assertInList(value, type);
					} else if (core.Class.isClass(type)) {
						core.Test.assertInstanceOf(value, type);
					} else if (core.Interface.isInterface(type)) {
						core.Interface.assert(value, type);
					}
					else
					{
						var assertName = "assert" + type;
						if (core.Test[assertName]) {
							core.Test[assertName](value);
						} else {
							console.warn("Unsupported check: " + type + "!");
						}
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
	 * @param obj {Object} Object which is modified
	 * @param config {Map} Property configuration
	 * @param args {arguments} List of all arguments send to the setter
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
	 * @param obj {Object} Object which is queried
	 * @param config {Map} Property configuration
	 * @param args {arguments} List of all arguments send to the setter
	 */
	checkGetter : function(obj, config, args)
	{
		if (args.length != 0) {
			throw new Error("Called get method of property " + config.name + " on " + obj + " with too many arguments!");
		}
	}
});