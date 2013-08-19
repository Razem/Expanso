(function (global, undefined) {
"use strict";
function definition(Legio, construct) {

var whitespace = /\s|\u0011|\u0012/, cursor = /\u0011|\u0012/g;

var LiteralParser = construct({
  init: function (code) {
    this.originalCode = this.code = code;
    this.literals = [];
  },
  
  members: {
    parse: function () {
      var code = this.code, ind = 0, symbols = ['"', "'", "`", "/"];
      
      MAIN:
      while (true) {
        var min = Infinity, ch;
        for (var i = 0; i < symbols.length; ++i) {
          var j = code.indexOf(symbols[i], ind);
          
          if (j !== -1 && j < min) {
            min = j;
            ch = symbols[i];
          }
        }
        
        if (Number.isFinite(min)) {
          if (ch === '"' || ch === "'" || ch === "`") {
            var end = this.findNext(ch, min + 1, true);
            
            if (end === -1) {
              this.error(min);
            }
            
            ind = min + this.putId("string-" + (ch === "`" ? "expanso" : (ch === '"' ? "double" : "single")), min, end);
            code = this.code;
          }
          else if (ch === "/") {
            if (this.get(min + 1) === "/") {
              var end = this.findNext("\n", min + 2);
              
              if (end === -1) {
                end = code.length - 1;
              }
              else {
                if (this.get(end - 1) === "\r") {
                  --end;
                }
                --end;
              }
              
              ind = min + this.putId("comment-line", min, end);
              code = this.code;
            }
            else if (this.get(min + 1) === "*") {
              var end = this.findNext("*/", min + 2);
              
              if (end === -1) {
                this.error(min);
              }
              
              ind = min + this.putId("comment-block", min, end + 1);
              code = this.code;
            }
            else {
              var notBefore = /\)|\]|\w|\$/;
              for (var j = 1; min - j >= 0; ++j) {
                var c = this.get(min - j);
                if (whitespace.test(c)) {
                  continue;
                }
                
                if (notBefore.test(c)) {
                  ind = min + 1;
                  continue MAIN;
                }
                
                break;
              }
              
              var end = this.findNext("/", min + 1, true);
              
              if (end === -1) {
                this.error(min);
              }
              
              var flags = /^(g|i|m)/;
              while (flags.test(this.get(end + 1))) {
                ++end;
              }
              
              var type = "regexp";
              if (this.get(min - 1) === "#") {
                type += "-expanso";
                min -= 1;
              }
              else if (cursor.test(this.get(min - 1)) && this.get(min - 2) === "#") {
                type += "-expanso";
                min -= 2;
              }
              
              ind = min + this.putId(type, min, end);
              code = this.code;
            }
          }
        }
        else {
          break;
        }
      }
      
      return code;
    },
    
    restore: function (code) { if (code === undefined) { code = this.code; } 
      var
      lits = this.literals,
      out = "", lastIndex = 0;
      
      while (true) {
        var mainInd = Infinity, ind, j, id;
        for (var i = 0; i < lits.length; ++i) {
          id = "'" + i + '"', ind = code.indexOf(id, lastIndex);
          
          if (ind !== -1 && ind < mainInd) {
            mainInd = ind;
            j = i;
          }
        }
        
        if (mainInd === Infinity) {
          break;
        }
        
        id = "'" + j + '"';
        ind = mainInd;
        out += code.slice(lastIndex, ind) + lits[j].data;
        lastIndex = ind + id.length;
      }
      
      out += code.slice(lastIndex);
      
      return out;
    },
    
    get: function (i) { return this.code[i]; },
    
    findNext: function (ch, ind, escape) {
      var res = -1;
      
      while (true) {
        res = this.code.indexOf(ch, ind);
        
        if (res === -1) {
          break;
        }
        
        if (escape) {
          var sum = 0;
          for (var i = 1; ; ++i) {
            var c = this.get(res - i);
            if (cursor.test(c)) {
              continue;
            }
            
            if (c === "\\") {
              ++sum;
            }
            else {
              break;
            }
          }
          
          if (sum % 2 !== 0) {
            ind = res + 1;
            continue;
          }
        }
        
        break;
      }
      
      return res;
    },
    
    putId: function (type, start, end) {
      ++end;
      
      var
      code = this.code,
      lit = code.slice(start, end),
      id;
      
      if (type === "regexp-expanso") {
        lit = lit.slice(1);
      }
      else if (type === "string-expanso") {
        lit = lit.slice(1, -1).replace(cursor, "").replace(/\\`/g, "`");
        
        var len = start - code.lastIndexOf("\n", start) - 1, indent = new RegExp("\\n( ){" + len + "}", "g");
        lit = lit.replace(indent, "\n");
        
        var first = lit.indexOf("\n"), last = lit.lastIndexOf("\n");
        if (last === lit.length - 1) {
          if (lit[last - 1] === "\r") {
            --last;
          }
          
          lit = lit.slice(0, last);
        }
        
        if (first === 0 || (first === 1 && lit[0] === "\r")) {
          lit = lit.slice(first + 1);
        }
        
        lit = JSON.stringify(lit);
        
        var ch = lit[0];
        // TODO: double \ (current ver. is buggy)
        lit = lit.replace(/#\{@(\w|\$)([^\}]+)\}/g, function (match, p1, p2) { return ch + " + this." + p1 + p2.replace(/\\"/g, '"').replace(/\\\\/, "\\") + " + " + ch; })
                 .replace(/#\{@([^\}]+)\}/g, function (match, p1) { return ch + " + this" + p1.replace(/\\"/g, '"').replace(/\\\\/, "\\") + " + " + ch; })
                 .replace(/#\{([^\}]+)\}/g, function (match, p1) { return ch + " + " + p1.replace(/\\"/g, '"').replace(/\\\\/, "\\") + " + " + ch; });
      }
      
      id = "'" + (this.literals.push({ type: type, data: lit }) - 1) + '"';
      
      this.code = code.slice(0, start) + id + code.slice(end);
      
      return id.length;
    },
    
    error: function (ind) {
      throw "Parse error starting in position " + ind + "!\n" + this.code.substr(ind, 30) + "…";
    }
  }
});

return LiteralParser;
}
if (typeof module === "object" && module.exports) {
module.exports = definition(require("legio/std"), require("legio/oop/construct"));
}
else if (typeof define === "function" && define.amd) {
define(["legio/std", "legio/oop/construct"], definition);
}
else {
global.LiteralParser = definition(global.Legio, global.Legio.construct);
}
})(this);