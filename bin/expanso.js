var
ExtraCompiler = require("../lib/extra-compiler"),
Path = require("path"),
FS = require("fs");

var
argv = process.argv,
dir = process.cwd(),
inFile = argv[2],
outFile = argv[3];

if (!inFile) {
  console.log("You have to define the file to compile!");
  process.exit(1);
}

if (!outFile) {
  outFile = inFile.replace(/\.jsx$/, ".js");
  
  if (inFile === outFile) {
    outFile += ".js";
  }
}

inFile = Path.resolve(dir, inFile);
outFile = Path.resolve(dir, outFile);

var code = FS.readFileSync(inFile, "utf8");

try {
  var
  compiler = new ExtraCompiler(code);
  compiledCode = compiler.compile();
  
  FS.writeFileSync(outFile, compiledCode, "utf8");
  
  console.log("The file was compiled to " + outFile);
}
catch (ex) {
  console.log(ex);
}
