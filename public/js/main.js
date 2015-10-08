/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "localhost:9001";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var App = __webpack_require__(1);
	// require('./router.js');
	React.render (
	    React.createElement(App, null),
	  document.getElementById('main')
	);
	// Router.init();


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	// var Constants = require('../constants/app_constants');
	// var Store = require('../stores/app_store');
	// var Actions = require('../actions/app_actions');
	var Table = __webpack_require__(2);

	var WebAPIUtils = __webpack_require__(16);
	WebAPIUtils.getData();

	var App = React.createClass({displayName: "App",
	  render:function () {
	    return(
	      React.createElement("div", {className: "app"}, 
	        "App", 
	        React.createElement(Table, null)
	      )
	    );
	  }
	});

	//Inline CSS Styles(excludes hover)
	var styles ={
	  base:{

	  }
	}

	module.exports = App;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Store = __webpack_require__(3);

	var TableRow = __webpack_require__(12);
	var TableHeader = __webpack_require__(14);
	var SearchRow = __webpack_require__(15);

	function getStateFromStores() {
	  return {
	    data: Store.getData()
	  };
	};

	var Table = React.createClass({displayName: "Table",
	  getInitialState:function() {
	    return getStateFromStores();
	  },
	  componentDidMount:function() {
	    Store.addChangeListener(this.onChange);
	  },
	  componentWillUnmount:function() {
	    Store.removeChangeListener(this.onChange);
	  },
	  onChange:function() {
	    this.setState(getStateFromStores());
	  },
	  render:function() {
	    console.log('render')
	    var contents = [];
	    this.state.data.forEach(function(rowData, i)  {
	      if (i===0) return;
	      contents.push((
	        React.createElement(TableRow, {data: rowData})
	      ));
	    });

	    return(
	      React.createElement("div", {className: "table"}, 
	        "Table", 
	        React.createElement("table", null, 
	          React.createElement(TableHeader, null), 
	          React.createElement("tbody", null, 
	            React.createElement(SearchRow, null), 
	            contents
	          )
	        )
	      )
	    );
	  }
	});

	//Inline CSS Styles(excludes hover)
	var styles ={
	  base:{

	  }
	}

	module.exports = Table;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var Dispatcher = __webpack_require__(4);
	var EventEmitter = __webpack_require__(9).EventEmitter;
	var Constants = __webpack_require__(10);
	var assign = __webpack_require__(11);

	var CHANGE_EVENT = 'change';

	var headerNames = [];
	var headerTypes = [];
	var data = [];
	var filterTerms = [];
	var filteredData = [];


	//Listeners and Getters
	var TableStore = assign({}, EventEmitter.prototype, {
	  emitChange: function() {
	    this.emit(CHANGE_EVENT);
	  },
	  addChangeListener: function(callback) {
	    this.on(CHANGE_EVENT, callback);
	  },
	  removeChangeListener: function(callback) {
	    this.removeListener(CHANGE_EVENT, callback);
	  },
	  getData: function() {
	    if (filterTerms.length === 0) return data;
	    return filteredData;
	  },
	  getHeaderNames: function() {
	    return headerNames;
	  },
	  getHeaderTypes: function() {
	    return headerTypes;
	  }
	});

	//Process Actions
	TableStore.dispatchToken = Dispatcher.register(function(payload){
	  switch(payload.type){
	    case Constants.RECEIVE_TABLE_DATA:
	      loadInitialData(payload);
	      TableStore.emitChange();
	      break;

	    case Constants.SET_FILTER:
	      setFilter(payload);
	      TableStore.emitChange();
	      break;
	  }

	});

	function loadInitialData(payload) {
	  data = payload.data;
	  headerNames = data[0].map(function(header) {
	    return header.split(' ')[0].substring(1);
	  });
	  headerTypes = data[0].map(function(header) {
	    var typeWithParens = header.split(' ')[1];
	    return typeWithParens.substring(1, typeWithParens.length-2);
	  });
	  console.log('Received table data');
	}

	function setFilter(payload) {
	  var columnIndex = payload.columnIndex;
	  var searchTerm = payload.searchTerm;
	  filterTerms[columnIndex] = searchTerm;
	  // Filter functional style!
	  filteredData = filterTerms.reduce(function(filteredData, filterTerm, index)  {
	    return (filterTerm === undefined || filterTerm === '') ? data : data.filter(function(row)  {
	      return row[index] === filterTerm;
	    });
	  }, data);
	  console.log('Set new filter:', columnIndex, '=', searchTerm);
	}

	//Define Custom Actions
	// function getData(){
	//   var promise = $.ajax("http://localhost:3000/data",{dataType: 'json'});

	//   promise.then( function(response){
	//      Data = response.Data;
	//      TableStore.emitChange();
	//  });
	// }

	// function setData(){
	//   var Data ="DATA";
	//   var promise = $.post("http://localhost:3000/documents",{data: document});

	//   promise.then( function(response){
	//      getData();
	//      TableStore.emitChange();
	//  });
	//}

	module.exports = TableStore;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var Dispatcher = __webpack_require__(5).Dispatcher;

	module.exports = new Dispatcher();


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2014-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	module.exports.Dispatcher = __webpack_require__(6);


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright (c) 2014-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule Dispatcher
	 * 
	 * @preventMunge
	 */

	'use strict';

	exports.__esModule = true;

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var invariant = __webpack_require__(8);

	var _prefix = 'ID_';

	/**
	 * Dispatcher is used to broadcast payloads to registered callbacks. This is
	 * different from generic pub-sub systems in two ways:
	 *
	 *   1) Callbacks are not subscribed to particular events. Every payload is
	 *      dispatched to every registered callback.
	 *   2) Callbacks can be deferred in whole or part until other callbacks have
	 *      been executed.
	 *
	 * For example, consider this hypothetical flight destination form, which
	 * selects a default city when a country is selected:
	 *
	 *   var flightDispatcher = new Dispatcher();
	 *
	 *   // Keeps track of which country is selected
	 *   var CountryStore = {country: null};
	 *
	 *   // Keeps track of which city is selected
	 *   var CityStore = {city: null};
	 *
	 *   // Keeps track of the base flight price of the selected city
	 *   var FlightPriceStore = {price: null}
	 *
	 * When a user changes the selected city, we dispatch the payload:
	 *
	 *   flightDispatcher.dispatch({
	 *     actionType: 'city-update',
	 *     selectedCity: 'paris'
	 *   });
	 *
	 * This payload is digested by `CityStore`:
	 *
	 *   flightDispatcher.register(function(payload) {
	 *     if (payload.actionType === 'city-update') {
	 *       CityStore.city = payload.selectedCity;
	 *     }
	 *   });
	 *
	 * When the user selects a country, we dispatch the payload:
	 *
	 *   flightDispatcher.dispatch({
	 *     actionType: 'country-update',
	 *     selectedCountry: 'australia'
	 *   });
	 *
	 * This payload is digested by both stores:
	 *
	 *   CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
	 *     if (payload.actionType === 'country-update') {
	 *       CountryStore.country = payload.selectedCountry;
	 *     }
	 *   });
	 *
	 * When the callback to update `CountryStore` is registered, we save a reference
	 * to the returned token. Using this token with `waitFor()`, we can guarantee
	 * that `CountryStore` is updated before the callback that updates `CityStore`
	 * needs to query its data.
	 *
	 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
	 *     if (payload.actionType === 'country-update') {
	 *       // `CountryStore.country` may not be updated.
	 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
	 *       // `CountryStore.country` is now guaranteed to be updated.
	 *
	 *       // Select the default city for the new country
	 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
	 *     }
	 *   });
	 *
	 * The usage of `waitFor()` can be chained, for example:
	 *
	 *   FlightPriceStore.dispatchToken =
	 *     flightDispatcher.register(function(payload) {
	 *       switch (payload.actionType) {
	 *         case 'country-update':
	 *         case 'city-update':
	 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
	 *           FlightPriceStore.price =
	 *             getFlightPriceStore(CountryStore.country, CityStore.city);
	 *           break;
	 *     }
	 *   });
	 *
	 * The `country-update` payload will be guaranteed to invoke the stores'
	 * registered callbacks in order: `CountryStore`, `CityStore`, then
	 * `FlightPriceStore`.
	 */

	var Dispatcher = (function () {
	  function Dispatcher() {
	    _classCallCheck(this, Dispatcher);

	    this._callbacks = {};
	    this._isDispatching = false;
	    this._isHandled = {};
	    this._isPending = {};
	    this._lastID = 1;
	  }

	  /**
	   * Registers a callback to be invoked with every dispatched payload. Returns
	   * a token that can be used with `waitFor()`.
	   */

	  Dispatcher.prototype.register = function register(callback) {
	    var id = _prefix + this._lastID++;
	    this._callbacks[id] = callback;
	    return id;
	  };

	  /**
	   * Removes a callback based on its token.
	   */

	  Dispatcher.prototype.unregister = function unregister(id) {
	    !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.unregister(...): `%s` does not map to a registered callback.', id) : invariant(false) : undefined;
	    delete this._callbacks[id];
	  };

	  /**
	   * Waits for the callbacks specified to be invoked before continuing execution
	   * of the current callback. This method should only be used by a callback in
	   * response to a dispatched payload.
	   */

	  Dispatcher.prototype.waitFor = function waitFor(ids) {
	    !this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): Must be invoked while dispatching.') : invariant(false) : undefined;
	    for (var ii = 0; ii < ids.length; ii++) {
	      var id = ids[ii];
	      if (this._isPending[id]) {
	        !this._isHandled[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): Circular dependency detected while ' + 'waiting for `%s`.', id) : invariant(false) : undefined;
	        continue;
	      }
	      !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): `%s` does not map to a registered callback.', id) : invariant(false) : undefined;
	      this._invokeCallback(id);
	    }
	  };

	  /**
	   * Dispatches a payload to all registered callbacks.
	   */

	  Dispatcher.prototype.dispatch = function dispatch(payload) {
	    !!this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.') : invariant(false) : undefined;
	    this._startDispatching(payload);
	    try {
	      for (var id in this._callbacks) {
	        if (this._isPending[id]) {
	          continue;
	        }
	        this._invokeCallback(id);
	      }
	    } finally {
	      this._stopDispatching();
	    }
	  };

	  /**
	   * Is this Dispatcher currently dispatching.
	   */

	  Dispatcher.prototype.isDispatching = function isDispatching() {
	    return this._isDispatching;
	  };

	  /**
	   * Call the callback stored with the given id. Also do some internal
	   * bookkeeping.
	   *
	   * @internal
	   */

	  Dispatcher.prototype._invokeCallback = function _invokeCallback(id) {
	    this._isPending[id] = true;
	    this._callbacks[id](this._pendingPayload);
	    this._isHandled[id] = true;
	  };

	  /**
	   * Set up bookkeeping needed when dispatching.
	   *
	   * @internal
	   */

	  Dispatcher.prototype._startDispatching = function _startDispatching(payload) {
	    for (var id in this._callbacks) {
	      this._isPending[id] = false;
	      this._isHandled[id] = false;
	    }
	    this._pendingPayload = payload;
	    this._isDispatching = true;
	  };

	  /**
	   * Clear bookkeeping used for dispatching.
	   *
	   * @internal
	   */

	  Dispatcher.prototype._stopDispatching = function _stopDispatching() {
	    delete this._pendingPayload;
	    this._isDispatching = false;
	  };

	  return Dispatcher;
	})();

	module.exports = Dispatcher;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 7 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule invariant
	 */

	"use strict";

	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */

	var invariant = function (condition, format, a, b, c, d, e, f) {
	  if (process.env.NODE_ENV !== 'production') {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  }

	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error('Invariant Violation: ' + format.replace(/%s/g, function () {
	        return args[argIndex++];
	      }));
	    }

	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	};

	module.exports = invariant;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 9 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 10 */
