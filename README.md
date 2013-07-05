Expanso
=======

This library allows you to use lambda expressions, precompiler features and lots of other things in JavaScript.

## Examples
```
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

// The "this" shorthand
@someName = "Hello world!"; // means this.someName
console.log(@); // means this

// "this" parameters
var e = (@x, @y) -> {
  @x === x;
  @y === y;
  // Both evalute to true
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

// *** Precompiler features ***

// Modules (CommonJS, AMD), export
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

// The foreach cycle
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

// Support of the "super" keyword using the Legio.construct
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
```
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