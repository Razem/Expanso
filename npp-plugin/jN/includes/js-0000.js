var JSTools = {},
    XFile = {};
(function () {
  var fs = JSTools.fs = new ActiveXObject("Scripting.FileSystemObject");
  
  XFile.read = function (file) {
    var f = fs.OpenTextFile(file, 1, false, 1);
    var text = f.ReadAll();
    f.Close();
    
    return text;
  };
  
  XFile.write = function (file, text) {
    var f = fs.CreateTextFile(file, true);
    f.Write(text);
    f.Close();
  };
  
  var dial = new Dialog({
    height: 0,
    dockable: {
      docking: "bottom",
      name: "JSTools"
    },
    title: ""
  });
  
  JSTools.notify = function notify(text) {
    var dock = dial.htmlDialog;
    dock.title = text;
    dock.visible = true;
  };
  
  JSTools.getText = function () {
    return Editor.currentView.text;
  };
  
  JSTools.menu = Editor.addMenu({
    text: "JavaScript"
  });
})();