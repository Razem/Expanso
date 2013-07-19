#module LiteralParser (
  Legio = "legio/std" = Legio,
  construct = "legio/oop/construct" = Legio.construct
)

var whitespace = #/\s|\u0011|\u0012/, cursor = #/\u0011|\u0012/g;

var LiteralParser = construct({
  init: code -> {
    @originalCode = @code = code;
    @literals = [];
  },
  
  members: {
    parse: () -> {
      var code = @code, ind = 0, symbols = ['"', "'", "`", "/"];
      
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
            var end = @findNext(ch, min + 1, true);
            
            if (end === -1) {
              @error(min);
            }
            
            ind = min + @putId("string-" + (ch === "`" ? "expanso" : (ch === '"' ? "double" : "single")), min, end);
            code = @code;
          }
          else if (ch === "/") {
            if (@get(min + 1) === "/") {
              var end = @findNext("\n", min + 2);
              
              if (end === -1) {
                end = code.length - 1;
              }
              else {
                if (@get(end - 1) === "\r") {
                  --end;
                }
                --end;
              }
              
              ind = min + @putId("comment-line", min, end);
              code = @code;
            }
            else if (@get(min + 1) === "*") {
              var end = @findNext("*/", min + 2);
              
              if (end === -1) {
                @error(min);
              }
              
              ind = min + @putId("comment-block", min, end + 1);
              code = @code;
            }
            else {
              var notBefore = #/\)|\]|\w|\$/;
              for (var j = 1; min - j >= 0; ++j) {
                var c = @get(min - j);
                if (whitespace.test(c)) {
                  continue;
                }
                
                if (notBefore.test(c)) {
                  ind = min + 1;
                  continue MAIN;
                }
                
                break;
              }
              
              var end = @findNext("/", min + 1, true);
              
              if (end === -1) {
                @error(min);
              }
              
              var flags = #/^(g|i|m)/;
              while (flags.test(@get(end + 1))) {
                ++end;
              }
              
              var type = "regexp";
              if (@get(min - 1) === "#") {
                type += "-expanso";
                min -= 1;
              }
              else if (cursor.test(@get(min - 1)) && @get(min - 2) === "#") {
                type += "-expanso";
                min -= 2;
              }
              
              ind = min + @putId(type, min, end);
              code = @code;
            }
          }
        }
        else {
          break;
        }
      }
      
      return code;
    },
    
    restore: (code = @code) -> {
      var
      lits = @literals,
      out = "", lastIndex = 0;
      
      while (true) {
        var mainInd = Infinity, ind, j, id;
        #foreach (i of lits) {
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
    
    get: i -> @code[i],
    
    findNext: (ch, ind, escape) -> {
      var res = -1;
      
      while (true) {
        res = @code.indexOf(ch, ind);
        
        if (res === -1) {
          break;
        }
        
        if (escape) {
          var sum = 0;
          for (var i = 1; ; ++i) {
            var c = @get(res - i);
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
    
    putId: (type, start, end) -> {
      ++end;
      
      var
      code = @code,
      lit = code.slice(start, end),
      id;
      
      if (type === "regexp-expanso") {
        lit = lit.slice(1);
      }
      else if (type === "string-expanso") {
        lit = lit.slice(1, -1).replace(cursor, "").replace(#/\\`/g, "`");
        
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
        lit = lit.replace(#/#\{@(\w|\$)([^\}]+)\}/g, (math, p1, p2) -> ch + " + this." + p1 + p2.replace(#/\\"/g, '"') + " + " + ch)
                 .replace(#/#\{@([^\}]+)\}/g, (math, p1) -> ch + " + this" + p1.replace(#/\\"/g, '"') + " + " + ch)
                 .replace(#/#\{([^\}]+)\}/g, (math, p1) -> ch + " + " + p1.replace(#/\\"/g, '"') + " + " + ch);
      }
      
      id = "'" + (@literals.push({ type: type, data: lit }) - 1) + '"';
      
      @code = code.slice(0, start) + id + code.slice(end);
      
      return id.length;
    },
    
    error: ind -> {
      throw "Parse error starting in position " + ind + "!\n" + @code.substr(ind, 30) + "…";
    }
  }
});

#export LiteralParser;
