#module ExtraCompiler (
  Legio = "legio/std" = Legio,
  construct = "legio/oop/construct" = Legio.construct,
  LiteralParser = "./literal-parser" = LiteralParser
)

var whitespace = #/\s|\u0011|\u0012/, cursor = #/\u0011|\u0012/g, alnum = #/^(\w|[\$@\u0011\u0012])$/;

var ExtraCompiler = construct({
  init: code -> {
    @originalCode = code;
    
    var lp = @literalParser = new LiteralParser(code);
    lp.parse();
    
    @code = lp.code;
  },
  
  members: {
    skipWhitespace: (data, ind) -> {
      while (whitespace.test(data[ind])) {
        ++ind;
      }
      
      return ind;
    },
    
    compile: () -> {
      var code = @code;
      
      code = @compileLambdas(code);
      
      // The "this" shortcut
      code = code.replace(#/@(\u0011|\u0012)?(\w|\$)/g, "this.$1$2").replace(#/@/g, "this");
      
      // Precompiler expressions
      code = @compileSharp(code);
      
      // Restore literals
      var out = @literalParser.restore(code);
      
      return out;
    },
    
    compileLambdas: code -> {
      var arrow = #/[^-]->|[^=]=>/g, lastIndex = 0, res, out = "";
      
      while (res = arrow.exec(code)) {
        if (right && res.index < right.end) {
          continue;
        }
        
        var ind = res.index, left = @getLeft(code, ind), right = @getRight(code, ind + 3, left.defaults);
        
        right.data = @compileLambdas(right.data);
        
        if (code.slice(left.end + 1, right.start).indexOf("\u0011") !== -1) {
          right.data = "\u0011" + right.data;
        }
        if (code.slice(left.end + 1, right.start).indexOf("\u0012") !== -1) {
          right.data = "\u0012" + right.data;
        }
        
        var exp = "function " + left.name + left.data + " " + right.data;
        
        if (code[ind + 1] === "=") {
          exp = "(" + exp + ").bind(this)";
        }
        
        out += code.slice(lastIndex, left.start) + exp;
        lastIndex = right.end + 1;
      }
      
      out += code.slice(lastIndex);
      
      return out;
    },
    
    getLeft: (code, ind) -> {
      while (whitespace.test(code[ind])) {
        if (cursor.test(code[ind]) && alnum.test(code[ind - 1])) {
          break;
        }
        --ind;
      }
      
      var res = { end: ind, name: "", defaults: "" };
      
      if (code[ind] === ")") {
        var br = 1;
        while (br > 0) {
          --ind;
          var ch = code[ind];
          
          if (ch === ")") {
            ++br;
          }
          else if (ch === "(") {
            --br;
          }
        }
        
        res.start = ind;
        
        var data = code.slice(ind + 1, res.end), params = @parseParameters(data);
        
        res.data = params.data;
        res.defaults = params.defaults;
        
        var nameEnd = ind;
        while (ind - 1 >= 0 && alnum.test(code[ind - 1])) {
          --ind;
        }
        
        var name = code.slice(ind, nameEnd);
        if (name.replace(cursor, "") !== "") {
          res.start = ind;
          res.name = name;
        }
      }
      else {
        while (alnum.test(code[ind])) {
          --ind;
        }
        
        ++ind;
        
        res.start = ind;
        
        var data = code.slice(ind, res.end + 1), params = @parseParameters(data);
        
        res.data = params.data;
        res.defaults = params.defaults;
      }
      
      return res;
    },
    
    getRight: (code, ind, defaults) -> {
      while (whitespace.test(code[ind])) {
        if (cursor.test(code[ind]) && alnum.test(code[ind + 1])) {
          break;
        }
        ++ind;
      }
      
      var res = { start: ind };
      
      if (code[ind] === "{") {
        var br = 1;
        while (br > 0) {
          ++ind;
          var ch = code[ind];
          
          if (ch === "{") {
            ++br;
          }
          else if (ch === "}") {
            --br;
          }
        }
        
        res.end = ind;
        
        var data = code.slice(res.start, ind + 1);
        
        res.data = data;
      }
      else {
        var opening = #/\(|\{|\[/, ending = #/\)|\}|\]/, end = #/;|,/, br = 0;
        while (true) {
          var ch = code[ind];
          
          if (br === 0 && (ending.test(ch) || end.test(ch))) {
            --ind;
            break;
          }
          
          if (opening.test(ch)) {
            ++br;
          }
          else if (ending.test(ch)) {
            --br;
          }
          
          ++ind;
        }
        
        var onlyWhite = #/\s/;
        while (onlyWhite.test(code[ind])) {
          --ind;
        }
        
        res.end = ind;
        res.data = "{ return " + code.slice(res.start, ind + 1) + "; }";
      }
      
      if (defaults) {
        res.data = res.data.replace(#/^\{/, "{ " + defaults);
      }
      
      return res;
    },
    
    parseParameters: data -> {
      var
      res = { data: "", defaults: "" },
      len = data.length, ind = 0, names = [], values = [];
      
      while (ind < len) {
        ind = @skipWhitespace(data, ind);
        
        if (ind >= len) { break; }
        
        if (cursor.test(data[ind - 1])) {
          --ind;
        }
        
        var nameInd = ind, nameEnd = ind, name, cleanName, def = "";
        while (alnum.test(data[nameEnd])) {
          if (nameEnd >= len) { break; }
          ++nameEnd;
        }
        
        name = data.slice(nameInd, nameEnd);
        cleanName = name.replace(cursor, "");
        
        if (cleanName === "") { break; }
        
        if (cleanName[0] === "@") {
          def = cleanName + " = " + cleanName.slice(1) + "; ";
          
          name = name.replace("@", "");
        }
        
        names.push(name);
        
        ind = @skipWhitespace(data, nameEnd);
        
        if (data[ind] === "=") {
          ind = @skipWhitespace(data, ++ind);
          
          var valInd = ind, valEnd = ind, val;
          
          var end, br = 0;
          while (true) {
            var ch = data[valEnd];
            
            if (br === 0 && (ch === "," || ch === undefined)) {
              break;
            }
            
            if (ch === "(") {
              ++br;
            }
            else if (ch === ")") {
              --br;
            }
            
            ++valEnd;
          }
          
          val = data.slice(valInd, valEnd);
          values.push(val);
          res.defaults += "if (" + name + " === undefined) { " + name + " = " + val + "; } ";
          
          ind = valEnd;
        }
        else if (data.substr(ind, 3) === "...") {
          names.pop();
          
          res.defaults += "var " + name + " = " + ExtraCompiler.restParameters + "(arguments, " + names.length + "); ";
          
          ind += 2;
        }
        
        res.defaults += def;
        
        ++ind;
      }
      
      res.data = "(" + names.join(", ") + ")";
      
      res.names = names;
      res.values = values;
      
      return res;
    },
    
    compileSharp: code -> {
      var res, pre = #/#((\w|\$|\u0011|\u0012)*)/g;
      
      while (res = pre.exec(code)) {
        var
        start = res.index,
        str = res[1].replace(cursor, ""),
        ind = start + res[0].length;
        
        if (str === "module") {
          code = @resolveModule(code, start, ind);
        }
        else if (str === "export") {
          code = code.slice(0, start) + "return" + code.slice(ind);
        }
        // construct extension
        else if (str === "super") {
          if (code[ind] === "(") {
            code = code.slice(0, start) + ExtraCompiler.superInit + code.slice(ind);
          }
          else if (code[ind] === ".") {
            var brInd = code.indexOf("(", ind), name = code.slice(ind + 1, brInd), fnCall = ExtraCompiler.superCall(name);
            
            var brEnd = @skipWhitespace(code, brInd + 1);
            if (code[brEnd] === ")") {
              fnCall = fnCall.replace(#/,\s*$/, "");
            }
            
            code = code.slice(0, start) + fnCall + code.slice(brInd + 1);
          }
          else {
            code = code.slice(0, start) + ExtraCompiler.superConstructor + code.slice(ind);
          }
        }
        else if (str === "foreach") {
          code = @resolveForeach(code, start, ind);
        }
        else if (str === "scope" || str === "") {
          code = @resolveScope(code, start, ind);
        }
      }
      
      return code;
    },
    
    resolveModule: (code, start, ind) -> {
      ind = @skipWhitespace(code, ind);
      
      var nameInd = ind, modName;
      
      ind = code.indexOf("(", ind);
      
      modName = code.slice(nameInd, ind).trim();
      
      var end = code.indexOf(")", ind), names = [], mods = [], globs = [], cont = code.slice(ind + 1, end).split(",");
      
      #foreach (i of cont) {
        var item = cont[i].split("=");
        if (item.length >= 2) {
          var name = item[0].replace(cursor, "").trim(), mod = item[1].replace(cursor, "").trim();
          
          if (item.length > 2) {
            var glob = item[2].replace(cursor, "").trim();
            globs.push(glob);
          }
          
          names.push(name);
          mods.push(mod);
        }
      }
      
      code = code.slice(0, start) +
             '(function (global, undefined) {\n' +
             '"use strict";\n' +
             'function definition(' + names.join(", ") + ') {' +
             code.slice(end + 1) +
             '}\n' +
             'if (typeof module === "object" && module.exports) {\n' +
             'module.exports = definition(' +
             (mods.length ? ('require(' + mods.join('), require(') + ')') : "") +
             ');\n' +
             '}\n' +
             'else if (typeof define === "function" && define.amd) {\n' +
             'define([' + mods.join(", ") + '], definition);\n' +
             '}\n' +
             (modName !== "" ? (
               'else {\n' +
               'global.' + modName + ' = definition(' +
               (globs.length ? ('global.' + globs.join(', global.')) : "") +
               ');\n' +
               '}\n'
             ) : "") +
             '})(this);';
      
      return code;
    },
    
    resolveForeach: (code, start, ind) -> {
      ind = code.indexOf("(", ind);
      var end = code.indexOf(")", ind), data = code.slice(ind + 1, end), val = "", isVal = false;
      
      if (data.indexOf(" in ") === -1 && data.indexOf(" of ") === -1) {
        data = data.replace(cursor, "");
      }
      
      if (data.indexOf(" in ") !== -1) {
        data = data.split(" in ");
        
        var vars = data[0].split(":"), obj = data[1].trim(), key = vars[0].trim();
        if (vars.length > 1) {
          val = vars[1].trim();
          isVal = true;
        }
        
        code = code.slice(0, start) +
               (isVal ? 'var ' + val + '; ' : '') +
               'for (var ' + key + ' in ' + obj + ') if (' +
               (isVal ? val + ' = ' + obj + '[' + key + '], ' : '') +
               ExtraCompiler.objectOwns + '(' + obj + ', ' + key +
               '))' +
               code.slice(end + 1);
      }
      else if (data.indexOf(" of ") !== -1) {
        data = data.split(" of ");
        
        var vars = data[0].split(":"), obj = data[1].trim(), key = vars[0].trim();
        if (vars.length > 1) {
          val = vars[1].trim();
          isVal = true;
        }
        
        code = code.slice(0, start) +
               'for (var ' + key + ' = 0' +
               (isVal ? ', ' + val + ' = ' + obj + '[' + key + ']' : '') +
               '; ' + key + ' < ' + obj + '.length; ++' + key +
               (isVal ? ', ' + val + ' = ' + obj + '[' + key + ']' : '') +
               ')' +
               code.slice(end + 1);
      }
      
      return code;
    },
    
    resolveScope: (code, start, ind) -> {
      var parInd = ind = code.indexOf("(", ind), parEnd;
      
      var br = 1;
      while (br > 0) {
        ++ind;
        var ch = code[ind];
        
        if (ch === "(") {
          ++br;
        }
        else if (ch === ")") {
          --br;
        }
      }
      
      parEnd = ind;
      
      var scopeData = @parseParameters(code.slice(parInd + 1, parEnd));
      
      var bodyInd = ind = code.indexOf("{", ind);
      
      br = 1;
      while (br > 0) {
        ++ind;
        var ch = code[ind];
        
        if (ch === "{") {
          ++br;
        }
        else if (ch === "}") {
          --br;
        }
      }
      
      var body = code.slice(bodyInd, ind + 1);
      
      code = code.slice(0, start) + "(function " + scopeData.data + " " + body + ")(" + scopeData.values.join(", ") + ")" + code.slice(ind + 1);
      
      return code;
    }
  },
  
  statics: {
    superInit: "this.superInit",
    superCall: name -> 'this.superCall("' + name + '", ',
    superConstructor: "this.superConstructor",
    
    restParameters: "Array.from",
    
    objectOwns: "Object.owns"
  }
});

#export ExtraCompiler;
