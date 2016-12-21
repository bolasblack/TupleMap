'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function TupleMap(opts) {
  if (opts && 'limit' in opts) {
    this._limit = opts.limit;
  }
  this.clear();
}

TupleMap.prototype = {
  _hash: function _hash(tuple) {
    // Speed up hash generation for the folowing pattern:
    // if ( !cache.has(t) ) { cache.set( t, slowFn(t) ); }
    if (tuple === this._lastTuple) {
      return this._lastHash;
    }

    var l = tuple.length;
    var aKey = [];

    for (var i = 0; i < l; i++) {
      var arg = tuple[i];
      var argType = typeof arg === 'undefined' ? 'undefined' : _typeof(arg);

      // if the argument is not a primitive, get a unique (memoized?) id for it
      // (typeof null is "object", but should be considered a primitive)
      if (arg !== null && (argType === 'object' || argType === 'function')) {
        if (this._idMap.has(arg)) {
          aKey.push(this._idMap.get(arg));
        } else {
          var id = '#' + this._id++;
          this._idMap.set(arg, id);
          aKey.push(id);
        }

        // otherwise, add the argument and its type to the aKey
      } else {
        aKey.push(argType === 'string' ? '"' + arg + '"' : '' + arg);
      }
    }

    this._lastTuple = tuple;
    // concatenate serialized arguments using a complex separator
    // (to avoid key collisions)
    this._lastHash = aKey.join('/<[MI_SEP]>/');

    return this._lastHash;
  },

  has: function has(tuple) {
    var hash = this._hash(tuple);
    return this._cache.has(hash);
  },

  set: function set(tuple, value) {
    var length = tuple.length;
    var hash = this._hash(tuple);

    if (this._limit !== undefined) {
      this._cache.delete(hash);
    }

    this._cache.set(hash, value);

    if (this._limit !== undefined && this._cache.size > this._limit) {
      this._cache.delete(this._cache.keys().next().value);
    }

    return this;
  },

  get: function get(tuple) {
    var hash = this._hash(tuple);

    if (this._limit !== undefined && this._cache.has(hash)) {
      var value = this._cache.get(hash);
      this._cache.delete(hash);
      this._cache.set(hash, value);
      return value;
    }

    return this._cache.get(hash);
  },

  clear: function clear() {
    this._cache = new Map();
    this._idMap = new WeakMap();
    this._id = 0;
    delete this._lastTuple;
    delete this._lastHash;
  }
};

exports.default = TupleMap;

//# sourceMappingURL=index.js.map