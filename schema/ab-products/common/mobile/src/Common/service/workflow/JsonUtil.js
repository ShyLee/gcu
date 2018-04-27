/**
 * Archibus JSON utility functions. Ported from jsonrpc.js
 * 
 * @author Jeff Martin
 */

Ext.define('Common.service.workflow.JsonUtil', {
	singleton : true,

	escapeJSONChar : function(c) {
		if (c === "\"" || c === "\\") {
			return "\\" + c;
        } else if (c === "\b") {
			return "\\b";
        } else if (c === "\f") {
            return "\\f";
        } else if (c === "\n") {
			return "\\n";
        } else if (c === "\r") {
			return "\\r";
        } else if (c === "\t") {
			return "\\t";
        }
		var hex = c.charCodeAt(0).toString(16);
		if (hex.length === 1)  {
			return "\\u000" + hex;
        } else if (hex.length === 2) {
			return "\\u00" + hex;
        } else if (hex.length === 3) {
			return "\\u0" + hex;
        } else {
			return "\\u" + hex;
        }
	},

	/* encode a string into JSON format */

	escapeJSONString : function(s) {
		/*
		 * The following should suffice but Safari's regex is b0rken (doesn't support callback substitutions) return
		 * "\"" + s.replace(/([^\u0020-\u007f]|[\\\"])/g, escapeJSONChar) + "\"";
		 */

		/* Rather inefficient way to do it */
		var parts = s.split("");
		for ( var i = 0; i < parts.length; i++) {
			var c = parts[i];
			if (c === '"' || c === '\\' || c.charCodeAt(0) < 32 || c.charCodeAt(0) >= 128) {
				parts[i] = this.escapeJSONChar(parts[i]);
            }
		}
		return "\"" + parts.join("") + "\"";
	},

	/**
	 * Convert object to ARCHIBUS JSON format
	 * 
	 * @param o
	 * @return {*}
	 */
	toJSON : function(o) {
        var v = [],
            attr;

		if (o === null) {
			return "null";
		} else if (o.constructor === String) {
			return this.escapeJSONString(o);
		} else if (o.constructor === Number) {
			return o.toString();
		} else if (o.constructor === Boolean) {
			return o.toString();
		} else if (o.constructor === Date) {
			//return '{javaClass: "java.util.Date", time: ' + o.valueOf() + '}';
            // KB 3039822. Do not allow marshalling of Date/Time objects using Workflow Rules
            throw new Error('Workflow toJSON. Date objects are not permitted to be marshalled using Workflow Rules.');
		} else if (o.constructor === Array || typeof (o.length) !== 'undefined') {
			for ( var i = 0; i < o.length; i++) {
				v.push(this.toJSON(o[i]));
            }
			return "[" + v.join(", ") + "]";
		} else {
			for (attr in o) {
				if (o[attr] === null) {
					v.push("\"" + attr + "\": null");
                } else if (typeof o[attr] === "function") {
					; /* skip */
                } else {
					v.push(this.escapeJSONString(attr) + ": " + this.toJSON(o[attr]));
				}
			}
			return "{" + v.join(", ") + "}";
		}
	}
});