/***/ function(module, exports) {

	//Specific Constants for TableStore
	var TableConstants = {
	  RECEIVE_TABLE_DATA: "RECEIVE_TABLE_DATA",
	  SET_FILTER: "SET_FILTER"
	}

	module.exports = TableConstants;


/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function ToObject(val) {
		if (val == null) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function ownEnumerableKeys(obj) {
		var keys = Object.getOwnPropertyNames(obj);

		if (Object.getOwnPropertySymbols) {
			keys = keys.concat(Object.getOwnPropertySymbols(obj));
		}

		return keys.filter(function (key) {
			return propIsEnumerable.call(obj, key);
		});
	}

	module.exports = Object.assign || function (target, source) {
		var from;
		var keys;
		var to = ToObject(target);

		for (var s = 1; s < arguments.length; s++) {
			from = arguments[s];
			keys = ownEnumerableKeys(Object(from));

			for (var i = 0; i < keys.length; i++) {
				to[keys[i]] = from[keys[i]];
			}
		}

		return to;
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var Constants = __webpack_require__(10);
	var Store = __webpack_require__(3);
	var Actions = __webpack_require__(13);

	var TableRow = React.createClass({displayName: "TableRow",
	  render:function () {
	    var contents = this.props.data.map(function(data)  {
	      return (React.createElement("td", null, " ", data, " "));
	    });
	    return (
	      React.createElement("div", {className: "tableRow"}, 
	        React.createElement("tr", null, " ", contents, " ")
	      )
	    );
	  }
	});

	var styles ={
	  base:{

	  }
	}

	module.exports = TableRow;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var Dispatcher = __webpack_require__(4);
	var Constants = __webpack_require__(10);

	var TableActions = {
	  receiveData: function(data) {
	    Dispatcher.dispatch({
	      type: Constants.RECEIVE_TABLE_DATA,
	      data: data
	    });
	  },
	  setFilter: function(columnIndex, searchTerm) {
	    Dispatcher.dispatch({
	      type: Constants.SET_FILTER,
	      columnIndex: columnIndex,
	      searchTerm: searchTerm
	    });
	  }
	};

	module.exports = TableActions;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var Store = __webpack_require__(3);

	function getStateFromStores() {
	  return {
	    headerNames: Store.getHeaderNames()
	  };
	};

	var TableHeader = React.createClass({displayName: "TableHeader",
	  getInitialState:function () {
	    return getStateFromStores();
	  },
	  render:function () {
	    var contents = this.state.headerNames.map(function(header)  {
	      return (React.createElement("th", {key: header}, " ", header, " "));
	    });
	    return (
	      React.createElement("div", {className: "tableHeader"}, 
	        React.createElement("thead", null, " ", React.createElement("tr", null, " ", contents, " "), " ")
	      )
	    )
	  }
	});

	var styles ={
	  base:{

	  }
	}

	module.exports = TableHeader;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var Actions = __webpack_require__(13);
	var Store = __webpack_require__(3);

	var TableRow = __webpack_require__(12);

	function getStateFromStores () {
	  return {
	    headerTypes: Store.getHeaderTypes()
	  }
	}

	var SearchRow = React.createClass({displayName: "SearchRow",
	  getInitialState:function () {
	    return getStateFromStores()
	  },
	  handleSubmit:function (columnIndex, e) {
	    e.preventDefault();
	    var searchTerm = React.findDOMNode(this.refs[columnIndex]).value.trim();
	    Actions.setFilter(columnIndex, searchTerm);
	    console.log('Filter for', searchTerm);
	  },
	  render:function () {
	    var types = this.state.headerTypes;
	    var content = types.map(function(type, columnIndex)  {
	      return (
	        React.createElement("td", {key: type+columnIndex}, 
	          React.createElement("form", {onSubmit: this.handleSubmit.bind(this, columnIndex)}, 
	            React.createElement("input", {type: "text", placeholder: type, ref: columnIndex})
	          )
	        )
	      );
	    }.bind(this));

	    return (
	      React.createElement("div", {className: "searchRow"}, 
	        React.createElement("tr", null, " ", content, " ")
	      )
	    );
	  }
	})


	var styles ={
	  base:{

	  }
	}

	module.exports = SearchRow;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	TableStore = __webpack_require__(3);
	TableActions = __webpack_require__(13);

	module.exports.getData = function() {
	  var data = __webpack_require__(17);
	  TableActions.receiveData(data);
	};


/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = [["\"sessionId (text)\"","\"page (text)\"","\"latency (number)\"","\"timeOnPage (number)\""],["373a3a5c","","23",""],["b8d61925","explore","192","186.789"],["b8b49b77","explore","173","48.976"],["b8b15168","","197",""],["37ea87a4","welcome","7","38.607"],["3814607e","query","40","427.119"],["b8e76ad2","query","38","427.605"],["b90982a2","index","26","8.860"],["b89b9862","explore","22","136.925"],["37ea53f9","explore","52","134.554"],["37ea53f9","query","21","429.473"],["38bb2703","query","270","282.341"],["3894c66d","query","17","303.908"],["b80b8185","welcome","7","30.540"],["b8556288","welcome","7","28.137"],["b830fae8","query","335","443.570"],["b8b82219","index","40","46.444"],["b79c1945","explore","28","54.154"],["b98fca9e","","10",""],["392fb754","","10",""],["b86a2a4a","query","17","355.662"],["b93924ef","query","17","418.320"],["b8ae0246","welcome","62","16.689"],["b8b82219","welcome","7","29.753"],["b736c527","query","17","352.100"],["3859b26b","query","42","435.858"],["b8f17614","explore","65","119.231"],["38e25a69","query","26","443.814"],["b7e5c726","query","17","390.268"],["3852feca","query","43","418.917"],["b87de71f","index","56","61.227"],["b8e76ad2","index","8","61.063"],["b818f238","query","17","359.382"],["b902f4c8","query","26","414.541"],["b8aad9a3","explore","90","146.760"],["397964c7","query","372","447.779"],["38829882","welcome","112","21.073"],["b6d5d008","query","60","406.635"],["b9029bfd","","78",""],["b89558df","query","312","281.525"],["b6593f0f","query","23","344.576"],["386decd1","query","19","285.058"],["3939304e","explore","23","118.953"],["b7bc209f","query","101","390.821"],["b91fca56","welcome","11","25.305"],["3938332c","welcome","37","36.229"],["35f6fd0c","welcome","7","37.266"],["376b0b6b","explore","103","92.470"],["b8ae0246","query","22","473.623"],["379783af","welcome","122","33.187"],["38871902","welcome","39","27.405"],["387aa68f","query","92","374.530"],["b904d79e","query","17","263.929"],["b85963e5","","69",""],["394747f4","query","17","323.569"],["b85965ea","index","21","45.806"],["b907af33","explore","22","78.873"],["b8a8420a","index","19","64.318"],["38717a91","explore","103","63.715"],["3803e0d1","welcome","7","27.841"],["b8b49b77","explore","362","122.560"],["b8831c91","query","17","373.113"],["3803decc","welcome","20","34.402"],["b8e093fc","welcome","38","23.308"],["38e25a69","query","17","323.636"],["3814607e","welcome","17","22.933"],["b9419e0f","query","18","355.196"],["b690a8a0","query","90","370.316"],["38829882","query","17","316.625"],["b7cb6c21","","138",""],["b835caaf","query","17","303.975"],["38f847d8","query","74","337.113"],["b902971d","index","4","17.927"],["38233d40","query","164","385.730"],["b858e005","query","50","400.506"],["392aafe6","query","17","406.609"],["b8e239f0","explore","46","50.530"],["b897b896","index","4","83.071"],["b91ae8cc","query","221","437.492"],["b8a0c257","explore","183","123.396"],["38871902","","181",""],["38448ed1","index","7","65.962"],["b93924ef","explore","169","139.301"],["b9386500","explore","181","135.699"],["b82dcbca","welcome","12","25.080"],["36a4b85c","query","24","466.296"],["b892117c","explore","33","85.484"],["b7c7c7e9","query","144","394.741"],["b7f97cba","explore","143","13.505"],["3966f55d","welcome","7","28.783"],["382a0405","index","4","29.260"],["b830fae8","query","100","439.006"],["b813d550","explore","232","77.396"],["b79c623e","explore","43","98.167"],["b8a99a72","explore","219","173.262"],["38b374c2","welcome","51","31.610"],["38c6dd76","index","47","65.628"],["b6bd3fc0","query","17","489.919"],["b94f36b4","","10",""],["b78158cd","explore","147","103.641"],[""]]

/***/ }
/******/ ]);