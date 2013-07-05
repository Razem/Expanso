var Global = {
  get: {},
  unpack: function () {
    for (var i in this.get) {
      eval(i + " = this.get[i];");
    }
  }
};

var Key, URI;
(function () {
  
  var global = Global.get;
  
  // legio/std
  (function(l,j){var k=function(){return k},h=k.nil=function(a){return a===j||null===a};k.or=function(a,f){return h(a)?f:a};var a=Object.prototype,p=a.hasOwnProperty,q=a.toString;Object.is||(Object.is=function(a,f){return 0===a&&0===f?1/a===1/f:a!==a&&f!==f?!0:a===f});var r=Object.is;Object.is=function(a){return 1===arguments.length?"object"===typeof a&&null!==a:r.apply(Object,arguments)};Object.owns=function(a,f){return p.call(a,f)};Object.create||(Object.create=function(a){var f=function(){};f.prototype=
  a;return new f});Object.keys||(Object.keys=function(a){var f=[],d;for(d in a)Object.owns(a,d)&&f.push(d);return f});Object.isEmpty=Object.empty=function(a){if(!h(a))for(var f in a)if(Object.owns(a,f))return!1;return!0};Object.clone=function f(d){if(Object.is(d)&&d!==l&&!d.nodeType){var c=Array.is(d)?[]:{},a;for(a in d)Object.owns(d,a)&&(c[a]=f(d[a]));return c}return d};Object.extend=function d(a,b){var e;if(2<arguments.length)for(e=1;e<arguments.length;++e)d(a,arguments[e]);else for(e in b)Object.owns(b,
  e)&&(a[e]=b[e]);return a};Object.merge=function(){for(var d={},a=0;a<arguments.length;++a)Object.extend(d,arguments[a]);return d};Object.forEach=Object.each=function(d,a){for(var b in d)if(Object.owns(d,b)&&a.call(d,d[b],b,d))break};Array.isArray||(Array.isArray=function(d){return d instanceof Array||"[object Array]"===q.call(d)});Array.is=Array.isArray;var a=Array.prototype,s=a.slice;Array.convert=Array.from=function(d,a,b){if(d){a||(a=0);b||(b=d.length);try{return s.call(d,a,b)}catch(e){for(var g=
  [];a<b;++a)g.push(d[a]);return g}}return[]};a.indexOf||(a.indexOf=function(d,a){for(var b=a||0,e=this.length;b<e;++b)if(this[b]===d)return b;return-1});a.lastIndexOf||(a.lastIndexOf=function(d,a){h(a)&&(a=this.length-1);for(var b=a;0<=b;b--)if(this[b]===d)return b;return-1});a.forEach||(a.forEach=function(d,a){for(var b=0;b<this.length;++b)d.call(a,this[b],b,this)});a.each=function(d,a,b){for(a=a||0;a<(b||this.length)&&!d.call(this,this[a],a,this);++a);return this};a.filter||(a.filter=function(a,
  c){for(var b=[],e=0,g=this.length;e<g;++e)a.call(c,this[e],e,this)&&b.push(this[e]);return b});a.every||(a.every=function(a,c){for(var b=0,e=this.length;b<e;++b)if(!a.call(c,this[b],b,this))return!1;return!0});a.some||(a.some=function(a,c){for(var b=0,e=this.length;b<e;++b)if(a.call(c,this[b],b,this))return!0;return!1});a.map||(a.map=function(a,c){for(var b=[],e=0,g=this.length;e<g;++e)b.push(a.call(c,this[e],e,this));return b});a.reduce||(a.reduce=function(a,c){var b=0;for(h(c)&&(c=this[b++]);b<
  this.length;++b)c=a(c,this[b],b,this);return c});a.reduceRight||(a.reduceRight=function(a,c){var b=this.length-1;for(h(c)&&(c=this[b--]);0<=b;--b)c=a(c,this[b],b,this);return c});a.add=function(a){return this.push.apply(this,a)};Function.is=function(a){return a instanceof Function||"function"===typeof a};a=Function.prototype;a.bind||(a.bind=function(a){var c=this;a===j&&(a=l);if(1>=arguments.length)return function(){return c.apply(a,arguments)};var b=Array.from(arguments,1);return function(){return c.apply(a,
  b.concat(Array.from(arguments)))}});a.bindList=function(a,c){var b=[a];b.add(c);return this.bind.apply(this,b)};a.mixin=function(a){var c=this.prototype;Object.extend(c,a);c.constructor=this;return this};a.extend=function(a){var c=this.prototype;Object.extend(this,a);this.prototype=c;return this};var t=/(\/|\.|\*|\+|\?|\||\(|\)|\[|\]|\{|\}|\\)/g;RegExp.escape=function(a){return a.replace(t,"\\$1")};String.is=function(a){return"string"===typeof a};a=String.prototype;if(!a.trim){var u=/^\s+|\s+$/g;
  a.trim=function(){return this.replace(u,"")}}if(!a.trimLeft){var v=/^\s+/g;a.trimLeft=function(){return this.replace(v,"")}}if(!a.trimRight){var w=/\s+$/g;a.trimRight=function(){return this.replace(w,"")}}a.replaceAll=function(a,c){return this.replace(RegExp(RegExp.escape(a),"g"),c)};a.replaceWhile=function(a,c){for(var b=this,e=0,g=a.length,h=c.length;-1!==(e=b.indexOf(a,e));)b=b.slice(0,e)+c+b.slice(e+g),e+=h;return b};var m=parseInt,n=parseFloat;a.toInt=function(a){return m(this,a||10)};a.toFloat=
  function(){return n(this)};a.repeat||(a.repeat=function(a){for(var c="",b=0;b<a;++b)c+=this;return c});a.contains||(a.contains=function(a,c){return-1!==this.indexOf(a,c)});a.startsWith||(a.startsWith=function(a,c){c===j&&(c=0);return this.indexOf(a,c)===c});a.endsWith||(a.endsWith=function(a,c){c===j&&(c=this.length);c-=a.length;return this.lastIndexOf(a,c)===c});Math.rand=function(a,c){return a+Math.floor(Math.random()*(c-a+1))};Math.sign||(Math.sign=function(a){return 0===a?0:0<a?1:-1});Number.is=
  function(a){return"number"===typeof a};Number.parseInt=m;Number.parse=n;Number.isNaN||(Number.isNaN=function(a){return a!==a});Number.isFinite=isFinite;Number.isNumeric=function(a){return(Number.is(a)||String.is(a)&&""!==a)&&Number.isFinite(a)};a=Number.prototype;a.limit=function(a,c){return this<a?a:this>c?c:this};a.toInt=function(){return this|0};a.toFloat=function(){return this};a.mod=function(a){return(this%a+a)%a};a.abs=function(){return Math.abs(this)};a.round=function(a){return a?(a=Math.pow(10,
  a),Math.round(this*a)/a):Math.round(this)};a.floor=function(){return Math.floor(this)};a.ceil=function(){return Math.ceil(this)};a.pow=function(a){return Math.pow(this,Number.is(a)?a:2)};a.sqrt=function(){return Math.sqrt(this)};a.log=function(a){return a?Math.log(this)/Math.log(a):Math.log(this)};a.toRad=function(){return this*Math.PI/180};a.toDeg=function(){return 180*this/Math.PI};Boolean.is=function(a){return"boolean"===typeof a};Date.now||(Date.now=function(){return+new Date});l.Legio=k})(global);
  
  // legio/oop/construct
  (function(f){var h=function(){var a=this.superConstructor;this.superConstructor=a.prototype.superConstructor;a.apply(this,arguments);delete this.superConstructor},j=function(a,b){var c=this.superConstructor.prototype;this.superConstructor=c.superConstructor;c=c[a].apply(this,b);delete this.superConstructor;return c};f.Legio.construct=function(a){var b=a.init,c=a.inherits,g=a.statics,e=a.mixins;a=a.members;if(c){var d=b.prototype=Object.create(c.prototype);d.superConstructor=c;d.superInit=h;d.superMethod=
  j;b.extend(c)}if(e)for(var d=0,f=e.length;d<f;++d)b.mixin(e[d]);a&&(c||e?b.mixin(a):b.prototype=a);g&&b.extend(g);return b.prototype.constructor=b}})(global);
  
  Global.unpack();
  
  Key = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    BREAK: 19,
    CAPS_LOCK: 20,
    ESC: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    
    ARROW_LEFT: 37,
    ARROW_UP: 38,
    ARROW_RIGHT: 39,
    ARROW_DOWN: 40,
    
    INSERT: 45,
    DELETE: 46,
    
    KEY_0: 48,
    KEY_1: 49,
    KEY_2: 50,
    KEY_3: 51,
    KEY_4: 52,
    KEY_5: 53,
    KEY_6: 54,
    KEY_7: 55,
    KEY_8: 56,
    KEY_9: 57,
    
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    
    NUM_0: 96,
    NUM_1: 97,
    NUM_2: 98,
    NUM_3: 99,
    NUM_4: 100,
    NUM_5: 101,
    NUM_6: 102,
    NUM_7: 103,
    NUM_8: 104,
    NUM_9: 105,
    NUM_STAR: 106,
    NUM_PLUS: 107,
    NUM_MINUS: 109,
    NUM_DOT: 110,
    NUM_SLASH: 111,
    NUM_LOCK: 144,
    
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123
  };

  var enc = encodeURI, dec = decodeURI, encC = encodeURIComponent, decC = decodeURIComponent;

  URI = {
    encode: enc,
    decode: dec,
    encodeComponent: encC,
    decodeComponent: decC,
    
    create: function (obj) {
      var str = "", ch = "";
      
      for (var i in obj) if (Object.owns(obj, i)) {
        str += ch + encC(i) + "=" + encC(obj[i]);
        ch = "&";
      }
      
      return str; // .slice(0, -1);
    },
    
    parse: function (str) {
      var obj = {}, parts = str.split("&"), part;
      
      for (var i = 0; i < parts.length; ++i) {
        part = parts[i].split("=");
        obj[decC(part[0])] = decC(part[1]);
      }
      
      return obj;
    }
  };

  URI.stringify = URI.create;
})();