var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    gist = require("lib/gist").gist;

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

                window.addEventListener("hashchange", this, false);
                // Use input if any
                var gistId = location.hash.slice(3);
                if (gistId) {
                    this.loadGist(gistId);
                } else {
                    this.loadExample(0);
                }
            }
        }
    },

    loadExample: {
        value: function(ix) {
            this.templateObjects.expressionList.selectedIndexes = [ix];
        }
    },

    /** Data **/

    data: {
        value: {
            "table": [
                {"id": 0, "firstName": "John", "lastName": "Doe", "handle": "john.doe", "score": 6},
                {"id": 1, "firstName": "Mary", "lastName": "Jane", "handle": "mary.jane", "score": 10}
            ],
            "headers": ["lastName", "handle"]
        }
    },

    myData: {
        value: {}
    },

    expressions: {
        value: [{
            "name": "Extract last name from @table",
            "expression": "@table.map{lastName}"
        }, {
            "name": "Filter @table by last name: Jane",
            "expression": "@table.filter{lastName == 'Jane'}"
        }, {
            "name": "Score average",
            "expression": "@table.map{score}.average()"

        }, {
            "name": "Create a sub structure out of @table",
            "expression": "@table.map{{name: firstName + ' ' + lastName}}"
        }]
    },

    /** Listeners **/

    handleSaveAction: {
        value: function() {
            this.save();
        }
    },

    handleHashchange: {
        value: function() {
            var gistId = location.hash.slice(3);

            if (gistId && gist.id != gistId) {
                this.loadGist(gistId);
            }
        }
    },

    /** Save **/

    save: {
        value: function() {
            var files = this._getFiddleFiles();

            gist.save({
                anon: true,
                files: files
            });
        }
    },

    _getFiddleFiles: {
        value: function() {
            var files = Object.create(null),
                data;

            function addFile(fileName, content) {
                files[fileName] = {content: content};
            }

            addFile("settings.json", JSON.stringify({
                autoFormat: this.templateObjects.autoFormat.checked
            }, null, 4));

            data = Object.clone(this.data);
            data.myData = this.myData;
            addFile("data.json", JSON.stringify(data, null, 4));

            addFile("expression.frb", this.templateObjects.frbCodeMirror.value);

            return files;
        }
    },

    /** Load **/

    loadGist: {
        value: function(id) {
            var self = this;

            gist.load(id).then(function(files) {
                self._loadFiddleFiles(files);
            }).done();
        }
    },

    _loadFiddleFiles: {
        value: function(files) {
            var settings,
                data,
                expression,
                frbExpression = this.templateObjects.frbExpression;

            settings = files["settings.json"] && files["settings.json"].content;
            if (settings) {
                settings = JSON.parse(settings);
                this.templateObjects.autoFormat.checked = settings.autoFormat;
            }

            data = files["data.json"] && files["data.json"].content;
            if (data) {
                data = JSON.parse(data);
                this.myData = data.myData;
                delete data.myData;
                this.data = data;
            }

            expression = files["expression.frb"] && files["expression.frb"].content;
            this.templateObjects.frbCodeMirror.setValueAsIs(expression || "");

            // Force expression evaluation through the new data. If the
            // loaded expression is the same as the current expression just
            // setting the new data will not trigger the re-evaluation so we
            // force it.
            frbExpression.dispatchOwnPropertyChange("data", frbExpression.data);
        }
    }
});
