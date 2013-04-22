/**
 * Based on http://codemirror.net/mode/clike/clike.js
 * https://github.com/montagejs/frb/blob/pegjs/grammar.pegjs
 */
var CodeMirror = require("./codemirror.min.js").CodeMirror;

CodeMirror.defineMode("frb", function(config/*, parserConfig*/) {
    var indentUnit = config.indentUnit;

    var builtin = words("true false null");
    var blockKeywords = words("map filter some every sorted group groupMap min max");
    var functionKeywords = words("sum average view enumerate range flatten reversed has get set keys values items startsWith endsWith contains join split");

    var currentPunctuation;

    function words(str) {
        var obj = {}, words = str.split(" ");
        for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
        return obj;
    }

    function tokenBase(stream, state) {
        var ch = stream.next();

        // String
        if (ch == '"' || ch == "'") {
            state.tokenize = tokenString(ch);
            return state.tokenize(stream, state);
        }

        // Punctuation
        if (/[\[\]{}\(\),:\.]/.test(ch)) {
            currentPunctuation = ch;
            return null;
        }

        // Number
        if (/\d/.test(ch)) {
            stream.eatWhile(/[\w\.]/);
            return "number";
        }

        // Comments
        if (ch == "/") {
            if (stream.eat("*")) {
                state.tokenize = tokenComment;
                return tokenComment(stream, state);
            }
            if (stream.eat("/")) {
                stream.skipToEnd();
                return "comment";
            }
        }

        // Operators
        var isOperatorChar= /rem|[*\/%+\-<>=\?&\|:!]/;
        if (isOperatorChar.test(ch)) {
            stream.eatWhile(isOperatorChar);
            return "operator";
        }

        // Advance stream to cover a "word"
        stream.eatWhile(/[\w\$_]/);

        // Read the "word" covered
        var word = stream.current();

        // Keywords
        if (blockKeywords.propertyIsEnumerable(word)) {
            return "keyword";
        }

        // Function calls
        if (functionKeywords.propertyIsEnumerable(word) && stream.peek() === "(") {
            return "keyword";
        }

        // Builtin
        if (builtin.propertyIsEnumerable(word)) {
            return "builtin";
        }

        if (word[0] === "@") {
            return "variable-3";
        }

        return "variable";
    }

    function tokenString(quote) {
        return function(stream, state) {
            var escaped = false, next, end = false;
            while ((next = stream.next()) != null) {
                if (next == quote && !escaped) {end = true; break;}
                escaped = !escaped && next == "\\";
            }
            if (end || !(escaped))
                state.tokenize = null;
            return "string";
        };
    }

    function tokenComment(stream, state) {
        var maybeEnd = false, ch;
        while (ch = stream.next()) {
            if (ch == "/" && maybeEnd) {
                state.tokenize = null;
                break;
            }
            maybeEnd = (ch == "*");
        }
        return "comment";
    }

    return {
        startState: function(/*basecolumn*/) {
            return {
                tokenize: null,
                blockLevel: 0
            };
        },

        token: function(stream, state) {
            var style;

            if (stream.eatSpace()) return null;

            currentPunctuation = null;

            style = (state.tokenize || tokenBase)(stream, state);

            if (style === "comment") {
                return style;
            }

            if (currentPunctuation === "{") {
                state.blockLevel++;
            } else if (currentPunctuation === "}") {
                state.blockLevel--;
            }

            return style;
        },

        indent: function(state, textAfter) {
            if (state.tokenize != tokenBase &&
                state.tokenize != null) {
                return CodeMirror.Pass;
            }

            var indentLevel = state.blockLevel;

            if (textAfter[0] === "}") {
                indentLevel--;
            }

            return indentLevel * indentUnit;
        },

        commentStart: "/*",
        commentEnd: "*/",
        newlineAfterToken: function(type, content, textAfter/*, state*/) {
            if (textAfter[0] === "}") {
                return true;
            }

            if (content === "}" && textAfter[0] === ".") {
                return false;
            }

            return /^[\{\}]$/.test(content);
        },

        electricChars: "{}"
    };
});

