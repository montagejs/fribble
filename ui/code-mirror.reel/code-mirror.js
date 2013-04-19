/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */
/**
    @module "montage/ui/code-mirror.reel"
    @requires montage
    @requires montage/ui/component
*/

/**
 * codemirror.min.js file is generated from http://codemirror.net/doc/compress.html
 * With the options: css, htmlembedded, htmlmixed, javascript, xml,
 * matchbrackets, closebrackets, show-hint, lint
 * When generating this file it is needed to replace "window.CodeMirror=" with
 * "var CodeMirror;exports.CodeMirror=CodeMirror="
 */

var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    CodeMirror = require("./codemirror/codemirror.min.js").CodeMirror;

require("./codemirror/frb");
require("./codemirror/formatting");

/**
    Description TODO
    @class module:"montage/ui/code-mirror.reel".CodeMirror
    @extends module:montage/ui/component.Component
*/
exports.CodeMirror = Montage.create(Component, /** @lends module:"montage/ui/code-mirror.reel".CodeMirror# */ {
    _codeMirror: {value: null},
    _newValue: {value: null},
    _drawAsIs: {value: false},
    /** Options **/
    tabSize: {value: 4},
    indentUnit: {value: 4},
    matchBrackets: {value: false},
    autoCloseBrackets: {value: false},
    lineNumbers: {value: false},
    mode: {value: null},
    autoFormat: {value: false},

    enterDocument: {
        value: function(firstTime) {
            var self = this,
                mode = this.mode;

            if (firstTime) {
                if (mode === "json") {
                    mode = {name: "javascript", json: true};
                }

                this._codeMirror = CodeMirror(this._element, {
                    mode: mode,
                    tabSize: this.tabSize,
                    indentUnit: this.indentUnit,
                    matchBrackets: this.matchBrackets,
                    autoCloseBrackets: this.autoCloseBrackets,
                    lineNumbers: this.lineNumbers,
                    value: this.value || ""
                });
                this._codeMirror.on("change", function(codeMirror, change) {
                    self.dispatchOwnPropertyChange("value", codeMirror.getValue());
                });
            }
        }
    },

    draw: {
        value: function() {
            if (this._newValue != null) {
                this._codeMirror.setValue(this._newValue);
                this._newValue = null;
                if (this.autoFormat && !this._drawAsIs) {
                    this.reformat();
                }
            }
        }
    },

    value: {
        get: function() {
            return this._codeMirror ? (this._newValue != null ? this._newValue : this._codeMirror.getValue()) : this._newValue;
        },
        set: function(value) {
            this._newValue = value;
            this._drawAsIs = false;
            this.needsDraw = true;
        }
    },

    /**
     * Set the value ignoring text changing options like auto format.
     */
    setValueAsIs: {
        value: function(value) {
            this.value = value;
            this._drawAsIs = true;
        }
    },

    hasModeErrors: {
        value: function() {
            return !!this._element.querySelector("*[class~='cm-error']");
        }
    },

    reformat: {
        value: function() {
            var codeMirror = this._codeMirror,
                lineCount = codeMirror.lineCount();

            var start = {line: 0, ch: 0};
            var textEnd = codeMirror.getLine(lineCount-1).length;
            var end = {line: lineCount-1, ch: textEnd};

            codeMirror.autoFormatRange(start, end);
            codeMirror.setSelection({line: 0, ch: 0});
        }
    }
});
