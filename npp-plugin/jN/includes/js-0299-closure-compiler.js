(function () {
  var fs = JSTools.fs;
  var jsMenu = JSTools.menu;
  
  var ccMenu = jsMenu.addMenu({
    text: "Closure Compiler"
  });
  
  // Settings
  var settings = GlobalSettings.get("ClosureCompiler"), method;
  
  function setMethod(m) {
    method = m;
    settings.method = m;
    
    GlobalSettings.set("ClosureCompiler", settings);
    
    checkMethod();
  }
  function checkMethod() {
    for (var i in methods) {
      methods[i].checked = false;
    }
    
    methods[method].checked = true;
  }
  
  function isFile(file) {
    return /\\/.test(file);
  }
  
  // Own functions for compiling
  function compile(level) {
    var v = Editor.currentView,
        rgx = /\.jsx?$/, extraRgx = /\.jsx$/;
    
    if (rgx.test(v.files[v.file]) || v.lang === 19 || v.lang === 15) {
      // Editor.open("test.js");
      var xhr = new ActiveXObject("MSXML2.XMLHTTP");
      
      if (xhr) {
        var post = URI.create({
          js_code: JSTools.getText(),
          compilation_level: level || "SIMPLE_OPTIMIZATIONS",
          output_format: "json",
          output_info: "compiled_code"
        });
        
        xhr.open("POST", "http://closure-compiler.appspot.com/compile", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("Content-Length", post.length);
        xhr.setRequestHeader("Connection", "close");
        
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              var data = JSON.parse(xhr.responseText);
              
              // debug(data);
              
              var file = v.files[v.file].trim(), saved = false;
              
              if (isFile(file) && method === "save") {
                XFile.write(saved = file.replace(rgx, ".min.js"), data.compiledCode);
              }
              else if (isFile(file) && method === "save-extra" && extraRgx.test(file)) {
                XFile.write(saved = file.replace(extraRgx, ".js"), data.compiledCode);
              }
              else {
                MenuCmds.FILE_NEW();
                MenuCmds.LANG_JS();
                Editor.currentView.text = data.compiledCode;
              }
              
              if (saved) {
                var msg = "Compiled to " + saved; // " + file + "
                JSTools.notify(msg);
              }
            }
          }
        };
        
        xhr.send(post);
        // JSTools.notify("MUHAHA");
      }
    }
    else {
      alert("Můžete kompilovat pouze JS soubory!");
    }
  }
  
  var simpleItem = {
    text: "Simple\tCtrl+F5",
    cmd: function () {
      compile();
    },
    
    ctrl: true,
    key: Key.F5
  };
  
  var advancedItem = {
    text: "Advanced\tCtrl+F6",
    cmd: function () {
      compile("ADVANCED_OPTIMIZATIONS");
    },
    
    ctrl: true,
    key: Key.F6
  };
  
  ccMenu.addItem(simpleItem);
  Editor.addHotKey(simpleItem);
  
  ccMenu.addItem(advancedItem);
  Editor.addHotKey(advancedItem);
  
  ccMenu.addSeparator();
  
  var methods = {
    "save": ccMenu.addItem({
      text: "Save to a .min.js file",
      cmd: function () {
        setMethod("save");
      }
    }),
    "save-extra": ccMenu.addItem({
      text: "Save to a .js file from .jsx",
      cmd: function () {
        setMethod("save-extra");
      }
    }),
    "open": ccMenu.addItem({
      text: "Open in a new file",
      cmd: function () {
        setMethod("open");
      }
    })
  };
  
  // Init settings
  if (!settings) {
    GlobalSettings.set("ClosureCompiler", settings = {});
    
    setMethod("save");
  }
  method = settings.method;
  checkMethod();
})();