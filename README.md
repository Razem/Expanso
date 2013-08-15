Expanso
=======

This library allows you to use lambda expressions, precompiler features and lots of other things in JavaScript.

## Examples
Lambda expressions:
```JavaScript
// An immediately returning function
var a = x -> x * x;

// Using two parameters
var b = (x, y) -> x * y;

// Using the function body
var c = (x, y) -> {
  if (x === y) {
    return 0;
  }
  
  return x * y;
};

// Default parameters
var d = (x, y = 10) -> {
  // …
};

// Rest parameters
var f = (a, b, c...) -> {
  alert(c.length);
};

// Fat arrow functions
var obj = {
  name: "Cute object",
  getFn: () -> {
    return () => @name;
  }
};

var fn = obj.getFn();
alert(fn()); // "Cute object"
```

The "this" shorthand:
```JavaScript
@someName = "Hello world!"; // means this.someName
console.log(@); // means this

// "this" parameters
var e = (@x, @y) -> {
  @x === x;
  @y === y;
  // Both evalute to true
};
```

Multi-line strings and a string interpolation:
```JavaScript
// (The indentation - in this case 10 spaces - is cleared on every line)
var str = `
          <div class="article">
            <div class="author">#{author}</div>
            #{@content}
            #{@[index]}
            #{comments.join("<br>")}
          </div>
          `;
```

Better regular expressions (in development):
```JavaScript
var rgx = #/some data/g;
```

### Precompiler features

Modules (CommonJS, AMD):
```JavaScript
#module (
  SomeModule = "some-module",
  AnotherModule = "another-module"
)

var ThisModule = {
  sayHello: () -> {
    alert("Hello world!");
  }
};

#export ThisModule;

// Support for browser modules
#module GlobalNameOfModule (
  SomeModule = "some-module" = GlobalNameOfSomeModule,
  AnotherModule = "another-module" = GlobalNameOfAnotherModule
)
```

The foreach cycle:
```JavaScript
#foreach (key in object) {
  // …
}
#foreach (key : val in object) {
  // …
}

#foreach (key of array) {
  // …
}
#foreach (key : val of array) {
  // …
}
```

Scoping:
```JavaScript
var a = "world", b = "Hello";
#scope (a = b, b = a) {
  alert(a + ", " + b + "!"); // Hello, world!
};

var c = #scope (a = b, b = a) {
  var exports = {};
  
  exports.greeting = a + ", " + b + "!";
  
  #export exports;
};
alert(c.greeting);

var d = #(a = b, b = a) { // shorthand
  // …
};
```

Support of the "super" keyword using the Legio.construct:
```JavaScript
var A = construct({
  init: (a, b) -> {
    @a = a.toString();
    @b = b.toString();
  },
  
  members: {
    showValues: () -> {
      alert(@a);
      alert(@b);
    }
  }
});

var B = construct({
  inherits: A,
  
  init: (a, b, c) -> {
    #super(a, b); // this.superInit(a, b)
    
    @c = c.toString();
  },
  
  members: {
    showValues: () -> {
      #super.showValues(); // this.superCall("showValues")
      alert(@c);
    },
    
    getNewParentInstance: (a, b) -> {
      var Parent = #super; // this.superConstructor
      
      return new Parent(a, b);
    }
  }
});
```

## Compiling
```HTML
<script src="http://requirejs.org/docs/release/2.1.6/minified/require.js"></script>
<script>
require.config({
  baseUrl: "/",
  paths: {
    "legio": "legio/src",
    "expanso": "src"
  }
});
</script>

<script>
require(["expanso/extra-compiler", "legio/request"], function (ExtraCompiler, Request) {
  
  Request.file("test-file.js").then(function (code) {
    var compiler = new ExtraCompiler(code);
    
    alert(compiler.compile());
  });
  
});
</script>
```

Or you can use the NPM package:
```
npm install -g expanso

expanso test-file.jsx
expanso test-file.jsx someDir/test-file.js
```
