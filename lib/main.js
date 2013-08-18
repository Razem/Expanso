(function (global, undefined) {
"use strict";
function definition(LiteralParser, ExtraCompiler) {

return {
  LiteralParser: LiteralParser,
  ExtraCompiler: ExtraCompiler
};
}
if (typeof module === "object" && module.exports) {
module.exports = definition(require("./literal-parser"), require("./extra-compiler"));
}
else if (typeof define === "function" && define.amd) {
define(["./literal-parser", "./extra-compiler"], definition);
}
else {
global.Expanso = definition(global.LiteralParser, global.ExtraCompiler);
}
})(this);