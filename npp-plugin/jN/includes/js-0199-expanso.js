(function () {
  var getText = JSTools.getText, newGetText;
  newGetText = function (cur) {
    var code = getText();
    
    if (cur) {
      cur = Editor.currentView.pos;
      
      var rgx = /=|-/;
      if (code[cur] === ">" && rgx.test(code[cur - 1]) && !rgx.test(code[cur - 2])) {
        ++cur;
      }
      else if (rgx.test(code[cur]) && code[cur + 1] === ">" && rgx.test(code[cur - 1])) {
        --cur;
      }
      
      code = code.slice(0, cur) + "\u0011" + code.slice(cur);
    }
    
    try {
      var compiler = new ExtraCompiler(code);
      return compiler.compile().replace("\u0011", "\u0013").replace(/\u0011/g, "").replace("\u0013", "\u0011");
    }
    catch (ex) {
      alert(ex);
      return "";
    }
  };
  
  var jsMenu = JSTools.menu,
      exMenu = jsMenu.addMenu({
        text: "Expanso"
      });
  
  function isFile(file) {
    return /\\/.test(file);
  }
  
  var item = {
    text: "Compile\tCtrl+F4",
    cmd: function () {
      var v = Editor.currentView,
          rgx = /\.js$/, extraRgx = /\.x\.js$/;
      
      if (rgx.test(v.files[v.file]) || v.lang === 19 || v.lang === 15) {
        var code = JSTools.getText(),
            file = v.files[v.file].trim(), saved = false;
        
        if (isFile(file) && extraRgx.test(file)) {
          XFile.write(saved = file.replace(extraRgx, ".js"), code);
        }
        else {
          MenuCmds.FILE_NEW();
          MenuCmds.LANG_JS();
          Editor.currentView.text = code;
        }
        
        if (saved) {
          var msg = "Compiled to " + saved; // " + file + "
          JSTools.notify(msg);
        }
      }
      else {
        alert("Můžete kompilovat pouze JS soubory!");
      }
    },
    
    ctrl: true,
    key: Key.F4
  };
  
  exMenu.addItem(item);
  Editor.addHotKey(item);
  
  exMenu.addSeparator();
  
  // Settings
  var settings = GlobalSettings.get("Expanso"), opt;
  
  if (!settings) {
    GlobalSettings.set("Expanso", settings = {});
  }
  
  function setTurn(m) {
    settings.closureCompiler = m;
    
    GlobalSettings.set("Expanso", settings);
    
    opt.checked = m;
    JSTools.getText = m ? newGetText : getText;
  }
  
  var opt = exMenu.addItem({
    text: "Allow in Closure Compiler",
    cmd: function () {
      setTurn(!opt.checked);
    }
  });
  
  if (settings.closureCompiler) {
    setTurn(true);
  }
})();