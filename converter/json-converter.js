var Montage = require("montage").Montage,
    Converter = require('montage/core/converter/converter').Converter;

exports.JsonConverter = Montage.create(Converter, {
    indent: {
        value: 2
    },

    delegate: {
        value: null
    },

    convert: {
        value: function(value) {
            if (value && value.exception) {
                return value.exception.message;
            }

            try {
                return JSON.stringify(value, null, this.indent);
            } catch (ex) {
                return "";
            }
        }
    },

    revert: {
        value: function(value) {
            try {
                var object = JSON.parse(value);
                this.callDelegateMethod("success", {value: value});
                return object;
            } catch (ex) {
                this.callDelegateMethod("error", {value: value, error: ex.message});
                return null;
            }
        }
    },

    deserializedFromTemplate: {
        value: function(owner, label) {
            this.identifier = label;
        }
    }
});
