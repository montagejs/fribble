var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;

exports.Main = Montage.create(Component, {
    templateDidLoad: {
        value: function(documentPart) {
            var objects = documentPart.objects,
                result = objects.result,
                self = this;

            // Creating the binding manually so we can still use @ notation for
            // properties inside the data object.
            if (result) {
                result.defineBinding("value", {
                    "<-": "path(@frbExpression.value)",
                    "converter": objects.jsonConverter,
                    "parameters": {
                        serialization: {
                            getObjectByLabel: function(label) {
                                if (label === "frbExpression") {
                                    return objects[label];
                                } else if (label === "myData") {
                                    return self.myData;
                                } else {
                                    return self.data[label];
                                }
                            }
                        }
                    }
                });

                // Use input if any
                var hash = document.location.hash;

                if (hash && hash.slice(0, 3) === "#!/") {
                    objects.frbExpression.value = decodeURIComponent(hash.slice(3));
                }
            }
        }
    },

    data: {
        value: {
            "table": [
                {"id": 0, "firstName": "John", "lastName": "Doe", "handle": "john.doe"},
                {"id": 1, "firstName": "Mary", "lastName": "Jane", "handle": "mary.jane"}
            ],
            "headers": ["lastName", "handle"]
        }
    },

    myData: {
        value: {}
    },

    expressions: {
        value: [{
            "name": "Create a sub structure out of @table",
            "expression": "@table.map{.{name: firstName + ' ' + lastName}}"
        }, {
            "name": "Filter @table by last name: Jane",
            "expression": "@table.filter{lastName == 'Jane'}"
        }, {
            "name": "Extract last name from @table",
            "expression": "@table.map{lastName}"
        }]
    }
});