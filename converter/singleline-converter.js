var Montage = require("montage").Montage,
    Converter = require('montage/core/converter/converter').Converter;

exports.SinglelineConverter = Montage.create(Converter, {
    convert: {
        value: function(v) {
            return v;
        }
    },

    revert: {
        value: function(v) {
            if (v) {
                return v.replace(/\n\s*/mg, "");
            } else {
                return v;
            }
        }
    }
});
