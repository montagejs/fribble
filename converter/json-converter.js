var Montage = require("montage").Montage,
    Converter = require('montage/core/converter/converter').Converter;

exports.JsonConverter = Montage.create(Converter, {
    indent: {
        value: 2
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
                return JSON.parse(value);
            } catch (ex) {
                return value;
            }
        }
    }
});
