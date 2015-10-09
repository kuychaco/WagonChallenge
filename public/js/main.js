/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "localhost:9001";
/******/
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

	var MyTable = __webpack_require__(2);
	var AppHeader = __webpack_require__(16);
	
	var WebAPIUtils = __webpack_require__(17);
	WebAPIUtils.getData();
	
	__webpack_require__(19);
	
	var App = React.createClass({displayName: "App",
	  render:function () {
	    return(
	      React.createElement("div", null, 
	        React.createElement(AppHeader, null), 
	        React.createElement("h2", null, " Wagon Programming Challenge "), 
	        React.createElement(Panel, {className: "app"}, 
	          React.createElement(MyTable, null)
	        )
	      )
	    );
	  }
	});
	
	module.exports = App;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Store = __webpack_require__(3);
	
	var TableRow = __webpack_require__(12);
	var TableHeader = __webpack_require__(14);
	
	function getStateFromStores() {
	  return {
	    data: Store.getData()
	  };
	};
	
	var MyTable = React.createClass({displayName: "MyTable",
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
	    var contents = this.state.data.map(function(rowData, i)  {
	      return (React.createElement(TableRow, {key: 'id-'+rowData[0]+i, data: rowData}));
	    });
	
	    return(
	      React.createElement("div", {className: "table", style: styles}, 
	        React.createElement(Table, {striped: true, bordered: true, condensed: true, hover: true}, 
	          React.createElement(TableHeader, null), 
	          React.createElement("tbody", null, 
	            contents
	          )
	        )
	      )
	    );
	  }
	});
	
	//Inline CSS Styles(excludes hover)
	var styles ={
	  table:{
	    margin: 'auto'
	  }
	}
	
	module.exports = MyTable;


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
	var originalData = [];
	var filterTerms = [];
	var filteredData = [];
	var pageRowsByType = {};
	
	
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
	    if (filterTerms.length === 0) return originalData;
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
	  var data = payload.data;
	  data.forEach(function(row, index)  {
	    if (index === 0) { headers = row; return; }
	    if (!pageRowsByType[row[1]]) pageRowsByType[row[1]] = [];
	    pageRowsByType[row[1]].push(index);
	
	    originalData.push(row);
	  });
	  // check if last row is empty
	  if (data[data.length-1].length < 4) data.pop();
	  var headers = data[0];
	  headerNames = headers.map(function(header) {
	    return header.split(' ')[0].substring(1);
	  });
	  headerTypes = headers.map(function(header) {
	    var typeWithParens = header.split(' ')[1];
	    return typeWithParens.substring(1, typeWithParens.length-2);
	  });
	  console.log('Received table data');
	}
	
	function setFilter(payload) {
	  var columnIndex = payload.columnIndex;
	  var searchTerm = payload.searchTerm;
	  filterTerms[columnIndex] = searchTerm;
	  // Filter data
	  filteredData = filterTerms.reduce(function(filteredData, filterTerm, index)  {
	    return (filterTerm === undefined) ? filteredData : filteredData.filter(function(row)  {
	      return row[index] && row[index].indexOf(filterTerm) > -1;
	    });
	  }, data);
	  console.log('Filtered data for: column', columnIndex, '=', searchTerm);
	}
	
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
	    var data = this.props.data;
	    var contents = data.map(function(value, index)  {
	      return (React.createElement("td", null, " ", value, " "));
	    });
	    return (React.createElement("tr", null, " ", contents, " "));
	  }
	});
	
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

	var Actions = __webpack_require__(13);
	var Store = __webpack_require__(3);
	var _ = __webpack_require__(15);
	
	
	function getStateFromStores() {
	  return {
	    headerNames: Store.getHeaderNames()
	  };
	};
	
	var TableHeader = React.createClass({displayName: "TableHeader",
	  getInitialState:function () {
	    return getStateFromStores();
	  },
	  handleKeyUp:function (columnIndex, e) {
	    var searchTerm = React.findDOMNode(this.refs[columnIndex]).value.trim();
	    if (e.which === 13) {
	      Actions.setFilter(columnIndex, searchTerm);
	      console.log('Filter for', searchTerm, 'in column', columnIndex);
	    }
	    else if (e.which === 8 && searchTerm.length === 0) {
	      Actions.setFilter(columnIndex, undefined);
	      console.log('Clear filter for column', columnIndex);
	    }
	  },
	  render:function () {
	    var contents = this.state.headerNames.map(function(header, columnIndex)  {
	      return (
	        React.createElement("th", {key: header}, 
	          header.toUpperCase(), 
	          React.createElement("input", {type: "text", placeholder: "search", ref: columnIndex, onKeyUp: this.handleKeyUp.bind(this, columnIndex)})
	        ));
	    }.bind(this));
	    return (
	      React.createElement("div", {className: "tableHeader"}, 
	        React.createElement("thead", null, 
	          React.createElement("tr", null, " ", contents, " "), " ")
	      )
	    )
	  }
	});
	
	module.exports = TableHeader;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.3
	//     http://underscorejs.org
	//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.
	
	(function() {
	
	  // Baseline setup
	  // --------------
	
	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;
	
	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;
	
	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
	
	  // Create quick reference variables for speed access to core prototypes.
	  var
	    push             = ArrayProto.push,
	    slice            = ArrayProto.slice,
	    toString         = ObjProto.toString,
	    hasOwnProperty   = ObjProto.hasOwnProperty;
	
	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind,
	    nativeCreate       = Object.create;
	
	  // Naked function reference for surrogate-prototype-swapping.
	  var Ctor = function(){};
	
	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };
	
	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }
	
	  // Current version.
	  _.VERSION = '1.8.3';
	
	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var optimizeCb = function(func, context, argCount) {
	    if (context === void 0) return func;
	    switch (argCount == null ? 3 : argCount) {
	      case 1: return function(value) {
	        return func.call(context, value);
	      };
	      case 2: return function(value, other) {
	        return func.call(context, value, other);
	      };
	      case 3: return function(value, index, collection) {
	        return func.call(context, value, index, collection);
	      };
	      case 4: return function(accumulator, value, index, collection) {
	        return func.call(context, accumulator, value, index, collection);
	      };
	    }
	    return function() {
	      return func.apply(context, arguments);
	    };
	  };
	
	  // A mostly-internal function to generate callbacks that can be applied
	  // to each element in a collection, returning the desired result — either
	  // identity, an arbitrary callback, a property matcher, or a property accessor.
	  var cb = function(value, context, argCount) {
	    if (value == null) return _.identity;
	    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
	    if (_.isObject(value)) return _.matcher(value);
	    return _.property(value);
	  };
	  _.iteratee = function(value, context) {
	    return cb(value, context, Infinity);
	  };
	
	  // An internal function for creating assigner functions.
	  var createAssigner = function(keysFunc, undefinedOnly) {
	    return function(obj) {
	      var length = arguments.length;
	      if (length < 2 || obj == null) return obj;
	      for (var index = 1; index < length; index++) {
	        var source = arguments[index],
	            keys = keysFunc(source),
	            l = keys.length;
	        for (var i = 0; i < l; i++) {
	          var key = keys[i];
	          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
	        }
	      }
	      return obj;
	    };
	  };
	
	  // An internal function for creating a new object that inherits from another.
	  var baseCreate = function(prototype) {
	    if (!_.isObject(prototype)) return {};
	    if (nativeCreate) return nativeCreate(prototype);
	    Ctor.prototype = prototype;
	    var result = new Ctor;
	    Ctor.prototype = null;
	    return result;
	  };
	
	  var property = function(key) {
	    return function(obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  };
	
	  // Helper for collection methods to determine whether a collection
	  // should be iterated as an array or as an object
	  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
	  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	  var getLength = property('length');
	  var isArrayLike = function(collection) {
	    var length = getLength(collection);
	    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	  };
	
	  // Collection Functions
	  // --------------------
	
	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles raw objects in addition to array-likes. Treats all
	  // sparse array-likes as if they were dense.
	  _.each = _.forEach = function(obj, iteratee, context) {
	    iteratee = optimizeCb(iteratee, context);
	    var i, length;
	    if (isArrayLike(obj)) {
	      for (i = 0, length = obj.length; i < length; i++) {
	        iteratee(obj[i], i, obj);
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (i = 0, length = keys.length; i < length; i++) {
	        iteratee(obj[keys[i]], keys[i], obj);
	      }
	    }
	    return obj;
	  };
	
	  // Return the results of applying the iteratee to each element.
	  _.map = _.collect = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length,
	        results = Array(length);
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      results[index] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };
	
	  // Create a reducing function iterating left or right.
	  function createReduce(dir) {
	    // Optimized iterator function as using arguments.length
	    // in the main function will deoptimize the, see #1991.
	    function iterator(obj, iteratee, memo, keys, index, length) {
	      for (; index >= 0 && index < length; index += dir) {
	        var currentKey = keys ? keys[index] : index;
	        memo = iteratee(memo, obj[currentKey], currentKey, obj);
	      }
	      return memo;
	    }
	
	    return function(obj, iteratee, memo, context) {
	      iteratee = optimizeCb(iteratee, context, 4);
	      var keys = !isArrayLike(obj) && _.keys(obj),
	          length = (keys || obj).length,
	          index = dir > 0 ? 0 : length - 1;
	      // Determine the initial value if none is provided.
	      if (arguments.length < 3) {
	        memo = obj[keys ? keys[index] : index];
	        index += dir;
	      }
	      return iterator(obj, iteratee, memo, keys, index, length);
	    };
	  }
	
	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`.
	  _.reduce = _.foldl = _.inject = createReduce(1);
	
	  // The right-associative version of reduce, also known as `foldr`.
	  _.reduceRight = _.foldr = createReduce(-1);
	
	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, predicate, context) {
	    var key;
	    if (isArrayLike(obj)) {
	      key = _.findIndex(obj, predicate, context);
	    } else {
	      key = _.findKey(obj, predicate, context);
	    }
	    if (key !== void 0 && key !== -1) return obj[key];
	  };
	
	  // Return all the elements that pass a truth test.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, predicate, context) {
	    var results = [];
	    predicate = cb(predicate, context);
	    _.each(obj, function(value, index, list) {
	      if (predicate(value, index, list)) results.push(value);
	    });
	    return results;
	  };
	
	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, predicate, context) {
	    return _.filter(obj, _.negate(cb(predicate)), context);
	  };
	
	  // Determine whether all of the elements match a truth test.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (!predicate(obj[currentKey], currentKey, obj)) return false;
	    }
	    return true;
	  };
	
	  // Determine if at least one element in the object matches a truth test.
	  // Aliased as `any`.
	  _.some = _.any = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (predicate(obj[currentKey], currentKey, obj)) return true;
	    }
	    return false;
	  };
	
	  // Determine if the array or object contains a given item (using `===`).
	  // Aliased as `includes` and `include`.
	  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
	    if (!isArrayLike(obj)) obj = _.values(obj);
	    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
	    return _.indexOf(obj, item, fromIndex) >= 0;
	  };
	
	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function(obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function(value) {
	      var func = isFunc ? method : value[method];
	      return func == null ? func : func.apply(value, args);
	    });
	  };
	
	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, _.property(key));
	  };
	
	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs) {
	    return _.filter(obj, _.matcher(attrs));
	  };
	
	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.find(obj, _.matcher(attrs));
	  };
	
	  // Return the maximum element (or element-based computation).
	  _.max = function(obj, iteratee, context) {
	    var result = -Infinity, lastComputed = -Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value > result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };
	
	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iteratee, context) {
	    var result = Infinity, lastComputed = Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value < result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed < lastComputed || computed === Infinity && result === Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };
	
	  // Shuffle a collection, using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  _.shuffle = function(obj) {
	    var set = isArrayLike(obj) ? obj : _.values(obj);
	    var length = set.length;
	    var shuffled = Array(length);
	    for (var index = 0, rand; index < length; index++) {
	      rand = _.random(0, index);
	      if (rand !== index) shuffled[index] = shuffled[rand];
	      shuffled[rand] = set[index];
	    }
	    return shuffled;
	  };
	
	  // Sample **n** random values from a collection.
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function(obj, n, guard) {
	    if (n == null || guard) {
	      if (!isArrayLike(obj)) obj = _.values(obj);
	      return obj[_.random(obj.length - 1)];
	    }
	    return _.shuffle(obj).slice(0, Math.max(0, n));
	  };
	
	  // Sort the object's values by a criterion produced by an iteratee.
	  _.sortBy = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    return _.pluck(_.map(obj, function(value, index, list) {
	      return {
	        value: value,
	        index: index,
	        criteria: iteratee(value, index, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };
	
	  // An internal function used for aggregate "group by" operations.
	  var group = function(behavior) {
	    return function(obj, iteratee, context) {
	      var result = {};
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index) {
	        var key = iteratee(value, index, obj);
	        behavior(result, value, key);
	      });
	      return result;
	    };
	  };
	
	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
	  });
	
	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function(result, value, key) {
	    result[key] = value;
	  });
	
	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key]++; else result[key] = 1;
	  });
	
	  // Safely create a real, live array from anything iterable.
	  _.toArray = function(obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (isArrayLike(obj)) return _.map(obj, _.identity);
	    return _.values(obj);
	  };
	
	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) return 0;
	    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	  };
	
	  // Split a collection into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var pass = [], fail = [];
	    _.each(obj, function(value, key, obj) {
	      (predicate(value, key, obj) ? pass : fail).push(value);
	    });
	    return [pass, fail];
	  };
	
	  // Array Functions
	  // ---------------
	
	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[0];
	    return _.initial(array, array.length - n);
	  };
	
	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	  };
	
	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array.
	  _.last = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[array.length - 1];
	    return _.rest(array, Math.max(0, array.length - n));
	  };
	
	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, n == null || guard ? 1 : n);
	  };
	
	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, _.identity);
	  };
	
	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, strict, startIndex) {
	    var output = [], idx = 0;
	    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
	      var value = input[i];
	      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
	        //flatten current level of array or arguments object
	        if (!shallow) value = flatten(value, shallow, strict);
	        var j = 0, len = value.length;
	        output.length += len;
	        while (j < len) {
	          output[idx++] = value[j++];
	        }
	      } else if (!strict) {
	        output[idx++] = value;
	      }
	    }
	    return output;
	  };
	
	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, false);
	  };
	
	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function(array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };
	
	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
	    if (!_.isBoolean(isSorted)) {
	      context = iteratee;
	      iteratee = isSorted;
	      isSorted = false;
	    }
	    if (iteratee != null) iteratee = cb(iteratee, context);
	    var result = [];
	    var seen = [];
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var value = array[i],
	          computed = iteratee ? iteratee(value, i, array) : value;
	      if (isSorted) {
	        if (!i || seen !== computed) result.push(value);
	        seen = computed;
	      } else if (iteratee) {
	        if (!_.contains(seen, computed)) {
	          seen.push(computed);
	          result.push(value);
	        }
	      } else if (!_.contains(result, value)) {
	        result.push(value);
	      }
	    }
	    return result;
	  };
	
	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function() {
	    return _.uniq(flatten(arguments, true, true));
	  };
	
	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    var result = [];
	    var argsLength = arguments.length;
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var item = array[i];
	      if (_.contains(result, item)) continue;
	      for (var j = 1; j < argsLength; j++) {
	        if (!_.contains(arguments[j], item)) break;
	      }
	      if (j === argsLength) result.push(item);
	    }
	    return result;
	  };
	
	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function(array) {
	    var rest = flatten(arguments, true, true, 1);
	    return _.filter(array, function(value){
	      return !_.contains(rest, value);
	    });
	  };
	
	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function() {
	    return _.unzip(arguments);
	  };
	
	  // Complement of _.zip. Unzip accepts an array of arrays and groups
	  // each array's elements on shared indices
	  _.unzip = function(array) {
	    var length = array && _.max(array, getLength).length || 0;
	    var result = Array(length);
	
	    for (var index = 0; index < length; index++) {
	      result[index] = _.pluck(array, index);
	    }
	    return result;
	  };
	
	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function(list, values) {
	    var result = {};
	    for (var i = 0, length = getLength(list); i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };
	
	  // Generator function to create the findIndex and findLastIndex functions
	  function createPredicateIndexFinder(dir) {
	    return function(array, predicate, context) {
	      predicate = cb(predicate, context);
	      var length = getLength(array);
	      var index = dir > 0 ? 0 : length - 1;
	      for (; index >= 0 && index < length; index += dir) {
	        if (predicate(array[index], index, array)) return index;
	      }
	      return -1;
	    };
	  }
	
	  // Returns the first index on an array-like that passes a predicate test
	  _.findIndex = createPredicateIndexFinder(1);
	  _.findLastIndex = createPredicateIndexFinder(-1);
	
	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iteratee, context) {
	    iteratee = cb(iteratee, context, 1);
	    var value = iteratee(obj);
	    var low = 0, high = getLength(array);
	    while (low < high) {
	      var mid = Math.floor((low + high) / 2);
	      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
	    }
	    return low;
	  };
	
	  // Generator function to create the indexOf and lastIndexOf functions
	  function createIndexFinder(dir, predicateFind, sortedIndex) {
	    return function(array, item, idx) {
	      var i = 0, length = getLength(array);
	      if (typeof idx == 'number') {
	        if (dir > 0) {
	            i = idx >= 0 ? idx : Math.max(idx + length, i);
	        } else {
	            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
	        }
	      } else if (sortedIndex && idx && length) {
	        idx = sortedIndex(array, item);
	        return array[idx] === item ? idx : -1;
	      }
	      if (item !== item) {
	        idx = predicateFind(slice.call(array, i, length), _.isNaN);
	        return idx >= 0 ? idx + i : -1;
	      }
	      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
	        if (array[idx] === item) return idx;
	      }
	      return -1;
	    };
	  }
	
	  // Return the position of the first occurrence of an item in an array,
	  // or -1 if the item is not included in the array.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
	  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);
	
	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
	    if (stop == null) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = step || 1;
	
	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var range = Array(length);
	
	    for (var idx = 0; idx < length; idx++, start += step) {
	      range[idx] = start;
	    }
	
	    return range;
	  };
	
	  // Function (ahem) Functions
	  // ------------------
	
	  // Determines whether to execute a function as a constructor
	  // or a normal function with the provided arguments
	  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
	    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	    var self = baseCreate(sourceFunc.prototype);
	    var result = sourceFunc.apply(self, args);
	    if (_.isObject(result)) return result;
	    return self;
	  };
	
	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function(func, context) {
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
	    var args = slice.call(arguments, 2);
	    var bound = function() {
	      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
	    };
	    return bound;
	  };
	
	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder, allowing any combination of arguments to be pre-filled.
	  _.partial = function(func) {
	    var boundArgs = slice.call(arguments, 1);
	    var bound = function() {
	      var position = 0, length = boundArgs.length;
	      var args = Array(length);
	      for (var i = 0; i < length; i++) {
	        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return executeBound(func, bound, this, this, args);
	    };
	    return bound;
	  };
	
	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = function(obj) {
	    var i, length = arguments.length, key;
	    if (length <= 1) throw new Error('bindAll must be passed function names');
	    for (i = 1; i < length; i++) {
	      key = arguments[i];
	      obj[key] = _.bind(obj[key], obj);
	    }
	    return obj;
	  };
	
	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memoize = function(key) {
	      var cache = memoize.cache;
	      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
	      return cache[address];
	    };
	    memoize.cache = {};
	    return memoize;
	  };
	
	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function(func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function(){
	      return func.apply(null, args);
	    }, wait);
	  };
	
	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = _.partial(_.delay, _, 1);
	
	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function(func, wait, options) {
	    var context, args, result;
	    var timeout = null;
	    var previous = 0;
	    if (!options) options = {};
	    var later = function() {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    };
	    return function() {
	      var now = _.now();
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0 || remaining > wait) {
	        if (timeout) {
	          clearTimeout(timeout);
	          timeout = null;
	        }
	        previous = now;
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };
	
	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;
	
	    var later = function() {
	      var last = _.now() - timestamp;
	
	      if (last < wait && last >= 0) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          if (!timeout) context = args = null;
	        }
	      }
	    };
	
	    return function() {
	      context = this;
	      args = arguments;
	      timestamp = _.now();
	      var callNow = immediate && !timeout;
	      if (!timeout) timeout = setTimeout(later, wait);
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }
	
	      return result;
	    };
	  };
	
	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return _.partial(wrapper, func);
	  };
	
	  // Returns a negated version of the passed-in predicate.
	  _.negate = function(predicate) {
	    return function() {
	      return !predicate.apply(this, arguments);
	    };
	  };
	
	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var args = arguments;
	    var start = args.length - 1;
	    return function() {
	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) result = args[i].call(this, result);
	      return result;
	    };
	  };
	
	  // Returns a function that will only be executed on and after the Nth call.
	  _.after = function(times, func) {
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };
	
	  // Returns a function that will only be executed up to (but not including) the Nth call.
	  _.before = function(times, func) {
	    var memo;
	    return function() {
	      if (--times > 0) {
	        memo = func.apply(this, arguments);
	      }
	      if (times <= 1) func = null;
	      return memo;
	    };
	  };
	
	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = _.partial(_.before, 2);
	
	  // Object Functions
	  // ----------------
	
	  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
	                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];
	
	  function collectNonEnumProps(obj, keys) {
	    var nonEnumIdx = nonEnumerableProps.length;
	    var constructor = obj.constructor;
	    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;
	
	    // Constructor is a special case.
	    var prop = 'constructor';
	    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);
	
	    while (nonEnumIdx--) {
	      prop = nonEnumerableProps[nonEnumIdx];
	      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
	        keys.push(prop);
	      }
	    }
	  }
	
	  // Retrieve the names of an object's own properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    if (nativeKeys) return nativeKeys(obj);
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };
	
	  // Retrieve all the property names of an object.
	  _.allKeys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };
	
	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };
	
	  // Returns the results of applying the iteratee to each element of the object
	  // In contrast to _.map it returns an object
	  _.mapObject = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys =  _.keys(obj),
	          length = keys.length,
	          results = {},
	          currentKey;
	      for (var index = 0; index < length; index++) {
	        currentKey = keys[index];
	        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	      }
	      return results;
	  };
	
	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };
	
	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };
	
	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };
	
	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = createAssigner(_.allKeys);
	
	  // Assigns a given object with all the own properties in the passed-in object(s)
	  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	  _.extendOwn = _.assign = createAssigner(_.keys);
	
	  // Returns the first key on an object that passes a predicate test
	  _.findKey = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = _.keys(obj), key;
	    for (var i = 0, length = keys.length; i < length; i++) {
	      key = keys[i];
	      if (predicate(obj[key], key, obj)) return key;
	    }
	  };
	
	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function(object, oiteratee, context) {
	    var result = {}, obj = object, iteratee, keys;
	    if (obj == null) return result;
	    if (_.isFunction(oiteratee)) {
	      keys = _.allKeys(obj);
	      iteratee = optimizeCb(oiteratee, context);
	    } else {
	      keys = flatten(arguments, false, false, 1);
	      iteratee = function(value, key, obj) { return key in obj; };
	      obj = Object(obj);
	    }
	    for (var i = 0, length = keys.length; i < length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      if (iteratee(value, key, obj)) result[key] = value;
	    }
	    return result;
	  };
	
	   // Return a copy of the object without the blacklisted properties.
	  _.omit = function(obj, iteratee, context) {
	    if (_.isFunction(iteratee)) {
	      iteratee = _.negate(iteratee);
	    } else {
	      var keys = _.map(flatten(arguments, false, false, 1), String);
	      iteratee = function(value, key) {
	        return !_.contains(keys, key);
	      };
	    }
	    return _.pick(obj, iteratee, context);
	  };
	
	  // Fill in a given object with default properties.
	  _.defaults = createAssigner(_.allKeys, true);
	
	  // Creates an object that inherits from the given prototype object.
	  // If additional properties are provided then they will be added to the
	  // created object.
	  _.create = function(prototype, props) {
	    var result = baseCreate(prototype);
	    if (props) _.extendOwn(result, props);
	    return result;
	  };
	
	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };
	
	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };
	
	  // Returns whether an object has a given set of `key:value` pairs.
	  _.isMatch = function(object, attrs) {
	    var keys = _.keys(attrs), length = keys.length;
	    if (object == null) return !length;
	    var obj = Object(object);
	    for (var i = 0; i < length; i++) {
	      var key = keys[i];
	      if (attrs[key] !== obj[key] || !(key in obj)) return false;
	    }
	    return true;
	  };
	
	
	  // Internal recursive comparison function for `isEqual`.
	  var eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a === 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	      case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return '' + a === '' + b;
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN
	        if (+a !== +a) return +b !== +b;
	        // An `egal` comparison is performed for other numeric values.
	        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a === +b;
	    }
	
	    var areArrays = className === '[object Array]';
	    if (!areArrays) {
	      if (typeof a != 'object' || typeof b != 'object') return false;
	
	      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	      // from different frames are.
	      var aCtor = a.constructor, bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
	                               _.isFunction(bCtor) && bCtor instanceof bCtor)
	                          && ('constructor' in a && 'constructor' in b)) {
	        return false;
	      }
	    }
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
	
	    // Initializing stack of traversed objects.
	    // It's done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] === a) return bStack[length] === b;
	    }
	
	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);
	
	    // Recursively compare objects and arrays.
	    if (areArrays) {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      length = a.length;
	      if (length !== b.length) return false;
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (length--) {
	        if (!eq(a[length], b[length], aStack, bStack)) return false;
	      }
	    } else {
	      // Deep compare objects.
	      var keys = _.keys(a), key;
	      length = keys.length;
	      // Ensure that both objects contain the same number of properties before comparing deep equality.
	      if (_.keys(b).length !== length) return false;
	      while (length--) {
	        // Deep compare each member
	        key = keys[length];
	        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return true;
	  };
	
	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b);
	  };
	
	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) return true;
	    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
	    return _.keys(obj).length === 0;
	  };
	
	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };
	
	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) === '[object Array]';
	  };
	
	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  };
	
	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
	  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) === '[object ' + name + ']';
	    };
	  });
	
	  // Define a fallback version of the method in browsers (ahem, IE < 9), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return _.has(obj, 'callee');
	    };
	  }
	
	  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	  // IE 11 (#1621), and in Safari 8 (#1929).
	  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
	    _.isFunction = function(obj) {
	      return typeof obj == 'function' || false;
	    };
	  }
	
	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };
	
	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && obj !== +obj;
	  };
	
	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	  };
	
	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };
	
	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };
	
	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, key) {
	    return obj != null && hasOwnProperty.call(obj, key);
	  };
	
	  // Utility Functions
	  // -----------------
	
	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };
	
	  // Keep the identity function around for default iteratees.
	  _.identity = function(value) {
	    return value;
	  };
	
	  // Predicate-generating functions. Often useful outside of Underscore.
	  _.constant = function(value) {
	    return function() {
	      return value;
	    };
	  };
	
	  _.noop = function(){};
	
	  _.property = property;
	
	  // Generates a function for a given object that returns a given property.
	  _.propertyOf = function(obj) {
	    return obj == null ? function(){} : function(key) {
	      return obj[key];
	    };
	  };
	
	  // Returns a predicate for checking whether an object has a given set of
	  // `key:value` pairs.
	  _.matcher = _.matches = function(attrs) {
	    attrs = _.extendOwn({}, attrs);
	    return function(obj) {
	      return _.isMatch(obj, attrs);
	    };
	  };
	
	  // Run a function **n** times.
	  _.times = function(n, iteratee, context) {
	    var accum = Array(Math.max(0, n));
	    iteratee = optimizeCb(iteratee, context, 1);
	    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
	    return accum;
	  };
	
	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };
	
	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function() {
	    return new Date().getTime();
	  };
	
	   // List of HTML entities for escaping.
	  var escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#x27;',
	    '`': '&#x60;'
	  };
	  var unescapeMap = _.invert(escapeMap);
	
	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function(map) {
	    var escaper = function(match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped
	    var source = '(?:' + _.keys(map).join('|') + ')';
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, 'g');
	    return function(string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  };
	  _.escape = createEscaper(escapeMap);
	  _.unescape = createEscaper(unescapeMap);
	
	  // If the value of the named `property` is a function then invoke it with the
	  // `object` as context; otherwise, return it.
	  _.result = function(object, property, fallback) {
	    var value = object == null ? void 0 : object[property];
	    if (value === void 0) {
	      value = fallback;
	    }
	    return _.isFunction(value) ? value.call(object) : value;
	  };
	
	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };
	
	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate    : /<%([\s\S]+?)%>/g,
	    interpolate : /<%=([\s\S]+?)%>/g,
	    escape      : /<%-([\s\S]+?)%>/g
	  };
	
	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;
	
	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'":      "'",
	    '\\':     '\\',
	    '\r':     'r',
	    '\n':     'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };
	
	  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;
	
	  var escapeChar = function(match) {
	    return '\\' + escapes[match];
	  };
	
	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function(text, settings, oldSettings) {
	    if (!settings && oldSettings) settings = oldSettings;
	    settings = _.defaults({}, settings, _.templateSettings);
	
	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');
	
	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escaper, escapeChar);
	      index = offset + match.length;
	
	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }
	
	      // Adobe VMs need the match returned to produce the correct offest.
	      return match;
	    });
	    source += "';\n";
	
	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
	
	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + 'return __p;\n';
	
	    try {
	      var render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }
	
	    var template = function(data) {
	      return render.call(this, data, _);
	    };
	
	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';
	
	    return template;
	  };
	
	  // Add a "chain" function. Start chaining a wrapped Underscore object.
	  _.chain = function(obj) {
	    var instance = _(obj);
	    instance._chain = true;
	    return instance;
	  };
	
	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.
	
	  // Helper function to continue chaining intermediate results.
	  var result = function(instance, obj) {
	    return instance._chain ? _(obj).chain() : obj;
	  };
	
	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    _.each(_.functions(obj), function(name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result(this, func.apply(_, args));
	      };
	    });
	  };
	
	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);
	
	  // Add all mutator Array functions to the wrapper.
	  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
	      return result(this, obj);
	    };
	  });
	
	  // Add all accessor Array functions to the wrapper.
	  _.each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return result(this, method.apply(this._wrapped, arguments));
	    };
	  });
	
	  // Extracts the result from a wrapped and chained object.
	  _.prototype.value = function() {
	    return this._wrapped;
	  };
	
	  // Provide unwrapping proxy for some methods used in engine operations
	  // such as arithmetic and JSON stringification.
	  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;
	
	  _.prototype.toString = function() {
	    return '' + this._wrapped;
	  };
	
	  // AMD registration happens at the end for compatibility with AMD loaders
	  // that may not enforce next-turn semantics on modules. Even though general
	  // practice for AMD registration is to be anonymous, underscore registers
	  // as a named module because, like jQuery, it is a base library that is
	  // popular enough to be bundled in a third party lib, but not be part of
	  // an AMD load request. Those cases could generate an error when an
	  // anonymous define() is called outside of a loader request.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}.call(this));


/***/ },
/* 16 */
/***/ function(module, exports) {

	
	
	var AppHeader = React.createClass({displayName: "AppHeader",
	  render:function () {
	    return(
	      React.createElement("nav", {className: "navbar navbar-default navbar-static-top", role: "navigation"}, 
	        React.createElement("div", {className: "container"}, 
	          React.createElement("div", {className: "navbar-header"}, 
	            React.createElement("button", {type: "button", className: "navbar-toggle collapsed", "data-toggle": "collapse", "data-target": "#wagon-navbar-collapse"}, 
	              React.createElement("span", {className: "icon-bar"}), 
	              React.createElement("span", {className: "icon-bar"}), 
	              React.createElement("span", {className: "icon-bar"})
	            ), 
	
	            React.createElement("a", {href: "https://www.wagonhq.com", target: "_blank"}, 
	            React.createElement("span", {className: "navbar-brand"}, 
	            React.createElement("div", {className: "navbar-logo"}), 
	            React.createElement("span", null, "Wagon ")
	            )
	            )
	          ), 
	
	          React.createElement("div", {className: "collapse navbar-collapse", id: "wagon-navbar-collapse"}, 
	            React.createElement("ul", {className: "nav navbar-nav navbar-right"}, 
	              React.createElement("li", null, React.createElement("a", {href: "https://linkedin.com/in/katrinauychaco", target: "_blank"}, "About")), 
	              React.createElement("li", null, React.createElement("a", {href: "https://g​ithub.com/kuychaco", target: "_blank"}, "GitHub")), 
	              React.createElement("li", null, React.createElement("a", {href: "https://medium.com/@katrinauychaco", target: "_blank"}, "Blog"))
	            )
	          )
	        )
	      )
	    );
	  }
	});
	
	module.exports = AppHeader;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	TableStore = __webpack_require__(3);
	TableActions = __webpack_require__(13);
	
	module.exports.getData = function() {
	  var data = __webpack_require__(18);
	  TableActions.receiveData(data);
	};


/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = [["\"sessionId (text)\"","\"page (text)\"","\"latency (number)\"","\"timeOnPage (number)\""],["b7a47e56","index","9","56.561"],["b8045be3","query","230","477.602"],["3933a80e","query","77","335.607"],["38b96a95","explore","182","100.940"],["375ad4d0","query","26","417.472"],["38d7936e","query","34","451.417"],["3968d642","welcome","13","20.993"],["b72d9375","query","190","328.195"],["379d5ea8","explore","113","174.273"],["b78bf9a5","","55",""],["38a86427","explore","100","34.254"],["b72f231c","welcome","11","35.975"],["b8ac2813","welcome","24","47.369"],["37d9801d","explore","22","145.085"],["371ef2ec","query","135","325.174"],["380494da","index","23","50.269"],["b9324e4e","welcome","7","44.820"],["379333c6","explore","113","155.389"],["b834e77f","index","8","33.891"],["b7aa9958","welcome","17","32.471"],["b8faab12","explore","152","176.381"],["38aa30c2","welcome","7","36.755"],["b7894aac","explore","303","122.965"],["387e5fd3","query","248","330.382"],["b8f13334","query","105","310.104"],["37ea053c","","28",""],["382ff46f","query","25","376.081"],["b78139ab","query","17","320.126"],["b712de52","welcome","32","44.932"],["380edea5","explore","262","146.385"],["b432dbc8","query","23","471.299"],["b6e86a47","explore","303","124.687"],["b8bb3849","query","102","420.098"],["b8a03224","query","71","517.160"],["38b52594","welcome","57","30.896"],["b8ea6996","","44",""],["36653a24","explore","81","96.062"],["b8c1fc74","","169",""],["39290817","query","49","289.623"],["b7352e58","welcome","7","13.705"],["b7e4ccd5","query","159","531.095"],["38aa30c2","explore","189","142.049"],["b85f1c7f","explore","275","88.663"],["b880c13a","query","17","302.459"],["37dadc3e","explore","33","101.257"],["b8a6645b","query","17","329.931"],["34f12b30","query","132","385.701"],["38b96a95","","91",""],["b8781981","explore","22","73.756"],["b7aefa94","query","69","356.983"],["b8da5ce2","query","57","281.362"],["3946238e","query","56","416.212"],["38f4c8db","explore","62","51.807"],["b85081f3","query","79","426.783"],["3907e5b0","welcome","70","29.227"],["37d8b9ed","welcome","67","23.867"],["37ac6a09","query","34","244.420"],["38f4230b","query","86","365.178"],["381e3950","welcome","20","19.399"],["b9316463","query","42","328.974"],["b893f1e9","explore","80","152.474"],["37ac6a09","query","300","414.585"],["b9200590","welcome","19","36.295"],["38dd6b90","welcome","7","19.256"],["38f4c8db","query","211","362.689"],["3913fdaf","welcome","42","26.221"],["b7ef02de","welcome","11","18.858"],["b7339a70","index","12","40.309"],["b9101f6d","","122",""],["b82f8b2a","query","66","522.157"],["3972909f","explore","96","108.926"],["b7210d82","welcome","16","25.747"],["38a7f88b","explore","22","62.071"],["37af77a3","welcome","76","27.171"],["37c3eb17","query","136","402.409"],["b80a0db4","explore","22","130.690"],["39152737","query","17","312.932"],["39132f5c","","17",""],["38c7a130","query","94","383.011"],["b78139ab","index","10","47.628"],["b6979500","query","22","235.352"],["b89705a9","query","49","290.668"],["392d18b2","query","18","425.116"],["b75759c1","query","64","365.884"],["b755da2b","","49",""],["38b537e4","query","102","362.103"],["b72f231c","index","12","48.305"],["38868413","index","33","43.676"],["38d7936e","query","53","406.586"],["3790a77c","query","52","449.923"],["b8a03224","welcome","25","28.177"],["38da8baa","explore","85","59.172"],["b95d95b8","query","20","380.290"],["39035eea","explore","25","154.160"],["b755da2b","welcome","26","50.902"],["395b5e7b","","28",""],["3907e5b0","explore","171","161.194"],["3596f875","welcome","10","32.125"],["38592e00","query","45","466.318"],["b7210d82","query","61","406.014"],["b8781981","query","56","367.489"],["37af77a3","query","108","323.820"],["b7b4e7ac","welcome","94","25.049"],["37247a19","query","122","358.006"],["b847bf23","explore","69","135.363"],["3943830a","query","133","496.398"],["b94b611d","query","17","291.651"],["b95d95b8","welcome","29","28.543"],["b8faab12","explore","176","66.838"],["b7821e5c","query","17","323.693"],["3933a80e","explore","129","115.773"],["b86c757d","query","17","415.680"],["38a7f88b","explore","22","57.889"],["b8a1e1e5","query","60","458.441"],["37494840","welcome","78","26.086"],["b7f7db07","welcome","8","36.648"],["b714dc46","index","4","74.504"],["b7608214","","10",""],["b8529553","index","35","35.432"],["b89da5c6","query","237","405.300"],["39087f58","query","107","399.954"],["38820dcb","query","150","305.494"],["b8bab8ec","query","17","335.194"],["b92a41bc","query","184","377.581"],["b90ce38e","welcome","7","37.543"],["385b96d4","query","90","448.439"],["36f7fdad","query","82","348.324"],["b938dc06","query","203","365.171"],["371ef2ec","welcome","60","31.519"],["394fc6e8","welcome","91","30.672"],["38d7936e","welcome","9","17.546"],["b8255a74","explore","192","78.153"],["b901e1ee","query","370","388.523"],["390c3cec","index","20","63.734"],["38ea393f","welcome","73","30.655"],["36a3d2fe","explore","83","127.354"],["b8d7bdee","query","120","432.728"],["37dadc3e","welcome","23","29.169"],["38d6f36c","query","17","383.678"],["394fc6e8","query","32","344.018"],["b6f10532","query","53","441.423"],["b8da5ce2","welcome","112","22.099"],["382b613e","welcome","26","36.990"],["b7339a70","explore","27","100.078"],["b896dfeb","explore","22","184.439"],["b834730b","query","62","376.460"],["b8780b92","explore","61","158.441"],["37265bd1","query","22","388.447"],["b7de74ad","index","18","51.450"],["3943830a","query","45","466.603"],["b94525bf","welcome","75","36.681"],["38ded491","query","91","413.197"],["3907e5b0","welcome","53","29.971"],["38d7936e","explore","42","94.668"],["b8ac8acd","query","17","364.246"],["3891da7b","explore","22","129.062"],["37a768f1","explore","193","118.014"],["b9200590","","111",""],["b91c49f9","explore","226","99.083"],["b938dc06","query","17","415.867"],["b83857e0","welcome","21","47.668"],["37d8b9ed","welcome","25","40.033"],["b7fc776f","welcome","18","32.750"],["b7e4ccd5","query","18","379.948"],["38b52594","explore","115","161.148"],["b6e86a47","welcome","9","15.150"],["38d8c63a","welcome","7","46.704"],["379333c6","query","17","464.166"],["b92d0688","query","61","326.312"],["3915cc59","welcome","22","35.324"],["b834e77f","welcome","105","37.502"],["387e5fd3","index","7","53.473"],["3796f292","welcome","205","29.229"],["37d78acc","explore","25","132.414"],["b8beba55","query","25","276.927"],["3913fdaf","","26",""],["b7a97dbb","explore","135","96.439"],["b8faab12","explore","22","183.331"],["b834730b","","10",""],["b8823cc9","index","5","52.456"],["38beeb4d","explore","69","67.523"],["b90ce38e","welcome","11","18.975"],["b52a98aa","index","4","62.871"],["3836f29a","query","26","351.494"],["b8529553","query","261","445.406"],["b8bb3849","query","85","388.692"],["b919a166","query","17","354.929"],["38b537e4","explore","125","98.496"],["391c2252","explore","40","96.170"],["36f3e2b0","explore","186","91.401"],["b8e22a2e","explore","22","137.471"],["37d701af","explore","154","61.873"],["37d8b9ed","explore","24","82.510"],["379333c6","query","202","338.203"],["37d78acc","index","59","72.444"],["385b341d","query","101","514.970"],["38d7936e","","65",""],["b726fc97","explore","159","134.358"],["38978417","welcome","17","31.210"],["b81edf15","query","51","282.358"],["39132f5c","query","52","407.088"],["b8f3e8b9","explore","22","126.015"],["37e71d7c","query","17","306.890"],["34f12b30","explore","102","80.777"],["39087f58","welcome","79","20.170"],["b880c13a","explore","22","81.439"],["b7c012a8","explore","294","81.715"],["36f7fdad","explore","22","95.471"],["b75759c1","welcome","28","21.122"],["b81579d6","query","31","365.187"],["b8255a74","welcome","18","43.495"],["38d95664","welcome","42","25.206"],["37d701af","welcome","8","32.355"],["391b2370","explore","60","113.065"],["b84ad865","query","355","331.188"],["38343e84","welcome","39","36.321"],["383c44cb","welcome","58","41.120"],["b7e4ccd5","","93",""],["b8bf9af4","","10",""],["38af774a","query","253","346.672"],["36aa7870","welcome","34","50.124"],["3811afac","welcome","10","42.358"],["b85081f3","query","73","333.328"],["b7939ddb","query","17","304.980"],["38e8ab3d","explore","190","72.512"],["387bd683","index","4","60.111"],["b8cb4c88","query","25","439.536"],["379d5ea8","explore","27","29.383"],["b755da2b","query","23","366.483"],["b82f8b2a","explore","22","118.824"],["39769889","query","184","481.406"],["b9106aff","","83",""],["379333c6","explore","97","105.551"],["b74acf21","query","17","367.546"],["363d3fbf","query","40","441.401"],["382f4c24","welcome","23","36.852"],["b78cd4cc","query","146","410.873"],["b8faab12","query","37","312.020"],["387bd683","explore","149","128.442"],["38c7a130","explore","206","194.682"],["b880c13a","query","17","257.463"],["3891da7b","explore","22","130.040"],["38420c72","welcome","12","28.085"],["b789800a","explore","108","90.463"],["39290817","index","11","47.333"],["b72f2109","query","17","327.549"],["3880ebea","query","51","307.511"],["b8823cc9","welcome","49","29.947"],["379333c6","explore","52","111.816"],["b8bee8a9","explore","105","124.255"],["b919a166","index","4","40.641"],["38aa30c2","explore","131","119.139"],["38368d7e","welcome","13","28.738"],["39875084","query","70","266.748"],["b81f57a4","welcome","73","13.529"],["b901a7bb","","10",""],["38343e84","query","27","370.864"],["39132f5c","explore","265","64.393"],["39083a44","query","17","293.268"],["3790a77c","query","128","419.030"],["b7aefa94","welcome","26","15.769"],["b81edf15","query","121","388.371"],["38b45947","welcome","7","35.737"],["b8faab12","welcome","11","28.396"],["39290817","query","63","399.448"],["b835e95b","index","21","41.286"],["38a57213","explore","255","80.225"],["38d95664","query","17","410.326"],["385d970c","query","17","293.407"],["b74acf21","explore","507","91.630"],["b88d8eb8","explore","41","104.404"],["b432dbc8","index","41","65.523"],["b81edf15","welcome","77","23.052"],["38a86427","explore","170","7.697"],["b847bf23","index","4","28.326"],["b90b46ff","query","57","376.947"],["38b96a95","query","60","389.674"],["39372d62","welcome","7","33.924"],["b78cd4cc","welcome","21","34.063"],["b82af9b9","query","152","433.125"],["38b537e4","","37",""],["37494840","explore","61","156.585"],["379fe829","query","17","423.675"],["37d63bbb","explore","94","89.375"],["b90b46ff","explore","164","138.583"],["b90ce463","query","19","305.665"],["382ff46f","","50",""],["b80b6056","","31",""],["3606bab5","query","215","400.315"],["380edea5","explore","142","85.458"],["b7d7b5f5","query","126","415.387"],["391c9704","explore","22","154.430"],["38b52594","index","4","32.410"],["386139d9","welcome","20","36.029"],["38343e84","welcome","10","39.271"],["b88d8eb8","welcome","79","24.343"],["b7ef02de","explore","134","78.045"],["b9552f4f","query","83","431.909"],["3883164c","query","82","406.713"],["b8d05715","welcome","7","30.243"],["b8da5ce2","welcome","52","18.754"],["38afab8e","explore","108","14.925"],["b896dfeb","explore","78","117.234"],["b7c012a8","","64",""],["38b30542","welcome","21","23.505"],["38592e00","welcome","48","33.359"],["b902786e","index","28","29.814"],["3900e284","","10",""],["3606bab5","welcome","58","22.496"],["b8834bbe","explore","22","150.714"],["b906df62","explore","58","181.644"],["b7608214","query","85","383.097"],["38868413","explore","172","71.268"],["38b23f71","","23",""],["386bb217","query","131","367.856"],["b89705a9","query","56","388.441"],["b8f1bf15","explore","60","2.310"],["384dc7aa","query","17","365.992"],["386e6d49","","10",""],["b85081f3","explore","46","144.824"],["b948b6f9","","17",""],["38420c72","explore","49","124.547"],["393ef37f","query","33","407.894"],["3819d95d","query","231","442.930"],["38d49209","query","241","456.553"],["374a37eb","query","17","493.448"],["b902786e","welcome","7","32.380"],["374b43a9","index","4","63.523"],["b9005d0b","query","22","408.144"],["b88d8eb8","welcome","9","31.947"],["38f4230b","","15",""],["b92d0688","query","17","426.888"],["392d18b2","query","17","334.522"],["b7939ddb","query","165","386.587"],["b881be6d","welcome","28","40.277"],["38978417","query","104","405.723"],["b980e6ce","welcome","7","13.835"],["3913fdaf","welcome","26","28.881"],["b9200590","explore","92","92.485"],["38592e00","","204",""],["b940c33b","query","17","512.028"],["36aa7870","welcome","66","17.838"],["38d9a089","query","105","375.301"],["b72f2109","explore","72","65.935"],["b432dbc8","welcome","7","24.548"],["38592e00","welcome","7","27.441"],["382b613e","query","17","344.240"],["3880ebea","query","87","277.777"],["393c832e","explore","175","28.294"],["b9324e4e","query","69","300.376"],["38beeb4d","","128",""],["b7aa9958","query","231","481.155"],["38edbb55","query","112","480.648"],["390d2410","explore","114","145.852"],["393ef37f","welcome","56","30.088"],["b78cd4cc","query","93","394.981"],["37c3eb17","query","39","483.271"],["37d63bbb","explore","400","180.753"],["b88d8eb8","welcome","37","20.629"],["382b613e","query","17","437.272"],["b85f1c7f","","19",""],["37494840","explore","36","113.166"],["b714dc46","welcome","7","45.144"],["b8c1fc74","welcome","68","37.390"],["39083a44","explore","22","91.176"],["b8045be3","query","25","438.102"],["382f4c24","index","21","57.630"],["b87ea259","","93",""],["381e3950","explore","89","75.312"],["b8c67786","query","22","365.204"],["38edbb55","query","43","417.365"],["38af774a","welcome","7","30.125"],["b80fcf1d","","14",""],["3882d1ef","explore","68","53.211"],["b8319d86","query","17","312.959"],["b90b128b","explore","116","57.216"],["b82f8b2a","explore","113","78.366"],["393c832e","explore","136","131.489"],["b7f7db07","query","136","439.949"],["395fce5f","welcome","22","41.792"],["b7d7b5f5","explore","434","134.715"],["36f3e2b0","query","20","417.763"],["b8255a74","query","105","392.312"],["39132f5c","welcome","17","31.788"],["37494840","index","7","51.573"],["b90ce463","explore","106","135.124"],["3790a77c","explore","62","38.673"],["3606bab5","index","27","51.948"],["3796f292","","124",""],["3596f875","explore","22","130.130"],["b8cadf66","index","4","62.789"],["371ef2ec","query","30","481.599"],["b84ad865","","10",""],["b835e95b","query","17","386.256"],["38b52594","query","18","537.140"],["b89705a9","index","18","53.159"],["37e71d7c","query","19","424.586"],["38aa11a2","welcome","7","23.921"],["b8529553","query","28","420.769"],["b8bee8a9","query","17","327.829"],["3909e239","explore","23","97.650"],["3822edba","welcome","64","35.036"],["b9b22f3d","welcome","9","31.313"],["395b5e7b","explore","112","106.827"],["39035eea","welcome","19","46.280"],["38a7f88b","explore","50","156.102"],["b9122007","query","192","463.678"],["b7939ddb","","50",""],["b8faab12","query","69","263.856"],["b7d7b5f5","","73",""],["38b30542","explore","22","95.562"],["3790a77c","explore","22","75.644"],["38749f05","welcome","32","25.860"],["b795879c","query","66","343.720"],["b9077d3a","explore","35","110.658"],["b7e4ccd5","query","21","398.676"],["395b5e7b","index","15","61.034"],["395b5e7b","index","10","41.261"],["393ef37f","query","26","362.268"],["b8c875ac","welcome","35","18.844"],["b89da5c6","query","77","396.243"],["b7a47e56","query","165","303.633"],["387c10ce","explore","31","97.561"],["b91dabaf","query","155","345.907"],["37d63bbb","query","17","327.995"],["38b537e4","welcome","26","24.284"],["371ef2ec","explore","22","119.974"],["38824d6d","query","192","390.710"],["3851b535","query","26","493.816"],["38592e00","welcome","19","28.739"],["b78cd4cc","index","12","46.823"],["b8cf3b88","explore","137","106.394"],["379d5ea8","query","17","435.267"],["387bd683","explore","22","131.596"],["3891da7b","query","98","366.803"],["b8780b92","","10",""],["b8cf3b88","query","25","447.876"],["b9324e4e","query","68","369.947"],["b88ada11","explore","130","102.788"],["b82f8b2a","welcome","7","38.807"],["38cae142","explore","176","154.006"],["3836f29a","query","96","403.168"],["b834730b","","10",""],["38978417","welcome","7","42.560"],["394b68a5","explore","55","189.987"],["b940c33b","welcome","16","30.963"],["b92d0688","welcome","117","33.314"],["37ac6a09","explore","22","172.594"],["b8bb9d02","explore","24","162.981"],["b948b6f9","query","202","408.346"],["3600fd8c","","32",""],["37265bd1","explore","22","111.982"],["b8beba55","query","107","350.676"],["38c738d1","","10",""],["b8ca7291","explore","22","98.164"],["36ce2e37","query","75","335.407"],["b8bf9af4","welcome","64","37.514"],["38400295","explore","97","35.743"],["b847bf23","explore","100","95.809"],["b888e833","welcome","81","8.759"],["3600fd8c","query","47","384.140"],["b88ada11","explore","155","76.724"],["b8bf9af4","welcome","41","34.638"],["39769889","welcome","42","30.973"],["38b537e4","query","17","429.292"],["b7b4e7ac","index","4","76.251"],["b789800a","query","17","422.151"],["377d4673","explore","26","72.184"],["b901a7bb","query","157","356.775"],["3933a80e","query","109","435.009"],["b8bf9af4","query","49","406.050"],["37d63bbb","query","17","433.067"],["387c10ce","","53",""],["37247a19","index","17","65.721"],["b8f1bf15","explore","87","101.554"],["b901e1ee","query","100","284.249"],["38843b38","query","179","422.948"],["b85081f3","query","38","386.856"],["37265bd1","explore","189","134.347"],["b940c33b","explore","22","130.947"],["3972909f","query","74","402.112"],["391e0466","explore","22","125.744"],["b83857e0","welcome","7","30.496"],["b83524be","","20",""],["37d8b9ed","query","17","386.237"],["b9b22f3d","explore","77","54.537"],["371b3e13","query","93","403.681"],["b90fca82","explore","87","136.895"],["387bd683","welcome","7","18.294"],["38b23f71","explore","221","108.754"],["36349e28","welcome","95","32.261"],["b80d45c6","explore","98","133.219"],["38b23f71","welcome","41","40.040"],["b8ea6996","explore","56","189.318"],["38cef8ac","index","67","49.612"],["38592e00","explore","22","110.810"],["b8cadf66","welcome","80","29.492"],["38f4c8db","explore","565","176.533"],["394fc6e8","query","164","432.472"],["39472aee","query","29","242.868"],["38d8c63a","query","21","367.913"],["38948563","query","17","420.007"],["b8e22a2e","explore","94","59.178"],["39092208","","58",""],["38b45947","","51",""],["b919dc4a","explore","170","62.512"],["b81dde6c","explore","101","193.958"],["38343e84","explore","111","92.856"],["b94525bf","query","89","201.746"],["36349e28","","11",""],["b90ce463","query","123","343.330"],["b85c022e","","158",""],["371b3e13","explore","544","133.109"],["b90fca82","query","182","399.560"],["b78cd4cc","query","31","400.599"],["38824d6d","query","17","400.913"],["38420c72","query","209","348.328"],["b82bcf61","index","53","47.205"],["b880c13a","","13",""],["b9b22f3d","query","94","380.261"],["37c3532d","index","35","47.178"],["b754f50b","welcome","7","35.059"],["385b96d4","explore","54","100.133"],["381e58d4","query","39","306.157"],["b8780b92","query","17","466.433"],["b919a166","explore","260","24.001"],["388aadd7","explore","393","101.641"],["b87ea259","explore","144","93.849"],["37d63bbb","welcome","21","26.620"],["b9418299","index","32","38.177"],["385823a9","query","17","520.424"],["b8bab8ec","welcome","37","39.638"],["3891da7b","welcome","46","31.416"],["390c3cec","query","100","432.748"],["b8f13334","query","260","374.633"],["b83524be","index","9","56.544"],["b7a47e56","welcome","32","24.684"],["b80fcf1d","query","28","339.603"],["b7d7b5f5","welcome","45","22.012"],["3909e239","query","85","358.335"],["b8b0892f","query","54","401.369"],["3792ae33","query","80","229.687"],["383c44cb","welcome","46","28.353"],["38adbc1c","","117",""],["b81579d6","welcome","57","32.932"],["b8ac2813","explore","119","105.219"],["b810076c","query","251","397.028"],["b7821e5c","explore","33","129.713"],["385b96d4","query","55","431.748"],["3882c89c","query","235","350.917"],["b80a0db4","welcome","7","35.477"],["381e58d4","explore","22","192.498"],["b8d05715","query","44","359.154"],["38aa11a2","query","17","318.128"],["b980e6ce","welcome","104","32.558"],["b8583fdd","query","177","452.602"],["b9b22f3d","explore","62","127.770"],["36ce2e37","welcome","40","24.356"],["b7968805","query","108","316.793"],["b8faab12","welcome","58","27.321"],["380edea5","explore","272","109.667"],["38d95664","index","31","57.226"],["b432dbc8","query","81","352.787"],["386e6d49","query","38","471.385"],["b7352e58","index","4","82.307"],["37c3eb17","query","157","480.827"],["38b537e4","welcome","54","21.241"],["b77f942a","query","117","335.638"],["38343e84","query","253","340.673"],["38400295","query","32","371.853"],["392d18b2","query","153","409.357"],["b88d8eb8","index","5","50.410"],["379fe829","query","64","403.055"],["384665e3","query","125","499.245"],["38ded491","welcome","50","26.266"],["38cae142","explore","22","128.488"],["b9324e4e","explore","92","161.077"],["b89705a9","index","6","50.526"],["38aa30c2","explore","34","113.552"],["b83857e0","query","84","304.939"],["391c9704","explore","85","63.158"],["393c832e","query","124","356.037"],["382b8a89","welcome","61","33.480"],["b90b128b","query","111","409.143"],["b8f3e8b9","query","19","421.666"],["b893f1e9","explore","22","158.151"],["b92d0688","welcome","66","17.977"],["384665e3","explore","99","26.269"],["38861a87","explore","78","59.532"],["b78bf9a5","query","82","241.584"],["b8529553","index","4","29.697"],["37e71d7c","explore","400","24.473"],["b89f8df2","welcome","13","23.833"],["3906759e","query","119","336.250"],["38d9a089","query","136","331.482"],["36bf0d6a","explore","73","123.186"],["38f26220","","13",""],["38a86427","query","17","355.919"],["b8c67786","welcome","10","16.960"],["386e6d49","explore","41","111.672"],["382ff46f","index","6","41.826"],["b84c5c67","explore","106","191.444"],["b72f2109","explore","67","163.534"],["38f8933d","welcome","20","29.719"],["b8a0d52a","explore","36","132.741"],["b8f1bf15","explore","138","92.063"],["b78358d5","query","140","431.915"],["386139d9","query","17","447.694"],["b9552f4f","welcome","120","40.148"],["b7352e58","index","74","68.318"],["b90ce38e","query","111","431.102"],["385823a9","query","65","306.290"],["b8255a74","explore","22","75.089"],["38b45947","index","38","60.951"],["380494da","explore","70","142.981"],["37d8b9ed","query","202","385.306"],["b9122007","query","55","445.785"],["b8780b92","welcome","25","26.418"],["390a94c6","index","44","46.255"],["b81579d6","welcome","7","31.553"],["b95d95b8","query","42","421.556"],["386c41b3","welcome","10","35.775"],["38ebcacd","explore","28","162.305"],["38447a00","index","35","51.259"],["391c9704","query","17","367.644"],["38aa11a2","welcome","12","32.999"],["379fe829","","179",""],["371ef2ec","explore","63","85.751"],["37a768f1","query","100","515.000"],["388aadd7","query","842","313.278"],["387e5fd3","explore","27","101.272"],["384665e3","query","17","336.058"],["3909e239","query","38","336.889"],["b7707626","explore","334","171.779"],["38f4c8db","","11",""],["38820dcb","explore","128","91.562"],["38f8933d","explore","119","116.871"],["3933a80e","explore","110","114.965"],["b7aa9958","query","101","421.429"],["b937fd4b","query","191","363.264"],["b8c1fc74","explore","22","110.030"],["3907e5b0","welcome","7","34.291"],["38e60476","welcome","21","33.205"],["b31efa97","welcome","25","24.207"],["b72f2109","explore","22","130.635"],["379333c6","welcome","131","29.811"],["b93b8201","welcome","35","23.662"],["b7abd6cd","explore","112","111.363"],["3943830a","explore","83","98.870"],["b82af9b9","welcome","11","34.280"],["b904a87b","","10",""],["b8255a74","","17",""],["b9324e4e","welcome","62","38.968"],["379d5ea8","explore","22","92.978"],["3915cc59","query","264","421.273"],["b8bee8a9","explore","22","192.763"],["b8529553","query","192","314.010"],["38f4c8db","query","17","424.578"],["37d78acc","welcome","10","31.278"],["39372d62","welcome","86","47.318"],["38948563","welcome","69","34.753"],["b880c13a","explore","77","87.239"],["b8cb4c88","explore","22","140.108"],["38f0a207","explore","22","84.452"],["b74acf21","explore","262","117.466"],["39365da1","query","190","461.560"],["37265bd1","welcome","57","38.667"],["3895c490","query","146","302.912"],["36f7fdad","query","38","382.814"],["3686429c","","54",""],["b86b60fc","index","42","57.532"],["b7894aac","welcome","8","36.402"],["b9077d3a","query","27","345.028"],["b810076c","explore","22","105.060"],["386e6d49","","10",""],["b7ef02de","explore","196","159.823"],["395fce5f","","56",""],["b72d9375","explore","279","152.780"],["b834e77f","query","278","324.356"],["37d9801d","welcome","35","29.957"],["3915cc59","","10",""],["38cef8ac","query","30","293.645"],["3883164c","query","119","440.600"],["b90fca82","explore","385","82.027"],["387bd683","query","83","385.198"],["3880ebea","query","37","490.143"],["39087f58","query","130","337.537"],["382ff46f","explore","88","165.230"],["b902786e","query","196","416.286"],["3606bab5","explore","22","87.463"],["394b68a5","welcome","8","27.648"],["38e85a88","query","44","225.162"],["b85c022e","welcome","29","23.766"],["382f4c24","explore","25","175.175"],["b8ac2813","explore","137","121.682"],["b7474352","explore","91","125.742"],["379fe829","explore","73","79.144"],["386e6d49","index","4","45.483"],["b80a0db4","welcome","65","31.855"],["37d78acc","index","4","40.025"],["38343e84","","60",""],["b80e549c","welcome","7","22.828"],["b89da5c6","explore","145","183.802"],["b901a7bb","query","231","434.042"],["3913fdaf","welcome","7","38.242"],["b80e549c","query","121","405.887"],["b92d0688","query","113","408.429"],["383204f1","","10",""],["b810076c","welcome","59","23.654"],["b847bf23","explore","49","104.691"],["b92a41bc","explore","88","32.252"],["b75759c1","query","27","357.979"],["b52a98aa","query","26","310.300"],["38b537e4","query","86","387.256"],["38f4230b","explore","80","130.464"],["394fc6e8","query","145","397.559"],["b52a98aa","welcome","48","25.367"],["b72f231c","welcome","15","22.365"],["393ef37f","index","26","72.456"],["387bd683","welcome","74","31.072"],["3891f3e2","welcome","29","32.227"],["b80a0db4","query","149","298.889"],["385b341d","query","32","193.220"],["b6633f1a","welcome","142","41.096"],["b8e8b49d","query","32","426.481"],["b9418299","query","154","253.372"],["3792ae33","query","45","391.127"],["b8583fdd","explore","493","151.838"],["383204f1","explore","270","84.366"],["38a86427","query","78","418.456"],["b90fca82","welcome","43","46.035"],["b8faab12","query","170","404.095"],["387eb251","","11",""],["b938dc06","welcome","50","22.949"],["3907e5b0","explore","38","96.699"],["383c44cb","query","31","430.502"],["386c41b3","explore","79","70.672"],["b84ad865","explore","22","170.098"],["b714dc46","explore","58","79.993"],["3909e239","explore","68","126.559"],["39083a44","query","460","404.668"],["b8acc8e1","query","175","441.218"],["3917dd99","query","34","464.472"],["b75759c1","query","39","286.601"],["3836f29a","query","99","400.648"],["b937fd4b","explore","44","49.646"],["b8d05715","query","170","200.485"],["3686429c","welcome","27","30.261"],["b7f7db07","welcome","7","17.906"],["375ad4d0","index","58","43.238"],["3946238e","query","73","380.437"],["382f9c89","query","163","349.530"],["b9316463","index","15","47.241"],["384665e3","query","45","431.104"],["38343e84","query","20","319.701"],["387bd683","explore","23","95.881"],["38d8c63a","welcome","21","38.657"],["379d5ea8","query","18","364.954"],["b78cd4cc","query","185","384.336"],["37d9801d","query","132","359.184"],["b7276af1","query","62","461.405"],["388aadd7","explore","22","87.162"],["b8ac8acd","query","26","371.878"],["b8971322","welcome","59","20.787"],["380494da","","49",""],["b78139ab","index","4","13.827"],["38948563","welcome","15","19.249"],["382b613e","","25",""],["394b68a5","query","170","439.893"],["385f952a","query","17","387.769"],["b8326597","explore","278","148.083"],["38aa30c2","","10",""],["b7f7db07","index","4","44.251"],["b880c13a","explore","28","145.598"],["b980e6ce","explore","112","124.936"],["382b8a89","explore","285","133.238"],["b8faab12","welcome","7","32.635"],["385b341d","explore","410","95.820"],["b919dc4a","explore","170","116.472"],["b86c757d","query","120","364.571"],["38447a00","welcome","36","30.373"],["38368d7e","query","50","645.622"],["391e0466","query","79","371.187"],["3891da7b","index","4","64.291"],["384dc7aa","query","17","430.181"],["38d8c63a","explore","176","215.312"],["b8a03224","index","49","55.576"],["38a7f88b","explore","59","113.024"],["b6a668ba","query","67","339.961"],["390c3cec","index","30","68.268"],["b7707626","welcome","10","24.795"],["b9324e4e","explore","22","108.544"],["b8583fdd","query","23","421.591"],["b7608214","explore","172","133.731"],["38d95664","explore","106","55.912"],["37a768f1","welcome","7","18.245"],["36a3d2fe","welcome","16","23.271"],["37a768f1","query","69","390.511"],["b80e549c","","10",""],["3972909f","welcome","12","7.892"],["b7f7db07","","24",""],["387bd683","explore","121","104.980"],["36653a24","query","188","326.057"],["393ef37f","query","53","499.682"],["38afab8e","welcome","7","40.198"],["b87ea259","query","203","351.153"],["38dd6b90","index","18","28.732"],["b78cd4cc","query","152","398.116"],["b8c875ac","index","4","63.908"],["382b613e","query","67","441.865"],["394fc6e8","explore","25","114.725"],["b95d95b8","explore","30","138.443"],["3686429c","index","10","81.858"],["38f8933d","query","174","365.769"],["38f26220","welcome","153","39.804"],["38ded491","index","4","27.869"],["b9098814","welcome","146","27.023"],["38f0a207","explore","57","142.164"],["b7939ddb","explore","23","87.030"],["b801e6e5","index","29","67.028"],["37ea0427","welcome","7","31.389"],["b90182be","explore","54","126.835"],["379fe829","welcome","35","18.015"],["b8e8b49d","query","17","355.391"],["3900e284","query","125","297.195"],["b901a7bb","query","17","364.551"],["390c3cec","welcome","7","22.840"],["b8bb3849","welcome","15","33.188"],["37d9801d","","54",""],["b8b0892f","query","164","295.675"],["37d8b9ed","query","34","429.574"],["38420c72","welcome","17","27.235"],["384665e3","explore","225","99.239"],["b9122007","index","6","64.043"],["385f952a","query","276","333.410"],["384665e3","","30",""],["b8d05715","query","77","377.292"],["3891f3e2","index","4","51.278"],["39875084","explore","328","174.560"],["b8583fdd","query","144","347.479"],["b901e1ee","query","30","402.502"],["b90ce38e","query","55","357.534"],["b52a98aa","","10",""],["389fde1c","query","75","420.961"],["b7fc776f","query","106","346.871"],["38820dcb","welcome","105","25.877"],["393ef37f","explore","22","86.512"],["381dc7c6","welcome","30","24.491"],["38b45947","welcome","21","18.854"],["38b52594","","62",""],["39472aee","","60",""],["39472aee","welcome","86","34.147"],["b8cadf66","","66",""],["3933a80e","welcome","20","44.071"],["39875084","explore","55","119.746"],["3880ebea","query","42","344.471"],["38cef8ac","welcome","51","21.111"],["b847bf23","welcome","8","20.015"],["37d9801d","explore","33","53.652"],["385b341d","explore","26","111.391"],["b80168ac","explore","334","142.669"],["38447a00","query","157","368.249"],["b8903a5b","explore","70","127.774"],["b8c875ac","query","115","418.226"],["389fde1c","index","4","50.368"],["b432dbc8","query","44","408.475"],["38f4230b","welcome","21","40.167"],["b82bcf61","explore","22","129.213"],["37383af0","","73",""],["36ce2e37","welcome","30","30.469"],["b95d95b8","query","18","321.259"],["b8bab8ec","query","23","359.970"],["b893f1e9","query","32","388.576"],["b8ccfe2a","explore","28","129.776"],["b80d45c6","query","17","345.792"],["b85f1c7f","query","84","380.203"],["38aa30c2","index","5","58.959"],["37ea0427","query","45","283.651"],["b78139ab","index","27","74.716"],["b8529553","index","24","16.853"],["b980e6ce","index","15","68.221"],["b8e8b49d","explore","71","65.812"],["39290817","query","42","332.889"],["b7939ddb","","10",""],["b8ccfe2a","explore","183","91.284"],["b8cf3b88","query","233","396.070"],["b91c49f9","query","17","419.578"],["386bb217","explore","52","113.544"],["3900e284","index","24","67.093"],["b81579d6","explore","28","123.537"],["37247a19","explore","511","101.940"],["38592e00","explore","22","116.246"],["382f4c24","query","70","459.911"],["38b30542","explore","224","78.988"],["37afb00b","query","62","345.337"],["b8781981","query","260","394.167"],["b9418299","explore","78","93.010"],["37c3532d","explore","119","122.844"],["b80a0db4","explore","110","80.404"],["393ef37f","welcome","7","34.594"],["b90182be","query","52","318.958"],["38843b38","query","55","408.393"],["b72d9375","explore","33","173.767"],["b92d0688","query","17","336.865"],["b84ad865","welcome","9","28.866"],["389fde1c","welcome","26","38.810"],["b8f13334","welcome","11","27.290"],["b795879c","explore","22","104.530"],["b938dc06","query","17","319.330"],["389fde1c","explore","38","158.237"],["b8289f1a","explore","172","43.358"],["3883164c","query","52","444.199"],["38978417","explore","278","89.972"],["38948563","explore","32","140.084"],["3920dfb4","explore","111","124.207"],["3917dd99","query","265","362.546"],["38beeb4d","welcome","76","34.376"],["37d78acc","index","4","77.501"],["b86b60fc","query","104","377.900"],["39092208","query","77","316.229"],["b7821e5c","query","86","444.036"],["b8c1fc74","explore","22","83.822"],["385d970c","","10",""],["38ebcacd","welcome","66","14.274"],["38b30542","explore","31","147.349"],["b9893bc9","welcome","25","34.476"],["b8823cc9","query","99","365.394"],["37dadc3e","welcome","43","17.880"],["386bb217","explore","192","60.523"],["381e58d4","index","7","65.688"],["38592e00","","39",""],["3686429c","explore","22","103.253"],["b6633f1a","query","107","225.425"],["38dd6b90","query","53","447.753"],["374a37eb","index","30","54.219"],["b937fd4b","query","17","339.604"],["385b6916","","48",""],["b6e86a47","explore","395","45.118"],["389fde1c","query","109","376.790"],["37c3532d","welcome","13","29.550"],["b7339a70","index","39","51.799"],["34f12b30","index","45","56.292"],["38d95664","query","17","405.364"],["38b537e4","query","55","377.838"],["b90ce463","query","66","524.207"],["394b68a5","welcome","11","35.822"],["b8290074","explore","240","95.361"],["38343e84","welcome","18","46.736"],["b893f1e9","welcome","38","34.003"],["b893f1e9","query","27","348.767"],["38978417","","10",""],["b7939ddb","","35",""],["379333c6","explore","87","86.005"],["38343e84","query","71","365.678"],["b8781981","","83",""],["38824d6d","","10",""],["396197d3","explore","308","54.088"],["b9893bc9","explore","491","99.780"],["37d9801d","explore","66","31.481"],["39092208","welcome","21","19.088"],["b8b0892f","query","17","462.157"],["38824d6d","index","24","52.369"],["3811afac","query","118","253.869"],["b8f3e8b9","explore","95","151.806"],["36aa7870","query","231","321.225"],["b9101f6d","","90",""],["396197d3","explore","22","139.891"],["b88ada11","welcome","19","35.788"],["b7968805","query","65","407.013"],["b72f231c","welcome","7","35.212"],["386e6d49","index","12","52.181"],["381dc7c6","query","64","441.317"],["395fce5f","query","49","364.805"],["394fc6e8","welcome","21","28.849"],["b92a41bc","query","110","317.162"],["39035eea","index","20","37.357"],["b8b0892f","welcome","81","31.233"],["38e60476","explore","65","194.804"],["b7de74ad","query","83","317.779"],["3851b535","welcome","83","25.163"],["38a57213","explore","307","61.131"],["39035eea","query","106","333.487"],["36f3e2b0","welcome","16","32.571"],["b93b8201","query","17","346.645"],["386bb217","query","17","374.549"],["38447a00","query","36","369.766"],["b81579d6","index","17","49.674"],["b8bb9d02","query","76","313.385"],["b8d7bdee","welcome","18","29.097"],["b7474352","query","37","432.180"],["387e5fd3","query","72","413.242"],["b8780b92","query","34","491.467"],["39744ff2","explore","276","87.962"],["38af774a","explore","66","78.963"],["38beeb4d","","17",""],["b82af9b9","explore","22","127.545"],["b8c1fc74","welcome","73","31.449"],["38824d6d","query","17","363.613"],["38b96a95","query","148","351.826"],["b7e4ccd5","explore","84","42.161"],["b8ca7291","explore","249","41.906"],["b8781981","query","44","381.812"],["36a3d2fe","","10",""],["382b613e","query","32","238.635"],["b810076c","explore","107","91.259"],["b8cf3b88","welcome","30","26.460"],["3792ae33","index","26","62.501"],["b809a459","query","50","384.847"],["37ba28ff","query","17","312.146"],["b888e833","query","58","415.725"],["39769889","explore","85","158.703"],["3790a77c","explore","169","71.769"],["38368d7e","query","25","382.997"],["b6979500","query","95","324.498"],["b8ad224b","explore","22","176.859"],["b726fc97","welcome","102","34.596"],["b726fc97","explore","91","113.721"],["387eb251","index","16","22.286"],["38beeb4d","welcome","38","16.837"],["3913fdaf","query","36","341.381"],["38d9a089","query","80","343.959"],["b7474352","query","188","438.937"],["39365da1","index","7","55.906"],["388aadd7","query","86","388.871"],["b7276af1","welcome","60","28.630"],["b8326597","query","108","343.307"],["b72d9375","welcome","19","29.162"],["36a3d2fe","welcome","25","37.976"],["b905f518","welcome","65","21.017"],["383c44cb","query","17","443.355"],["b7aefa94","query","231","380.169"],["b31efa97","explore","344","154.945"],["382b8a89","explore","114","127.691"],["b94b611d","query","128","378.996"],["38d7936e","","10",""],["b78358d5","explore","33","119.636"],["b8cb4c88","","19",""],["b8bee8a9","welcome","7","35.790"],["38ea393f","index","53","50.549"],["3882c89c","query","17","481.405"],["38f0a207","query","117","405.837"],["38d7936e","query","24","365.027"],["37d8b9ed","","10",""],["b74acf21","explore","32","75.459"],["382f9c89","welcome","50","19.292"],["3819d95d","explore","28","153.345"],["3796f292","explore","323","120.081"],["b8a0d52a","","54",""],["b7894aac","query","26","278.406"],["b8fdf6d5","query","30","420.057"],["3811afac","explore","30","106.662"],["b81579d6","explore","22","138.421"],["39875084","welcome","23","24.693"],["38ebcacd","explore","41","95.109"],["b9856d43","explore","153","181.872"],["380494da","query","23","442.592"],["38beeb4d","query","258","430.846"],["b847bf23","explore","69","104.136"],["384dc7aa","welcome","32","23.006"],["389fde1c","","44",""],["b9122007","explore","294","82.625"],["b6e86a47","explore","186","145.490"],["b8c875ac","query","117","362.833"],["38ebcacd","welcome","12","37.178"],["b95d95b8","index","11","66.834"],["b810076c","explore","374","45.306"],["391c9704","explore","138","190.449"],["b919dc4a","index","10","48.204"],["b8b22c28","query","144","287.628"],["387bd683","index","8","50.727"],["386bb217","query","79","397.793"],["b8a754d1","index","7","64.283"],["b80b6056","query","59","338.868"],["38ea393f","query","17","368.051"],["374b43a9","query","43","421.084"],["b8c1fc74","","12",""],["b696bfa2","explore","286","109.969"],["b8834bbe","query","81","458.084"],["38978417","query","503","353.382"],["b888e833","explore","94","198.889"],["38368d7e","welcome","77","26.675"],["38cef8ac","explore","22","93.002"],["b52a98aa","welcome","7","42.293"],["b7de74ad","query","17","266.068"],["b83857e0","query","132","479.673"],["b74acf21","explore","22","125.486"],["3972909f","query","17","354.202"],["b9122007","explore","22","141.905"],["b72f2109","explore","57","140.224"],["b896dfeb","index","52","38.669"],["3906759e","query","108","330.749"],["b78358d5","query","61","351.567"],["380494da","explore","45","58.085"],["391c2252","query","123","358.893"],["37c3eb17","query","112","338.994"],["b755da2b","query","25","505.963"],["38cae142","welcome","7","44.683"],["b9098814","index","6","70.009"],["b8f1345d","query","125","364.857"],["38343e84","explore","151","116.911"],["3686429c","index","38","53.895"],["b94b611d","","10",""],["b8f1bf15","query","31","401.526"],["36f3e2b0","","10",""],["b9200590","index","10","58.491"],["37a768f1","query","17","402.971"],["b8faab12","query","103","300.915"],["3891da7b","explore","62","137.713"],["37ac6a09","explore","150","36.164"],["b9077d3a","explore","104","81.558"],["38c09959","explore","192","103.052"],["375ad4d0","","126",""],["39875084","query","66","443.956"],["b696bfa2","welcome","73","30.269"],["381dc7c6","query","141","310.528"],["38d8c63a","welcome","75","26.730"],["393ef37f","welcome","7","26.124"],["3906759e","query","26","503.287"],["b75759c1","explore","92","88.316"],["38368d7e","explore","22","104.360"],["383204f1","query","67","295.064"],["b92d0688","welcome","9","22.093"],["b82f8b2a","welcome","15","29.879"],["395fce5f","explore","52","107.224"],["39035eea","query","24","346.920"],["37a768f1","query","32","413.853"],["b86c757d","query","106","348.315"],["b9200590","query","181","362.864"],["37afb00b","welcome","35","23.949"],["38ded491","query","30","468.240"],["b7f4d0c1","query","110","448.483"],["b834e77f","query","17","353.517"],["39472aee","index","8","58.338"],["38820dcb","index","38","57.157"],["b789800a","explore","70","101.959"],["b90ce463","explore","50","160.311"],["38cef8ac","query","37","260.072"],["b9552f4f","explore","84","161.018"],["b6f10532","welcome","11","35.222"],["b938dc06","explore","68","60.356"],["b8cadf66","explore","150","137.619"],["b7210d82","","27",""],["38d8c63a","query","73","340.635"],["b8c67786","explore","76","84.011"],["b7aefa94","explore","22","70.848"],["b78bf9a5","welcome","11","29.895"],["b92d0688","","13",""],["38592e00","query","85","372.787"],["b93477eb","welcome","25","34.365"],["b8e92871","explore","161","119.826"],["394fc6e8","index","5","63.893"],["381e58d4","query","43","400.695"],["382b613e","explore","41","128.170"],["b8a6645b","explore","47","153.829"],["3686429c","welcome","38","28.163"],["b8f1bf15","index","4","29.677"],["38f8933d","query","17","368.930"],["b8cf3b88","explore","42","177.100"],["b7c012a8","welcome","45","26.485"],["38b96a95","query","43","426.294"],["38cae142","query","97","459.511"],["3917dd99","explore","83","113.486"],["b7821e5c","query","106","334.131"],["375ad4d0","welcome","7","30.511"],["b7abd6cd","explore","295","176.332"],["b8289f1a","query","65","321.806"],["b84ad865","explore","49","145.020"],["b8a6645b","query","64","406.274"],["b8781981","query","88","320.071"],["385f952a","explore","109","148.693"],["381e3950","query","106","304.785"],["b94b611d","query","22","417.109"],["b7fc776f","welcome","18","39.989"],["38820dcb","explore","44","96.246"],["b7474352","welcome","14","27.414"],["b8823cc9","query","23","419.374"],["b810076c","welcome","22","38.452"],["b93477eb","query","271","343.858"],["3915cc59","query","17","339.274"],["391c2252","index","5","46.970"],["b85c022e","query","31","399.481"],["379d5ea8","","12",""],["3882c89c","welcome","45","30.838"],["b902786e","query","100","334.477"],["391c9704","explore","170","99.037"],["39132f5c","explore","22","94.332"],["b72f231c","welcome","40","16.389"],["3836f29a","explore","220","69.210"],["3880ebea","explore","22","124.087"],["b8ccfe2a","query","93","378.652"],["392d18b2","index","52","45.581"],["37ac6a09","welcome","11","46.923"],["b6979500","explore","22","46.068"],["3882c89c","welcome","42","28.916"],["b902786e","query","88","475.531"],["38820dcb","query","17","447.994"],["383c44cb","query","33","311.981"],["b7707626","explore","91","130.476"],["b90b128b","welcome","41","43.107"],["3913fdaf","query","17","350.250"],["b8a6645b","index","4","56.469"],["b6633f1a","","10",""],["3906759e","explore","54","88.037"],["b90182be","query","357","368.915"],["b82bcf61","welcome","13","34.790"],["396197d3","explore","122","83.066"],["b7210d82","explore","36","189.927"],["37af77a3","","55",""],["b7474352","index","10","52.177"],["b72f231c","welcome","14","27.538"],["b9098814","welcome","7","28.977"],["b80b6056","query","80","364.737"],["b8cadf66","query","95","344.526"],["38beeb4d","index","60","33.078"],["38afab8e","query","17","411.919"],["39365da1","explore","24","161.831"],["b847bf23","query","66","467.366"],["387eb251","welcome","7","45.730"],["b8e92871","explore","75","66.202"],["b74acf21","query","249","323.920"],["b809a459","index","8","50.892"],["b82bcf61","query","27","370.775"],["388aadd7","query","56","367.331"],["387c10ce","explore","235","138.203"],["39152737","explore","22","86.050"],["b6633f1a","explore","36","158.910"],["b8c1fc74","explore","311","95.045"],["393ef37f","query","115","306.394"],["386e6d49","query","23","245.324"],["386bb217","query","28","380.260"],["b7608214","","149",""],["379d5ea8","explore","22","110.455"],["b8ad224b","query","17","533.684"],["383c44cb","query","193","254.259"],["b8903a5b","index","4","42.945"],["b789800a","welcome","23","29.619"],["b89da5c6","query","25","498.081"],["38da8baa","explore","22","202.178"],["b91dabaf","welcome","61","34.371"],["385b6916","query","45","415.964"],["38d7936e","explore","56","121.065"],["b6a668ba","","62",""],["39152737","welcome","32","24.580"],["b7fc776f","index","32","28.950"],["39132f5c","query","19","411.132"],["b726fc97","welcome","7","16.374"],["b8da5ce2","explore","144","131.765"],["b9200590","explore","22","132.390"],["b896dfeb","welcome","7","39.292"],["b9077d3a","query","85","363.075"],["b893f1e9","index","35","23.674"],["b6979500","query","17","459.213"],["3956dea1","query","193","482.352"],["b810076c","query","17","377.155"],["b938dc06","query","17","363.285"],["b85f1c7f","query","17","450.364"],["38beeb4d","welcome","11","33.934"],["b901a7bb","query","101","293.848"],["393c832e","explore","396","111.849"],["38ea393f","query","17","388.760"],["b8a03224","query","39","434.321"],["39472aee","query","224","295.761"],["b905f518","explore","281","174.057"],["3917dd99","explore","67","222.776"],["b85c022e","welcome","96","28.099"],["37e71d7c","query","28","298.317"],["b9316463","query","124","299.636"],["b85c022e","explore","22","99.287"],["37d78acc","explore","102","137.150"],["391c9704","query","17","421.982"],["b7276af1","explore","79","54.350"],["385d970c","index","4","32.654"],["b8acc8e1","explore","82","141.802"],["b88d8eb8","query","25","418.204"],["b696bfa2","explore","212","78.326"],["36349e28","explore","110","75.036"],["b834e77f","explore","101","118.390"],["39092208","query","55","400.973"],["b7474352","index","5","46.756"],["374a37eb","welcome","39","31.518"],["3880ebea","explore","56","124.233"],["37ea053c","query","17","306.149"],["3917dd99","query","206","296.303"],["3907e5b0","query","103","326.044"],["38539d8c","welcome","41","21.955"],["38f4c8db","query","36","278.581"],["b880c13a","query","17","371.231"],["3686429c","query","17","359.383"],["b7821e5c","index","4","62.041"],["b89705a9","query","23","452.754"],["375ad4d0","explore","40","152.561"],["37afb00b","","39",""],["b937fd4b","index","8","70.069"],["36ce2e37","explore","59","155.294"],["b8b22c28","explore","22","74.855"],["b8f13334","query","109","414.001"],["38a86427","welcome","24","35.099"],["b8a70c57","query","116","196.625"],["385d970c","welcome","10","30.627"],["385823a9","query","88","420.101"],["b87ea259","query","17","365.788"],["b938dc06","explore","152","57.566"],["b74acf21","index","14","37.833"],["391b2370","welcome","7","29.021"],["b808f9b5","query","17","318.446"],["b8246fe0","","127",""],["b896dfeb","explore","208","93.900"],["394b68a5","welcome","14","24.303"],["391c2252","welcome","26","34.238"],["b8290074","welcome","113","39.023"],["b8b22c28","query","49","377.909"],["37ea053c","welcome","7","26.855"],["b8289f1a","explore","84","103.525"],["b93477eb","query","49","420.816"],["b9552f4f","explore","25","110.590"],["b94b611d","index","4","61.806"],["36349e28","query","21","382.278"],["b78b2440","query","190","378.786"],["b896dfeb","query","52","495.035"],["b94525bf","query","104","394.306"],["b8f13334","query","59","421.873"],["b72d9375","explore","22","71.224"],["383204f1","explore","311","106.301"],["b81f57a4","query","102","338.379"],["385b341d","explore","150","125.808"],["3907e5b0","query","218","428.095"],["386e6d49","query","17","397.857"],["b8326597","query","47","312.011"],["b86c757d","query","403","413.151"],["b77f942a","","87",""],["37d78acc","explore","98","144.550"],["b80d45c6","explore","22","170.175"],["374b43a9","explore","204","192.899"],["38a57213","","61",""],["b90b46ff","explore","22","160.556"],["3819d95d","query","186","297.911"],["3909e239","query","42","273.002"],["b8f1345d","query","36","332.083"],["b8a1e1e5","","57",""],["39769889","query","51","440.866"],["36349e28","query","145","428.070"],["396197d3","explore","44","79.472"],["38aa11a2","","28",""],["b9324e4e","explore","215","134.229"],["b8faab12","index","24","47.239"],["382b8a89","index","51","24.223"],["37494840","","14",""],["381e3950","welcome","7","41.475"],["38a7f88b","explore","470","110.273"],["b7aa9958","query","305","390.760"],["38400295","explore","95","83.106"],["37d8b9ed","explore","269","116.047"],["3822edba","index","67","31.465"],["380494da","query","42","492.870"],["b74acf21","explore","115","84.447"],["b9101f6d","query","341","320.608"],["b88d8eb8","query","17","384.010"],["b789800a","welcome","7","26.473"],["3946238e","query","174","296.542"],["b82f8b2a","welcome","39","16.124"],["38948563","query","26","432.715"],["3909e239","query","37","383.633"],["b8e92871","query","17","361.365"],["b7ef02de","query","83","403.520"],["36653a24","query","17","402.960"],["b902786e","welcome","8","51.009"],["b7608214","query","94","460.107"],["b7c012a8","query","239","389.294"],["b9200590","welcome","19","13.754"],["b830c67c","query","121","323.742"],["386139d9","","10",""],["38368d7e","query","17","362.590"],["b8bb3849","","15",""],["379333c6","welcome","109","42.272"],["38cae142","index","11","46.906"],["b7968805","","49",""],["385d970c","explore","93","146.218"],["b7fc776f","explore","99","101.546"],["b755da2b","query","69","426.412"],["379d5ea8","query","135","332.691"],["b90b128b","explore","28","110.337"],["b8ac2813","query","31","387.242"],["3686429c","explore","27","60.507"],["b72f231c","explore","106","121.288"],["b9005d0b","explore","89","184.622"],["3822edba","welcome","7","36.590"],["b896dfeb","query","57","456.533"],["38400295","","30",""],["37d63bbb","query","80","393.805"],["381e3950","explore","177","95.915"],["38da8baa","index","5","55.519"],["36aa7870","index","22","38.649"],["382f4c24","explore","31","105.221"],["387c10ce","index","8","42.946"],["37247a19","query","17","451.898"],["39087f58","query","88","411.591"],["3836f29a","welcome","44","35.017"],["b93b8201","index","29","43.246"],["b830c67c","welcome","37","37.422"],["b93477eb","query","123","322.898"],["b81f57a4","","38",""],["b8529553","","70",""],["38d8c63a","query","48","444.271"],["37afb00b","welcome","25","24.342"],["37d9801d","welcome","16","48.016"],["b8c67786","welcome","53","29.641"],["36653a24","query","45","394.449"],["b8cb4c88","query","17","407.709"],["385b96d4","welcome","14","23.112"],["b81f57a4","welcome","7","18.350"],["38c7a130","query","63","365.996"],["38c09959","query","18","354.803"],["3883164c","query","81","345.552"],["b90ce38e","query","291","405.567"],["b789800a","query","47","328.882"],["b8ca7291","welcome","7","22.179"],["38b23f71","explore","65","160.201"],["36349e28","welcome","206","32.855"],["b81579d6","query","17","381.018"],["b85f1c7f","index","86","58.166"],["b82bcf61","query","25","425.804"],["b880c13a","welcome","43","24.656"],["b78bf9a5","welcome","158","42.455"],["3792ae33","query","91","376.455"],["b90182be","welcome","7","29.681"],["384665e3","welcome","74","33.769"],["383204f1","index","35","37.340"],["b902786e","query","217","514.697"],["38da8baa","explore","191","126.127"],["b5e7f657","","10",""],["b78358d5","explore","35","162.343"],["b7de74ad","query","39","365.446"],["b7e4ccd5","query","110","357.132"],["3796f292","explore","258","54.351"],["39875084","query","104","354.191"],["b8e92871","explore","326","86.435"],["3851b535","query","24","418.342"],["38b23f71","welcome","7","30.660"],["390c3cec","query","28","330.711"],["3933a80e","explore","22","64.006"],["38cef8ac","query","68","356.907"],["39744ff2","welcome","41","36.175"],["b919dc4a","index","4","70.073"],["b7d7b5f5","index","12","68.719"],["b90ce463","welcome","15","29.618"],["39092208","explore","92","131.466"],["b7608214","explore","82","73.660"],["b88ada11","query","48","321.785"],["38539d8c","explore","35","67.633"],["b9077d3a","","110",""],["391b2370","query","100","411.837"],["b80fcf1d","welcome","21","31.251"],["3811afac","explore","22","49.989"],["39875084","welcome","7","35.271"],["b8ccfe2a","query","64","411.179"],["38d9a089","query","83","418.699"],["b940c33b","index","25","17.473"],["b755da2b","welcome","25","19.961"],["b919dc4a","explore","186","98.023"],["b8971322","query","309","411.380"],["385823a9","query","61","346.248"],["38420c72","","17",""],["38afab8e","query","95","300.687"],["b7a47e56","index","4","45.070"],["b7821e5c","query","215","392.941"],["38f4230b","explore","43","82.765"],["38a57213","explore","136","107.421"],["b8beba55","index","9","34.883"],["b902786e","query","86","434.206"],["b8d05715","welcome","81","32.469"],["b6a668ba","index","9","24.121"],["3891f3e2","","31",""],["b8da5ce2","query","214","360.351"],["391b2370","explore","22","32.539"],["b90b128b","","40",""],["b9101f6d","explore","212","153.284"],["3851b535","welcome","14","18.544"],["b7aa9958","explore","100","118.531"],["34f12b30","welcome","34","16.134"],["396197d3","query","17","398.177"],["b7ef02de","query","365","392.857"],["38b96a95","explore","526","95.370"],["b714dc46","query","198","410.580"],["b755da2b","explore","112","55.169"],["b890dc6a","query","88","485.209"],["3891f3e2","explore","64","183.557"],["395fce5f","welcome","29","30.603"],["b980e6ce","query","38","408.492"],["391e0466","welcome","78","32.400"],["37ba28ff","query","83","459.958"],["b7e4ccd5","explore","35","195.002"],["3600fd8c","query","22","516.651"],["b8583fdd","explore","42","119.361"],["b6979500","query","99","352.745"],["384665e3","query","237","427.798"],["b81579d6","welcome","7","21.298"],["38aa11a2","query","71","413.589"],["b8e22a2e","welcome","7","38.347"],["38749f05","welcome","74","8.901"],["36ce2e37","query","104","308.603"],["3906759e","query","360","354.585"],["38edbb55","index","4","68.579"],["363d3fbf","explore","23","37.334"],["391c2252","welcome","67","40.666"],["3900e284","explore","91","168.494"],["37af77a3","index","18","23.417"],["b8f1bf15","welcome","84","40.479"],["b7939ddb","query","259","358.234"],["3913fdaf","welcome","13","38.983"],["3906759e","explore","22","139.260"],["394b68a5","query","48","294.990"],["37eb2fcd","query","271","341.932"],["38343e84","","99",""],["37c3eb17","welcome","45","26.461"],["b95d95b8","explore","22","125.907"],["b8f3e8b9","explore","82","80.424"],["3851b535","explore","22","97.433"],["3880ebea","explore","270","93.542"],["b8cadf66","query","29","413.621"],["38c09959","query","403","415.930"],["382ff46f","welcome","7","28.544"],["38c738d1","query","67","401.595"],["b80d45c6","explore","121","131.982"],["b82af9b9","query","22","310.361"],["b8a6645b","query","104","443.789"],["b85081f3","query","118","329.059"],["3891f3e2","explore","47","95.364"],["37ea053c","index","4","30.023"],["b432dbc8","index","41","32.294"],["b7ef02de","explore","22","165.685"],["3836f29a","explore","31","102.913"],["b834e77f","welcome","16","23.904"],["b72f2109","index","17","2.763"],["38edbb55","explore","162","142.763"],["b7894aac","explore","147","152.339"],["b89da5c6","query","68","434.161"],["386bb217","welcome","51","30.961"],["b9077d3a","query","100","459.979"],["389fde1c","query","20","430.408"],["b904a87b","query","34","341.483"],["b712de52","query","268","449.561"],["b8583fdd","index","5","49.579"],["b7939ddb","query","158","429.244"],["b714dc46","index","10","68.072"],["38820dcb","explore","22","57.947"],["385823a9","","21",""],["38447a00","welcome","19","29.090"],["394b68a5","query","71","302.585"],["b9316463","query","17","384.133"],["b93b8201","explore","166","64.077"],["385f952a","welcome","10","28.687"],["b8da5ce2","welcome","21","29.096"],["375ad4d0","query","17","293.925"],["b8971322","query","69","333.828"],["3906759e","query","153","361.907"],["b8b0892f","explore","39","49.172"],["b881be6d","query","33","341.890"],["b8ac8acd","index","32","54.994"],["b847bf23","query","70","479.779"],["b8ca7291","query","63","419.331"],["b7de74ad","explore","101","129.035"],["390c3cec","explore","22","160.345"],["38cae142","explore","22","148.765"],["395b5e7b","explore","234","140.564"],["b83524be","query","74","464.309"],["38d9a089","welcome","24","26.994"],["389fde1c","query","44","428.775"],["b88ada11","welcome","20","15.657"],["38948563","welcome","7","25.217"],["38868413","explore","153","135.261"],["3883164c","welcome","71","32.515"],["b78cd4cc","explore","22","154.245"],["382b8a89","explore","136","142.744"],["38adbc1c","query","17","349.597"],["37d701af","index","4","47.848"],["36ce2e37","welcome","13","19.467"],["38420c72","index","4","61.494"],["b7339a70","welcome","39","33.859"],["b888e833","welcome","31","31.539"],["b714dc46","query","125","503.612"],["b8cb4c88","welcome","7","33.910"],["38820dcb","","10",""],["b81edf15","index","24","39.462"],["38948563","query","252","266.810"],["3900e284","index","4","42.889"],["385b6916","query","42","464.758"],["b81579d6","welcome","7","46.404"],["b8045be3","query","82","339.185"],["b835e95b","query","259","310.790"],["b940c33b","explore","50","41.129"],["388aadd7","welcome","8","31.224"],["382b613e","index","9","55.225"],["390c3cec","explore","61","159.179"],["371ef2ec","welcome","67","18.322"],["37d63bbb","explore","55","61.974"],["36bf0d6a","query","17","382.417"],["38948563","query","397","377.860"],["b8f1bf15","explore","237","181.903"],["36f7fdad","index","5","51.732"],["37e71d7c","query","33","413.090"],["b726fc97","explore","153","169.162"],["38592e00","query","17","401.040"],["b8bf9af4","query","172","363.263"],["b8acc8e1","query","112","397.556"],["b948b6f9","query","26","410.236"],["38824d6d","explore","321","75.011"],["3920dfb4","welcome","15","40.528"],["b8c875ac","explore","22","139.934"],["388aadd7","query","60","339.373"],["38592e00","","26",""],["3933a80e","query","73","391.063"],["b8bee8a9","query","17","317.583"],["b9101f6d","welcome","28","10.047"],["b9324e4e","welcome","7","28.728"],["b80fcf1d","index","20","57.156"],["379d5ea8","query","124","371.100"],["37383af0","welcome","17","24.848"],["38a5cc26","query","46","360.757"],["b6a668ba","query","209","343.542"],["37494840","welcome","22","34.102"],["37af77a3","query","346","367.162"],["b82bcf61","query","52","351.337"],["b8290074","explore","199","21.225"],["38af774a","welcome","45","31.480"],["b980e6ce","query","289","333.188"],["b7c012a8","explore","65","132.348"],["38b45947","query","22","310.771"],["386c41b3","","34",""],["b82f8b2a","query","107","468.824"],["380494da","query","39","416.942"],["383c44cb","","134",""],["b85081f3","query","212","355.232"],["b8289f1a","index","7","35.820"],["b90fca82","query","24","370.982"],["b8e92871","welcome","7","21.097"],["36bf0d6a","welcome","25","40.318"],["b8e8b49d","explore","97","122.736"],["37a768f1","query","295","309.872"],["3900e284","","10",""],["37ea053c","explore","48","111.269"],["38539d8c","index","95","27.143"],["b8823cc9","welcome","26","21.923"],["3891f3e2","welcome","7","24.638"],["b830c67c","query","49","356.612"],["39092208","query","247","192.587"],["b7fc776f","query","52","468.364"],["3895c490","welcome","52","17.689"],["39875084","query","134","333.251"],["382b613e","explore","196","124.451"],["37c3eb17","query","86","333.475"],["38cae142","explore","44","125.926"],["b7d7b5f5","welcome","100","27.112"],["382b8a89","explore","86","89.137"],["3968d642","query","180","388.337"],["38beeb4d","query","133","357.604"],["b890dc6a","query","42","365.414"],["b8e92871","welcome","12","17.276"],["b8cf3b88","query","238","411.113"],["b9005d0b","welcome","7","12.892"],["39769889","query","52","497.370"],["39769889","query","42","363.795"],["b8bb3849","","79",""],["b8e8b49d","query","118","466.016"],["b8ad224b","query","25","415.599"],["b8289f1a","query","387","353.630"],["36349e28","explore","91","80.630"],["b712de52","query","51","447.751"],["b8290074","explore","258","139.154"],["b78cd4cc","explore","229","56.868"],["36f3e2b0","query","57","248.510"],["38a7f88b","query","148","430.154"],["36ce2e37","query","42","431.424"],["38f0a207","explore","164","57.837"],["b8583fdd","welcome","20","40.626"],["3822edba","query","45","365.991"],["38447a00","explore","139","190.387"],["b8d7bdee","explore","22","10.982"],["b72f231c","welcome","68","39.460"],["b7352e58","explore","175","33.411"],["b834e77f","welcome","7","33.736"],["b6633f1a","query","17","452.452"],["b8cadf66","explore","263","70.866"],["b8289f1a","query","27","345.929"],["37494840","welcome","84","19.165"],["381dc7c6","welcome","39","40.230"],["b7fc776f","welcome","83","31.226"],["38b23f71","welcome","12","38.269"],["b8c875ac","query","66","319.134"],["b82bcf61","explore","619","65.044"],["b919a166","query","17","381.087"],["3913fdaf","welcome","19","37.308"],["b808f9b5","explore","143","87.498"],["37a768f1","query","53","398.819"],["b8b0892f","query","94","409.849"],["b7fc776f","welcome","35","37.271"],["b8acc8e1","welcome","124","28.736"],["380edea5","query","17","441.032"],["38820dcb","query","42","338.467"],["b8a754d1","index","13","21.068"],["3906759e","index","40","63.011"],["37ac6a09","","145",""],["387c10ce","explore","22","77.197"],["391c2252","query","88","334.683"],["b82f8b2a","index","4","38.957"],["385f952a","query","17","424.449"],["3606bab5","index","7","52.426"],["b7210d82","query","142","497.789"],["b77f942a","explore","117","110.195"],["390c3cec","query","78","313.734"],["b810076c","","313",""],["b8cb4c88","welcome","7","38.826"],["b9552f4f","index","29","69.377"],["b8ac2813","explore","22","95.781"],["b980e6ce","explore","132","62.653"],["382b613e","explore","86","184.056"],["38400295","welcome","208","26.540"],["b7c012a8","query","208","293.642"],["37383af0","welcome","25","30.422"],["b8c875ac","explore","151","103.618"],["b91c49f9","index","8","44.739"],["b795879c","query","37","386.240"],["b90b46ff","query","63","371.262"],["379333c6","welcome","67","11.531"],["b712de52","welcome","7","37.402"],["39087f58","query","91","299.628"],["b83857e0","explore","129","162.692"],["383c44cb","query","134","354.988"],["b6f10532","query","49","306.410"],["b8a0d52a","explore","22","67.672"],["b90b128b","index","11","47.268"],["38f0a207","","36",""],["3943830a","explore","160","126.027"],["b8bee8a9","query","56","349.800"],["38afab8e","explore","96","94.525"],["38aa30c2","explore","144","68.563"],["b8c67786","welcome","7","38.069"],["b80e549c","index","8","45.611"],["b696bfa2","welcome","17","36.504"],["b82bcf61","query","29","354.943"],["38f0a207","explore","330","92.226"],["39152737","query","54","445.773"],["38749f05","","31",""],["b904a87b","","10",""],["b7c012a8","query","37","449.959"],["38a86427","query","512","227.509"],["3796f292","query","27","506.227"],["39152737","welcome","100","32.435"],["37265bd1","explore","50","91.082"],["37d63bbb","","14",""],["b7aefa94","query","32","446.128"],["b8bab8ec","query","61","419.389"],["38f4230b","query","33","297.850"],["b74acf21","welcome","7","20.337"],["38b96a95","","58",""],["b8a1e1e5","query","139","286.711"],["38d6f36c","index","46","25.999"],["b8781981","explore","22","45.744"],["3920dfb4","welcome","45","31.678"],["39290817","explore","59","99.736"],["39744ff2","query","313","430.161"],["38c7a130","query","66","275.110"],["b7210d82","welcome","61","27.881"],["b7fc776f","query","108","424.908"],["37dadc3e","query","18","243.066"],["384dc7aa","query","36","373.278"],["39769889","query","181","452.217"],["38749f05","welcome","21","41.841"],["38b30542","","31",""],["3606bab5","explore","86","69.384"],["b8ac2813","welcome","29","27.406"],["b7210d82","query","118","284.280"],["b9101f6d","explore","22","163.067"],["b9106aff","explore","172","60.144"],["38c738d1","welcome","11","49.445"],["390d2410","welcome","8","29.523"],["b8e8b49d","explore","293","96.466"],["b78139ab","query","436","362.049"],["b80e549c","welcome","9","30.254"],["3968d642","query","174","474.151"],["b8a0d52a","query","125","398.086"],["39365da1","welcome","12","24.530"],["38d49209","query","19","336.402"],["b834730b","welcome","12","27.494"],["3792ae33","welcome","14","16.160"],["b9324e4e","","55",""],["380494da","explore","146","78.955"],["b8cadf66","query","73","360.429"],["38f26220","","10",""],["388aadd7","query","35","391.516"],["375ad4d0","query","30","381.230"],["b7a47e56","explore","22","149.268"],["3956dea1","query","48","406.545"],["b8ac8acd","explore","45","125.007"],["38aa30c2","","173",""],["38c09959","explore","59","83.235"],["b905f518","","55",""],["b85081f3","welcome","43","28.957"],["b74acf21","explore","52","91.106"],["3836f29a","","24",""],["b78358d5","query","129","304.563"],["b89da5c6","index","39","82.839"],["38a57213","query","119","337.680"],["b6a668ba","query","77","382.939"],["395fce5f","explore","235","102.060"],["38b96a95","welcome","58","19.968"],["b933999c","query","17","375.750"],["b7968805","query","292","371.110"],["b9106aff","explore","22","101.498"],["b8ac8acd","query","134","357.935"],["3880ebea","query","20","497.641"],["b85081f3","query","17","256.105"],["37ac6a09","explore","131","147.828"],["38cae142","welcome","37","32.374"],["38e8ab3d","query","102","383.020"],["37d63bbb","query","59","364.549"],["b88ada11","query","17","366.182"],["385b6916","query","186","373.870"],["b80b6056","explore","102","113.867"],["3882c89c","explore","60","166.519"],["38978417","index","4","61.612"],["b7608214","welcome","14","26.066"],["36653a24","query","19","332.315"],["36f3e2b0","query","77","378.117"],["363d3fbf","query","27","323.598"],["37ea0427","index","34","58.923"],["b754f50b","explore","45","88.885"],["b95d95b8","query","17","415.300"],["b95d95b8","index","15","73.817"],["b905f518","query","111","393.501"],["b7d7b5f5","query","17","351.895"],["3792ae33","explore","22","69.724"],["b789800a","query","67","288.795"],["b933999c","welcome","23","40.592"],["b8ccfe2a","query","29","521.868"],["b8fdf6d5","query","338","373.280"],["b88ada11","explore","25","156.775"],["3883164c","welcome","33","27.354"],["38a57213","query","566","257.019"],["b890dc6a","query","54","344.535"],["b835e95b","query","28","399.604"],["37247a19","query","205","318.924"],["b80a0db4","explore","43","144.831"],["36ce2e37","welcome","35","23.634"],["387bd683","index","12","28.260"],["b8a1e1e5","explore","22","115.284"],["382b613e","query","66","531.491"],["b795879c","","138",""],["b89f8df2","welcome","81","48.252"],["38f26220","explore","56","71.989"],["37d9801d","welcome","7","8.557"],["b7d7b5f5","explore","309","89.109"],["3909e239","query","213","485.634"],["3792ae33","","28",""],["b8ccfe2a","welcome","41","11.402"],["b834e77f","welcome","34","24.830"],["38a7f88b","explore","277","65.555"],["3915cc59","explore","66","154.430"],["b8255a74","query","248","325.150"],["b712de52","explore","79","146.218"],["b8326597","query","38","449.844"],["b937fd4b","explore","22","138.621"],["b754f50b","welcome","31","35.379"],["b7608214","query","25","439.457"],["b937fd4b","query","56","388.022"],["3882d1ef","explore","70","77.828"],["36f7fdad","welcome","7","27.137"],["b8e92871","","10",""],["396197d3","query","37","406.960"],["3606bab5","query","60","461.180"],["b9101f6d","explore","172","123.011"],["b8ac8acd","explore","154","92.423"],["b9098814","query","129","401.377"],["38f4230b","query","73","351.247"],["b8583fdd","index","50","46.976"],["b901a7bb","welcome","9","34.863"],["39132f5c","query","17","447.267"],["38592e00","query","63","376.213"],["b7352e58","explore","157","185.928"],["b7276af1","explore","148","53.432"],["b7d7b5f5","explore","22","125.523"],["380494da","index","46","49.934"],["b7474352","welcome","50","31.706"],["38c09959","explore","80","150.776"],["382ff46f","query","162","295.616"],["b83857e0","","11",""],["b90182be","query","165","414.453"],["b8ccfe2a","query","35","420.764"],["38592e00","query","22","464.322"],["b8beba55","index","65","33.973"],["3913fdaf","","236",""],["38861a87","","156",""],["b8255a74","index","23","59.482"],["37a768f1","welcome","32","21.810"],["b8acc8e1","query","41","390.197"],["3907e5b0","","10",""],["391c9704","query","158","404.546"],["385823a9","query","85","296.966"],["b8290074","","137",""],["3851b535","explore","22","80.057"],["b83857e0","query","42","331.640"],["38592e00","query","17","454.354"],["386e6d49","explore","22","161.469"],["38948563","welcome","7","37.317"],["b7276af1","explore","61","68.384"],["38a57213","query","45","390.267"],["3907e5b0","index","4","41.527"],["388aadd7","","64",""],["b92d0688","query","43","429.035"],["385d970c","welcome","9","32.852"],["38aa30c2","welcome","66","30.915"],["b83857e0","explore","22","56.922"],["382f4c24","query","249","346.697"],["385f952a","explore","65","130.520"],["38a5cc26","welcome","14","12.087"],["387bd683","explore","182","91.241"],["b81f57a4","explore","201","115.975"],["38a5cc26","explore","22","155.502"],["b7707626","query","104","353.586"],["38cef8ac","welcome","13","26.459"],["37d63bbb","welcome","27","29.513"],["b93477eb","explore","22","130.940"],["3882d1ef","query","58","375.076"],["b8583fdd","query","69","390.817"],["b95d95b8","explore","23","85.499"],["38f0a207","index","5","78.253"],["38868413","query","35","390.772"],["b696bfa2","query","55","332.632"],["382b8a89","query","70","452.663"],["b8903a5b","welcome","9","36.816"],["b9200590","query","17","362.743"],["b8a0d52a","","36",""],["b7608214","explore","22","164.087"],["b835e95b","index","99","26.720"],["38cae142","query","314","357.844"],["363d3fbf","query","168","471.541"],["b8f1bf15","","62",""],["387e5fd3","explore","259","94.335"],["395fce5f","query","59","396.026"],["3900e284","query","126","498.579"],["b93b8201","explore","22","133.576"],["b89f8df2","welcome","67","34.143"],["b7de74ad","query","319","387.678"],["37247a19","index","15","41.861"],["b78bf9a5","query","44","401.916"],["b80d45c6","query","120","337.932"],["b8d7bdee","index","22","35.140"],["b8c1fc74","","22",""],["382f9c89","explore","32","94.401"],["b7474352","query","145","408.756"],["386bb217","query","146","362.524"],["38b30542","explore","137","144.724"],["b82f8b2a","query","107","354.679"],["b80b6056","explore","170","183.005"],["b84ad865","query","132","348.528"],["37ba28ff","welcome","80","31.591"],["b7608214","explore","246","68.942"],["b83857e0","explore","73","64.148"],["38820dcb","query","262","377.050"],["b9856d43","query","82","373.412"],["38c738d1","welcome","103","16.656"],["37d8b9ed","query","59","398.792"],["b9200590","query","86","291.885"],["38868413","explore","174","113.208"],["b8903a5b","index","40","52.986"],["386c41b3","query","221","368.161"],["3880ebea","index","23","49.898"],["385f952a","explore","22","156.587"],["395b5e7b","explore","195","78.130"],["37ba28ff","explore","159","175.981"],["38b52594","explore","22","57.504"],["38d7936e","query","21","359.221"],["b9098814","explore","27","110.029"],["b80a0db4","explore","28","153.053"],["394fc6e8","query","29","424.450"],["38ded491","welcome","44","36.337"],["b8290074","query","168","462.301"],["b937fd4b","query","157","381.558"],["b7e4ccd5","query","68","383.048"],["b91c49f9","","32",""],["3943830a","explore","37","114.894"],["b810076c","explore","22","65.552"],["390c3cec","query","42","407.008"],["b81dde6c","welcome","43","28.903"],["39875084","query","17","536.797"],["b8ac8acd","query","150","397.778"],["39083a44","","84",""],["b7d7b5f5","query","35","355.942"],["b85081f3","explore","68","122.877"],["b8834bbe","query","189","429.884"],["3968d642","explore","105","123.632"],["b80fcf1d","query","17","404.620"],["37d63bbb","welcome","7","24.644"],["b712de52","explore","129","126.774"],["b77f942a","explore","38","110.241"],["b8da5ce2","explore","31","104.505"],["393ef37f","welcome","111","43.317"],["371ef2ec","query","34","274.271"],["b8a03224","welcome","76","21.720"],["38d6f36c","explore","118","103.061"],["38afab8e","query","17","365.128"],["371b3e13","explore","22","56.901"],["386e6d49","index","13","32.749"],["b89da5c6","index","4","80.039"],["b9552f4f","welcome","20","36.377"],["38ded491","query","42","255.250"],["38a57213","explore","157","96.020"],["b7aefa94","query","17","362.756"],["37dadc3e","explore","57","163.556"],["38afab8e","query","118","254.168"],["b87ea259","welcome","10","34.259"],["b8971322","","19",""],["b7968805","welcome","28","36.954"],["b9552f4f","explore","22","117.215"],["39875084","explore","97","87.658"],["b8ca7291","query","17","415.421"],["38f26220","query","125","449.077"],["382b8a89","explore","107","124.197"],["37ac6a09","index","9","27.257"],["39083a44","query","127","390.649"],["38343e84","","41",""],["38f26220","welcome","17","43.586"],["385b341d","explore","245","81.844"],["38adbc1c","query","36","343.069"],["b8246fe0","","30",""],["b8e8b49d","query","134","358.156"],["386c41b3","explore","240","122.673"],["386139d9","query","17","367.911"],["b8ccfe2a","explore","27","100.726"],["b980e6ce","","10",""],["387eb251","query","17","311.972"],["b8acc8e1","query","143","285.721"],["b7b4e7ac","query","29","298.865"],["b8cf3b88","explore","84","162.776"],["38ded491","query","116","320.293"],["38c7a130","welcome","30","26.706"],["b9098814","explore","72","93.932"],["38d9a089","explore","657","85.312"],["b7d7b5f5","query","28","450.713"],["b9893bc9","","10",""],["b8045be3","query","196","264.598"],["39372d62","welcome","91","41.685"],["3895c490","welcome","7","29.832"],["b91c49f9","welcome","106","24.733"],["b8d7bdee","explore","143","119.620"],["b94525bf","welcome","44","23.703"],["38dd6b90","explore","36","130.352"],["391b2370","query","181","470.004"],["37ac6a09","","13",""],["b84ad865","query","98","406.976"],["b80fcf1d","","10",""],["36a3d2fe","","156",""],["390d2410","","154",""],["b7a47e56","index","4","55.231"],["b847bf23","query","17","397.875"],["b8a0d52a","explore","54","77.967"],["38e60476","welcome","37","48.955"],["38a57213","query","206","406.652"],["b7b4e7ac","explore","22","115.066"],["b808f9b5","explore","65","136.472"],["b81579d6","query","17","431.011"],["b78cd4cc","explore","28","156.630"],["b810076c","welcome","72","25.230"],["39472aee","explore","69","87.527"],["38420c72","query","46","369.195"],["38948563","query","183","268.796"],["384665e3","index","4","57.515"],["381dc7c6","explore","35","152.644"],["38861a87","query","105","358.248"],["37ea0427","explore","83","154.419"],["3920dfb4","query","59","377.051"],["b8045be3","query","35","490.819"],["b91c49f9","welcome","7","14.383"],["b8ccfe2a","welcome","7","29.705"],["37494840","explore","39","95.710"],["382ff46f","query","20","476.207"],["38ebcacd","explore","22","169.186"],["380494da","explore","66","123.336"],["b8529553","welcome","35","42.504"],["38b96a95","explore","202","134.880"],["380edea5","query","17","352.314"],["b8290074","explore","24","181.531"],["b8529553","welcome","26","20.481"],["38adbc1c","explore","22","117.096"],["38400295","explore","57","47.235"],["38d49209","explore","83","119.207"],["38d49209","query","76","311.849"],["b80e549c","explore","158","86.550"],["b896dfeb","welcome","10","18.570"],["38e60476","explore","22","65.154"],["b7707626","query","221","460.631"],["b83524be","welcome","32","26.141"],["37dadc3e","query","19","423.168"],["b8780b92","index","19","57.042"],["b7c012a8","explore","71","189.145"],["38d49209","explore","51","106.895"],["b7abd6cd","explore","22","70.248"],["38868413","","78",""],["374a37eb","explore","145","135.917"],["b8c875ac","welcome","59","22.305"],["371ef2ec","","68",""],["39132f5c","explore","25","106.437"],["37ea0427","query","21","417.693"],["38c7a130","explore","253","61.469"],["b6f10532","welcome","39","25.742"],["b8a754d1","explore","73","125.705"],["b881be6d","explore","22","96.109"],["38868413","","39",""],["379fe829","query","26","270.403"],["b835e95b","query","28","490.532"],["391c9704","welcome","56","22.848"],["b8c67786","explore","39","124.862"],["b810076c","query","176","370.055"],["38e85a88","query","22","398.246"],["39092208","index","13","48.791"],["b87ea259","welcome","20","34.898"],["b92d0688","query","33","408.605"],["b835e95b","welcome","59","30.479"],["382f4c24","query","52","366.790"],["b81f57a4","explore","98","45.316"],["39290817","welcome","99","18.248"],["b8903a5b","query","53","315.784"],["39744ff2","index","25","63.196"],["389fde1c","query","81","354.572"],["3891da7b","query","88","314.568"],["38343e84","explore","172","144.063"],["b8cadf66","query","24","516.732"],["385b96d4","query","47","338.765"],["38d49209","query","17","375.923"],["b80b6056","query","110","342.212"],["392d18b2","welcome","45","22.971"],["38afab8e","","50",""],["371b3e13","welcome","38","50.719"],["39092208","","85",""],["38edbb55","explore","203","170.264"],["b88d8eb8","welcome","35","44.035"],["390a94c6","explore","229","128.155"],["37ac6a09","welcome","78","41.525"],["385d970c","explore","121","118.336"],["b8a754d1","query","83","323.696"],["39083a44","index","41","44.965"],["34f12b30","welcome","7","34.881"],["b6a668ba","query","53","433.260"],["b890dc6a","explore","22","51.842"],["b893f1e9","query","99","331.919"],["393ef37f","query","265","384.775"],["b938dc06","query","23","344.263"],["385b6916","query","207","370.476"],["b91c49f9","explore","22","119.008"],["3956dea1","query","34","434.214"],["b8d05715","explore","22","55.407"],["38dd6b90","explore","331","82.210"],["38d95664","explore","172","150.479"],["38cae142","index","112","60.352"],["b94525bf","explore","73","97.150"],["38cef8ac","query","145","421.499"],["b8ca7291","explore","42","90.619"],["b81579d6","index","14","51.005"],["386c41b3","welcome","37","35.732"],["38b537e4","query","107","517.285"],["382ff46f","","38",""],["b92a41bc","query","17","389.030"],["b78cd4cc","welcome","7","33.408"],["38824d6d","query","117","313.031"],["b8971322","explore","65","134.657"],["39152737","welcome","53","28.674"],["391b2370","query","17","350.516"],["b7de74ad","","96",""],["37eb2fcd","explore","54","87.621"],["b7abd6cd","query","30","467.287"],["b8583fdd","index","9","60.078"],["37d9801d","index","4","68.177"],["b8beba55","welcome","35","28.211"],["381e58d4","explore","108","175.973"],["36ce2e37","explore","98","208.241"],["b85f1c7f","explore","46","119.173"],["38978417","welcome","34","30.273"],["b8bb9d02","explore","22","179.645"],["379fe829","query","56","403.723"],["38c738d1","welcome","48","27.875"],["37c3532d","query","157","366.118"],["b8f1bf15","index","26","71.492"],["385823a9","explore","230","54.882"],["b82f8b2a","welcome","25","12.675"],["371b3e13","query","127","443.586"],["380edea5","explore","22","136.161"],["b9b22f3d","welcome","79","21.472"],["b7fc776f","explore","60","152.903"],["b696bfa2","query","17","383.362"],["b901a7bb","query","107","473.482"],["b72f231c","welcome","18","26.073"],["377d4673","query","60","463.453"],["391b2370","query","17","417.987"],["392d18b2","query","17","460.332"],["b7894aac","explore","98","77.031"],["38a86427","query","44","346.902"],["b902786e","explore","35","69.934"],["34f12b30","query","72","419.372"],["b726fc97","query","17","509.402"],["b904a87b","explore","22","80.169"],["b7fc776f","explore","22","92.774"],["387e5fd3","explore","186","84.974"],["b432dbc8","welcome","37","46.648"],["38b45947","welcome","187","33.436"],["b78b2440","explore","130","127.346"],["394b68a5","welcome","7","32.735"],["b9106aff","welcome","82","19.393"],["38820dcb","query","75","379.072"],["b84ad865","explore","77","129.234"],["b82af9b9","index","4","72.318"],["b88ada11","explore","89","96.948"],["b834730b","explore","22","187.781"],["b8903a5b","welcome","20","31.147"],["b7821e5c","query","146","320.662"],["38749f05","","10",""],["b93477eb","explore","22","0.292"],["39372d62","explore","22","54.953"],["38592e00","explore","488","195.372"],["39769889","index","15","53.036"],["38e85a88","query","17","377.214"],["37ba28ff","query","92","387.855"],["39875084","index","97","37.690"],["b9324e4e","query","47","437.956"],["34f12b30","welcome","11","36.208"],["b8ea6996","explore","116","138.814"],["b7210d82","","86",""],["b8bb9d02","query","68","343.084"],["382f4c24","explore","73","11.020"],["392d18b2","","51",""],["b81edf15","query","17","382.634"],["b9077d3a","query","47","374.318"],["37e71d7c","explore","429","142.497"],["385823a9","welcome","12","19.887"],["b7276af1","query","17","339.064"],["37af77a3","explore","127","67.188"],["b8cf3b88","query","110","428.612"],["b8045be3","explore","50","124.518"],["b881be6d","welcome","93","25.690"],["37d9801d","query","48","295.764"],["38b45947","welcome","83","31.186"],["371b3e13","explore","110","68.052"],["b82af9b9","explore","67","140.943"],["b88d8eb8","query","53","373.634"],["385823a9","query","26","330.392"],["b835e95b","explore","379","89.840"],["36ce2e37","","33",""],["b9098814","query","36","305.947"],["37265bd1","explore","158","123.653"],["39152737","index","33","24.896"],["3907e5b0","explore","25","130.987"],["b84c5c67","","15",""],["b881be6d","query","209","409.820"],["b8a6645b","query","120","436.518"],["38a57213","query","40","329.812"],["3913fdaf","query","160","315.352"],["38b537e4","explore","176","118.513"],["b8ca7291","query","88","399.211"],["b940c33b","explore","58","75.563"],["3882c89c","query","247","339.541"],["394b68a5","index","7","45.334"],["38a86427","query","87","417.236"],["b8a1e1e5","explore","242","155.073"],["b85c022e","query","120","348.447"],["38c738d1","query","18","401.156"],["391c9704","index","13","76.199"],["39472aee","query","110","394.253"],["387e5fd3","query","83","378.143"],["37d78acc","explore","190","45.741"],["b8b0892f","explore","428","121.527"],["3920dfb4","explore","143","195.426"],["385b96d4","query","232","362.554"],["b9101f6d","explore","22","89.486"],["3851b535","explore","55","180.938"],["38c7a130","query","17","265.649"],["38a86427","query","87","448.402"],["b52a98aa","query","70","358.773"],["371b3e13","query","53","471.838"],["384665e3","explore","22","160.318"],["b8ac2813","query","129","307.355"],["b830c67c","query","17","308.764"],["38f4230b","index","4","55.270"],["b8823cc9","query","124","438.098"],["b86b60fc","query","50","360.636"],["b78bf9a5","explore","30","116.586"],["b8289f1a","index","15","53.992"],["38ded491","explore","249","184.228"],["b8bf9af4","explore","128","97.531"],["392d18b2","explore","563","97.316"],["b7968805","welcome","46","17.802"],["38e60476","query","20","376.636"],["b9106aff","welcome","77","17.397"],["3920dfb4","query","17","312.589"],["38d8c63a","welcome","7","34.964"],["b8c1fc74","","10",""],["b9b22f3d","","54",""],["b86b60fc","index","58","55.648"],["b9418299","","30",""],["38420c72","explore","254","37.914"],["b8bb3849","query","229","360.702"],["b8583fdd","query","76","252.117"],["383204f1","index","52","51.691"],["b9101f6d","query","17","357.064"],["3943830a","query","45","433.829"],["b7352e58","welcome","7","23.030"],["37d8b9ed","query","41","373.276"],["37c3532d","index","11","30.947"],["b8834bbe","welcome","26","45.762"],["38824d6d","query","302","374.029"],["38a5cc26","query","44","422.910"],["3943830a","query","17","397.567"],["386c41b3","query","17","458.358"],["b8a70c57","explore","366","185.344"],["390c3cec","explore","75","116.853"],["b8f1bf15","query","44","282.350"],["3822edba","index","23","39.551"],["374a37eb","query","51","417.147"],["b7939ddb","welcome","121","27.097"],["b933999c","query","154","247.872"],["b75759c1","query","295","399.832"],["b7339a70","query","183","352.194"],["38861a87","query","125","344.208"],["b8246fe0","query","51","381.909"],["b7939ddb","welcome","7","27.155"],["37494840","explore","22","76.011"],["b90b46ff","welcome","78","31.172"],["37d63bbb","explore","43","132.274"],["392d18b2","explore","22","137.543"],["b81579d6","welcome","7","43.710"],["b7ef02de","welcome","12","31.791"],["3920dfb4","explore","46","167.624"],["b6633f1a","welcome","104","28.538"],["b801e6e5","explore","144","113.249"],["b75759c1","explore","52","127.548"],["b808f9b5","explore","126","142.954"],["389fde1c","explore","22","120.938"],["b94b611d","welcome","7","26.530"],["39875084","","13",""],["b90ce463","explore","88","78.629"],["393c832e","query","17","435.252"],["3836f29a","query","17","492.614"],["391e0466","welcome","7","27.900"],["b940c33b","welcome","94","22.192"],["b93477eb","explore","22","91.305"],["38868413","query","372","282.731"],["393ef37f","explore","22","114.082"],["b7a97dbb","query","17","339.413"],["b81dde6c","query","168","414.556"],["38ded491","welcome","9","27.187"],["b834730b","explore","64","123.126"],["b84ad865","query","105","349.295"],["36bf0d6a","explore","24","44.367"],["3836f29a","query","27","252.393"],["387c10ce","explore","61","123.686"],["b80a0db4","query","18","415.906"],["38948563","welcome","7","40.164"],["b83857e0","welcome","85","39.399"],["b75759c1","","85",""],["374b43a9","query","37","401.479"],["38ded491","welcome","125","22.605"],["384dc7aa","explore","37","92.387"],["38b96a95","","10",""],["b810076c","","34",""],["38f0a207","welcome","52","28.891"],["38afab8e","welcome","13","31.695"],["37c3eb17","explore","125","144.834"],["36349e28","query","167","369.050"],["b91dabaf","explore","215","110.581"],["374a37eb","welcome","7","27.298"],["b90b46ff","query","61","515.651"],["381e3950","query","103","329.312"],["b78bf9a5","","205",""],["b795879c","query","240","429.110"],["b86c757d","welcome","27","37.805"],["b8a754d1","welcome","61","33.740"],["377d4673","explore","48","74.093"],["385823a9","welcome","18","28.562"],["b8045be3","query","17","414.210"],["3968d642","explore","316","50.463"],["b7339a70","query","18","402.647"],["38824d6d","index","13","49.451"],["379fe829","index","10","12.586"],["b92b2caf","query","17","311.884"],["390a94c6","query","61","379.754"],["b7ef02de","query","17","394.318"],["b8b0892f","query","17","387.088"],["38824d6d","explore","22","93.446"],["39083a44","explore","84","122.933"],["38447a00","welcome","37","40.432"],["b8b0892f","index","4","46.766"],["386139d9","explore","22","153.156"],["b8beba55","explore","28","104.310"],["b7894aac","welcome","50","35.830"],["389fde1c","explore","223","141.266"],["b7939ddb","query","20","339.572"],["b9324e4e","explore","28","37.587"],["385d970c","query","39","500.555"],["382f4c24","explore","50","113.691"],["b90fca82","query","222","253.048"],["b85081f3","explore","164","75.224"],["394b68a5","query","79","334.284"],["b8903a5b","explore","230","206.481"],["b712de52","index","23","44.289"],["b8a0d52a","explore","48","113.367"],["39152737","","71",""],["b7d7b5f5","index","25","65.545"],["38ebcacd","index","25","37.359"],["b7968805","query","57","394.414"],["b92d0688","welcome","36","38.820"],["b7b4e7ac","query","127","472.118"],["3917dd99","query","62","374.341"],["b432dbc8","query","306","341.457"],["b8319d86","welcome","61","39.252"],["b795879c","welcome","50","30.501"],["b835e95b","query","54","350.773"],["b896dfeb","welcome","7","44.285"],["b8ac2813","index","4","37.913"],["3606bab5","explore","30","101.318"],["3891da7b","index","12","69.886"],["37494840","query","17","402.291"],["b893f1e9","query","17","424.882"],["38da8baa","explore","54","119.617"],["38c09959","query","17","368.565"],["38d6f36c","index","5","61.111"],["b7c012a8","query","17","346.743"],["38ea393f","explore","87","111.987"],["b8bb9d02","explore","85","115.158"],["38978417","explore","22","100.211"],["395b5e7b","explore","54","54.659"],["38a86427","explore","56","117.760"],["b8255a74","welcome","27","31.932"],["b9098814","query","17","378.225"],["3917dd99","explore","22","43.142"],["b847bf23","welcome","10","24.599"],["385d970c","query","179","455.315"],["38d9a089","explore","236","123.521"],["38f4c8db","query","43","382.787"],["387bd683","explore","240","129.843"],["b881be6d","query","17","345.035"],["b9b22f3d","welcome","13","32.051"],["38447a00","welcome","32","31.127"],["b8f13334","query","226","499.770"],["b8bee8a9","explore","22","210.189"],["b835e95b","welcome","39","41.483"],["38afab8e","welcome","187","31.597"],["b9316463","index","24","54.925"],["382b8a89","query","17","383.208"],["39769889","explore","141","138.809"],["3943830a","explore","281","114.975"],["b8c1fc74","index","21","41.508"],["b87ea259","query","286","384.371"],["385823a9","explore","194","140.644"],["37383af0","welcome","47","22.849"],["38948563","query","76","428.496"],["38539d8c","","10",""],["b888e833","explore","369","133.422"],["b95d95b8","explore","22","97.309"],["b8289f1a","query","351","375.867"],["b7a97dbb","index","5","70.260"],["b5e7f657","welcome","26","30.844"],["3956dea1","explore","101","66.543"],["b8ad224b","","37",""],["b9552f4f","query","84","279.442"],["b91c49f9","query","32","343.730"],["38868413","welcome","7","25.858"],["b7339a70","welcome","47","20.194"],["b83524be","explore","52","125.723"],["382f9c89","query","51","323.634"],["38adbc1c","","19",""],["38af774a","explore","22","87.307"],["b9893bc9","welcome","10","29.185"],["b880c13a","explore","84","145.709"],["b7a47e56","","10",""],["37eb2fcd","explore","22","128.461"],["37247a19","index","4","23.026"],["b9106aff","explore","22","128.619"],["3880ebea","query","114","330.421"],["b7ef02de","explore","22","99.746"],["b8a6645b","explore","345","171.375"],["b8bab8ec","welcome","49","28.050"],["b906df62","explore","137","88.824"],["b8583fdd","query","20","316.230"],["b89da5c6","query","17","350.378"],["b92d0688","explore","22","87.280"],["b888e833","query","68","305.433"],["b8beba55","explore","47","145.239"],["37383af0","","10",""],["384dc7aa","index","4","39.023"],["38b45947","explore","292","73.354"],["b9122007","query","75","336.777"],["3882c89c","explore","49","168.558"],["b726fc97","query","173","297.020"],["38b52594","welcome","7","22.467"],["b9856d43","query","78","276.552"],["b52a98aa","query","89","358.578"],["392d18b2","query","30","439.550"],["38f0a207","query","21","454.113"],["b881be6d","query","20","376.839"],["b8a0d52a","index","28","49.929"],["377d4673","welcome","50","23.168"],["b95d95b8","explore","56","77.132"],["b937fd4b","explore","61","165.486"],["389fde1c","query","40","394.753"],["38a86427","explore","22","110.412"],["b91c49f9","query","79","374.770"],["37d8b9ed","query","332","393.897"],["3968d642","query","116","357.298"],["b7474352","welcome","7","23.494"],["b8529553","query","86","393.196"],["b89da5c6","explore","114","156.643"],["b696bfa2","explore","664","110.765"],["b880c13a","explore","258","29.113"],["b938dc06","explore","87","51.004"],["b948b6f9","welcome","77","33.166"],["3915cc59","explore","22","126.176"],["36f3e2b0","query","17","335.290"],["b8bb9d02","explore","158","127.615"],["b919dc4a","query","126","321.019"],["388aadd7","index","64","43.189"],["382ff46f","query","250","394.999"],["390a94c6","query","25","318.420"],["b906df62","explore","238","178.125"],["b93477eb","explore","22","207.575"],["37d9801d","explore","22","113.732"],["39875084","query","29","282.119"],["b78b2440","query","45","423.863"],["b8bb3849","explore","83","67.353"],["b726fc97","explore","22","102.708"],["393c832e","","26",""],["382f9c89","","24",""],["36a3d2fe","","10",""],["b7821e5c","query","79","343.760"],["b948b6f9","explore","40","175.160"],["3883164c","welcome","7","37.887"],["38948563","query","63","423.724"],["386bb217","explore","352","98.934"],["b9b22f3d","query","41","457.898"],["36653a24","query","66","466.327"],["385823a9","query","45","338.640"],["b6e86a47","index","11","70.393"],["b80168ac","query","21","410.228"],["b8781981","explore","170","69.781"],["b5e7f657","query","180","423.928"],["b8acc8e1","welcome","17","26.341"],["b7c012a8","explore","167","68.897"],["b754f50b","query","72","359.695"],["b8faab12","query","17","318.581"],["388aadd7","welcome","7","28.846"],["3796f292","query","31","365.586"],["b8b22c28","index","4","34.286"],["b82f8b2a","explore","288","92.557"],["38592e00","welcome","23","16.864"],["b81dde6c","query","17","365.417"],["3900e284","welcome","15","31.805"],["b8e8b49d","query","56","304.316"],["b90ce38e","explore","129","128.217"],["b9101f6d","index","4","33.823"],["b6f10532","index","4","52.084"],["b432dbc8","query","17","387.632"],["b74acf21","index","11","37.153"],["b7608214","explore","79","29.819"],["38b45947","query","19","335.305"],["b8e92871","welcome","24","27.022"],["37ea053c","welcome","7","21.653"],["b8a6645b","query","56","378.621"],["b80fcf1d","query","52","456.821"],["382b8a89","welcome","19","26.494"],["385b96d4","query","174","453.639"],["b6e86a47","welcome","123","23.413"],["b847bf23","query","147","326.069"],["b8045be3","welcome","30","22.542"],["b8823cc9","query","17","427.922"],["b8a0d52a","","51",""],["b8ac8acd","explore","138","60.198"],["3686429c","query","161","310.988"],["b82af9b9","explore","144","40.294"],["3943830a","welcome","16","24.546"],["b7de74ad","explore","39","88.621"],["37247a19","welcome","14","34.071"],["b8a70c57","explore","65","45.892"],["386139d9","","29",""],["b8b22c28","explore","281","99.472"],["b82f8b2a","query","55","350.702"],["b8319d86","query","82","347.598"],["b8971322","query","17","471.476"],["b7e4ccd5","welcome","16","18.877"],["391c2252","query","69","306.324"],["b9316463","explore","55","71.096"],["391c9704","explore","24","115.287"],["39035eea","query","17","344.154"],["b9101f6d","explore","220","72.479"],["b7f7db07","welcome","7","28.534"],["b8246fe0","query","18","395.351"],["b8246fe0","query","17","329.773"],["b881be6d","explore","100","62.497"],["b8f1345d","query","158","400.904"],["b90182be","query","17","464.631"],["380494da","query","102","369.540"],["b8b0892f","query","80","457.884"],["3895c490","query","162","302.489"],["38368d7e","explore","158","77.995"],["b7339a70","welcome","134","45.238"],["b7474352","explore","22","149.746"],["37ac6a09","explore","22","72.359"],["b805419d","query","39","367.059"],["395fce5f","query","17","344.489"],["b888e833","query","17","407.842"],["39744ff2","index","7","43.220"],["3913fdaf","query","409","386.438"],["b86c757d","welcome","28","24.653"],["b432dbc8","welcome","38","24.304"],["b726fc97","explore","22","104.680"],["3811afac","","54",""],["b9200590","welcome","13","21.038"],["39290817","query","143","365.363"],["b696bfa2","explore","74","125.586"],["37c3eb17","query","200","461.184"],["39290817","query","185","330.633"],["b5e7f657","query","58","406.157"],["b696bfa2","index","4","67.592"],["38da8baa","welcome","118","23.032"],["3946238e","","10",""],["387c10ce","query","87","370.278"],["b8bf9af4","query","23","292.702"],["b8beba55","explore","22","162.127"],["3851b535","explore","123","102.171"],["3972909f","explore","22","138.033"],["b8cadf66","explore","68","91.675"],["b834e77f","query","113","356.007"],["b8f3e8b9","query","258","312.600"],["38af774a","","28",""],["b8ca7291","explore","92","151.171"],["3836f29a","query","48","394.617"],["38aa11a2","query","17","392.019"],["b755da2b","query","40","289.193"],["383204f1","explore","87","91.373"],["b8bb9d02","explore","78","107.904"],["3917dd99","explore","82","163.012"],["387e5fd3","query","160","328.542"],["395fce5f","explore","135","95.284"],["b8bb3849","welcome","13","26.288"],["b8b22c28","query","219","330.526"],["b8780b92","explore","82","137.551"],["b906df62","explore","87","73.572"],["b82af9b9","index","44","44.438"],["382b8a89","query","143","324.151"],["380edea5","","70",""],["38b52594","welcome","22","25.817"],["b90fca82","query","286","368.998"],["38d95664","query","77","328.416"],["b78358d5","welcome","7","43.826"],["b9098814","welcome","23","44.062"],["3880ebea","explore","76","163.700"],["b90ce463","index","4","36.026"],["38c7a130","index","28","58.018"],["38343e84","explore","22","59.315"],["b835e95b","welcome","10","28.224"],["b834730b","query","17","434.142"],["38f4230b","index","4","24.994"],["385b96d4","welcome","96","32.985"],["b906df62","query","190","477.119"],["b8e22a2e","query","29","407.158"],["380494da","query","30","419.796"],["39875084","","10",""],["3907e5b0","explore","127","168.282"],["b754f50b","explore","186","117.262"],["b712de52","query","17","441.281"],["390d2410","","14",""],["3811afac","query","70","364.771"],["b80b6056","explore","93","107.375"],["b890dc6a","explore","102","72.616"],["38dd6b90","query","49","466.392"],["38ea393f","welcome","15","44.083"],["3907e5b0","query","17","419.258"],["38b45947","index","16","46.005"],["b940c33b","welcome","12","34.684"],["37c3532d","explore","28","98.979"],["b810076c","query","33","363.782"],["b72d9375","welcome","66","29.069"],["b938dc06","explore","22","87.088"],["b78b2440","query","121","389.240"],["380494da","explore","22","206.264"],["b8f1345d","explore","43","101.602"],["395fce5f","welcome","27","21.662"],["3906759e","welcome","7","26.720"],["b8bf9af4","explore","29","156.066"],["b835e95b","query","32","401.377"],["37d701af","query","17","298.965"],["38d95664","query","17","404.208"],["391b2370","query","180","436.507"],["382b613e","welcome","55","31.948"],["382b613e","welcome","36","29.897"],["38592e00","explore","84","124.910"],["39365da1","query","246","370.057"],["b9856d43","query","285","453.066"],["b8d7bdee","query","209","253.780"],["b795879c","query","40","405.522"],["b84ad865","welcome","30","40.999"],["b940c33b","explore","103","110.692"],["b8f13334","query","102","311.664"],["b94525bf","query","479","474.672"],["34f12b30","explore","68","118.222"],["b8d05715","query","30","275.689"],["b8823cc9","query","58","406.990"],["394fc6e8","index","7","38.418"],["38978417","index","48","45.553"],["3836f29a","explore","230","87.709"],["b80e549c","index","10","44.580"],["b8f3e8b9","explore","22","94.578"],["b8b22c28","query","27","409.338"],["39472aee","welcome","35","36.349"],["390c3cec","welcome","40","7.867"],["37383af0","query","194","445.994"],["b86b60fc","explore","93","80.164"],["b789800a","explore","141","121.749"],["b80d45c6","welcome","7","22.057"],["3900e284","query","17","348.798"],["39472aee","query","64","499.526"],["3933a80e","query","49","329.017"],["38749f05","explore","80","183.384"],["b85f1c7f","explore","62","44.162"],["b6979500","explore","67","106.265"],["b8529553","welcome","26","34.220"],["b72d9375","query","78","427.910"],["b7de74ad","index","7","84.716"],["386c41b3","index","18","74.098"],["3596f875","query","51","464.952"],["38da8baa","query","17","407.855"],["38978417","query","174","355.987"],["38b45947","query","46","220.745"],["3851b535","","73",""],["38a7f88b","explore","28","134.971"],["385823a9","explore","454","159.980"],["b52a98aa","query","29","333.296"],["b9077d3a","welcome","7","30.717"],["371b3e13","query","17","493.410"],["38868413","","72",""],["b82af9b9","welcome","25","28.396"],["b8d05715","query","24","428.689"],["3606bab5","query","100","444.548"],["3851b535","query","192","338.935"],["38824d6d","welcome","7","27.244"],["b8c1fc74","welcome","63","28.653"],["b93477eb","","23",""],["b712de52","query","272","324.220"],["36ce2e37","explore","41","71.316"],["b834e77f","query","244","255.581"],["39092208","explore","182","114.660"],["b801e6e5","explore","323","92.069"],["b8c67786","explore","22","148.072"],["b9200590","explore","173","85.359"],["b880c13a","query","74","370.983"],["b8da5ce2","","10",""],["b8290074","","26",""],["3891da7b","query","183","368.365"],["38b45947","explore","753","136.635"],["38d95664","query","53","410.582"],["b8f3e8b9","explore","186","125.996"],["3917dd99","explore","22","46.533"],["b755da2b","query","218","419.789"],["390a94c6","welcome","16","29.465"],["3917dd99","welcome","37","28.052"],["386e6d49","welcome","50","23.927"],["36a3d2fe","query","17","295.015"],["38948563","query","73","362.974"],["3900e284","query","70","374.355"],["b94525bf","","98",""],["394fc6e8","index","18","58.248"],["b92d0688","query","62","338.462"],["38e85a88","explore","277","68.957"],["b8255a74","query","67","324.424"],["38a5cc26","explore","82","172.234"],["386bb217","welcome","43","19.914"],["38e60476","query","270","355.529"],["379333c6","query","17","401.987"],["b82af9b9","query","46","378.864"],["382b613e","query","17","301.430"],["b8ac2813","explore","24","85.187"],["b789800a","explore","22","40.230"],["b72f231c","query","100","408.852"],["b7608214","welcome","9","26.591"],["3792ae33","explore","28","118.131"],["38539d8c","explore","48","166.162"],["b726fc97","query","148","220.632"],["b8f1bf15","query","32","436.996"],["b7fc776f","","31",""],["3968d642","welcome","9","24.209"],["b89705a9","welcome","22","25.672"],["b8e22a2e","query","17","516.882"],["b8971322","query","54","363.920"],["38c09959","query","24","303.619"],["3907e5b0","index","4","61.136"],["b8823cc9","query","133","293.987"],["3907e5b0","explore","23","93.823"],["b7de74ad","explore","69","52.166"],["3596f875","explore","66","134.826"],["3920dfb4","explore","139","104.692"],["380edea5","welcome","24","25.920"],["3596f875","explore","24","150.491"],["b90fca82","explore","32","161.851"],["3606bab5","query","41","415.863"],["39035eea","query","217","350.228"],["b7707626","query","202","431.465"],["37265bd1","query","119","343.424"],["3792ae33","query","144","326.979"],["b31efa97","welcome","7","39.493"],["b92a41bc","explore","22","115.311"],["b7f4d0c1","","12",""],["b8faab12","query","237","429.723"],["38400295","index","36","75.088"],["b810076c","explore","305","48.043"],["b8319d86","index","4","51.254"],["37ea0427","welcome","187","37.025"],["b7821e5c","","94",""],["b902786e","query","17","445.136"],["383c44cb","query","158","337.565"],["385b96d4","explore","22","69.122"],["38b23f71","query","17","374.162"],["b74acf21","query","227","267.968"],["3900e284","explore","65","159.807"],["38d6f36c","query","277","340.387"],["b8faab12","index","4","50.517"],["b938dc06","query","17","273.563"],["39035eea","index","12","41.890"],["39152737","query","33","288.678"],["3891da7b","explore","354","81.635"],["391b2370","welcome","7","21.196"],["b8a70c57","query","82","375.724"],["b948b6f9","welcome","22","19.248"],["38b52594","query","90","391.945"],["b7a47e56","explore","76","62.696"],["b8fdf6d5","index","4","59.678"],["37e71d7c","explore","48","79.577"],["37d63bbb","query","26","389.440"],["37d9801d","explore","277","128.760"],["3906759e","query","17","344.826"],["3600fd8c","welcome","22","27.096"],["b80a0db4","query","129","484.904"],["392d18b2","query","17","357.934"],["385b341d","explore","143","112.543"],["b8fdf6d5","query","35","303.806"],["3882d1ef","query","236","340.254"],["b8cf3b88","explore","228","113.642"],["b7c012a8","query","117","442.045"],["b94525bf","query","320","382.024"],["38749f05","query","17","338.199"],["38b23f71","query","36","398.668"],["b8e92871","explore","22","120.656"],["b6a668ba","index","5","37.459"],["b7d7b5f5","query","258","504.555"],["b830c67c","explore","185","119.425"],["b8326597","explore","29","146.558"],["b7894aac","explore","32","121.775"],["b8ac2813","welcome","7","33.815"],["37ea053c","explore","398","91.358"],["38d49209","","26",""],["37d78acc","explore","970","72.481"],["385823a9","query","17","251.118"],["b8cadf66","explore","23","120.119"],["b980e6ce","welcome","27","27.954"],["b893f1e9","query","17","500.863"],["b91c49f9","welcome","83","44.245"],["b75759c1","query","17","284.800"],["39087f58","explore","91","82.976"],["b980e6ce","explore","759","126.626"],["385d970c","query","17","339.929"],["b8faab12","query","86","398.303"],["38ded491","","138",""],["394fc6e8","explore","138","108.126"],["b94525bf","welcome","24","30.344"],["b432dbc8","explore","195","48.095"],["382b613e","","56",""],["b7de74ad","","108",""],["38447a00","query","107","322.981"],["b82bcf61","query","24","381.413"],["b904a87b","query","202","222.931"],["384665e3","index","137","37.536"],["385b96d4","explore","56","139.861"],["387c10ce","explore","30","102.219"],["391c2252","explore","60","132.076"],["39083a44","query","66","375.090"],["39875084","welcome","10","32.051"],["b8326597","query","137","396.629"],["37d78acc","index","41","28.041"],["b6633f1a","query","120","342.831"],["b78358d5","welcome","7","27.268"],["b8da5ce2","welcome","42","35.516"],["38861a87","welcome","32","29.829"],["b7939ddb","welcome","31","38.110"],["b94525bf","query","36","464.350"],["b81dde6c","query","81","470.903"],["b75759c1","query","17","378.398"],["38e85a88","explore","71","121.494"],["b919a166","explore","22","13.150"],["b7a97dbb","welcome","43","15.327"],["b8246fe0","","28",""],["b8a6645b","welcome","24","28.710"],["3792ae33","query","36","368.425"],["b712de52","welcome","9","26.761"],["b8ea6996","query","109","355.304"],["380edea5","explore","417","150.057"],["b7a97dbb","query","283","287.282"],["b7aefa94","","33",""],["38d49209","","45",""],["b937fd4b","query","44","328.976"],["38ded491","welcome","7","22.256"],["3880ebea","index","11","28.891"],["384665e3","query","17","396.241"],["b9077d3a","welcome","46","33.017"],["b835e95b","index","4","41.836"],["38b23f71","query","85","437.590"],["3915cc59","index","31","39.944"],["b8319d86","welcome","7","39.881"],["b8255a74","query","17","443.378"],["b87ea259","welcome","16","26.480"],["b9316463","explore","30","86.256"],["b93477eb","query","50","388.931"],["b8cb4c88","welcome","8","42.374"],["b90182be","query","17","372.131"],["390a94c6","explore","662","12.886"],["38c738d1","query","135","483.067"],["3972909f","query","17","462.948"],["37ea053c","query","56","385.632"],["38861a87","welcome","44","36.262"],["38f4c8db","query","76","270.927"],["b8ca7291","query","68","353.788"],["395fce5f","query","54","402.503"],["b6e86a47","explore","22","130.290"],["382f9c89","query","68","372.035"],["38d8c63a","","23",""],["39035eea","explore","189","170.974"],["38beeb4d","query","263","411.287"],["3882c89c","explore","112","110.937"],["b805419d","explore","644","119.245"],["b93b8201","explore","197","81.778"],["377d4673","query","17","377.958"],["b8a70c57","explore","76","126.999"],["396197d3","welcome","10","40.934"],["389fde1c","index","122","37.453"],["37d9801d","query","129","414.739"],["38b30542","query","120","395.942"],["b432dbc8","explore","241","134.588"],["b8beba55","query","17","366.703"],["b7939ddb","welcome","29","29.717"],["38ea393f","query","69","493.681"],["385b96d4","index","16","23.699"],["b81dde6c","welcome","16","41.385"],["34f12b30","query","96","342.130"],["37247a19","query","64","340.883"],["b755da2b","explore","204","135.073"],["3686429c","","84",""],["38b30542","explore","33","139.099"],["b72f2109","welcome","24","22.284"],["38368d7e","query","122","502.063"],["38a57213","","47",""],["b9200590","explore","236","118.980"],["389fde1c","explore","23","22.008"],["b7474352","index","21","48.637"],["383204f1","query","32","364.296"],["37c3532d","query","46","403.788"],["b9101f6d","query","69","312.616"],["b8781981","query","137","348.674"],["38b52594","explore","62","74.884"],["38d95664","explore","104","30.274"],["b8f3e8b9","welcome","22","43.395"],["b7276af1","welcome","30","37.056"],["b85f1c7f","explore","115","112.381"],["b7d7b5f5","","35",""],["379333c6","query","213","475.910"],["371ef2ec","query","48","414.118"],["39769889","explore","141","148.189"],["37265bd1","welcome","48","30.114"],["b810076c","explore","174","110.279"],["b78358d5","explore","81","145.983"],["b90ce38e","index","29","50.991"],["b93b8201","explore","582","82.852"],["396197d3","explore","44","97.542"],["b8cb4c88","welcome","12","32.119"],["3946238e","","27",""],["38d6f36c","query","28","480.307"],["b7fc776f","explore","22","101.994"],["b78cd4cc","query","229","329.251"],["38d49209","explore","53","90.145"],["b834e77f","query","74","365.456"],["38948563","explore","57","103.500"],["382f4c24","query","132","385.108"],["3596f875","query","20","342.995"],["38a86427","query","29","401.497"],["b940c33b","index","31","43.221"],["37ea0427","welcome","7","23.580"],["b93477eb","query","104","325.416"],["37eb2fcd","query","17","346.013"],["b805419d","explore","22","92.563"],["b940c33b","explore","208","177.905"],["38aa11a2","welcome","29","47.428"],["b7339a70","query","234","334.914"],["b90fca82","","111",""],["3796f292","welcome","10","39.116"],["b754f50b","query","18","381.690"],["b5e7f657","query","17","410.957"],["b7474352","welcome","12","23.308"],["385f952a","query","63","386.635"],["b8c67786","","75",""],["38b537e4","welcome","7","41.697"],["385b6916","query","117","340.221"],["38e60476","explore","86","86.986"],["38d8c63a","index","21","54.715"],["38b23f71","welcome","52","30.457"],["37383af0","","10",""],["385b96d4","welcome","55","36.483"],["39372d62","welcome","38","33.279"],["38dd6b90","query","144","392.349"],["38a57213","explore","48","77.002"],["391b2370","welcome","95","34.093"],["383204f1","welcome","27","19.861"],["b888e833","welcome","32","43.429"],["b904a87b","explore","266","111.615"],["b90fca82","welcome","85","28.962"],["b7f7db07","index","4","52.859"],["37383af0","","10",""],["b902786e","explore","240","141.726"],["38592e00","query","17","392.703"],["b8326597","explore","123","127.011"],["37c3eb17","","35",""],["b52a98aa","","10",""],["379d5ea8","welcome","21","30.004"],["391b2370","welcome","79","27.804"],["381dc7c6","query","46","406.667"],["b7894aac","query","524","401.884"],["386e6d49","welcome","7","30.412"],["b8255a74","query","34","384.090"],["b7707626","welcome","67","41.860"],["b7707626","query","36","473.929"],["b95d95b8","welcome","26","33.781"],["39372d62","explore","94","123.729"],["b8bb9d02","welcome","7","23.348"],["38978417","query","123","282.188"],["b893f1e9","explore","25","124.358"],["b5e7f657","explore","58","82.429"],["3946238e","welcome","186","24.364"],["b7aa9958","index","4","54.702"],["386e6d49","query","248","487.469"],["b80e549c","explore","22","56.839"],["38420c72","welcome","37","19.366"],["b8f13334","welcome","12","28.077"],["38d7936e","explore","70","96.667"],["b80168ac","welcome","14","39.876"],["391c2252","","24",""],["38ea393f","welcome","21","22.860"],["39290817","welcome","7","34.961"],["38c09959","query","57","381.037"],["b84ad865","explore","152","12.165"],["3882c89c","query","63","397.764"],["38f26220","explore","402","119.909"],["b7821e5c","explore","74","89.181"],["38b52594","explore","22","140.939"],["382b613e","explore","119","60.327"],["b755da2b","index","20","65.739"],["b8cb4c88","query","97","442.027"],["3882d1ef","welcome","12","37.177"],["b8c1fc74","query","170","424.383"],["b90ce463","query","105","384.059"],["b940c33b","welcome","59","31.149"],["b92a41bc","explore","244","141.509"],["3909e239","welcome","61","40.729"],["38b45947","query","185","436.298"],["b7276af1","index","4","58.055"],["b85f1c7f","welcome","40","33.295"],["38861a87","explore","32","36.824"],["b31efa97","query","17","411.638"],["374a37eb","query","110","396.292"],["b87ea259","query","128","383.079"],["38a5cc26","","69",""],["b8fdf6d5","welcome","19","34.532"],["b92d0688","welcome","59","27.612"],["b9101f6d","index","14","51.813"],["391c9704","explore","22","81.458"],["37e71d7c","welcome","62","34.126"],["b8319d86","query","49","326.250"],["b75759c1","index","12","68.621"],["b8da5ce2","explore","38","199.615"],["3956dea1","query","17","433.380"],["3933a80e","query","17","450.563"],["3596f875","explore","89","120.597"],["b9077d3a","explore","181","119.396"],["b8d05715","explore","147","140.160"],["3933a80e","query","27","415.913"],["386bb217","welcome","7","34.506"],["b9856d43","query","105","244.749"],["b881be6d","query","65","435.760"],["b8289f1a","query","58","454.933"],["36f3e2b0","explore","158","76.233"],["b808f9b5","explore","71","49.361"],["b808f9b5","explore","194","176.120"],["39769889","explore","22","139.626"],["b7276af1","explore","67","76.215"],["b8d05715","index","40","45.789"],["38d95664","welcome","19","43.293"],["b8bee8a9","query","17","403.924"],["36a3d2fe","query","48","352.041"],["386bb217","","26",""],["37e71d7c","query","107","355.577"],["391e0466","explore","38","70.349"],["b8e22a2e","welcome","7","38.581"],["37ea053c","query","46","391.289"],["b31efa97","explore","165","168.608"],["b8ca7291","query","32","393.278"],["3606bab5","query","26","386.018"],["b755da2b","welcome","29","21.346"],["38749f05","explore","349","53.454"],["b712de52","query","17","359.802"],["392d18b2","explore","22","154.948"],["385f952a","welcome","8","29.329"],["b8beba55","query","31","372.566"],["b88ada11","explore","44","122.589"],["b8c67786","query","54","358.876"],["b980e6ce","index","4","71.654"],["386bb217","welcome","74","33.799"],["382f4c24","query","37","315.833"],["b8823cc9","query","89","418.809"],["b9122007","welcome","9","25.037"],["38592e00","index","5","48.171"],["b7474352","","25",""],["3907e5b0","explore","22","105.479"],["384dc7aa","welcome","44","36.555"],["3882d1ef","","13",""],["37eb2fcd","explore","41","105.637"],["385b341d","explore","66","76.936"],["3946238e","welcome","23","42.816"],["38aa30c2","index","125","32.905"],["386e6d49","query","141","372.158"],["b90182be","query","95","363.448"],["39769889","query","202","341.633"],["387eb251","welcome","33","45.670"],["39132f5c","query","372","454.558"],["374a37eb","query","75","409.784"],["38b52594","welcome","11","35.571"],["b830c67c","query","58","499.025"],["371b3e13","query","83","379.565"],["b89705a9","","52",""],["38820dcb","","14",""],["b6e86a47","query","23","366.324"],["b8e92871","welcome","7","30.622"],["383c44cb","explore","22","149.010"],["b919a166","query","40","308.386"],["b8d05715","index","53","22.258"],["3920dfb4","","119",""],["b8ac8acd","index","40","64.838"],["38ded491","welcome","7","27.233"],["3600fd8c","query","17","363.459"],["b755da2b","explore","94","134.501"],["36f3e2b0","query","27","468.309"],["38820dcb","query","17","443.754"],["b8d05715","welcome","60","36.775"],["b9856d43","explore","103","96.079"],["b72f231c","query","151","473.746"],["b72f231c","welcome","18","28.736"],["b902786e","welcome","28","34.794"],["b8a6645b","query","29","359.627"],["38f0a207","query","26","380.189"],["b8780b92","explore","34","124.146"],["b7e4ccd5","query","17","334.547"],["34f12b30","explore","151","89.073"],["384665e3","welcome","26","18.381"],["b8f1345d","explore","128","63.158"],["b8bf9af4","explore","22","143.619"],["b896dfeb","","148",""],["3796f292","explore","30","47.556"],["37af77a3","welcome","35","30.345"],["b80b6056","index","15","76.270"],["b8289f1a","welcome","23","30.189"],["395b5e7b","explore","50","160.164"],["385f952a","","34",""],["38c09959","query","77","395.026"],["396197d3","explore","47","55.231"],["385823a9","query","17","388.223"],["3920dfb4","query","49","405.328"],["3968d642","explore","125","152.124"],["3933a80e","query","36","377.349"],["b789800a","","64",""],["b84c5c67","query","46","362.366"],["387c10ce","explore","128","139.077"],["b834e77f","welcome","9","26.600"],["b8290074","explore","212","155.541"],["3891da7b","explore","22","97.608"],["b8acc8e1","explore","119","94.528"],["37ea0427","query","74","341.948"],["3917dd99","query","71","510.930"],["390c3cec","query","53","354.249"],["b8823cc9","","23",""],["380edea5","query","17","348.893"],["38d9a089","welcome","7","22.016"],["36f3e2b0","query","17","350.682"],["b8cadf66","query","20","436.162"],["3796f292","welcome","7","30.676"],["39092208","welcome","68","22.129"],["38ea393f","query","50","401.523"],["b880c13a","explore","131","135.072"],["b8290074","explore","83","114.974"],["b940c33b","welcome","40","13.269"],["380edea5","query","17","390.439"],["b80b6056","explore","310","113.603"],["38b52594","explore","22","161.750"],["38e8ab3d","query","98","394.973"],["b7f4d0c1","query","197","357.660"],["37383af0","explore","22","163.356"],["391c9704","query","219","401.800"],["38a86427","explore","125","56.435"],["3946238e","query","342","404.803"],["36aa7870","query","17","444.486"],["b72f231c","explore","22","127.549"],["b8cf3b88","query","22","448.836"],["b8f1345d","","36",""],["381e58d4","query","91","441.500"],["b80fcf1d","index","4","53.125"],["b80a0db4","","53",""],["381e3950","welcome","69","21.524"],["b7339a70","","34",""],["38b537e4","explore","31","107.224"],["b78cd4cc","index","16","32.014"],["b8529553","query","322","505.515"],["39132f5c","explore","253","106.405"],["38d95664","query","17","459.087"],["b896dfeb","explore","44","156.594"],["38868413","query","141","442.790"],["38e8ab3d","query","70","412.961"],["b937fd4b","query","82","364.468"],["b9122007","welcome","7","20.178"],["b948b6f9","explore","196","118.024"],["b8781981","explore","22","130.554"],["38b537e4","explore","22","170.512"],["37ba28ff","query","43","454.024"],["b8faab12","welcome","48","54.133"],["3907e5b0","explore","37","101.028"],["b8a1e1e5","query","17","467.101"],["3968d642","explore","40","108.970"],["b8f1bf15","query","70","375.217"],["38820dcb","query","149","414.792"],["382f9c89","","67",""],["b8bee8a9","index","6","52.665"],["387e5fd3","welcome","7","21.060"],["387bd683","explore","63","93.111"],["b92b2caf","welcome","166","33.015"],["b7276af1","welcome","29","24.093"],["3606bab5","query","74","381.416"],["b8289f1a","query","31","473.196"],["b6979500","query","96","401.863"],["b805419d","query","257","459.089"],["b85081f3","explore","196","54.677"],["b72f2109","welcome","7","23.269"],["b8326597","explore","130","105.183"],["b901a7bb","index","44","61.033"],["38b52594","","14",""],["38b96a95","","62",""],["b7d7b5f5","explore","406","88.532"],["b89705a9","query","36","385.394"],["b9324e4e","index","36","48.212"],["36349e28","explore","159","98.623"],["36f7fdad","index","4","65.469"],["387eb251","query","221","407.511"],["3600fd8c","explore","235","20.530"],["b5e7f657","query","80","330.406"],["36349e28","welcome","30","41.880"],["b8a03224","","12",""],["38420c72","query","101","386.912"],["b8583fdd","query","199","365.456"],["b8a03224","explore","39","145.780"],["b80b6056","index","26","44.163"],["b880c13a","welcome","55","23.767"],["38343e84","","18",""],["363d3fbf","query","137","400.219"],["38843b38","welcome","10","26.160"],["b9077d3a","explore","51","99.076"],["b835e95b","query","20","411.591"],["383c44cb","query","238","375.054"],["382b8a89","index","4","59.202"],["b78bf9a5","query","145","380.191"],["b888e833","query","17","326.817"],["b81f57a4","index","32","40.662"],["38f8933d","explore","689","111.558"],["34f12b30","explore","22","67.854"],["b8971322","query","35","369.292"],["b919a166","welcome","20","17.932"],["385823a9","","40",""],["b9101f6d","explore","27","148.091"],["b89f8df2","explore","94","79.047"],["b7fc776f","query","17","346.798"],["b7821e5c","welcome","7","38.673"],["b902786e","explore","22","101.703"],["38539d8c","explore","22","139.824"],["b696bfa2","query","342","336.658"],["b81579d6","explore","132","85.383"],["b82af9b9","explore","233","169.031"],["b85f1c7f","index","4","59.460"],["b8f1bf15","welcome","75","20.767"],["b83524be","query","86","426.445"],["389fde1c","query","29","352.178"],["b8529553","explore","22","102.031"],["387bd683","explore","22","112.599"],["b89705a9","welcome","7","30.617"],["b78b2440","query","65","428.935"],["b7894aac","query","207","347.916"],["3792ae33","index","31","45.037"],["3851b535","welcome","46","44.759"],["b8ad224b","query","184","361.768"],["39152737","welcome","7","24.360"],["38368d7e","","69",""],["38539d8c","","92",""],["b8d05715","query","80","318.829"],["3790a77c","welcome","38","16.563"],["b8ca7291","explore","34","82.446"],["394fc6e8","explore","79","128.366"],["b6a668ba","","158",""],["38978417","query","41","457.262"],["38a5cc26","explore","46","207.642"],["b7b4e7ac","query","110","382.461"],["381e3950","query","114","309.260"],["37383af0","explore","22","111.734"],["395b5e7b","query","41","427.306"],["b8a6645b","explore","22","76.692"],["38aa30c2","welcome","69","28.165"],["38f26220","explore","29","143.587"],["b7ef02de","welcome","32","38.498"],["b9418299","explore","171","0.626"],["34f12b30","explore","130","127.329"],["b7d7b5f5","welcome","13","22.485"],["b940c33b","explore","112","151.983"],["b5e7f657","index","30","36.791"],["b8cadf66","query","86","301.153"],["b8c875ac","explore","266","62.828"],["b940c33b","index","30","50.559"],["37afb00b","index","16","73.540"],["b9077d3a","query","17","307.041"],["b8a1e1e5","explore","106","83.221"],["b86b60fc","query","35","402.389"],["b9200590","welcome","7","25.370"],["b72d9375","query","108","489.798"],["39744ff2","query","105","240.716"],["382ff46f","index","45","72.359"],["38d8c63a","explore","175","159.784"],["37247a19","","167",""],["382b8a89","explore","97","89.359"],["3819d95d","explore","75","65.300"],["b8a0d52a","index","23","15.065"],["b80a0db4","query","27","416.084"],["379d5ea8","query","80","314.220"],["b904a87b","index","24","38.859"],["b80b6056","welcome","41","35.411"],["b7abd6cd","explore","110","142.426"],["3943830a","welcome","9","26.248"],["374a37eb","","12",""],["377d4673","query","141","454.605"],["b8bf9af4","explore","22","65.961"],["38e85a88","welcome","9","35.470"],["3956dea1","query","49","378.553"],["b92a41bc","explore","178","105.953"],["38400295","welcome","74","21.494"],["b8f3e8b9","query","233","392.466"],["b7939ddb","welcome","34","27.652"],["36a3d2fe","welcome","7","40.506"],["38c7a130","index","4","41.839"],["b7ef02de","query","17","347.336"],["b905f518","query","37","396.746"],["b755da2b","welcome","7","29.685"],["b7276af1","explore","69","121.393"],["b8da5ce2","explore","22","128.571"],["b81579d6","explore","250","60.128"],["38d7936e","query","83","299.339"],["b80b6056","query","17","515.501"],["375ad4d0","query","111","480.608"],["382f4c24","","72",""],["38d9a089","welcome","60","29.043"],["3956dea1","query","77","269.514"],["38d6f36c","","10",""],["38592e00","welcome","7","17.763"],["b8a03224","explore","138","122.625"],["392d18b2","query","48","442.409"],["b72d9375","explore","105","66.179"],["38e60476","query","72","344.273"],["36349e28","","55",""],["39372d62","","118",""],["b9893bc9","query","129","469.674"],["395b5e7b","explore","124","81.789"],["38adbc1c","welcome","76","32.565"],["b8f3e8b9","explore","23","120.815"],["385b6916","query","116","227.328"],["37e71d7c","index","82","36.255"],["b8290074","welcome","12","37.719"],["391c2252","query","139","393.247"],["38edbb55","index","4","62.311"],["b90b46ff","","23",""],["b8bb9d02","","10",""],["b881be6d","explore","117","121.671"],["38dd6b90","explore","73","63.853"],["b8e22a2e","query","17","406.019"],["b905f518","welcome","81","29.356"],["3790a77c","explore","71","29.750"],["b89f8df2","explore","51","78.672"],["b8319d86","welcome","70","25.673"],["36ce2e37","","25",""],["b7de74ad","welcome","16","33.586"],["b89f8df2","explore","44","164.629"],["387e5fd3","explore","22","71.748"],["37d63bbb","query","38","394.604"],["b8a0d52a","query","42","400.018"],["b7339a70","explore","295","63.215"],["b8c875ac","query","17","480.339"],["b755da2b","explore","395","121.549"],["38a7f88b","","24",""],["34f12b30","explore","284","147.981"],["39035eea","welcome","34","23.032"],["38dd6b90","query","25","357.954"],["38a57213","explore","107","138.978"],["b901a7bb","welcome","45","38.544"],["b9316463","explore","125","184.846"],["390d2410","explore","264","73.131"],["b8326597","query","21","426.351"],["37d8b9ed","explore","76","97.397"],["36ce2e37","explore","125","136.512"],["b8a1e1e5","explore","106","113.642"],["b8fdf6d5","explore","39","73.223"],["3891f3e2","explore","22","121.417"],["b808f9b5","explore","34","88.356"],["3790a77c","query","17","359.374"],["37af77a3","welcome","20","26.956"],["b809a459","explore","94","179.801"],["38d7936e","query","17","414.753"],["b8ca7291","query","144","511.466"],["38a57213","query","137","374.017"],["39372d62","query","71","436.383"],["386139d9","","15",""],["3909e239","welcome","24","35.873"],["39152737","explore","102","98.085"],["b881be6d","query","81","383.240"],["b7fc776f","welcome","7","38.427"],["395b5e7b","welcome","86","40.183"],["3600fd8c","query","79","400.599"],["38749f05","query","178","465.218"],["37383af0","","129",""],["377d4673","query","254","252.853"],["b902786e","","56",""],["37265bd1","explore","405","127.606"],["38e60476","explore","22","52.269"],["39087f58","welcome","58","40.984"],["b88ada11","welcome","7","20.432"],["b7b4e7ac","query","112","310.226"],["b7210d82","welcome","17","22.385"],["b88ada11","query","17","306.557"],["3972909f","welcome","21","24.574"],["b9106aff","explore","87","80.344"],["b7f7db07","welcome","10","28.816"],["3968d642","query","91","480.814"],["b8bf9af4","welcome","20","46.469"],["36f7fdad","welcome","42","28.929"],["b7b4e7ac","welcome","57","32.023"],["b7894aac","query","46","399.823"],["b7d7b5f5","","40",""],["b8ea6996","","81",""],["36bf0d6a","explore","180","131.852"],["374b43a9","explore","179","142.402"],["b6a668ba","","18",""],["390a94c6","welcome","31","25.154"],["b7707626","explore","22","37.833"],["37eb2fcd","","18",""],["38edbb55","explore","100","61.253"],["b726fc97","welcome","7","28.887"],["b7fc776f","","10",""],["b902786e","explore","22","95.305"],["b78cd4cc","","16",""],["b8255a74","welcome","26","17.165"],["3956dea1","query","183","458.153"],["37ea053c","welcome","15","30.011"],["b8c875ac","explore","63","99.179"],["b8d7bdee","explore","47","33.741"],["b808f9b5","welcome","33","40.903"],["b85081f3","","74",""],["382f9c89","explore","145","76.441"],["b7339a70","","33",""],["3811afac","query","17","344.879"],["39744ff2","query","436","302.990"],["b6a668ba","welcome","18","44.683"],["b8a1e1e5","explore","108","75.595"],["374b43a9","welcome","7","16.691"],["b7aa9958","explore","204","85.061"],["b8faab12","","57",""],["b696bfa2","explore","42","168.482"],["37ea0427","query","18","458.768"],["381dc7c6","welcome","15","26.125"],["393c832e","welcome","32","35.251"],["374a37eb","explore","22","122.409"],["393c832e","index","4","56.905"],["36ce2e37","query","17","286.644"],["b82af9b9","query","59","285.449"],["36bf0d6a","query","55","393.761"],["382b8a89","query","40","335.740"],["38d8c63a","explore","52","32.368"],["39372d62","explore","68","93.761"],["38592e00","welcome","65","40.116"],["b82bcf61","index","4","55.216"],["37247a19","explore","118","165.109"],["b90fca82","query","40","403.584"],["390d2410","explore","61","39.529"],["3606bab5","explore","34","111.754"],["b8781981","explore","235","72.904"],["374b43a9","explore","22","92.137"],["b834e77f","explore","22","76.399"],["383c44cb","index","4","42.071"],["36f7fdad","query","47","301.262"],["b8529553","query","17","548.969"],["39132f5c","explore","154","89.110"],["39372d62","query","25","376.225"],["b78cd4cc","query","30","386.936"],["38d95664","welcome","7","20.297"],["385823a9","welcome","54","42.166"],["386bb217","query","35","394.067"],["b8bb3849","query","209","413.586"],["38749f05","explore","244","86.640"],["b8583fdd","explore","108","137.430"],["3913fdaf","welcome","11","24.409"],["38948563","query","270","324.550"],["b754f50b","welcome","7","28.749"],["b902786e","query","22","376.797"],["38e85a88","explore","22","134.736"],["b8e22a2e","query","100","402.044"],["387e5fd3","explore","130","90.245"],["b7d7b5f5","","60",""],["b881be6d","index","25","42.078"],["b948b6f9","explore","22","123.692"],["b6e86a47","explore","123","42.666"],["38c7a130","query","367","346.884"],["37ba28ff","query","332","313.616"],["b8246fe0","","34",""],["b834e77f","query","17","458.604"],["36f7fdad","index","64","35.417"],["3882d1ef","","44",""],["b8a03224","query","377","428.017"],["b72f231c","query","20","338.522"],["386c41b3","explore","75","86.396"],["37dadc3e","index","107","51.527"],["b7707626","index","4","81.836"],["3606bab5","","20",""],["389fde1c","index","4","50.847"],["b8faab12","explore","151","167.688"],["b78b2440","explore","22","147.112"],["b7707626","query","202","377.709"],["b8a1e1e5","index","4","33.267"],["b80a0db4","index","4","42.600"],["3792ae33","explore","54","166.330"],["b8b22c28","query","172","380.613"],["b905f518","query","28","248.097"],["38ded491","explore","22","52.010"],["b81edf15","welcome","76","45.871"],["b919a166","welcome","8","42.721"],["b9856d43","welcome","25","24.870"],["39769889","index","33","40.098"],["b8fdf6d5","query","304","369.329"],["380edea5","query","31","397.316"],["b6e86a47","welcome","44","28.090"],["387bd683","query","93","374.006"],["382f9c89","query","164","436.232"],["39372d62","explore","304","106.402"],["382ff46f","explore","114","56.949"],["38a5cc26","explore","31","107.313"],["b8f13334","query","201","456.986"],["b31efa97","query","79","310.816"],["b9552f4f","welcome","96","23.637"],["38a86427","","16",""],["38c7a130","explore","183","180.771"],["b7aa9958","query","56","312.602"],["385d970c","index","4","51.585"],["b7210d82","query","90","333.074"],["b8a03224","index","16","50.598"],["b8c67786","query","17","444.604"],["b7210d82","welcome","23","22.323"],["36aa7870","query","113","395.959"],["38820dcb","explore","175","180.721"],["b830c67c","explore","79","60.345"],["b888e833","query","412","433.424"],["b90b46ff","query","29","421.602"],["b888e833","query","37","266.061"],["b80a0db4","query","17","309.753"],["b77f942a","query","57","433.665"],["b726fc97","welcome","43","45.507"],["b78b2440","index","42","60.845"],["b90b46ff","index","4","34.271"],["b8d05715","query","17","466.806"],["38a86427","explore","22","148.306"],["37c3eb17","query","73","322.615"],["38edbb55","explore","76","171.530"],["3972909f","query","57","327.879"],["b8289f1a","explore","154","30.864"],["b8a0d52a","","63",""],["377d4673","welcome","12","31.905"],["b8583fdd","query","17","297.333"],["b835e95b","query","23","356.785"],["37e71d7c","","119",""],["b8326597","explore","23","80.735"],["b8e22a2e","query","196","341.722"],["b8781981","explore","32","128.798"],["b8d05715","query","17","332.069"],["37c3eb17","welcome","7","21.427"],["3909e239","query","600","423.961"],["b86c757d","query","22","363.223"],["b9106aff","explore","347","74.720"],["3819d95d","query","76","479.874"],["393c832e","index","6","33.150"],["38368d7e","explore","36","115.410"],["391b2370","welcome","52","27.305"],["37dadc3e","index","4","34.441"],["38f4230b","explore","110","116.618"],["36653a24","welcome","7","30.133"],["b92a41bc","explore","89","124.461"],["b94b611d","welcome","7","32.580"],["36f3e2b0","query","63","341.840"],["b9101f6d","welcome","75","37.235"],["b90ce38e","explore","61","71.756"],["38d7936e","explore","22","160.380"],["b72f2109","explore","25","80.704"],["b8cb4c88","","52",""],["b8823cc9","query","101","296.040"],["b5e7f657","","55",""],["b78139ab","welcome","7","43.579"],["b80e549c","query","56","303.664"],["b8903a5b","welcome","7","42.107"],["37ea053c","query","98","483.832"],["b8d05715","welcome","22","27.786"],["b8971322","explore","24","83.939"],["b94525bf","query","17","425.990"],["390d2410","query","56","334.832"],["b8bb9d02","query","46","343.988"],["b8bee8a9","welcome","50","28.637"],["39290817","query","142","347.134"],["38a57213","index","4","54.101"],["b8bab8ec","index","23","55.403"],["b8e22a2e","index","23","43.165"],["38b96a95","explore","22","82.228"],["b84c5c67","query","79","266.870"],["b834730b","welcome","67","41.529"],["b9856d43","welcome","7","24.478"],["b8a1e1e5","query","61","399.927"],["38749f05","query","71","353.058"],["3796f292","welcome","11","30.953"],["b881be6d","explore","30","145.799"],["38948563","explore","186","146.095"],["382f4c24","explore","107","104.748"],["b8903a5b","explore","56","126.556"],["36bf0d6a","query","25","330.526"],["b80168ac","","11",""],["b78358d5","explore","145","99.146"],["38f0a207","explore","77","131.938"],["b9552f4f","query","49","273.207"],["38592e00","query","30","441.902"],["b754f50b","query","17","424.390"],["386bb217","query","110","296.062"],["380edea5","welcome","9","43.172"],["38d95664","explore","94","190.180"],["381e58d4","explore","360","83.849"],["b7276af1","explore","28","123.447"],["3946238e","welcome","261","27.711"],["b81dde6c","explore","26","80.618"],["36349e28","welcome","94","35.423"],["38ded491","index","50","61.622"],["b7968805","welcome","7","31.566"],["b8289f1a","welcome","186","33.009"],["3851b535","welcome","52","19.041"],["b5e7f657","explore","103","73.929"],["371ef2ec","welcome","7","27.718"],["38f0a207","query","161","418.614"],["38ea393f","query","29","438.985"],["38420c72","index","5","62.400"],["38a5cc26","","68",""],["b6a668ba","welcome","36","33.983"],["b8ca7291","welcome","9","23.782"],["b7210d82","explore","79","81.565"],["392d18b2","query","18","351.917"],["b7707626","query","149","455.013"],["38afab8e","query","42","389.980"],["b8ac8acd","explore","22","179.474"],["36ce2e37","","93",""],["3596f875","query","19","348.945"],["b904a87b","","17",""],["380edea5","query","82","371.886"],["3900e284","welcome","8","17.295"],["b805419d","welcome","23","37.106"],["393ef37f","query","65","477.308"],["b85c022e","query","77","349.456"],["38368d7e","query","17","420.933"],["b6a668ba","explore","22","107.845"],["389fde1c","welcome","7","26.762"],["b81dde6c","explore","177","129.123"],["37383af0","","10",""],["b92d0688","welcome","13","42.854"],["3790a77c","query","83","393.667"],["b91dabaf","welcome","86","17.655"],["b78139ab","","10",""],["b8a754d1","query","107","331.716"],["36bf0d6a","explore","22","79.608"],["38948563","explore","22","108.710"],["b901e1ee","explore","70","136.158"],["34f12b30","query","31","238.442"],["b92b2caf","query","87","456.073"],["377d4673","query","40","329.314"],["382f9c89","","32",""],["b9418299","query","20","379.912"],["391c2252","explore","261","58.875"],["b72f231c","","146",""],["385f952a","query","29","368.491"],["38a57213","index","56","50.311"],["b8a6645b","explore","224","74.572"],["36bf0d6a","query","17","435.574"],["3933a80e","welcome","31","33.453"],["3956dea1","query","97","385.636"],["b7e4ccd5","query","122","471.555"],["b77f942a","query","47","370.067"],["b8d7bdee","query","17","329.468"],["3946238e","query","21","326.271"],["38c09959","explore","126","117.066"],["b8f13334","explore","35","119.814"],["394fc6e8","explore","22","67.067"],["b8ca7291","welcome","7","30.377"],["b9324e4e","query","54","401.976"],["b8971322","query","194","268.130"],["382f4c24","index","27","70.748"],["b90182be","welcome","73","25.576"],["38ebcacd","explore","93","100.497"],["38dd6b90","explore","280","130.815"],["38aa30c2","welcome","42","32.380"],["38824d6d","index","20","71.626"],["b7968805","welcome","11","7.334"],["b902786e","query","49","424.824"],["b696bfa2","welcome","8","30.729"],["38c7a130","explore","49","180.092"],["384dc7aa","explore","22","98.334"],["b830c67c","query","323","327.884"],["38a57213","explore","22","92.358"],["37c3eb17","query","189","388.286"],["37af77a3","explore","184","173.199"],["b755da2b","explore","22","138.282"],["b938dc06","","22",""],["3913fdaf","","103",""],["b901a7bb","query","17","411.436"],["b7608214","query","17","377.521"],["b8f1345d","index","22","40.071"],["39035eea","explore","63","64.443"],["394fc6e8","","10",""],["385b96d4","query","17","378.680"],["b8a0d52a","query","115","436.277"],["b8a754d1","query","436","494.277"],["37ea053c","explore","150","74.961"],["b83857e0","explore","263","56.602"],["b8529553","explore","118","93.142"],["3822edba","","164",""],["b80168ac","explore","167","97.870"],["3946238e","explore","220","83.695"],["390c3cec","query","45","375.533"],["b8bab8ec","","50",""],["b9316463","explore","195","101.278"],["38948563","query","47","400.644"],["39365da1","","10",""],["b8246fe0","welcome","38","22.969"],["382b613e","query","17","423.668"],["387bd683","query","100","366.405"],["3900e284","query","36","445.910"],["b808f9b5","welcome","56","33.572"],["38a7f88b","welcome","61","17.528"],["b72f2109","explore","81","150.354"],["b896dfeb","explore","22","125.208"],["38adbc1c","welcome","21","42.060"],["b9098814","explore","157","162.880"],["b90b46ff","","10",""],["b8246fe0","query","66","325.705"],["b9101f6d","query","128","393.519"],["395b5e7b","welcome","7","31.870"],["38447a00","query","17","299.469"],["36a3d2fe","index","14","41.149"],["38b45947","","28",""],["b8b0892f","query","38","374.188"],["b8326597","query","118","339.320"],["b8d05715","explore","117","81.487"],["b83524be","welcome","109","27.932"],["380494da","welcome","25","22.479"],["b8c1fc74","query","40","316.102"],["383c44cb","welcome","49","39.968"],["38843b38","index","38","49.745"],["b8beba55","query","135","362.354"],["b801e6e5","welcome","34","28.637"],["b81579d6","query","107","335.372"],["b6f10532","query","33","308.008"],["379d5ea8","query","17","379.368"],["3895c490","query","56","360.473"],["38d49209","query","82","405.176"],["b8326597","welcome","7","24.186"],["b893f1e9","explore","198","132.702"],["38948563","query","102","462.052"],["b7ef02de","query","145","402.808"],["386139d9","explore","47","131.349"],["39152737","query","17","432.964"],["38d6f36c","explore","204","135.099"],["b7939ddb","query","17","351.064"],["b80168ac","query","41","356.754"],["b7a47e56","welcome","8","21.554"],["b937fd4b","index","21","39.051"],["38d8c63a","welcome","7","23.183"],["3819d95d","explore","22","85.028"],["b90b128b","welcome","39","26.722"],["39365da1","query","150","390.126"],["b87ea259","welcome","30","28.592"],["b90ce38e","query","184","315.760"],["b8f1345d","explore","22","179.870"],["b80a0db4","welcome","282","36.628"],["37265bd1","query","107","402.956"],["385b96d4","query","78","527.645"],["39132f5c","explore","59","126.147"],["38b45947","welcome","49","35.530"],["b805419d","query","101","326.622"],["b881be6d","explore","102","123.167"],["38820dcb","explore","237","168.153"],["37ac6a09","welcome","34","18.423"],["38b45947","query","178","383.366"],["38edbb55","index","36","39.673"],["b7a47e56","explore","40","129.013"],["b52a98aa","explore","60","98.910"],["38978417","query","42","341.490"],["b75759c1","","10",""],["386e6d49","explore","165","168.318"],["b84c5c67","explore","123","174.175"],["39132f5c","welcome","18","27.980"],["38b45947","query","41","406.018"],["b8e22a2e","welcome","8","35.608"],["3895c490","explore","22","177.722"],["b84ad865","explore","28","99.564"],["b8f13334","query","140","359.983"],["b8971322","query","17","298.776"],["b904a87b","explore","314","83.707"],["38a7f88b","query","108","341.399"],["3836f29a","explore","22","160.195"],["38d6f36c","explore","121","73.754"],["b83857e0","explore","293","125.371"],["b80fcf1d","welcome","42","26.998"],["b880c13a","query","17","405.704"],["b8cadf66","explore","421","156.088"],["37d78acc","welcome","41","40.159"],["b8e92871","query","17","315.012"],["3906759e","explore","73","97.443"],["38f26220","query","35","379.870"],["38e85a88","query","47","364.303"],["b7fc776f","explore","22","148.243"],["38da8baa","index","4","67.264"],["b8bf9af4","query","17","373.274"],["3822edba","query","17","357.645"],["37c3eb17","welcome","28","23.793"],["38b23f71","query","43","384.897"],["b9856d43","","10",""],["377d4673","query","20","403.735"],["38447a00","explore","84","118.388"],["b7352e58","explore","64","30.521"],["b9324e4e","query","70","280.077"],["38539d8c","index","30","34.595"],["b9418299","query","17","426.590"],["36aa7870","query","85","358.866"],["363d3fbf","welcome","94","46.951"],["38aa30c2","query","17","337.554"],["38ebcacd","explore","53","119.906"],["b801e6e5","welcome","8","39.799"],["b8f1bf15","welcome","14","23.451"],["393ef37f","explore","22","102.262"],["395fce5f","welcome","10","38.292"],["b8255a74","welcome","52","37.264"],["b83857e0","query","184","335.557"],["390c3cec","explore","108","123.178"],["374b43a9","explore","389","108.470"],["39372d62","query","128","419.357"],["b880c13a","","10",""],["391b2370","","56",""],["3906759e","explore","22","104.160"],["37494840","explore","199","66.366"],["38d95664","query","42","356.032"],["3686429c","index","9","38.391"],["b8246fe0","explore","51","108.689"],["b8a6645b","explore","111","74.865"],["b78bf9a5","query","28","412.059"],["39472aee","welcome","7","34.290"],["37d8b9ed","query","65","287.032"],["385b96d4","query","132","282.258"],["3920dfb4","query","17","233.083"],["38b537e4","query","90","339.580"],["b7abd6cd","query","34","491.342"],["b85c022e","","24",""],["b7aefa94","welcome","7","35.033"],["b8ea6996","explore","115","119.495"],["b810076c","explore","127","66.980"],["37d9801d","query","23","440.886"],["385823a9","explore","267","197.539"],["b93477eb","","71",""],["38592e00","query","26","325.844"],["384665e3","explore","22","70.524"],["b93b8201","welcome","53","31.997"],["3822edba","explore","34","168.900"],["379333c6","explore","59","93.923"],["38b30542","query","97","313.546"],["b8f3e8b9","index","4","37.205"],["38368d7e","explore","135","55.091"],["b78139ab","query","155","380.227"],["38e85a88","index","15","71.110"],["b86b60fc","explore","154","150.716"],["b88ada11","index","4","52.531"],["b880c13a","","144",""],["b89f8df2","explore","22","67.857"],["b696bfa2","query","44","225.666"],["38aa30c2","","10",""],["b8e22a2e","explore","171","119.320"],["38b537e4","query","30","427.564"],["b8e8b49d","query","40","411.522"],["b84ad865","query","230","375.047"],["390a94c6","query","368","411.696"],["b754f50b","explore","409","105.044"],["b7821e5c","welcome","25","35.439"],["38b52594","","15",""],["b834730b","explore","55","87.568"],["382ff46f","","27",""],["3943830a","query","146","314.503"],["3811afac","explore","35","89.493"],["388aadd7","welcome","7","34.061"],["b7474352","index","64","28.933"],["38adbc1c","welcome","121","39.657"],["b8ca7291","index","38","45.318"],["38420c72","welcome","19","27.686"],["38a86427","","17",""],["b75759c1","welcome","20","28.621"],["b893f1e9","query","31","487.272"],["36a3d2fe","explore","22","101.667"],["b91c49f9","explore","22","79.561"],["38948563","explore","52","29.675"],["39744ff2","welcome","36","38.048"],["38afab8e","index","13","49.814"],["b9856d43","welcome","12","31.764"],["38cef8ac","","105",""],["390d2410","index","16","56.097"],["3972909f","query","65","320.202"],["387bd683","query","17","379.573"],["37ea053c","welcome","7","24.953"],["34f12b30","explore","184","84.458"],["b789800a","query","24","367.498"],["b8a03224","welcome","7","30.424"],["b7894aac","explore","165","166.985"],["36f3e2b0","explore","345","166.839"],["b8bf9af4","welcome","8","25.456"],["b9552f4f","","18",""],["38aa30c2","query","77","386.497"],["37d701af","query","33","320.938"],["379d5ea8","query","17","377.123"],["37494840","explore","66","137.722"],["39744ff2","query","17","315.747"],["b6979500","query","24","460.866"],["b8ca7291","explore","25","160.874"],["b90ce38e","query","17","403.505"],["38e85a88","explore","109","105.009"],["38cef8ac","welcome","7","28.730"],["b835e95b","query","222","445.729"],["b9316463","index","8","52.742"],["37d8b9ed","query","24","305.323"],["b880c13a","","84",""],["b9856d43","query","17","310.891"],["b8d05715","welcome","45","43.272"],["b8ad224b","explore","225","138.836"],["38a86427","welcome","19","22.225"],["3822edba","query","429","466.980"],["b9077d3a","welcome","18","30.906"],["b78139ab","query","40","321.503"],["b82af9b9","explore","134","154.901"],["392d18b2","index","21","61.454"],["b9b22f3d","explore","179","88.616"],["38400295","welcome","7","22.574"],["b7707626","welcome","83","19.362"],["38368d7e","query","156","363.278"],["38749f05","explore","131","44.657"],["b9418299","query","93","451.120"],["b89705a9","query","31","588.056"],["3882d1ef","","38",""],["377d4673","query","17","369.366"],["b8ca7291","welcome","7","29.128"],["38a86427","","175",""],["3891da7b","query","17","452.893"],["b78b2440","index","144","64.155"],["b80d45c6","welcome","7","18.029"],["b906df62","explore","82","66.802"],["38a5cc26","query","59","290.329"],["b8bee8a9","explore","244","88.372"],["b9418299","query","17","506.587"],["3956dea1","","10",""],["b933999c","explore","42","97.525"],["38820dcb","explore","45","67.868"],["b8bb3849","explore","59","53.319"],["b6e86a47","welcome","88","24.878"],["b78b2440","query","57","335.908"],["36653a24","query","77","483.365"],["b9552f4f","query","17","321.265"],["38b23f71","explore","22","81.306"],["3895c490","explore","108","102.427"],["379d5ea8","explore","67","137.932"],["b9005d0b","query","17","306.679"],["b8bf9af4","query","17","325.489"],["b7abd6cd","","17",""],["385b341d","query","17","558.728"],["3943830a","query","17","311.400"],["b809a459","explore","107","100.480"],["3900e284","explore","112","91.614"],["391c2252","welcome","50","31.254"],["b7707626","welcome","7","28.068"],["391b2370","explore","183","157.247"],["38beeb4d","query","68","314.504"],["387c10ce","welcome","21","28.954"],["b80168ac","query","336","378.509"],["b8fdf6d5","explore","22","123.223"],["b7aefa94","","85",""],["38c09959","welcome","7","32.946"],["b8a70c57","welcome","16","30.078"],["38ebcacd","welcome","54","23.645"],["b881be6d","welcome","7","26.723"],["b8c1fc74","explore","31","162.548"],["b834730b","query","55","385.078"],["38843b38","query","43","228.827"],["b8fdf6d5","query","17","396.988"],["391c2252","welcome","7","25.072"],["b86b60fc","welcome","7","30.745"],["381e58d4","query","47","471.090"],["b696bfa2","query","191","389.841"],["b9077d3a","query","41","515.350"],["38b30542","welcome","66","24.917"],["396197d3","welcome","41","40.728"],["b72f2109","welcome","54","41.559"],["b8faab12","welcome","7","28.661"],["38d9a089","query","29","333.849"],["390d2410","welcome","23","39.427"],["b948b6f9","query","114","395.699"],["b7210d82","welcome","134","31.143"],["38d7936e","query","108","376.164"],["b94525bf","explore","22","145.198"],["b94b611d","query","74","402.041"],["38d7936e","welcome","28","44.511"],["38c738d1","query","17","355.042"],["b90ce463","query","290","315.602"],["387e5fd3","query","205","351.368"],["3946238e","","10",""],["b830c67c","query","66","393.897"],["38a86427","explore","257","113.537"],["34f12b30","query","169","455.459"],["b9106aff","explore","102","63.228"],["b31efa97","welcome","7","36.485"],["b9552f4f","query","49","390.562"],["b8f1345d","explore","31","53.023"],["38447a00","query","186","301.472"],["b92a41bc","explore","523","120.551"],["b95d95b8","","10",""],["b7352e58","welcome","42","24.020"],["b8f13334","explore","119","155.878"],["385b341d","welcome","34","34.117"],["b8319d86","index","4","51.917"],["b82bcf61","index","9","58.468"],["b8529553","explore","23","107.352"],["37c3532d","query","29","264.859"],["b90ce38e","index","13","41.185"],["b8583fdd","explore","34","174.058"],["b7894aac","query","188","436.782"],["b8780b92","query","30","465.796"],["b7821e5c","welcome","7","12.939"],["37ea053c","","57",""],["3891f3e2","welcome","7","13.766"],["37d78acc","query","45","477.991"],["37d701af","query","98","314.085"],["b6f10532","index","4","59.553"],["b83857e0","welcome","7","34.364"],["371ef2ec","explore","101","77.982"],["b9893bc9","query","143","426.781"],["b8d05715","query","49","406.315"],["3915cc59","query","41","368.904"],["b9552f4f","query","17","424.230"],["b8c875ac","index","8","59.326"],["38c09959","query","46","285.838"],["36f7fdad","explore","60","26.872"],["b8bab8ec","explore","327","103.766"],["38d6f36c","index","4","58.565"],["b937fd4b","explore","230","65.773"],["b8e22a2e","","48",""],["b83524be","query","17","444.791"],["387c10ce","query","44","402.054"],["b795879c","explore","366","147.686"],["b83857e0","query","163","383.747"],["386e6d49","explore","22","258.304"],["383204f1","welcome","24","45.631"],["39472aee","query","77","385.119"],["36349e28","welcome","122","33.247"],["37ba28ff","query","91","481.659"],["38e85a88","query","183","428.712"],["b7608214","index","6","29.498"],["b7f4d0c1","explore","81","126.346"],["b795879c","explore","90","98.866"],["3851b535","query","57","388.973"],["38ea393f","query","56","357.167"],["b7339a70","welcome","57","22.876"],["38aa30c2","explore","97","135.542"],["b8d7bdee","explore","159","139.343"],["36bf0d6a","query","17","380.369"],["b8c1fc74","explore","40","41.838"],["b7339a70","query","178","394.891"],["b86c757d","explore","119","184.231"],["37a768f1","welcome","31","26.353"],["b8045be3","explore","102","105.688"],["b88d8eb8","query","17","361.923"],["3906759e","explore","96","138.586"],["381e58d4","query","127","417.629"],["b8971322","query","183","368.171"],["b80fcf1d","welcome","60","22.148"],["38dd6b90","explore","22","108.752"],["b7aefa94","welcome","7","34.073"],["b948b6f9","explore","85","70.410"],["b8a6645b","","26",""],["b8834bbe","explore","49","19.164"],["b72d9375","query","96","416.946"],["b755da2b","","10",""],["391b2370","explore","179","75.899"],["37e71d7c","welcome","7","30.073"],["b9418299","query","51","315.503"],["b888e833","","10",""],["b78139ab","","16",""],["b933999c","query","17","432.446"],["b7894aac","explore","22","120.992"],["382f9c89","","10",""],["b8971322","index","19","42.410"],["3790a77c","query","22","357.447"],["b89da5c6","explore","97","119.985"],["39083a44","query","17","353.559"],["b940c33b","explore","22","113.983"],["3686429c","explore","22","164.984"],["b8f1345d","index","4","47.236"],["38d6f36c","query","26","487.147"],["38e60476","explore","81","218.080"],["b90ce38e","index","25","22.341"],["391e0466","welcome","43","22.987"],["b80d45c6","welcome","7","30.210"],["395b5e7b","query","197","429.246"],["383c44cb","explore","398","60.842"],["b980e6ce","query","24","287.247"],["b86b60fc","","22",""],["3883164c","welcome","85","26.995"],["b888e833","welcome","36","32.187"],["37ea053c","welcome","35","37.170"],["3895c490","query","88","323.525"],["371ef2ec","explore","55","95.456"],["b81f57a4","explore","106","139.532"],["b7474352","query","262","453.115"],["380edea5","explore","31","80.619"],["379fe829","welcome","21","32.448"],["37a768f1","explore","89","129.155"],["b82af9b9","explore","175","43.524"],["3819d95d","","38",""],["b89f8df2","query","52","401.905"],["b8781981","welcome","14","35.804"],["393c832e","index","4","50.282"],["b7a97dbb","query","81","513.392"],["38b45947","query","57","372.475"],["379fe829","welcome","37","38.263"],["3882d1ef","welcome","7","35.721"],["b75759c1","query","62","390.070"],["36349e28","welcome","123","33.894"],["38592e00","explore","332","126.508"],["38f0a207","index","33","31.658"],["b85c022e","explore","23","21.868"],["b948b6f9","query","130","422.316"],["37d8b9ed","query","35","445.621"],["b808f9b5","index","60","48.580"],["39087f58","welcome","28","46.869"],["b7608214","query","17","427.540"],["381e58d4","explore","251","62.483"],["b80b6056","welcome","39","35.025"],["b432dbc8","explore","22","142.752"],["393c832e","query","46","436.672"],["b7276af1","query","49","410.265"],["b8ad224b","query","33","449.266"],["396197d3","explore","47","80.469"],["b432dbc8","explore","22","102.201"],["37d8b9ed","","12",""],["38f0a207","welcome","7","15.550"],["3972909f","query","17","342.364"],["b90fca82","index","111","26.093"],["380494da","explore","22","141.004"],["38868413","index","7","19.204"],["3819d95d","explore","96","120.441"],["b696bfa2","","10",""],["38e85a88","welcome","47","28.258"],["3880ebea","index","25","68.364"],["b74acf21","explore","121","97.775"],["3900e284","explore","249","113.334"],["390c3cec","welcome","10","16.575"],["396197d3","query","162","284.907"],["386c41b3","query","17","349.855"],["38978417","welcome","7","32.501"],["375ad4d0","explore","22","42.505"],["b8780b92","explore","43","102.527"],["37d63bbb","query","95","413.108"],["b78139ab","welcome","7","26.606"],["36a3d2fe","query","66","508.792"],["38adbc1c","query","17","439.874"],["b8e92871","","48",""],["b9552f4f","","36",""],["3943830a","index","27","34.492"],["3917dd99","explore","186","101.948"],["393ef37f","query","17","321.226"],["381e58d4","explore","22","85.154"],["b8fdf6d5","query","88","392.860"],["b880c13a","","201",""],["3968d642","query","184","434.240"],["b9418299","query","74","379.826"],["3596f875","query","17","227.247"],["3895c490","query","135","214.351"],["38861a87","query","159","316.347"],["b8971322","explore","24","106.430"],["b7d7b5f5","welcome","61","26.849"],["b8ac8acd","explore","61","86.942"],["38420c72","welcome","53","20.847"],["b948b6f9","query","49","306.090"],["38861a87","query","78","486.950"],["37d701af","query","61","442.876"],["38b23f71","query","27","373.607"],["b8beba55","query","22","415.646"],["b8a0d52a","explore","157","86.635"],["b9200590","query","114","452.090"],["384dc7aa","query","101","361.755"],["b92a41bc","query","127","434.480"],["38edbb55","","51",""],["b9418299","explore","52","64.299"],["393ef37f","explore","43","166.160"],["b9324e4e","index","6","62.680"],["38d6f36c","query","295","314.818"],["391b2370","","10",""],["36f7fdad","query","161","389.393"],["b7f4d0c1","query","39","327.222"],["b901e1ee","query","98","377.476"],["b8c67786","query","156","310.330"],["391e0466","welcome","40","20.464"],["38539d8c","welcome","27","29.170"],["b937fd4b","index","22","40.672"],["37afb00b","explore","43","51.242"],["b80168ac","query","57","315.262"],["39132f5c","welcome","8","22.068"],["b9098814","index","15","70.243"],["b980e6ce","","21",""],["3915cc59","query","96","398.646"],["b80d45c6","explore","54","68.301"],["b86b60fc","query","83","415.496"],["b896dfeb","welcome","7","17.994"],["3811afac","query","126","384.726"],["390c3cec","index","4","49.887"],["b88d8eb8","index","27","62.078"],["b83524be","query","35","310.139"],["390a94c6","query","17","363.928"],["b80d45c6","","169",""],["3606bab5","welcome","52","44.910"],["b83857e0","explore","60","143.727"],["3851b535","query","123","448.159"],["3920dfb4","explore","166","119.655"],["b7339a70","","154",""],["b86b60fc","query","56","430.561"],["38592e00","welcome","7","30.387"],["b8a03224","","19",""],["3909e239","explore","78","97.874"],["b8b0892f","query","89","291.356"],["37d8b9ed","explore","250","135.118"],["b8b0892f","index","4","38.367"],["b8289f1a","","144",""],["38da8baa","query","61","316.916"],["b8c1fc74","query","31","383.281"],["38d6f36c","explore","41","101.250"],["391c9704","welcome","7","32.427"],["38aa30c2","index","17","43.037"],["b90182be","welcome","7","32.529"],["b8a03224","","62",""],["b810076c","welcome","65","34.756"],["38b96a95","query","224","334.069"],["b52a98aa","welcome","16","31.385"],["36a3d2fe","query","41","263.154"],["b7ef02de","query","43","233.920"],["b7b4e7ac","query","148","413.827"],["b906df62","query","107","329.674"],["3891da7b","explore","23","120.941"],["3972909f","query","62","407.919"],["36653a24","query","167","458.453"],["b7707626","index","67","65.604"],["382b8a89","query","72","380.479"],["382b8a89","query","26","403.462"],["363d3fbf","query","99","387.991"],["b91dabaf","index","70","55.632"],["37247a19","query","84","384.750"],["b7276af1","explore","83","175.189"],["b8c67786","","13",""],["b8ea6996","welcome","151","13.090"],["b86b60fc","explore","44","152.866"],["b880c13a","explore","97","116.185"],["b8beba55","query","26","232.103"],["b91dabaf","query","478","426.691"],["363d3fbf","explore","62","90.468"],["385b96d4","query","17","373.252"],["39132f5c","explore","239","96.214"],["371b3e13","query","121","447.311"],["38e85a88","","10",""],["b8319d86","query","17","430.411"],["b5e7f657","query","279","453.968"],["393ef37f","query","147","337.026"],["b8326597","explore","263","95.781"],["b89705a9","query","202","435.198"],["382ff46f","query","17","310.209"],["3819d95d","welcome","54","26.447"],["385f952a","explore","304","63.862"],["38343e84","","82",""],["b8326597","","167",""],["37c3532d","index","6","65.099"],["38e8ab3d","query","130","382.167"],["b789800a","index","6","74.446"],["b805419d","explore","22","112.682"],["371b3e13","index","4","40.877"],["b8cf3b88","index","12","46.873"],["38d9a089","query","50","248.378"],["b80b6056","welcome","7","27.316"],["387eb251","query","86","469.870"],["36ce2e37","","44",""],["b9200590","query","86","340.016"],["381dc7c6","index","29","40.049"],["b7aa9958","explore","167","90.317"],["b8823cc9","query","72","263.038"],["386bb217","welcome","42","12.732"],["b81f57a4","query","17","347.957"],["38749f05","query","47","385.686"],["b80e549c","explore","95","83.640"],["b8290074","query","50","330.058"],["b72d9375","query","50","281.890"],["384665e3","welcome","68","28.418"],["b74acf21","query","96","464.791"],["b78139ab","index","4","57.665"],["37ac6a09","explore","80","153.042"],["b795879c","query","151","460.097"],["b90ce463","explore","59","172.337"],["b8ea6996","query","112","269.857"],["3606bab5","welcome","22","20.363"],["b81f57a4","welcome","67","34.205"],["b8fdf6d5","query","127","354.587"],["37d701af","","20",""],["b805419d","explore","45","65.503"],["36aa7870","index","10","38.581"],["38da8baa","explore","203","151.561"],["38b52594","welcome","7","28.128"],["b90182be","index","40","45.727"],["b8e22a2e","index","6","11.953"],["b789800a","query","29","370.224"],["387bd683","explore","22","40.914"],["b8e92871","query","69","265.508"],["b8bf9af4","welcome","23","35.124"],["b8b0892f","explore","277","90.565"],["385b6916","welcome","32","15.168"],["38d95664","welcome","9","25.180"],["37ba28ff","explore","200","172.941"],["379fe829","welcome","42","18.913"],["38ea393f","explore","84","79.596"],["386bb217","welcome","7","20.530"],["b6633f1a","welcome","72","33.328"],["b78b2440","query","17","410.721"],["3968d642","query","17","477.917"],["b8e22a2e","query","17","448.626"],["393ef37f","query","281","384.529"],["382b613e","welcome","25","36.870"],["b90fca82","query","23","401.195"],["b80fcf1d","query","116","414.318"],["b810076c","explore","74","96.083"],["38ebcacd","explore","255","163.476"],["38c7a130","explore","102","110.526"],["37ea0427","","37",""],["b9324e4e","welcome","31","41.711"],["b906df62","explore","148","84.373"],["3596f875","welcome","35","32.466"],["b937fd4b","query","17","456.338"],["b9200590","explore","66","128.521"],["38820dcb","query","30","352.291"],["38da8baa","welcome","9","24.199"],["b9106aff","index","9","58.561"],["b9098814","welcome","7","28.346"],["b86c757d","explore","22","87.141"],["b8583fdd","welcome","42","38.292"],["b89705a9","query","108","299.955"],["38c738d1","explore","96","93.556"],["38d49209","query","17","421.912"],["38592e00","query","18","408.484"],["38a7f88b","query","61","391.185"],["3891f3e2","","34",""],["36349e28","explore","45","126.071"],["38368d7e","query","199","370.875"],["38d9a089","welcome","12","42.609"],["37383af0","index","18","54.107"],["b8e22a2e","query","17","468.888"],["b8f1bf15","","29",""],["b8bb9d02","","23",""],["b7a97dbb","welcome","109","27.977"],["b75759c1","welcome","77","33.028"],["b7210d82","index","12","67.961"],["38f4c8db","explore","99","20.909"],["38e60476","explore","70","144.834"],["36f7fdad","index","27","29.754"],["b90182be","query","17","343.019"],["380494da","query","55","377.065"],["3883164c","query","118","389.215"],["b8ccfe2a","index","28","57.800"],["374b43a9","query","260","302.499"],["b5e7f657","welcome","7","26.114"],["b890dc6a","query","108","413.885"],["b8d7bdee","index","4","71.859"],["3600fd8c","query","90","347.137"],["b9077d3a","explore","102","140.554"],["383204f1","query","71","436.218"],["371ef2ec","welcome","22","40.924"],["b8ccfe2a","query","296","430.554"],["38592e00","query","44","561.872"],["b9552f4f","explore","22","135.061"],["b87ea259","explore","169","55.011"],["b7e4ccd5","index","18","49.294"],["3895c490","explore","221","117.347"],["b81edf15","explore","392","165.760"],["3792ae33","welcome","18","30.464"],["3600fd8c","query","102","429.447"],["b90ce38e","welcome","7","19.664"],["b805419d","","52",""],["b9893bc9","index","15","58.094"],["b847bf23","query","121","333.371"],["b8781981","query","123","364.437"],["380494da","query","65","430.431"],["b809a459","index","4","51.698"],["385d970c","welcome","22","34.121"],["b8ac8acd","welcome","7","33.561"],["391e0466","welcome","22","23.330"],["b8ea6996","welcome","85","14.576"],["39152737","query","148","450.170"],["3956dea1","","15",""],["38f4c8db","explore","110","154.551"],["387e5fd3","explore","140","121.411"],["382ff46f","query","180","447.930"],["b8bee8a9","query","321","338.240"],["b8a0d52a","explore","63","112.061"],["38d6f36c","index","25","39.122"],["3596f875","welcome","12","29.377"],["b6e86a47","welcome","183","26.914"],["b8acc8e1","welcome","41","27.949"],["b92a41bc","index","19","36.392"],["b31efa97","query","109","374.735"],["b83524be","query","572","466.941"],["b8a70c57","welcome","7","26.698"],["b904a87b","explore","22","89.947"],["b789800a","explore","403","105.711"],["b835e95b","welcome","56","13.377"],["b80b6056","query","60","385.163"],["b8a754d1","query","17","449.362"],["b6e86a47","query","59","426.816"],["b893f1e9","query","96","311.301"],["b8ea6996","explore","174","130.520"],["382f9c89","welcome","7","29.050"],["3933a80e","explore","96","115.416"],["385823a9","explore","22","73.168"],["b8b22c28","query","77","485.178"],["b9893bc9","explore","29","119.832"],["b9316463","explore","22","95.483"],["b7821e5c","query","17","384.564"],["375ad4d0","query","52","392.442"],["38d95664","query","58","308.219"],["b7f4d0c1","","10",""],["3790a77c","explore","201","86.165"],["b9077d3a","query","108","413.618"],["36f7fdad","query","120","348.243"],["38f8933d","welcome","31","34.274"],["3917dd99","query","17","420.107"],["3913fdaf","explore","22","118.832"],["390a94c6","index","43","67.636"],["b89705a9","query","113","388.191"],["36a3d2fe","index","70","72.142"],["3913fdaf","welcome","12","23.289"],["37494840","query","52","478.355"],["b8f1345d","explore","22","117.209"],["b8971322","explore","363","66.137"],["38f4230b","explore","23","170.993"],["b7fc776f","index","51","52.242"],["371ef2ec","query","41","403.170"],["b6e86a47","explore","130","87.411"],["b72f2109","explore","90","113.905"],["38e85a88","query","26","290.757"],["b91dabaf","welcome","31","23.564"],["b432dbc8","","140",""],["b83524be","query","17","388.972"],["b81f57a4","query","33","464.833"],["b919dc4a","explore","97","102.762"],["b8bb9d02","explore","28","105.437"],["b84c5c67","explore","41","173.766"],["b890dc6a","query","119","319.489"],["b8a6645b","","206",""],["b8faab12","welcome","10","17.771"],["b8cf3b88","explore","65","97.523"],["b80d45c6","query","17","326.926"],["38b45947","welcome","43","35.865"],["b919dc4a","explore","100","128.021"],["386e6d49","explore","33","33.068"],["b92d0688","welcome","37","35.464"],["38c09959","query","142","352.514"],["b8834bbe","explore","22","140.388"],["b810076c","","19",""],["38adbc1c","query","170","421.063"],["3836f29a","query","17","454.668"],["38da8baa","query","51","413.192"],["3600fd8c","query","17","509.366"],["b52a98aa","explore","235","138.857"],["381e3950","explore","31","133.905"],["b8c67786","index","17","25.746"],["b5e7f657","index","16","61.068"],["b5e7f657","","10",""],["b940c33b","query","17","403.673"],["38f0a207","explore","223","146.592"],["38c7a130","explore","47","144.713"],["b77f942a","query","90","327.186"],["3880ebea","index","4","45.694"],["b8c875ac","explore","66","163.491"],["38cae142","explore","158","104.620"],["b7aa9958","query","17","493.579"],["b8a6645b","query","57","384.787"],["b8290074","explore","22","141.628"],["b8a754d1","explore","94","145.166"],["38b537e4","index","12","60.964"],["37eb2fcd","","10",""],["375ad4d0","query","190","383.258"],["b9316463","query","84","407.562"],["36f3e2b0","welcome","19","27.432"],["3907e5b0","explore","55","112.558"],["36f3e2b0","index","4","39.202"],["37a768f1","query","99","384.106"],["38843b38","explore","301","127.814"],["380494da","explore","185","120.550"],["b8289f1a","explore","22","92.710"],["b89da5c6","welcome","11","43.564"],["38edbb55","explore","55","1.297"],["3851b535","query","17","388.094"],["38cae142","index","11","43.188"],["b795879c","welcome","68","32.566"],["38dd6b90","welcome","7","18.725"],["38da8baa","explore","182","110.694"],["38e8ab3d","welcome","7","22.210"],["b896dfeb","query","26","335.158"],["b938dc06","welcome","28","26.118"],["b94b611d","index","4","30.773"],["b7abd6cd","query","32","390.217"],["b8e8b49d","explore","22","157.356"],["382f4c24","query","129","446.782"],["b896dfeb","query","242","366.960"],["b90ce463","index","83","47.200"],["b86c757d","query","120","419.888"],["b9856d43","","45",""],["b86c757d","query","17","423.418"],["38824d6d","query","207","416.565"],["38948563","query","58","406.284"],["381e58d4","welcome","32","19.362"],["379fe829","explore","66","32.875"],["386c41b3","welcome","209","28.854"],["b919dc4a","query","17","458.007"],["b52a98aa","welcome","10","31.059"],["b9893bc9","explore","22","117.034"],["381dc7c6","query","92","401.091"],["385d970c","explore","57","122.556"],["b7f7db07","explore","113","83.799"],["384665e3","explore","28","93.398"],["395b5e7b","explore","133","158.883"],["38ebcacd","query","66","438.103"],["383c44cb","explore","316","117.393"],["b8bab8ec","welcome","25","47.306"],["b8a0d52a","explore","126","105.628"],["b6633f1a","query","281","446.031"],["390d2410","explore","420","155.786"],["b72f2109","index","17","36.611"],["38d6f36c","welcome","43","44.069"],["377d4673","explore","22","74.455"],["382f4c24","query","17","267.762"],["b81579d6","index","5","77.220"],["b84c5c67","query","121","400.672"],["b906df62","welcome","74","22.943"],["b8045be3","","30",""],["b8fdf6d5","query","364","351.187"],["b7c012a8","explore","25","75.195"],["38c09959","query","24","399.456"],["3933a80e","welcome","71","29.583"],["37d701af","index","82","47.346"],["377d4673","welcome","53","31.444"],["38820dcb","explore","185","140.799"],["b90b46ff","","10",""],["393ef37f","query","100","412.275"],["37e71d7c","query","33","484.284"],["38592e00","welcome","27","41.050"],["37383af0","explore","25","149.376"],["b902786e","explore","32","99.122"],["3920dfb4","query","107","552.387"],["38343e84","query","24","337.463"],["b90fca82","explore","50","156.160"],["b8a0d52a","query","142","382.006"],["b74acf21","explore","22","58.400"],["3686429c","welcome","26","36.998"],["38afab8e","query","137","348.340"],["36f7fdad","welcome","164","35.584"],["b84c5c67","explore","89","119.914"],["385b96d4","explore","46","145.116"],["b88d8eb8","welcome","7","28.942"],["b9552f4f","","202",""],["b72d9375","explore","85","149.455"],["3822edba","query","109","440.401"],["b801e6e5","query","17","188.528"],["b80b6056","index","24","64.722"],["363d3fbf","explore","81","58.865"],["38beeb4d","index","7","54.839"],["b95d95b8","query","104","447.930"],["38afab8e","query","64","398.113"],["b890dc6a","query","25","445.538"],["37e71d7c","","10",""],["39365da1","","14",""],["39035eea","query","163","413.745"],["37a768f1","explore","159","110.172"],["392d18b2","query","102","340.764"],["381e58d4","query","55","234.445"],["b9856d43","welcome","179","32.655"],["b7d7b5f5","index","16","37.353"],["382b8a89","query","52","375.142"],["3596f875","","10",""],["384665e3","explore","22","146.256"],["b8cadf66","explore","98","102.788"],["3883164c","welcome","42","41.726"],["b92d0688","query","160","361.652"],["b8e22a2e","welcome","19","38.405"],["385823a9","explore","246","61.200"],["387e5fd3","query","138","300.606"],["382ff46f","welcome","17","38.681"],["38e60476","","16",""],["b8bb3849","","90",""],["382f4c24","explore","99","142.596"],["379fe829","welcome","67","30.355"],["3956dea1","query","30","270.273"],["b81f57a4","index","12","56.025"],["b901a7bb","","41",""],["384dc7aa","explore","57","39.115"],["b881be6d","welcome","14","27.951"],["38f4c8db","welcome","79","36.329"],["b80168ac","explore","25","121.658"],["37383af0","welcome","83","22.204"],["36aa7870","","30",""],["b834730b","welcome","148","42.475"],["b8971322","query","24","289.761"],["b8781981","explore","156","139.328"],["b8bb9d02","welcome","19","38.863"],["382b8a89","query","60","325.260"],["b5e7f657","welcome","10","29.065"],["393ef37f","explore","69","52.765"],["b80fcf1d","","10",""],["380494da","","10",""],["39092208","","32",""],["b9098814","query","49","447.973"],["38f8933d","query","158","424.897"],["b8971322","explore","331","53.447"],["b89da5c6","query","95","384.079"],["b8781981","explore","96","64.612"],["b8326597","explore","33","78.546"],["39152737","explore","22","118.867"],["385d970c","query","70","304.316"],["b72d9375","index","5","59.616"],["381e58d4","welcome","23","30.578"],["38b30542","query","127","371.894"],["3792ae33","welcome","85","21.705"],["38beeb4d","query","67","356.046"],["b8246fe0","","64",""],["3882c89c","query","172","360.361"],["b9106aff","welcome","10","31.545"],["395fce5f","welcome","20","20.702"],["3882c89c","query","47","395.763"],["38820dcb","explore","88","136.313"],["b8faab12","explore","22","131.234"],["38f26220","query","17","284.039"],["b89da5c6","explore","34","72.933"],["b809a459","welcome","7","23.614"],["b801e6e5","explore","22","118.596"],["38c738d1","welcome","20","39.070"],["b90ce463","welcome","183","28.783"],["38d8c63a","explore","105","133.458"],["38f26220","query","17","404.731"],["b9324e4e","welcome","19","32.302"],["b8fdf6d5","query","59","404.098"],["b919a166","query","159","323.513"],["371b3e13","welcome","26","20.737"],["386c41b3","welcome","29","41.450"],["37ac6a09","explore","22","134.532"],["b81f57a4","welcome","11","27.763"],["3915cc59","","99",""],["381e3950","query","17","295.147"],["b7de74ad","explore","322","59.166"],["38f8933d","","22",""],["38adbc1c","query","130","319.152"],["38f8933d","explore","40","120.580"],["386139d9","explore","22","33.693"],["b9418299","","26",""],["36aa7870","query","17","519.907"],["b8045be3","query","116","500.959"],["b980e6ce","query","37","311.295"],["379d5ea8","query","133","438.121"],["b712de52","explore","263","61.977"],["b7339a70","welcome","7","29.902"],["38ebcacd","welcome","68","40.515"],["37af77a3","query","46","399.628"],["b8bee8a9","welcome","165","28.700"],["37eb2fcd","query","168","335.250"],["38a7f88b","index","27","55.208"],["38ea393f","query","220","449.479"],["b754f50b","explore","148","36.879"],["386c41b3","explore","22","88.863"],["38a7f88b","explore","26","80.608"],["39372d62","query","17","346.171"],["b919a166","query","158","434.632"],["b801e6e5","welcome","19","22.352"],["387e5fd3","welcome","7","43.166"],["b83524be","query","17","405.148"],["38749f05","query","200","424.990"],["b7aefa94","explore","91","104.585"],["b8f13334","","10",""],["b7aefa94","explore","408","127.768"],["b95d95b8","","20",""],["386e6d49","explore","28","98.396"],["b980e6ce","welcome","12","31.063"],["b8f3e8b9","query","36","342.268"],["b8a0d52a","query","113","372.542"],["37d701af","explore","45","54.441"],["b6e86a47","query","17","305.761"],["b9077d3a","query","17","350.963"],["b714dc46","query","18","453.828"],["b82bcf61","explore","22","85.152"],["b8d05715","welcome","7","14.950"],["3600fd8c","query","87","384.328"],["b8326597","explore","199","177.869"],["3920dfb4","explore","132","116.752"],["b90b46ff","explore","296","58.275"],["37af77a3","query","17","358.452"],["393c832e","welcome","10","26.200"],["b808f9b5","query","98","346.534"],["371b3e13","query","23","337.466"],["b8290074","query","38","482.070"],["b755da2b","explore","202","166.397"],["b89f8df2","welcome","7","29.803"],["b6633f1a","explore","92","129.027"],["b880c13a","query","52","292.053"],["b835e95b","","28",""],["38f8933d","explore","29","143.699"],["391c2252","explore","22","118.659"],["b72d9375","query","67","467.414"],["b9101f6d","explore","209","127.755"],["b80e549c","welcome","37","36.883"],["b8045be3","welcome","70","34.143"],["b90fca82","query","72","415.894"],["39372d62","index","4","49.968"],["39132f5c","query","95","399.015"],["b904a87b","explore","153","116.961"],["390d2410","welcome","46","33.497"],["38e8ab3d","index","19","40.670"],["38b23f71","explore","147","136.229"],["3851b535","index","16","41.598"],["3606bab5","index","10","77.643"],["395b5e7b","query","89","398.845"],["390d2410","index","48","44.118"],["b8529553","explore","37","102.884"],["38f26220","query","70","436.622"],["39875084","","17",""],["b712de52","query","74","382.863"],["39290817","explore","170","70.141"],["396197d3","welcome","7","28.421"],["b8fdf6d5","query","17","330.849"],["39035eea","explore","216","119.649"],["374b43a9","explore","63","117.009"],["b726fc97","welcome","45","32.857"],["3891da7b","explore","60","126.856"],["38592e00","explore","136","93.878"],["38afab8e","query","98","434.442"],["38cae142","explore","24","109.172"],["b78cd4cc","query","19","455.150"],["37d78acc","query","129","382.613"],["390c3cec","index","5","65.441"],["39875084","query","31","378.675"],["38b23f71","query","113","284.383"],["b8f1bf15","query","160","398.648"],["b948b6f9","query","53","436.637"],["392d18b2","query","155","440.646"],["b9418299","welcome","127","26.595"],["b8c67786","query","53","368.176"],["37247a19","query","299","343.037"],["b8f1345d","query","264","317.748"],["b8ac2813","index","6","43.698"],["b82af9b9","query","36","308.165"],["b8ad224b","query","30","384.955"],["b8cadf66","explore","22","120.090"],["b7fc776f","welcome","10","27.584"],["379d5ea8","query","17","424.272"],["b8ea6996","welcome","60","22.148"],["b82f8b2a","query","105","407.176"],["b74acf21","","43",""],["36349e28","query","104","246.398"],["3891da7b","query","118","396.001"],["b72d9375","","19",""],["b83524be","welcome","20","33.085"],["387eb251","query","217","408.721"],["b8a70c57","explore","27","160.440"],["38d8c63a","welcome","16","17.300"],["b7de74ad","explore","102","128.258"],["b8290074","query","118","310.413"],["b72d9375","query","63","358.418"],["38d7936e","index","4","42.611"],["381dc7c6","welcome","47","16.147"],["b89705a9","query","146","373.938"],["b8bb3849","index","4","25.444"],["374b43a9","query","119","389.436"],["b8d05715","welcome","38","32.948"],["b7aa9958","query","194","481.677"],["37eb2fcd","query","23","399.771"],["b82f8b2a","welcome","15","34.015"],["38f0a207","query","91","374.647"],["b712de52","","10",""],["b82f8b2a","query","19","343.393"],["381e58d4","","61",""],["b78bf9a5","query","25","357.173"],["394b68a5","query","178","462.700"],["b82af9b9","welcome","59","25.442"],["38adbc1c","explore","42","113.145"],["b8e92871","welcome","26","50.699"],["b9101f6d","query","59","449.203"],["38f26220","index","18","40.204"],["391c2252","explore","48","44.163"],["38d9a089","explore","104","128.535"],["385d970c","index","5","64.051"],["38afab8e","query","114","366.356"],["38f0a207","query","265","375.397"],["b8ad224b","welcome","29","26.369"],["b8cb4c88","query","17","274.684"],["38749f05","query","17","325.061"],["38d49209","explore","66","156.562"],["b80e549c","query","113","354.212"],["371b3e13","","62",""],["38c738d1","query","174","265.821"],["b8cadf66","explore","143","94.818"],["38868413","query","38","369.812"],["b78cd4cc","query","114","314.300"],["b81f57a4","index","31","9.259"],["b9005d0b","query","59","471.206"],["38adbc1c","","84",""],["b6979500","query","31","298.319"],["b8ea6996","explore","22","102.265"],["37ea0427","explore","272","107.138"],["b893f1e9","query","181","419.392"],["b7352e58","query","86","518.344"],["b80fcf1d","explore","226","106.332"],["b8cb4c88","explore","257","122.648"],["391c9704","explore","22","68.593"],["391c2252","welcome","7","34.964"],["b8cf3b88","explore","283","92.261"],["39372d62","explore","22","139.985"],["375ad4d0","query","68","446.976"],["38978417","welcome","18","20.062"],["38539d8c","welcome","10","34.327"],["b8f13334","explore","33","143.866"],["b9077d3a","query","277","327.620"],["395fce5f","","40",""],["39092208","query","17","381.621"],["b9418299","query","17","407.789"],["390a94c6","welcome","21","31.233"],["38e60476","welcome","7","31.997"],["b8326597","index","4","52.018"],["b809a459","explore","31","110.942"],["b90182be","index","8","58.849"],["38f26220","","57",""],["37d8b9ed","welcome","40","25.692"],["3792ae33","welcome","72","25.649"],["b834e77f","welcome","8","27.080"],["b78358d5","explore","146","90.416"],["393ef37f","query","169","299.049"],["b9552f4f","query","17","448.593"],["3596f875","explore","22","75.812"],["39152737","query","51","395.055"],["b835e95b","query","73","272.505"],["386139d9","explore","26","146.022"],["3909e239","welcome","7","27.268"],["381e58d4","query","129","501.983"],["38861a87","query","41","418.622"],["3882d1ef","welcome","23","27.089"],["b8045be3","welcome","41","31.288"],["382f4c24","explore","529","77.767"],["b95d95b8","welcome","68","27.622"],["b880c13a","query","17","330.426"],["b78139ab","welcome","9","36.156"],["36a3d2fe","explore","147","103.304"],["381dc7c6","query","88","339.926"],["38868413","","10",""],["37d701af","explore","251","96.024"],["38dd6b90","query","55","406.052"],["379333c6","query","30","370.711"],["39035eea","query","70","506.931"],["371ef2ec","welcome","94","35.210"],["386e6d49","query","34","378.116"],["38b45947","welcome","113","33.937"],["38749f05","welcome","31","34.051"],["b81579d6","query","463","432.441"],["b8780b92","","103",""],["b8c67786","query","142","366.966"],["b5e7f657","welcome","28","28.063"],["379333c6","query","81","347.004"],["b7939ddb","explore","162","27.435"],["b8583fdd","explore","169","91.811"],["b8e92871","explore","24","163.699"],["379d5ea8","explore","67","166.890"],["b8acc8e1","explore","412","133.020"],["36f7fdad","welcome","30","22.085"],["395b5e7b","index","39","49.328"],["b8acc8e1","index","23","49.008"],["38a86427","explore","31","121.827"],["b8ccfe2a","explore","134","157.754"],["389fde1c","explore","51","128.534"],["b7474352","index","4","47.136"],["b9200590","explore","105","106.380"],["b86b60fc","explore","22","38.465"],["b901a7bb","explore","100","136.031"],["b835e95b","welcome","26","25.163"],["38420c72","query","17","450.441"],["b90b46ff","explore","86","108.766"],["36ce2e37","welcome","10","38.604"],["b7fc776f","query","85","446.329"],["b8ccfe2a","query","18","349.886"],["b8ac8acd","welcome","7","42.076"],["395b5e7b","explore","22","149.062"],["3811afac","query","148","444.762"],["b755da2b","query","132","390.449"],["38a7f88b","query","17","485.869"],["38868413","explore","22","98.338"],["383204f1","query","49","318.604"],["b901a7bb","explore","22","162.302"],["37dadc3e","query","74","483.609"],["3822edba","explore","22","98.947"],["37ac6a09","welcome","45","33.124"],["3686429c","explore","70","110.361"],["b90b128b","query","17","374.992"],["3851b535","welcome","7","21.489"],["3943830a","query","41","537.440"],["382b8a89","explore","22","120.288"],["b8d05715","explore","44","130.638"],["37ea053c","explore","139","102.784"],["b7d7b5f5","explore","22","129.935"],["393c832e","query","163","365.542"],["b9005d0b","welcome","7","32.636"],["b714dc46","welcome","71","17.899"],["3811afac","query","97","322.530"],["39472aee","query","73","385.499"],["385b6916","","27",""],["b893f1e9","welcome","18","28.070"],["380edea5","welcome","21","18.646"],["b92d0688","explore","216","90.494"],["38aa11a2","explore","22","138.676"],["b7d7b5f5","welcome","124","35.893"],["b834e77f","welcome","19","24.217"],["b8246fe0","welcome","51","30.165"],["38b52594","welcome","43","34.472"],["b89f8df2","query","97","385.666"],["b77f942a","query","101","327.587"],["3606bab5","index","19","52.190"],["b6a668ba","welcome","7","36.686"],["38a7f88b","welcome","171","35.166"],["3913fdaf","explore","73","161.933"],["394b68a5","explore","28","95.593"],["b95d95b8","","10",""],["39092208","query","189","373.076"],["38447a00","query","27","477.231"],["b91dabaf","explore","115","56.623"],["387eb251","query","89","529.362"],["39035eea","explore","142","76.277"],["b88d8eb8","explore","98","109.224"],["b6633f1a","query","77","333.081"],["b830c67c","welcome","70","9.961"],["37ac6a09","explore","222","37.611"],["b8583fdd","welcome","18","31.022"],["3906759e","explore","77","82.156"],["b8326597","query","30","316.818"],["b7707626","query","218","394.500"],["38dd6b90","explore","58","96.071"],["b901e1ee","","63",""],["388aadd7","query","122","364.142"],["b80a0db4","welcome","17","36.668"],["37d8b9ed","index","12","61.040"],["386c41b3","query","17","413.159"],["3891f3e2","explore","22","102.564"],["382f9c89","explore","148","138.884"],["3790a77c","welcome","8","37.093"],["b81edf15","","61",""],["b80b6056","query","17","424.850"],["37494840","explore","95","168.549"],["382f4c24","query","112","473.825"],["3882c89c","explore","94","112.933"],["38c738d1","query","111","429.739"],["38beeb4d","explore","167","45.818"],["37ea0427","explore","110","122.455"],["b940c33b","welcome","32","36.968"],["b8acc8e1","query","208","345.591"],["38af774a","query","166","289.520"],["38f4230b","explore","254","140.799"],["b834730b","explore","407","144.030"],["b906df62","explore","22","92.861"],["b7b4e7ac","","41",""],["b726fc97","query","21","339.253"],["b980e6ce","query","94","403.548"],["b87ea259","explore","233","146.134"],["b8045be3","query","101","429.222"],["37dadc3e","query","70","305.424"],["38d6f36c","index","12","26.023"],["b89f8df2","","28",""],["b8bab8ec","query","36","344.772"],["b938dc06","query","47","320.512"],["b78139ab","index","7","45.900"],["b80fcf1d","welcome","23","32.358"],["384665e3","","49",""],["b7c012a8","","12",""],["3933a80e","query","55","316.958"],["38dd6b90","query","87","365.919"],["b8ac2813","query","42","409.096"],["b80e549c","query","95","361.379"],["b91c49f9","explore","293","31.459"],["380edea5","query","156","385.356"],["381e3950","query","77","475.190"],["b755da2b","explore","93","115.626"],["b80b6056","explore","249","139.336"],["b88d8eb8","explore","22","53.513"],["b8e22a2e","index","4","33.053"],["b7276af1","explore","178","166.174"],["b8319d86","explore","176","115.890"],["395b5e7b","welcome","7","34.668"],["b84ad865","query","17","390.508"],["b80e549c","explore","22","133.627"],["b8fdf6d5","welcome","61","34.506"],["b8c1fc74","explore","22","99.759"],["390a94c6","","24",""],["374a37eb","explore","184","55.795"],["37d8b9ed","query","358","304.420"],["385b6916","query","87","422.914"],["3917dd99","query","17","401.478"],["b91dabaf","explore","439","71.734"],["39769889","query","83","248.805"],["36a3d2fe","query","34","402.990"],["394b68a5","welcome","118","32.537"],["b7c012a8","","263",""],["38ebcacd","explore","213","153.797"],["b80b6056","welcome","58","22.737"],["b80168ac","index","7","71.816"],["b7352e58","index","83","46.703"],["b85081f3","query","35","346.999"],["b6e86a47","","11",""],["374a37eb","explore","81","91.995"],["386139d9","welcome","20","22.400"],["379333c6","query","23","358.317"],["b8255a74","welcome","71","23.384"],["383c44cb","","44",""],["3913fdaf","explore","249","100.734"],["36653a24","explore","379","76.830"],["b8a70c57","query","228","399.295"],["b90b46ff","query","104","301.865"],["b7ef02de","query","101","444.352"],["b8bb9d02","query","68","319.534"],["37ea053c","welcome","24","25.559"],["b8f1345d","explore","255","122.675"],["b8289f1a","explore","308","84.240"],["b808f9b5","welcome","19","36.002"],["b8c875ac","explore","297","114.879"],["39875084","explore","24","164.486"],["386139d9","explore","320","156.314"],["b904a87b","welcome","8","22.362"],["b904a87b","explore","172","120.416"],["b754f50b","explore","37","145.893"],["39083a44","query","17","342.559"],["38420c72","welcome","18","26.001"],["3891f3e2","index","11","56.612"],["b933999c","query","64","373.750"],["38368d7e","explore","85","53.682"],["3906759e","explore","22","170.439"],["b9b22f3d","query","44","377.479"],["b810076c","welcome","131","24.690"],["38cef8ac","explore","204","62.352"],["b9324e4e","","65",""],["b8583fdd","welcome","99","37.413"],["b86c757d","index","4","39.301"],["b90182be","welcome","50","38.627"],["b84c5c67","query","80","364.419"],["b77f942a","query","101","288.788"],["3811afac","explore","260","106.454"],["38afab8e","explore","24","109.734"],["37e71d7c","explore","52","89.834"],["391c9704","query","128","266.543"],["383204f1","query","114","367.966"],["b890dc6a","query","70","354.680"],["b8ca7291","explore","154","62.305"],["b980e6ce","query","34","352.918"],["b9324e4e","query","32","360.178"],["b8ac2813","query","254","324.841"],["b8da5ce2","explore","22","96.501"],["b82f8b2a","index","6","54.951"],["38861a87","explore","111","166.422"],["b8045be3","query","338","306.410"],["b81edf15","welcome","13","45.842"],["389fde1c","explore","22","82.471"],["380494da","explore","91","155.507"],["b940c33b","query","36","390.084"],["3811afac","query","222","270.912"],["38f4230b","query","75","467.630"],["b834730b","","38",""],["381e3950","query","42","426.833"],["b81579d6","index","5","66.962"],["39372d62","welcome","51","24.037"],["b80a0db4","explore","120","86.387"],["38af774a","index","7","52.490"],["38cae142","query","17","355.617"],["382f4c24","query","80","367.800"],["b5e7f657","explore","58","72.068"],["b82f8b2a","explore","114","106.167"],["394b68a5","query","186","352.698"],["383204f1","index","9","48.894"],["38dd6b90","welcome","61","35.839"],["3819d95d","query","65","379.419"],["36349e28","welcome","101","28.157"],["b82bcf61","welcome","7","32.479"],["390c3cec","query","17","404.753"],["34f12b30","query","18","363.346"],["38ea393f","query","17","502.157"],["b901e1ee","welcome","47","21.355"],["b8faab12","explore","142","70.638"],["381e58d4","","74",""],["38afab8e","welcome","117","34.400"],["382f4c24","query","31","295.203"],["380494da","query","17","313.928"],["b72d9375","query","40","437.641"],["38f8933d","query","37","387.084"],["b7276af1","welcome","8","37.185"],["b78bf9a5","welcome","7","26.856"],["391c9704","explore","125","109.415"],["b90182be","query","37","328.955"],["39472aee","query","99","346.975"],["396197d3","query","65","381.009"],["37d63bbb","query","505","497.779"],["b86b60fc","welcome","50","37.123"],["393ef37f","explore","29","24.886"],["b801e6e5","query","121","361.178"],["38400295","explore","22","84.460"],["37a768f1","explore","118","62.168"],["b80fcf1d","explore","22","113.683"],["3606bab5","explore","94","142.145"],["396197d3","explore","55","131.363"],["b6633f1a","query","232","403.119"],["391c2252","welcome","7","27.732"],["379333c6","welcome","16","8.508"],["36a3d2fe","","112",""],["379333c6","query","38","446.966"],["b7b4e7ac","query","216","402.403"],["b80d45c6","index","17","82.987"],["382ff46f","explore","22","136.539"],["b808f9b5","query","42","417.175"],["3790a77c","explore","85","94.235"],["b78b2440","explore","75","194.603"],["b8cadf66","welcome","23","45.850"],["b7ef02de","explore","73","129.677"],["3895c490","query","241","420.547"],["38420c72","explore","147","133.321"],["b8319d86","","152",""],["b7968805","query","82","350.529"],["3600fd8c","explore","137","92.054"],["b88ada11","query","121","443.818"],["b8f13334","welcome","89","29.400"],["b72f2109","welcome","7","38.422"],["b82f8b2a","query","80","347.499"],["b91dabaf","welcome","43","34.414"],["b880c13a","query","283","307.733"],["b92d0688","explore","852","117.468"],["b7c012a8","query","107","442.737"],["b8da5ce2","query","67","346.616"],["384665e3","index","5","42.366"],["391e0466","query","135","498.148"],["38d95664","explore","130","183.487"],["b7ef02de","explore","22","126.212"],["b6633f1a","explore","26","90.689"],["391e0466","query","53","376.776"],["380edea5","index","18","24.965"],["b90b46ff","explore","22","135.985"],["3900e284","index","20","31.824"],["b93477eb","query","17","427.967"],["391b2370","query","88","376.968"],["b6633f1a","welcome","66","21.454"],["38f0a207","","207",""],["b86b60fc","query","83","359.275"],["38b23f71","welcome","35","45.118"],["3851b535","welcome","34","30.522"],["b937fd4b","explore","95","45.224"],["b8beba55","explore","45","127.952"],["385f952a","query","73","370.005"],["37e71d7c","query","65","369.021"],["b8da5ce2","","18",""],["38d9a089","query","128","330.687"],["b81579d6","query","47","498.769"],["b789800a","","105",""],["38ded491","welcome","31","18.482"],["b85f1c7f","query","71","369.219"],["b830c67c","query","175","458.614"],["386e6d49","welcome","82","42.938"],["382b8a89","explore","342","158.035"],["395b5e7b","query","23","401.234"],["390c3cec","explore","90","106.320"],["b7de74ad","welcome","7","44.803"],["b937fd4b","explore","46","140.598"],["383204f1","query","37","370.909"],["36f7fdad","query","83","422.316"],["b90b128b","query","17","419.243"],["38ebcacd","welcome","46","26.454"],["37eb2fcd","explore","47","152.249"],["b92b2caf","index","4","36.445"],["390d2410","index","9","53.697"],["b8903a5b","explore","318","94.760"],["b86c757d","explore","47","157.115"],["3917dd99","query","36","384.434"],["38aa30c2","query","296","416.083"],["38d95664","explore","22","103.508"],["382f4c24","explore","46","115.932"],["b90ce38e","query","38","440.259"],["391c2252","explore","54","119.933"],["379333c6","welcome","34","34.549"],["b90b46ff","explore","129","69.609"],["b7707626","welcome","27","37.773"],["39365da1","query","190","443.804"],["3882c89c","explore","225","82.517"],["b8bf9af4","welcome","40","31.189"],["374b43a9","explore","144","180.108"],["38e85a88","explore","156","162.405"],["389fde1c","query","32","423.446"],["b7ef02de","welcome","64","27.346"],["37eb2fcd","explore","39","48.604"],["b432dbc8","explore","45","106.273"],["37d63bbb","welcome","18","23.366"],["36f7fdad","explore","27","102.738"],["37383af0","explore","100","126.221"],["b7276af1","query","51","278.895"],["37d701af","welcome","67","24.577"],["b52a98aa","explore","25","101.506"],["b755da2b","explore","63","135.213"],["b712de52","welcome","7","36.899"],["384dc7aa","query","107","394.125"],["b78b2440","query","113","550.092"],["385b6916","explore","73","90.278"],["38adbc1c","welcome","40","48.818"],["b8f13334","welcome","11","19.721"],["b7d7b5f5","query","149","326.070"],["382ff46f","query","17","414.971"],["b8e22a2e","explore","104","140.712"],["38aa11a2","explore","84","95.883"],["38592e00","query","124","360.497"],["388aadd7","query","186","386.803"],["385d970c","welcome","18","31.813"],["38f26220","query","17","510.204"],["38adbc1c","query","141","392.910"],["34f12b30","query","115","276.749"],["36f7fdad","index","4","28.681"],["b9106aff","index","4","60.499"],["38b52594","explore","59","116.309"],["38a86427","explore","22","150.036"],["b93b8201","","71",""],["b901e1ee","explore","179","135.251"],["b90182be","query","84","401.984"],["39087f58","query","201","399.345"],["b8cb4c88","query","178","322.982"],["3891f3e2","query","254","287.732"],["38e8ab3d","explore","334","109.317"],["3900e284","explore","43","123.147"],["b8da5ce2","explore","82","113.871"],["371ef2ec","welcome","52","34.551"],["39472aee","index","39","40.838"],["b85c022e","explore","56","76.634"],["b8f13334","query","45","389.398"],["b8cadf66","welcome","75","38.269"],["38749f05","index","4","47.740"],["b919dc4a","welcome","26","33.089"],["b87ea259","welcome","9","48.433"],["38a5cc26","","15",""],["b91dabaf","explore","111","59.531"],["3880ebea","query","24","364.150"],["b82f8b2a","query","26","348.049"],["b9106aff","welcome","21","25.240"],["36653a24","query","60","371.813"],["38d6f36c","","278",""],["b5e7f657","index","21","39.955"],["b88d8eb8","explore","47","100.013"],["b78cd4cc","query","143","415.764"],["b810076c","welcome","13","36.384"],["39769889","welcome","10","32.619"],["b8255a74","explore","90","121.393"],["b7f7db07","explore","298","61.526"],["38592e00","welcome","18","26.623"],["34f12b30","index","27","46.372"],["b90ce38e","query","17","263.765"],["b980e6ce","query","193","376.479"],["b834e77f","explore","137","190.403"],["38b52594","explore","22","92.966"],["38edbb55","index","14","47.193"],["385d970c","query","17","396.665"],["b8cadf66","index","4","54.343"],["36aa7870","index","14","45.617"],["b72d9375","welcome","37","32.304"],["385b96d4","","15",""],["38aa30c2","welcome","11","25.855"],["b86c757d","query","17","300.467"],["b8d05715","query","192","356.850"],["36bf0d6a","query","117","268.281"],["b91dabaf","","48",""],["38824d6d","explore","290","71.670"],["37d9801d","explore","48","218.561"],["38948563","query","292","333.435"],["b80168ac","query","133","385.678"],["38dd6b90","explore","209","66.302"],["395fce5f","explore","42","122.411"],["3880ebea","query","209","415.976"],["37e71d7c","explore","104","107.996"],["b8beba55","query","17","340.869"],["b8bb3849","","14",""],["b9552f4f","explore","111","159.971"],["b8b22c28","explore","99","109.236"],["b8e92871","explore","102","38.202"],["b88d8eb8","query","54","415.236"],["b74acf21","query","17","231.011"],["b7210d82","query","158","408.037"],["b9552f4f","index","17","60.320"],["b8903a5b","","37",""],["b8fdf6d5","query","17","368.973"],["386c41b3","explore","41","43.179"],["39290817","query","47","469.580"],["3906759e","query","17","387.589"],["393c832e","","89",""],["b890dc6a","query","85","417.455"],["b8a03224","explore","176","147.089"],["b90ce38e","query","17","301.991"],["b902786e","","17",""],["37d63bbb","query","194","397.612"],["b919a166","query","102","376.584"],["b72f231c","","10",""],["b7939ddb","","10",""],["38ea393f","index","4","68.888"],["b8bb9d02","query","68","372.646"],["3913fdaf","welcome","20","25.463"],["38d8c63a","explore","86","126.034"],["38f4c8db","explore","92","111.080"],["b7e4ccd5","explore","70","110.058"],["b7352e58","query","40","243.056"],["b6633f1a","explore","22","97.918"],["b938dc06","","10",""],["b80168ac","index","26","47.179"],["394fc6e8","welcome","15","31.774"],["38e85a88","explore","268","105.385"],["b7707626","explore","56","167.989"],["393ef37f","welcome","7","30.198"],["381e3950","query","19","420.424"],["b92d0688","explore","98","39.792"],["379fe829","explore","22","124.954"],["3946238e","","57",""],["3946238e","query","97","327.591"],["b90ce38e","index","33","40.523"],["b8781981","explore","134","129.662"],["387c10ce","explore","208","149.526"],["b93b8201","index","13","71.531"],["b7aa9958","query","43","382.553"],["37265bd1","query","120","418.104"],["b6e86a47","","10",""],["38861a87","explore","491","135.784"],["b8a0d52a","query","263","315.454"],["b89da5c6","query","17","432.786"],["b8290074","query","103","323.344"],["b7276af1","query","84","385.263"],["38edbb55","explore","138","148.816"],["38aa30c2","","10",""],["38d95664","query","67","389.808"],["b91dabaf","index","66","67.085"],["38978417","explore","349","117.018"],["b9101f6d","explore","50","138.509"],["36a3d2fe","explore","125","174.995"],["b432dbc8","query","43","418.301"],["b93477eb","query","35","385.933"],["382b613e","query","25","412.622"],["b89da5c6","query","17","434.557"],["36bf0d6a","explore","22","142.334"],["b8d05715","query","87","435.494"],["b7339a70","","99",""],["38e60476","query","68","336.562"],["b75759c1","explore","24","123.019"],["b83857e0","query","49","466.761"],["b888e833","","22",""],["395fce5f","query","19","309.353"],["386139d9","query","236","399.927"],["3880ebea","query","96","312.526"],["39152737","welcome","7","28.489"],["38592e00","welcome","21","29.878"],["37ac6a09","query","17","369.848"],["387bd683","query","17","467.009"],["b8c875ac","welcome","21","36.743"],["38d7936e","index","6","48.816"],["b7e4ccd5","index","42","48.398"],["38368d7e","","191",""],["b91c49f9","query","130","339.789"],["385d970c","index","4","54.343"],["38b23f71","welcome","17","24.879"],["38b96a95","welcome","16","32.593"],["3906759e","","91",""],["38e85a88","explore","97","27.807"],["b83857e0","explore","133","147.946"],["39769889","query","17","412.208"],["b78139ab","query","58","444.066"],["b948b6f9","query","29","404.982"],["b8d05715","","10",""],["39290817","welcome","30","20.140"],["b8faab12","query","17","419.954"],["394fc6e8","welcome","38","46.074"],["38978417","index","9","64.422"],["385b341d","query","17","315.628"],["b8289f1a","query","172","507.776"],["b80fcf1d","welcome","7","31.310"],["b8d7bdee","query","75","329.584"],["37ba28ff","explore","89","11.274"],["b78bf9a5","explore","249","93.240"],["b948b6f9","query","26","329.592"],["b75759c1","index","5","42.731"],["37afb00b","query","32","474.762"],["380edea5","query","190","417.717"],["b7c012a8","explore","117","105.384"],["393ef37f","explore","229","116.423"],["3933a80e","query","370","406.561"],["b754f50b","explore","111","98.830"],["382b613e","welcome","13","37.402"],["b8cb4c88","query","19","358.713"],["b888e833","query","433","442.155"],["b7aa9958","index","45","60.116"],["392d18b2","welcome","44","24.957"],["38cae142","explore","256","169.040"],["b7276af1","query","17","444.875"],["3600fd8c","explore","66","148.134"],["39372d62","explore","22","161.640"],["b6633f1a","welcome","26","21.832"],["b6633f1a","welcome","25","19.980"],["38ea393f","query","67","335.292"],["b919a166","explore","30","117.543"],["b9418299","welcome","70","37.182"],["3972909f","explore","102","82.497"],["387eb251","query","33","342.829"],["3790a77c","","13",""],["b7f7db07","query","285","269.676"],["b8bab8ec","welcome","102","26.733"],["388aadd7","query","17","407.822"],["36f3e2b0","query","202","343.383"],["b90b128b","explore","350","128.960"],["3792ae33","","23",""],["3891da7b","query","59","335.639"],["b8e8b49d","welcome","19","35.331"],["b805419d","","72",""],["b7339a70","explore","257","73.325"],["38b537e4","query","463","263.534"],["36a3d2fe","","12",""],["b7276af1","welcome","46","11.248"],["379fe829","explore","42","54.924"],["381e58d4","query","159","382.161"],["38f8933d","index","130","48.493"],["b80b6056","explore","263","66.296"],["38f8933d","welcome","23","27.431"],["39092208","query","175","428.971"],["385d970c","explore","118","142.484"],["b8a754d1","query","186","368.006"],["385f952a","explore","22","163.916"],["3822edba","explore","192","231.972"],["38f4230b","","41",""],["b5e7f657","welcome","90","36.984"],["b933999c","explore","30","88.853"],["b888e833","welcome","17","7.705"],["b8bab8ec","query","308","398.139"],["390d2410","explore","560","130.291"],["382b8a89","query","285","299.644"],["3920dfb4","query","112","301.980"],["b84ad865","","10",""],["b8ccfe2a","query","17","410.115"],["39472aee","explore","49","85.939"],["39769889","welcome","53","23.011"],["3933a80e","index","12","50.904"],["38447a00","query","105","426.960"],["b7968805","explore","331","154.570"],["387c10ce","query","17","461.105"],["391c2252","query","114","336.489"],["b8326597","welcome","16","36.211"],["390a94c6","welcome","8","22.287"],["b9316463","explore","63","220.192"],["383204f1","query","35","360.720"],["37afb00b","index","4","40.958"],["b809a459","welcome","70","21.088"],["38a5cc26","query","50","427.257"],["3907e5b0","explore","135","105.489"],["3686429c","explore","244","33.162"],["b712de52","welcome","29","31.938"],["b9b22f3d","query","133","447.034"],["b7a97dbb","query","28","317.912"],["392d18b2","query","52","382.199"],["b74acf21","welcome","19","28.121"],["b937fd4b","explore","23","109.182"],["b80fcf1d","welcome","12","33.536"],["38beeb4d","query","66","391.308"],["b7a47e56","welcome","20","21.537"],["b8781981","query","142","344.387"],["b896dfeb","query","281","476.917"],["36ce2e37","explore","64","119.367"],["391c9704","index","34","48.107"],["379333c6","","12",""],["b94525bf","query","186","585.606"],["375ad4d0","welcome","222","25.820"],["b90182be","index","6","51.364"],["38b52594","welcome","26","26.116"],["3933a80e","","10",""],["b847bf23","query","73","432.823"],["371b3e13","explore","103","150.017"],["b8b0892f","query","32","412.361"],["38539d8c","query","35","330.962"],["b80d45c6","welcome","20","27.171"],["37e71d7c","query","18","369.584"],["391e0466","welcome","28","31.559"],["3819d95d","query","48","440.162"],["36349e28","query","201","355.015"],["38447a00","explore","54","186.797"],["37afb00b","explore","22","159.615"],["3943830a","","39",""],["b808f9b5","query","30","488.049"],["395b5e7b","index","50","51.954"],["b789800a","query","85","312.139"],["38cae142","query","86","425.524"],["b7a47e56","query","45","302.979"],["b9893bc9","explore","129","110.479"],["b90ce463","query","232","436.176"],["b906df62","welcome","8","25.645"],["b7339a70","index","4","49.271"],["38f4230b","explore","22","128.349"],["b9418299","explore","22","86.699"],["b90ce463","query","221","429.502"],["b9077d3a","welcome","64","44.521"],["37c3eb17","welcome","7","33.641"],["b94525bf","index","27","50.202"],["374b43a9","index","14","46.278"],["38edbb55","explore","67","106.505"],["b75759c1","query","17","328.130"],["b9101f6d","query","256","287.274"],["3606bab5","explore","34","155.374"],["b7608214","query","17","391.256"],["38afab8e","index","26","50.272"],["383204f1","query","17","428.830"],["b7339a70","welcome","163","26.028"],["b881be6d","explore","23","119.440"],["3883164c","query","55","423.958"],["b8971322","query","166","516.007"],["b9106aff","query","17","303.460"],["36bf0d6a","welcome","31","22.231"],["37c3532d","query","25","419.405"],["37ea0427","welcome","45","25.874"],["b8faab12","query","43","344.919"],["b72f231c","query","105","321.544"],["38b23f71","query","19","390.150"],["36aa7870","explore","77","72.634"],["b90b128b","welcome","7","20.408"],["39035eea","index","16","43.810"],["3968d642","query","218","383.379"],["b82af9b9","explore","164","34.743"],["3933a80e","query","86","399.004"],["395fce5f","explore","48","175.398"],["b789800a","explore","267","149.739"],["382f4c24","explore","49","122.831"],["b86c757d","explore","246","62.001"],["3883164c","welcome","7","38.503"],["39290817","welcome","44","32.641"],["38d6f36c","query","44","450.936"],["b835e95b","query","88","453.607"],["b80e549c","query","56","354.632"],["b726fc97","explore","27","115.050"],["b94b611d","query","53","293.268"],["b8cf3b88","explore","29","167.796"],["b901e1ee","query","88","417.592"],["b90b46ff","explore","71","52.575"],["39083a44","query","26","453.096"],["b8e22a2e","welcome","12","9.290"],["39092208","explore","45","161.586"],["b8ccfe2a","query","165","457.442"],["b7608214","welcome","52","38.422"],["b7939ddb","query","36","376.868"],["b7a97dbb","explore","22","147.654"],["b8823cc9","explore","200","139.811"],["381e3950","explore","133","133.964"],["390a94c6","welcome","7","34.371"],["38861a87","query","17","368.415"],["391c9704","query","27","434.183"],["b9324e4e","query","17","474.610"],["b8a6645b","explore","84","52.070"],["b980e6ce","query","49","393.163"],["b8a03224","query","196","416.610"],["39365da1","query","77","422.694"],["38f4230b","query","133","346.452"],["38420c72","index","16","42.335"],["37247a19","query","128","537.703"],["b90fca82","query","339","438.997"],["b8f13334","explore","136","89.732"],["b835e95b","query","123","389.401"],["b888e833","explore","59","157.513"],["b90ce38e","explore","22","62.739"],["380edea5","explore","230","112.287"],["387bd683","welcome","37","28.894"],["b8a6645b","explore","86","123.312"],["b7a47e56","query","17","328.790"],["38749f05","query","52","412.377"],["b8a754d1","query","118","410.626"],["b90fca82","explore","134","100.029"],["386bb217","query","63","359.441"],["b7707626","query","35","422.598"],["38beeb4d","explore","196","88.945"],["b8a03224","explore","34","164.994"],["3895c490","query","86","306.132"],["392d18b2","query","62","381.364"],["3972909f","query","32","397.774"],["b90b46ff","explore","369","57.497"],["b78bf9a5","explore","22","198.984"],["b94525bf","welcome","83","27.708"],["38cae142","query","34","462.149"],["39152737","welcome","7","24.582"],["391e0466","explore","51","119.540"],["393c832e","explore","135","124.478"],["b90b128b","query","136","355.170"],["b712de52","explore","120","119.750"],["b7b4e7ac","","36",""],["392d18b2","welcome","7","30.643"],["b91c49f9","explore","65","76.710"],["39092208","query","55","460.506"],["39087f58","index","51","44.575"],["38420c72","explore","78","121.823"],["371b3e13","","10",""],["38dd6b90","index","31","65.343"],["38820dcb","index","9","65.045"],["b7608214","query","39","327.940"],["b9856d43","explore","48","68.884"],["3968d642","explore","248","70.888"],["b90fca82","explore","151","122.990"],["b81edf15","query","75","457.805"],["387bd683","welcome","92","39.564"],["37265bd1","explore","219","136.089"],["b8903a5b","welcome","62","35.692"],["b8971322","explore","127","49.303"],["37ac6a09","query","17","464.204"],["b8255a74","welcome","126","31.011"],["b8c1fc74","query","152","413.286"],["b8289f1a","index","6","43.489"],["b8f1bf15","index","12","52.539"],["b8ac8acd","index","4","15.090"],["3968d642","welcome","7","31.439"],["b7939ddb","query","17","423.708"],["b80fcf1d","query","106","408.166"],["34f12b30","","10",""],["b8e92871","index","15","29.020"],["38aa30c2","query","17","362.691"],["38b30542","","10",""],["b801e6e5","welcome","7","30.702"],["b7f7db07","query","39","342.636"],["b86c757d","query","251","472.095"],["393ef37f","query","121","268.309"],["385b96d4","","41",""],["3792ae33","welcome","72","29.709"],["b937fd4b","query","318","416.797"],["385d970c","explore","25","48.267"],["374a37eb","query","126","393.221"],["37c3eb17","query","27","401.698"],["3851b535","explore","95","106.418"],["377d4673","explore","116","151.678"],["38c7a130","query","23","295.640"],["39875084","query","124","394.078"],["3972909f","explore","22","55.454"],["382b613e","explore","127","112.116"],["b85081f3","explore","32","106.382"],["38b52594","query","63","377.972"],["38b52594","query","24","311.325"],["b8529553","explore","134","145.451"],["b81579d6","explore","120","85.555"],["b432dbc8","explore","189","120.856"],["b86c757d","explore","169","76.251"],["39875084","","134",""],["36f7fdad","query","69","242.308"],["391c9704","welcome","16","42.812"],["b8cb4c88","","93",""],["b80e549c","","100",""],["b9077d3a","explore","104","39.758"],["38f0a207","explore","72","61.665"],["b85f1c7f","query","224","418.801"],["b7276af1","","26",""],["385f952a","welcome","7","34.159"],["b8faab12","query","307","360.548"],["38c7a130","query","169","418.430"],["39087f58","index","33","39.301"],["3882d1ef","welcome","21","29.845"],["b8529553","welcome","42","32.138"],["38ebcacd","welcome","28","29.423"],["b8781981","query","97","460.775"],["39744ff2","explore","355","93.785"],["38cae142","explore","22","169.347"],["b938dc06","welcome","7","33.677"],["b82bcf61","","83",""],["392d18b2","","55",""],["b8583fdd","query","17","464.288"],["b81579d6","welcome","7","30.617"],["381e58d4","explore","135","192.670"],["b31efa97","welcome","11","38.841"],["39290817","query","72","296.212"],["b6a668ba","index","15","60.891"],["b74acf21","explore","100","149.472"],["b919a166","explore","22","109.718"],["b8255a74","query","256","425.975"],["384665e3","welcome","7","34.209"],["3913fdaf","query","131","371.195"],["371ef2ec","query","25","372.093"],["38948563","query","74","410.928"],["386139d9","explore","38","121.319"],["b88d8eb8","explore","36","123.651"],["b8ac2813","explore","150","124.408"],["b92d0688","explore","127","84.990"],["38c738d1","query","253","350.104"],["b805419d","query","17","544.627"],["38861a87","explore","445","218.461"],["b84c5c67","index","7","53.818"],["39035eea","","70",""],["36aa7870","welcome","30","25.193"],["b90ce38e","explore","31","98.607"],["38d49209","explore","132","193.302"],["38a7f88b","query","105","454.248"],["3836f29a","welcome","7","15.714"],["b78b2440","explore","367","206.957"],["38343e84","explore","176","147.918"],["385f952a","index","30","68.028"],["b91dabaf","query","45","410.991"],["3915cc59","explore","98","165.959"],["b9316463","welcome","64","28.988"],["b7474352","explore","51","125.426"],["39744ff2","welcome","45","17.512"],["b9098814","explore","22","125.457"],["3943830a","index","14","64.998"],["b8faab12","","10",""],["38f4c8db","query","26","433.337"],["391c9704","","121",""],["b7821e5c","index","8","76.808"],["3790a77c","explore","22","121.920"],["b31efa97","query","58","516.882"],["38d49209","query","132","395.599"],["38843b38","","10",""],["37494840","query","17","297.308"],["b8583fdd","welcome","11","48.326"],["b8971322","welcome","14","32.893"],["b7b4e7ac","explore","101","32.672"],["b8289f1a","index","25","47.997"],["39092208","query","17","407.758"],["38749f05","explore","213","151.852"],["384dc7aa","explore","107","84.073"],["b72f2109","query","171","394.998"],["b9552f4f","welcome","12","18.755"],["b78cd4cc","","27",""],["b93b8201","index","4","48.573"],["b92b2caf","index","28","42.509"],["b7339a70","index","15","64.426"],["38b537e4","welcome","48","51.851"],["b85f1c7f","welcome","32","32.340"],["387bd683","explore","33","96.753"],["b7de74ad","explore","22","91.349"],["b8ac8acd","index","16","82.478"],["390a94c6","query","44","351.786"],["b7a97dbb","explore","91","52.893"],["371ef2ec","query","46","504.858"],["b90ce463","welcome","16","22.187"],["3686429c","welcome","7","29.033"],["38e8ab3d","query","45","339.307"],["38b537e4","explore","61","127.342"],["38820dcb","query","260","392.496"],["b7aa9958","","90",""],["b8c875ac","welcome","36","39.220"],["b89da5c6","query","97","307.836"],["38cef8ac","query","164","337.682"],["b94b611d","welcome","77","35.904"],["38592e00","explore","100","167.838"],["b84ad865","explore","32","125.505"],["b8255a74","query","26","394.327"],["b809a459","welcome","75","24.470"],["b834e77f","explore","287","141.287"],["b8c875ac","welcome","7","43.073"],["b84c5c67","","10",""],["395b5e7b","explore","22","109.372"],["b919a166","explore","171","108.549"],["382b8a89","query","17","313.042"],["b8c875ac","query","24","366.319"],["b906df62","welcome","7","22.085"],["383204f1","query","71","384.007"],["b8a03224","explore","42","149.014"],["37d9801d","welcome","56","28.080"],["385823a9","query","24","359.900"],["b9005d0b","query","43","342.057"],["b85f1c7f","welcome","63","23.997"],["36349e28","explore","82","97.113"],["395b5e7b","explore","219","61.448"],["36653a24","welcome","14","33.497"],["b88ada11","index","35","55.745"],["b83524be","welcome","16","27.986"],["b8780b92","explore","132","133.758"],["37ac6a09","welcome","36","19.847"],["b8290074","query","51","428.200"],["38b23f71","welcome","16","22.140"],["37e71d7c","query","58","410.122"],["39035eea","welcome","8","32.684"],["b904a87b","query","24","432.292"],["37ac6a09","query","113","309.066"],["b8a03224","query","79","385.746"],["b80d45c6","explore","185","129.230"],["b90b128b","welcome","7","20.368"],["38ea393f","query","55","288.506"],["377d4673","query","167","371.296"],["392d18b2","explore","24","143.974"],["38dd6b90","explore","127","108.136"],["38adbc1c","explore","300","126.883"],["b94525bf","query","17","324.700"],["b8583fdd","query","17","339.538"],["385b6916","","35",""],["380494da","query","81","316.976"],["b8bf9af4","query","36","403.517"],["b8ea6996","explore","82","109.934"],["b834730b","query","66","394.833"],["380edea5","welcome","18","27.369"],["3790a77c","explore","53","111.749"],["375ad4d0","query","168","446.668"],["b8acc8e1","explore","224","101.377"],["b888e833","query","230","350.450"],["375ad4d0","query","35","366.119"],["b754f50b","index","4","37.304"],["374a37eb","query","117","348.581"],["b74acf21","query","28","368.191"],["38edbb55","explore","87","106.394"],["b94b611d","query","320","461.659"],["3883164c","query","86","286.278"],["b696bfa2","query","121","463.414"],["b84ad865","query","17","363.697"],["b8289f1a","welcome","132","28.820"],["b8045be3","query","70","318.724"],["3956dea1","explore","61","171.008"],["b7339a70","explore","31","157.059"],["b8bb3849","explore","32","72.332"],["b81579d6","query","115","476.857"],["b755da2b","query","17","341.518"],["b8cb4c88","welcome","47","27.985"],["39132f5c","","110",""],["b9101f6d","explore","94","89.599"],["36f7fdad","welcome","7","43.174"],["384665e3","explore","264","69.220"],["b89705a9","welcome","141","24.486"],["38539d8c","index","4","61.850"],["b7608214","query","23","471.856"],["b8b0892f","welcome","7","24.027"],["36653a24","welcome","8","40.676"],["b9122007","index","24","33.135"],["379d5ea8","query","17","380.356"],["b93477eb","explore","39","76.132"],["b8b0892f","query","17","400.733"],["38e8ab3d","","43",""],["392d18b2","query","269","361.377"],["b8c875ac","welcome","21","33.188"],["37383af0","welcome","156","28.238"],["b9324e4e","explore","616","52.586"],["385f952a","query","79","414.500"],["b890dc6a","welcome","11","20.343"],["379d5ea8","welcome","19","36.452"],["b81edf15","query","18","417.168"],["3882d1ef","index","15","35.205"],["b7821e5c","query","255","401.125"],["38f26220","query","17","414.405"],["385f952a","explore","41","117.962"],["b83524be","query","17","384.450"],["38beeb4d","query","21","414.956"],["386139d9","index","11","28.989"],["b80168ac","query","17","463.814"],["b754f50b","explore","69","135.844"],["3906759e","index","4","29.522"],["b8a6645b","query","86","461.332"],["387e5fd3","","50",""],["b808f9b5","query","62","392.167"],["3909e239","explore","142","93.678"],["b92d0688","explore","98","76.259"],["b88d8eb8","query","38","399.752"],["382b613e","query","146","422.189"],["b8ca7291","explore","142","44.208"],["36bf0d6a","query","17","303.958"],["394b68a5","index","4","29.007"],["b78b2440","query","175","350.387"],["b6633f1a","welcome","56","30.133"],["b90b46ff","explore","72","122.241"],["b9418299","","45",""],["b6f10532","explore","100","136.037"],["39035eea","query","17","258.003"],["38beeb4d","explore","172","131.040"],["b8ccfe2a","query","52","328.323"],["38868413","query","327","354.634"],["379d5ea8","explore","333","149.207"],["b7f4d0c1","welcome","11","28.628"],["388aadd7","query","25","471.076"],["3907e5b0","explore","36","70.776"],["b92b2caf","welcome","7","33.048"],["b8045be3","","80",""],["3917dd99","welcome","7","20.271"],["377d4673","explore","58","186.290"],["38447a00","explore","218","91.974"],["382b8a89","explore","201","125.120"],["b8acc8e1","welcome","26","39.356"],["3883164c","query","113","338.294"],["b7707626","query","334","257.050"],["b80fcf1d","welcome","38","29.833"],["38f8933d","query","22","403.903"],["b8beba55","query","20","373.942"],["3917dd99","index","4","58.096"],["38d6f36c","query","99","392.578"],["381e58d4","welcome","7","8.951"],["b86b60fc","query","17","400.918"],["38978417","explore","180","107.231"],["39372d62","explore","22","180.799"],["385b6916","query","53","419.610"],["b81f57a4","query","31","383.472"],["37ea0427","explore","22","120.767"],["38a5cc26","query","125","348.420"],["b8780b92","query","67","418.684"],["b933999c","explore","93","15.088"],["b9552f4f","welcome","81","23.893"],["b90b128b","explore","170","98.813"],["b810076c","query","299","344.232"],["b8045be3","index","4","16.194"],["b94b611d","explore","239","108.538"],["b712de52","welcome","7","13.494"],["b8529553","explore","506","54.392"],["382b8a89","welcome","47","25.817"],["3891f3e2","welcome","18","37.715"],["386139d9","query","95","342.708"],["b92a41bc","query","44","363.534"],["b80e549c","explore","22","107.908"],["b8255a74","welcome","7","24.907"],["b8529553","query","17","325.788"],["3851b535","welcome","52","23.624"],["b8045be3","welcome","24","33.857"],["b78139ab","welcome","7","11.169"],["b77f942a","","12",""],["37ea053c","query","17","364.402"],["38539d8c","query","123","280.853"],["b6979500","welcome","30","27.836"],["38948563","query","86","345.760"],["37c3eb17","query","17","479.777"],["b810076c","query","98","432.133"],["38d6f36c","","96",""],["38824d6d","query","38","393.456"],["379333c6","explore","22","172.239"],["b72d9375","welcome","7","33.954"],["b9106aff","query","17","324.319"],["b8d05715","query","39","366.165"],["b84ad865","welcome","22","43.097"],["387eb251","query","91","338.349"],["b938dc06","index","27","74.203"],["3956dea1","welcome","33","25.668"],["38aa30c2","query","17","300.383"],["b88d8eb8","","42",""],["b9856d43","explore","57","73.665"],["b7707626","explore","180","85.108"],["385823a9","","18",""],["b93477eb","query","17","527.020"],["b919a166","query","90","362.120"],["b9552f4f","index","10","47.886"],["38539d8c","explore","22","141.507"],["392d18b2","explore","67","122.867"],["395fce5f","welcome","8","29.989"],["b8780b92","","73",""],["b85081f3","explore","31","93.580"],["39769889","query","17","376.252"],["382b613e","query","67","187.564"],["39035eea","welcome","47","23.444"],["36f3e2b0","query","25","321.030"],["b712de52","welcome","19","16.834"],["b6e86a47","query","30","315.851"],["37d9801d","","242",""],["38a7f88b","query","75","339.436"],["36a3d2fe","query","87","375.293"],["377d4673","explore","76","65.992"],["b8bee8a9","welcome","42","34.510"],["38aa30c2","explore","22","106.649"],["381e58d4","query","85","408.633"],["385d970c","explore","22","174.507"],["3906759e","welcome","34","33.857"],["b896dfeb","query","432","339.890"],["387e5fd3","query","167","364.628"],["b9893bc9","query","164","346.559"],["3882c89c","welcome","21","26.510"],["371ef2ec","index","52","58.817"],["b940c33b","query","17","444.709"],["39092208","","186",""],["b82bcf61","explore","54","117.714"],["386bb217","welcome","155","34.563"],["b81dde6c","welcome","10","43.343"],["388aadd7","query","92","317.431"],["38ded491","query","350","494.627"],["b8780b92","explore","62","108.400"],["38f8933d","explore","22","112.307"],["3909e239","explore","67","124.010"],["b9856d43","index","71","45.944"],["b9316463","index","11","77.482"],["38f0a207","query","239","324.212"],["b830c67c","query","58","429.101"],["b80fcf1d","query","56","344.379"],["b8289f1a","explore","207","136.617"],["b80d45c6","welcome","34","37.112"],["b7210d82","query","53","398.655"],["b6979500","welcome","31","33.972"],["b902786e","query","17","420.303"],["b7a97dbb","explore","75","168.164"],["b89705a9","explore","22","137.132"],["394b68a5","","11",""],["b78139ab","welcome","69","34.310"],["38b537e4","explore","66","120.397"],["b8fdf6d5","query","119","383.099"],["b834730b","query","17","408.785"],["b85c022e","query","24","248.639"],["b91dabaf","explore","249","93.065"],["3596f875","query","38","319.749"],["b8f13334","query","147","411.068"],["b8c67786","explore","43","42.367"],["384dc7aa","welcome","7","20.061"],["38adbc1c","index","19","32.995"],["b938dc06","welcome","36","31.343"],["b93477eb","explore","22","104.749"],["b8834bbe","query","147","226.977"],["39290817","welcome","7","24.666"],["3792ae33","welcome","11","25.475"],["b8ca7291","index","4","69.628"],["b72d9375","query","86","399.902"],["b6f10532","query","62","476.797"],["38c09959","explore","105","129.091"],["b919a166","query","433","399.898"],["38749f05","explore","243","68.117"],["b8529553","welcome","92","29.379"],["b7aefa94","explore","22","122.117"],["b8c1fc74","query","54","373.232"],["36aa7870","explore","123","82.645"],["39769889","query","17","390.891"],["38861a87","index","4","68.311"],["b74acf21","explore","127","182.922"],["392d18b2","query","215","343.240"],["b83857e0","query","87","299.762"],["b86b60fc","","104",""],["b834e77f","query","66","367.256"],["b81579d6","query","72","255.279"],["b8ea6996","welcome","184","23.468"],["b7939ddb","explore","22","104.138"],["36aa7870","query","29","290.349"],["3907e5b0","query","64","337.249"],["385b96d4","explore","31","113.615"],["b92b2caf","","109",""],["b72f231c","welcome","19","34.221"],["3851b535","query","67","426.667"],["38e85a88","index","12","59.240"],["38b23f71","","15",""],["38d6f36c","welcome","8","30.793"],["b888e833","query","33","482.611"],["b8f1bf15","explore","232","155.642"],["38cae142","explore","24","136.198"],["38824d6d","query","43","355.488"],["b7aa9958","query","150","446.000"],["b8cadf66","query","17","333.007"],["396197d3","index","73","58.124"],["38861a87","query","193","397.801"],["388aadd7","explore","83","160.757"],["3792ae33","query","294","384.586"],["390d2410","explore","384","157.855"],["b8faab12","welcome","7","18.972"],["b8cb4c88","welcome","95","19.849"],["379d5ea8","query","101","454.023"],["37247a19","query","74","213.521"],["382b613e","explore","99","93.054"],["b808f9b5","explore","82","62.627"],["b9b22f3d","query","26","393.089"],["393c832e","query","17","369.086"],["382f4c24","welcome","20","33.243"],["3600fd8c","welcome","41","31.537"],["b8ea6996","query","242","357.194"],["387eb251","query","26","407.509"],["38d9a089","query","65","427.700"],["b80e549c","query","114","304.546"],["b8834bbe","","12",""],["b902786e","query","615","371.903"],["38a57213","explore","561","58.051"],["3686429c","explore","252","102.478"],["b8290074","query","171","414.889"],["38e60476","explore","22","47.887"],["b87ea259","explore","95","158.630"],["38a7f88b","query","24","351.826"],["b8c1fc74","query","44","495.340"],["387bd683","explore","59","50.456"],["b805419d","explore","183","120.321"],["b8beba55","query","246","337.363"],["b85f1c7f","explore","22","130.928"],["39092208","welcome","19","29.475"],["b9856d43","","74",""],["38a86427","welcome","33","43.961"],["b78bf9a5","query","68","304.166"],["38d95664","query","176","428.383"],["b78cd4cc","query","58","416.390"],["b8bb9d02","explore","86","171.572"],["391c9704","welcome","7","28.805"],["390a94c6","welcome","8","32.826"],["38ebcacd","query","181","398.899"],["b85081f3","query","39","366.599"],["b805419d","welcome","76","21.114"],["b8bab8ec","explore","30","115.617"],["b6633f1a","query","56","358.093"],["b901a7bb","query","148","299.795"],["b7fc776f","query","161","327.248"],["b9856d43","explore","186","73.603"],["38d9a089","query","59","441.393"],["b8903a5b","explore","22","170.404"],["3913fdaf","query","100","359.135"],["b696bfa2","welcome","115","28.868"],["b80b6056","explore","22","134.025"],["38f4c8db","","22",""],["390d2410","","10",""],["b9106aff","welcome","7","32.980"],["b80d45c6","explore","24","88.897"],["b8b22c28","explore","22","119.520"],["b90fca82","query","60","350.471"],["39152737","query","64","332.246"],["37c3eb17","query","89","350.563"],["b948b6f9","explore","22","83.017"],["38592e00","index","23","8.373"],["b795879c","query","67","487.560"],["3686429c","query","77","398.316"],["38400295","","127",""],["b919dc4a","index","4","40.229"],["b90182be","explore","22","91.728"],["b8ac2813","query","80","470.060"],["38c7a130","welcome","22","26.635"],["b7474352","welcome","52","42.199"],["b81579d6","index","4","40.088"],["39365da1","query","153","407.751"],["b712de52","query","17","440.803"],["38f8933d","query","243","430.425"],["38539d8c","query","93","316.348"],["b8ad224b","index","38","67.080"],["38f8933d","index","5","25.253"],["38adbc1c","explore","407","138.436"],["b8bf9af4","query","180","490.237"],["36653a24","welcome","156","39.065"],["b7707626","query","65","369.137"],["38ea393f","index","4","42.436"],["b432dbc8","index","27","55.218"],["3882c89c","query","17","338.612"],["b90182be","query","62","391.736"],["379d5ea8","welcome","46","30.387"],["3900e284","explore","81","109.274"],["b8a1e1e5","explore","22","124.798"],["b712de52","explore","151","111.074"],["b94b611d","query","285","471.254"],["b726fc97","query","34","316.454"],["39372d62","explore","297","82.894"],["37c3532d","index","14","29.715"],["387bd683","query","284","304.050"],["b8781981","welcome","13","26.260"],["39875084","index","6","66.049"],["b7608214","query","78","334.029"],["b8583fdd","query","17","302.024"],["b7707626","query","60","336.126"],["381e3950","query","80","348.052"],["b9418299","explore","39","112.000"],["3900e284","query","155","377.767"],["b8e22a2e","welcome","16","25.736"],["b80a0db4","explore","28","59.353"],["b93477eb","welcome","15","39.571"],["36f7fdad","welcome","32","27.068"],["b7e4ccd5","query","20","380.367"],["381e3950","","34",""],["39035eea","query","46","334.159"],["371ef2ec","query","69","412.829"],["38592e00","query","45","346.796"],["b904a87b","query","166","421.825"],["b81579d6","","49",""],["b78bf9a5","explore","73","58.967"],["383204f1","","86",""],["b8c67786","","64",""],["b8781981","query","64","483.443"],["38843b38","query","99","278.478"],["b93b8201","query","195","340.833"],["b85c022e","","99",""],["38d49209","","231",""],["b8cb4c88","query","65","436.508"],["b8c1fc74","explore","22","82.416"],["396197d3","explore","95","113.698"],["38749f05","query","84","287.550"],["b8ea6996","explore","90","40.043"],["b905f518","explore","193","136.221"],["38a86427","query","100","377.479"],["3933a80e","explore","57","162.238"],["b7f7db07","welcome","40","29.747"],["389fde1c","","10",""],["b8cf3b88","explore","429","147.692"],["b7939ddb","explore","22","185.277"],["b8c1fc74","query","106","338.224"],["38978417","query","84","342.575"],["37e71d7c","query","97","430.303"],["b89da5c6","welcome","7","32.975"],["38ebcacd","index","4","60.349"],["b8529553","explore","22","92.503"],["387e5fd3","explore","164","116.946"],["b8bf9af4","query","156","339.432"],["387e5fd3","explore","76","104.579"],["38cef8ac","explore","22","154.767"],["b83857e0","explore","26","131.989"],["b80b6056","welcome","13","26.768"],["3909e239","index","42","28.750"],["38749f05","","143",""],["b9005d0b","explore","226","93.784"],["384665e3","index","4","66.925"],["b8acc8e1","query","216","373.444"],["b9122007","query","45","436.270"],["38400295","explore","133","180.406"],["37c3eb17","welcome","40","32.721"],["b85f1c7f","welcome","10","20.811"],["b80e549c","query","17","396.734"],["39769889","index","22","49.217"],["393c832e","","10",""],["38368d7e","explore","248","105.653"],["b8290074","explore","95","88.237"],["3819d95d","query","17","305.614"],["374b43a9","query","30","324.015"],["b8ad224b","query","32","483.087"],["b81f57a4","explore","22","130.130"],["b8cadf66","","10",""],["b904a87b","explore","73","106.092"],["379333c6","welcome","89","28.329"],["b948b6f9","query","36","331.094"],["38f8933d","explore","153","141.139"],["b8246fe0","explore","108","110.499"],["381e3950","query","53","293.818"],["39290817","query","75","331.521"],["38b52594","explore","249","115.684"],["38c09959","query","17","436.888"],["38a5cc26","welcome","7","35.948"],["b94525bf","welcome","7","42.713"],["389fde1c","query","38","349.162"],["b8bab8ec","query","194","397.876"],["b80168ac","query","17","502.807"],["b8e92871","","33",""],["b8781981","","10",""],["363d3fbf","query","168","339.520"],["38539d8c","query","76","384.542"],["385d970c","","10",""],["39744ff2","query","17","385.839"],["b9893bc9","query","263","363.588"],["b84c5c67","query","17","460.242"],["b5e7f657","","18",""],["b7474352","query","17","422.142"],["b896dfeb","query","175","330.345"],["b8ac2813","query","38","345.181"],["b432dbc8","explore","74","111.207"],["394fc6e8","query","28","295.608"],["37d8b9ed","explore","22","78.011"],["b8a0d52a","query","70","285.989"],["b75759c1","welcome","13","28.268"],["b755da2b","welcome","15","23.974"],["38f26220","query","125","389.608"],["b88d8eb8","query","111","351.625"],["391e0466","query","17","422.734"],["b81dde6c","index","9","52.322"],["38d49209","welcome","9","27.571"],["38d7936e","welcome","7","24.608"],["b89f8df2","welcome","11","17.720"],["38749f05","query","17","352.396"],["3968d642","","53",""],["38e8ab3d","","99",""],["38d6f36c","explore","77","94.677"],["b8bb9d02","explore","98","14.324"],["393c832e","explore","22","55.031"],["379333c6","welcome","47","33.288"],["b90182be","welcome","7","15.514"],["b919a166","index","24","35.210"],["37c3532d","index","4","60.556"],["b7f7db07","welcome","39","19.994"],["b7a97dbb","query","61","384.483"],["388aadd7","query","90","330.619"],["3956dea1","query","77","265.465"],["b6633f1a","welcome","20","20.071"],["b906df62","welcome","7","43.114"],["385823a9","query","70","308.767"],["38a5cc26","query","140","387.241"],["38ea393f","query","17","448.613"],["b7f7db07","welcome","37","30.022"],["38824d6d","query","64","340.201"],["39132f5c","query","17","303.521"],["38d7936e","welcome","72","14.709"],["b8c1fc74","explore","22","96.164"],["b8c875ac","","10",""],["b938dc06","query","17","311.326"],["390d2410","","10",""],["b8da5ce2","index","11","27.779"],["b9893bc9","query","253","419.186"],["3891f3e2","explore","427","61.556"],["38824d6d","query","19","431.776"],["37d9801d","explore","264","118.858"],["38d9a089","explore","58","124.231"],["b80fcf1d","welcome","15","32.957"],["b88d8eb8","index","4","44.528"],["388aadd7","query","17","415.590"],["b8f3e8b9","","10",""],["b893f1e9","explore","22","113.344"],["385b341d","welcome","23","25.090"],["b901e1ee","explore","22","74.446"],["37c3532d","","35",""],["37ea053c","query","182","462.860"],["385d970c","","22",""],["b919a166","welcome","40","44.290"],["b86b60fc","welcome","15","16.422"],["36a3d2fe","welcome","75","25.986"],["b31efa97","query","31","336.953"],["b890dc6a","index","11","49.125"],["b80a0db4","query","180","326.585"],["b8e22a2e","","44",""],["38d6f36c","query","118","373.335"],["38aa30c2","welcome","7","31.652"],["3906759e","query","31","472.957"],["b9101f6d","welcome","53","36.882"],["b80a0db4","index","24","52.677"],["39035eea","explore","703","41.635"],["37dadc3e","query","139","396.183"],["3946238e","explore","22","119.701"],["371ef2ec","index","5","48.296"],["36f7fdad","query","109","436.549"],["3822edba","query","39","427.939"],["37c3532d","welcome","34","32.242"],["34f12b30","explore","22","118.067"],["b901e1ee","","52",""],["b696bfa2","welcome","48","41.202"],["38824d6d","query","113","411.119"],["b8a70c57","explore","25","108.838"],["b81579d6","welcome","17","38.835"],["385823a9","query","246","366.495"],["b82af9b9","welcome","43","19.586"],["b8f3e8b9","","44",""],["3900e284","welcome","7","37.871"],["393c832e","query","81","408.939"],["b8ea6996","explore","324","105.090"],["38a5cc26","explore","333","59.543"],["b85081f3","query","113","342.746"],["374b43a9","query","187","306.908"],["b5e7f657","","54",""],["3895c490","query","187","416.807"],["38447a00","explore","133","5.264"],["38b45947","explore","147","130.822"],["38ea393f","query","236","319.376"],["b90fca82","query","133","265.101"],["38e8ab3d","explore","304","71.482"],["3915cc59","index","50","56.733"],["386139d9","welcome","17","18.674"],["b901a7bb","welcome","81","18.557"],["3606bab5","query","17","304.511"],["b7aa9958","index","19","59.633"],["b8a0d52a","query","17","367.963"],["b8cf3b88","query","20","384.333"],["b937fd4b","query","18","490.877"],["3907e5b0","query","17","347.724"],["38ea393f","index","15","55.532"],["b7210d82","index","11","27.223"],["b714dc46","query","42","308.209"],["37c3eb17","query","60","483.155"],["b9098814","welcome","12","26.443"],["38820dcb","explore","248","36.007"],["b8bab8ec","query","211","421.828"],["386c41b3","welcome","133","11.612"],["b78bf9a5","explore","40","166.348"],["37494840","welcome","7","22.659"],["3946238e","welcome","138","29.175"],["385d970c","query","46","368.827"],["b8fdf6d5","welcome","15","19.703"],["b8781981","welcome","32","28.551"],["39035eea","","10",""],["396197d3","welcome","8","19.476"],["38e85a88","query","140","357.469"],["b754f50b","explore","26","95.812"],["b90fca82","welcome","59","42.320"],["384dc7aa","query","38","427.875"],["b830c67c","query","34","320.576"],["b8a1e1e5","welcome","40","29.661"],["b8cf3b88","explore","211","112.888"],["b8bb9d02","welcome","7","37.849"],["b8cadf66","index","21","36.602"],["b7fc776f","welcome","27","28.023"],["38b96a95","explore","49","126.186"],["b82af9b9","index","4","39.805"],["38d6f36c","query","17","427.095"],["3972909f","index","4","29.318"],["b90fca82","index","6","53.514"],["386e6d49","query","100","382.547"],["b77f942a","query","287","381.616"],["38e8ab3d","query","106","412.285"],["374a37eb","","10",""],["b7de74ad","welcome","74","35.383"],["b5e7f657","query","30","328.718"],["38749f05","explore","61","175.929"],["38b23f71","explore","147","179.228"],["b94b611d","query","24","420.372"],["38ea393f","index","22","37.671"],["b8f13334","","10",""],["b696bfa2","welcome","11","41.836"],["381e3950","","99",""],["b8e8b49d","","11",""],["b8c67786","query","71","406.257"],["b78139ab","welcome","11","45.321"],["b8d7bdee","explore","187","119.003"],["377d4673","query","47","430.495"],["36653a24","query","88","420.004"],["37383af0","explore","22","147.353"],["b6a668ba","query","30","319.916"],["b6979500","welcome","10","35.584"],["38343e84","welcome","7","29.196"],["37af77a3","query","71","389.779"],["38820dcb","query","138","333.399"],["37c3532d","explore","60","56.586"],["b7a47e56","query","146","443.242"],["b9101f6d","query","91","488.545"],["b901e1ee","query","177","546.902"],["b8e8b49d","query","33","387.384"],["b80168ac","query","203","406.704"],["b8ccfe2a","explore","71","107.764"],["389fde1c","","17",""],["b82af9b9","index","50","27.021"],["374a37eb","query","17","365.353"],["39087f58","query","17","473.131"],["b938dc06","welcome","170","26.210"],["393ef37f","explore","88","105.325"],["b93477eb","explore","22","126.793"],["394b68a5","query","126","371.118"],["3891da7b","index","4","74.656"],["b808f9b5","explore","22","58.727"],["b906df62","index","19","40.127"],["b6633f1a","welcome","47","26.679"],["b8d7bdee","query","17","391.177"],["386c41b3","","53",""],["386c41b3","explore","22","83.526"],["39152737","query","197","354.474"],["b805419d","index","47","20.112"],["38400295","welcome","7","17.988"],["38c09959","","70",""],["39087f58","welcome","14","30.065"],["b80fcf1d","explore","40","219.916"],["393ef37f","explore","80","52.627"],["b7210d82","index","5","71.687"],["38d6f36c","query","185","361.843"],["b9005d0b","query","64","366.170"],["34f12b30","query","19","396.225"],["b80d45c6","explore","156","137.851"],["b90182be","explore","101","81.561"],["b75759c1","explore","83","60.035"],["b8ca7291","","120",""],["379333c6","welcome","17","32.187"],["b8f1bf15","query","147","322.274"],["b834730b","welcome","12","20.106"],["38978417","explore","152","13.214"],["b714dc46","","37",""],["b980e6ce","explore","22","195.218"],["b8fdf6d5","query","170","399.924"],["384dc7aa","query","53","408.444"],["38539d8c","index","20","39.262"],["395b5e7b","query","196","379.928"],["3836f29a","","43",""],["b9418299","query","175","347.686"],["b726fc97","query","78","396.537"],["b8e8b49d","index","4","51.819"],["b84c5c67","query","65","404.194"],["38b45947","welcome","7","34.996"],["b9005d0b","welcome","7","22.737"],["391c9704","query","374","291.535"],["b87ea259","explore","28","98.884"],["387eb251","explore","161","64.009"],["b8cb4c88","query","201","430.921"],["3943830a","query","109","336.186"],["b8f13334","explore","50","86.983"],["388aadd7","query","138","412.194"],["b78cd4cc","explore","31","157.497"],["388aadd7","query","49","274.231"],["b696bfa2","","16",""],["390c3cec","query","35","461.835"],["3907e5b0","explore","681","146.615"],["b8bb3849","query","31","273.759"],["39087f58","welcome","17","41.121"],["b8f1345d","query","182","278.894"],["b7de74ad","welcome","94","21.497"],["387eb251","explore","22","84.877"],["39132f5c","index","12","45.069"],["37d9801d","query","56","408.968"],["b8a1e1e5","explore","140","149.701"],["38d7936e","welcome","35","29.528"],["3792ae33","explore","59","39.558"],["b880c13a","query","223","398.980"],["b933999c","welcome","13","22.234"],["b93b8201","query","184","366.409"],["b7f7db07","explore","187","70.142"],["b7968805","query","17","345.433"],["b80168ac","query","77","376.140"],["38a7f88b","query","132","493.513"],["38b45947","query","22","468.058"],["b6979500","query","135","252.599"],["b805419d","explore","46","111.600"],["b830c67c","welcome","16","29.784"],["b7c012a8","query","49","420.332"],["38c738d1","welcome","40","13.142"],["38f4230b","explore","22","110.083"],["3600fd8c","explore","22","163.942"],["383204f1","explore","22","138.506"],["b8319d86","index","13","77.728"],["b8f3e8b9","query","96","355.655"],["383c44cb","explore","26","88.437"],["b808f9b5","explore","35","182.614"],["382f9c89","query","114","423.141"],["3920dfb4","index","41","75.593"],["b83857e0","welcome","36","25.678"],["b8bee8a9","explore","141","118.790"],["38afab8e","query","139","382.122"],["b940c33b","welcome","110","27.639"],["393c832e","welcome","17","30.931"],["b8d05715","query","134","439.118"],["3606bab5","welcome","8","29.252"],["b938dc06","explore","29","73.036"],["b9324e4e","explore","131","164.752"],["b8ac2813","welcome","95","30.122"],["b6979500","welcome","16","10.273"],["b904a87b","query","51","303.291"],["b805419d","","10",""],["382ff46f","explore","22","194.669"],["b93477eb","query","192","368.819"],["b8a754d1","query","63","370.996"],["b82bcf61","explore","22","185.928"],["b8a03224","query","32","478.795"],["37c3eb17","query","31","407.403"],["394fc6e8","","17",""],["b9324e4e","explore","193","111.892"],["37ac6a09","explore","42","91.816"],["385b341d","explore","22","157.775"],["b5e7f657","","16",""],["383c44cb","query","30","265.398"],["b8326597","index","43","45.969"],["36a3d2fe","welcome","43","30.351"],["b8d05715","query","25","261.635"],["375ad4d0","welcome","112","19.740"],["379fe829","query","75","434.752"],["b7f4d0c1","query","158","431.926"],["39372d62","query","144","239.120"],["b81579d6","query","366","451.076"],["b95d95b8","index","13","66.325"],["37247a19","query","50","402.143"],["37dadc3e","query","54","423.607"],["b9893bc9","welcome","11","26.905"],["b75759c1","query","17","415.315"],["b8903a5b","query","106","392.324"],["385823a9","","72",""],["b8e22a2e","index","21","33.315"],["b432dbc8","explore","296","155.264"],["38e8ab3d","","56",""],["38f8933d","explore","22","202.086"],["38d6f36c","welcome","7","15.704"],["b830c67c","index","23","71.725"],["b7d7b5f5","query","24","308.104"],["b890dc6a","query","23","362.426"],["38c738d1","welcome","7","28.950"],["37d701af","explore","60","111.232"],["b8b0892f","query","31","336.596"],["38d6f36c","query","202","359.656"],["39083a44","welcome","17","29.233"],["b86c757d","welcome","31","24.142"],["b805419d","explore","22","120.592"],["36349e28","explore","105","3.384"],["b88d8eb8","explore","295","90.877"],["b712de52","welcome","33","28.621"],["38e85a88","query","166","467.089"],["b8529553","query","126","408.293"],["36bf0d6a","query","65","362.629"],["b83857e0","query","39","349.074"],["38ebcacd","welcome","46","32.975"],["b810076c","query","130","354.597"],["37494840","query","56","385.231"],["38d6f36c","welcome","7","28.172"],["b77f942a","explore","25","145.757"],["b88d8eb8","index","4","29.019"],["b8cb4c88","query","269","436.822"],["386bb217","explore","46","129.937"],["3956dea1","query","106","383.139"],["b8a70c57","query","17","322.841"],["b81f57a4","query","22","393.655"],["38e8ab3d","query","134","306.883"],["381dc7c6","explore","22","64.340"],["b8a6645b","query","276","402.162"],["b88d8eb8","query","152","353.338"],["b7210d82","query","154","416.703"],["b9098814","query","17","362.715"],["b7de74ad","query","230","409.076"],["b8cf3b88","query","141","390.665"],["38edbb55","query","268","355.378"],["38beeb4d","explore","54","120.235"],["b80a0db4","query","17","355.609"],["38861a87","explore","50","82.326"],["3819d95d","welcome","42","20.827"],["3891f3e2","query","26","414.296"],["b78139ab","index","23","42.606"],["39365da1","query","17","452.507"],["b52a98aa","explore","235","164.701"],["390d2410","","90",""],["b84c5c67","welcome","53","32.424"],["b8a03224","explore","68","64.487"],["b80168ac","welcome","66","41.510"],["b696bfa2","query","72","421.893"],["b830c67c","index","4","45.390"],["39132f5c","explore","22","116.936"],["3606bab5","query","235","297.142"],["b8ca7291","welcome","14","24.774"],["b80b6056","query","17","376.987"],["3943830a","explore","245","141.358"],["379fe829","explore","144","124.890"],["3946238e","explore","290","14.492"],["b8583fdd","query","364","414.072"],["b8b0892f","query","40","364.829"],["386139d9","query","17","430.021"],["b8beba55","explore","38","131.047"],["b80e549c","welcome","23","27.932"],["383c44cb","welcome","66","17.752"],["b77f942a","explore","46","127.214"],["b7d7b5f5","","39",""],["b8c875ac","welcome","7","39.499"],["b72d9375","query","17","431.894"],["b7894aac","query","75","326.424"],["38820dcb","explore","136","80.261"],["b8290074","index","31","48.768"],["3907e5b0","welcome","11","23.552"],["37d9801d","query","32","483.598"],["b8f13334","query","114","338.816"],["385b341d","query","52","353.890"],["b8290074","query","36","408.128"],["b834e77f","welcome","44","27.998"],["38b537e4","query","104","393.105"],["b9005d0b","explore","64","83.404"],["b7352e58","explore","128","99.061"],["36ce2e37","explore","298","54.180"],["b82bcf61","query","86","352.990"],["38edbb55","query","19","320.067"],["34f12b30","welcome","49","34.014"],["39152737","index","73","39.309"],["b789800a","index","19","27.892"],["38400295","query","58","359.460"],["38f4230b","index","8","83.072"],["b88d8eb8","explore","81","44.396"],["363d3fbf","query","21","344.870"],["37d701af","explore","185","166.475"],["b8acc8e1","query","96","378.697"],["b94525bf","welcome","141","29.022"],["38cae142","welcome","47","31.183"],["b90b46ff","","32",""],["b8bb9d02","index","5","49.660"],["b940c33b","query","86","446.049"],["b919dc4a","explore","402","136.176"],["38b52594","welcome","7","23.982"],["b881be6d","index","7","37.107"],["38749f05","query","121","371.882"],["b847bf23","explore","47","115.010"],["384665e3","index","50","47.575"],["38da8baa","query","17","386.113"],["b9316463","query","17","456.823"],["38edbb55","welcome","43","42.307"],["38f26220","query","77","442.476"],["b8bee8a9","welcome","8","31.273"],["391c9704","","13",""],["b81dde6c","query","304","436.612"],["38c738d1","welcome","7","21.880"],["38beeb4d","query","17","448.254"],["3882c89c","explore","97","106.224"],["b85f1c7f","explore","47","190.571"],["b78b2440","welcome","7","28.332"],["b905f518","query","41","363.221"],["b82f8b2a","index","4","50.230"],["b80e549c","query","17","436.063"],["b85081f3","query","17","278.157"],["b80b6056","query","54","360.872"],["36f7fdad","welcome","20","43.991"],["38c09959","query","17","392.036"],["b755da2b","explore","65","124.203"],["b89f8df2","explore","168","104.844"],["b82f8b2a","query","284","279.002"],["b8c875ac","explore","115","119.769"],["b72f231c","query","24","357.582"],["b8d7bdee","explore","64","83.335"],["b901e1ee","query","368","515.373"],["38f26220","","115",""],["37afb00b","welcome","7","24.201"],["393c832e","query","277","427.253"],["38ebcacd","welcome","19","20.544"],["36f3e2b0","query","129","261.936"],["b905f518","explore","28","187.844"],["b901a7bb","query","17","490.949"],["36a3d2fe","explore","265","111.919"],["393c832e","explore","322","69.875"],["38592e00","query","52","421.879"],["b901a7bb","query","99","338.481"],["386c41b3","query","17","382.226"],["38420c72","","70",""],["392d18b2","query","29","432.126"],["386139d9","query","275","386.572"],["38afab8e","explore","22","158.415"],["38d49209","query","152","423.618"],["387e5fd3","explore","90","97.340"],["37eb2fcd","query","64","432.587"],["b8ac8acd","explore","22","88.431"],["b86c757d","","47",""],["36f7fdad","query","21","350.684"],["b8f3e8b9","explore","49","78.391"],["b8c875ac","query","174","409.743"],["b80b6056","welcome","18","39.767"],["38d7936e","explore","32","99.251"],["b88d8eb8","explore","45","17.441"],["38b537e4","explore","84","75.109"],["b85081f3","","11",""],["38820dcb","explore","172","19.993"],["b809a459","query","133","457.729"],["b8045be3","welcome","109","39.035"],["38d49209","query","17","219.975"],["b8bf9af4","query","257","358.454"],["b8246fe0","query","57","362.720"],["3796f292","explore","22","121.895"],["b52a98aa","index","17","11.261"],["b8289f1a","query","149","383.964"],["b940c33b","index","4","33.006"],["b8ac2813","query","22","360.226"],["391e0466","query","34","421.919"],["b8971322","welcome","7","28.729"],["b7968805","index","4","69.680"],["38420c72","explore","59","150.561"],["b94525bf","query","37","410.517"],["38da8baa","query","56","490.012"],["b88d8eb8","index","6","29.270"],["38820dcb","explore","206","140.582"],["b9324e4e","query","84","378.494"],["387c10ce","explore","22","65.551"],["38e85a88","explore","591","87.700"],["b919a166","query","41","415.843"],["3819d95d","welcome","74","15.626"],["37d9801d","explore","25","131.289"],["b80b6056","query","166","341.922"],["b9098814","explore","138","136.915"],["b77f942a","welcome","20","34.322"],["b78b2440","query","39","464.695"],["b7ef02de","query","17","436.704"],["b78bf9a5","index","21","51.818"],["b8faab12","explore","22","17.290"],["b8acc8e1","welcome","19","26.156"],["b7b4e7ac","query","142","326.486"],["38b537e4","","67",""],["b80d45c6","welcome","7","27.544"],["3891da7b","welcome","7","28.602"],["b92a41bc","index","10","47.015"],["3606bab5","welcome","50","26.862"],["b7352e58","query","89","366.914"],["b8beba55","query","84","466.711"],["b78cd4cc","explore","157","83.706"],["b7f7db07","index","8","62.573"],["b8a0d52a","explore","100","81.483"],["b9316463","explore","58","99.348"],["b88ada11","index","27","55.045"],["b8290074","explore","112","75.010"],["386139d9","welcome","31","38.911"],["b9122007","explore","304","160.888"],["b8583fdd","","10",""],["b940c33b","query","139","445.761"],["38f4230b","query","89","389.792"],["b8e92871","welcome","35","49.135"],["b8ac8acd","explore","130","96.068"],["b7f4d0c1","welcome","31","28.202"],["39087f58","query","76","373.763"],["b8a6645b","query","33","427.100"],["b7a97dbb","index","17","35.061"],["b89f8df2","index","8","18.567"],["38b30542","query","40","440.896"],["36aa7870","query","17","490.774"],["38b45947","index","64","50.177"],["38420c72","explore","250","104.262"],["38b52594","query","41","539.443"],["b9856d43","query","130","323.567"],["374a37eb","index","22","59.481"],["b8d05715","query","17","430.558"],["38dd6b90","query","114","351.737"],["36349e28","explore","108","68.653"],["37c3532d","explore","127","119.229"],["b8c875ac","explore","37","75.591"],["379fe829","query","586","301.191"],["39092208","","77",""],["b919a166","explore","22","126.101"],["b8f3e8b9","query","63","478.721"],["3790a77c","explore","22","100.839"],["382b613e","explore","51","114.540"],["b7474352","","10",""],["b92a41bc","query","62","347.189"],["b9893bc9","query","91","512.517"],["b80fcf1d","explore","114","136.413"],["3606bab5","query","37","371.537"],["b7e4ccd5","query","241","437.138"],["38c09959","index","42","53.124"],["3882d1ef","welcome","10","19.969"],["b8326597","welcome","7","29.308"],["38861a87","query","24","391.674"],["b8bb9d02","explore","99","106.688"],["b937fd4b","explore","34","55.382"],["b7b4e7ac","explore","22","82.935"],["385d970c","explore","22","114.595"],["b8289f1a","query","51","369.076"],["3909e239","","96",""],["b8bab8ec","query","32","379.965"],["3943830a","query","17","470.017"],["38da8baa","welcome","13","35.186"],["381dc7c6","welcome","52","26.171"],["b8cb4c88","explore","28","109.281"],["b8780b92","query","85","491.648"],["38e85a88","welcome","23","41.023"],["379d5ea8","query","117","312.111"],["386bb217","explore","48","144.484"],["b82f8b2a","query","32","479.877"],["3883164c","query","17","425.065"],["b8045be3","explore","119","127.560"],["36f7fdad","index","24","57.689"],["b90b128b","query","327","415.038"],["37a768f1","query","17","345.982"],["39132f5c","query","26","464.732"],["387c10ce","","30",""],["b8971322","explore","50","129.840"],["b9418299","index","4","42.195"],["3836f29a","","36",""],["b7894aac","","10",""],["38b23f71","query","17","386.678"],["b904a87b","query","84","364.418"],["382f4c24","query","96","254.583"],["385b96d4","explore","93","141.142"],["b8a1e1e5","index","15","77.699"],["b8b0892f","query","78","355.711"],["391b2370","explore","22","79.329"],["3972909f","explore","104","86.275"],["37383af0","query","123","269.147"],["390c3cec","explore","241","36.546"],["39372d62","explore","529","84.572"],["37d8b9ed","query","29","447.492"],["3790a77c","query","54","467.964"],["385b341d","welcome","25","22.026"],["b80d45c6","query","178","391.780"],["38d7936e","explore","36","43.956"],["38a5cc26","query","247","393.849"],["b789800a","explore","39","47.108"],["386bb217","query","86","312.572"],["b91c49f9","query","79","432.677"],["b8bb3849","query","28","475.796"],["3946238e","query","17","375.177"],["b9098814","welcome","7","27.144"],["b937fd4b","query","54","404.909"],["391b2370","query","17","285.263"],["b80a0db4","query","44","261.426"],["b8a1e1e5","index","10","43.802"],["b805419d","query","158","340.239"],["b893f1e9","","10",""],["385b6916","query","287","497.905"],["38da8baa","explore","198","146.823"],["379d5ea8","","41",""],["374a37eb","query","38","430.528"],["3956dea1","index","15","46.251"],["b7339a70","query","17","338.520"],["b91dabaf","index","20","45.083"],["b834e77f","query","17","423.017"],["374b43a9","query","26","360.542"],["b8e8b49d","","19",""],["b8ca7291","query","26","390.957"],["393ef37f","explore","135","105.851"],["b810076c","query","55","301.920"],["36ce2e37","welcome","10","36.544"],["37265bd1","explore","46","107.845"],["38d6f36c","query","363","299.328"],["b8529553","","62",""],["b80168ac","query","22","383.923"],["b80b6056","welcome","12","13.040"],["b90b46ff","query","17","385.857"],["b7968805","query","63","365.179"],["b88d8eb8","query","29","364.665"],["b8ccfe2a","query","79","333.843"],["b81f57a4","query","95","383.641"],["3909e239","explore","126","72.729"],["3891da7b","welcome","49","34.814"],["37afb00b","query","17","265.894"],["3915cc59","explore","86","127.627"],["b8529553","query","17","271.964"],["37c3532d","explore","35","163.435"],["385b6916","query","235","302.728"],["b6979500","explore","22","90.954"],["37dadc3e","","10",""],["385d970c","query","60","436.860"],["38f8933d","query","39","282.343"],["b7abd6cd","explore","30","185.563"],["38c738d1","query","178","461.586"],["b754f50b","explore","22","21.818"],["b8255a74","","104",""],["b89f8df2","welcome","92","35.281"],["b9324e4e","query","70","355.637"],["38e8ab3d","","13",""],["b78b2440","query","43","358.071"],["396197d3","query","316","400.292"],["b7aefa94","welcome","9","22.913"],["b755da2b","explore","28","102.424"],["38f4230b","explore","22","177.209"],["396197d3","explore","199","119.045"],["b82bcf61","explore","22","153.078"],["b8fdf6d5","index","24","33.344"],["b8f1345d","query","123","344.797"],["3596f875","query","72","374.728"],["b696bfa2","welcome","51","27.639"],["37af77a3","explore","284","44.485"],["b81edf15","","19",""],["391c2252","query","38","344.679"],["39087f58","welcome","19","24.719"],["b8cf3b88","welcome","69","32.141"],["b8c875ac","index","8","49.681"],["38cae142","explore","33","88.172"],["38843b38","query","40","396.647"],["38edbb55","","22",""],["393ef37f","index","8","51.576"],["34f12b30","welcome","66","25.471"],["38c738d1","","91",""],["3968d642","welcome","20","29.204"],["b754f50b","","53",""],["38749f05","explore","68","136.018"],["39083a44","explore","22","144.655"],["b88ada11","","57",""],["38343e84","explore","36","107.415"],["387eb251","explore","94","139.900"],["b81579d6","explore","38","97.396"],["39092208","query","133","328.814"],["b5e7f657","explore","129","149.444"],["382f9c89","welcome","10","32.965"],["39472aee","query","78","330.634"],["3920dfb4","explore","30","113.344"],["b6979500","query","71","414.129"],["3880ebea","","47",""],["39472aee","explore","117","84.890"],["b78cd4cc","explore","269","222.059"],["3900e284","query","128","362.005"],["b8beba55","query","25","379.014"],["391c9704","query","42","400.635"],["b75759c1","explore","71","111.561"],["38d95664","welcome","18","39.625"],["b9005d0b","explore","54","67.160"],["b9200590","query","17","332.443"],["b8255a74","welcome","7","40.339"],["39365da1","index","21","66.255"],["b86b60fc","query","17","352.191"],["39365da1","","75",""],["b905f518","explore","51","211.212"],["38a7f88b","index","4","25.077"],["38f4230b","welcome","17","35.099"],["384dc7aa","welcome","16","33.091"],["b8a03224","","15",""],["38adbc1c","index","14","70.116"],["b8cadf66","query","158","382.815"],["387bd683","query","208","313.003"],["b7939ddb","query","59","344.335"],["b77f942a","explore","22","88.149"],["b8d7bdee","","15",""],["b77f942a","explore","27","151.640"],["b7608214","index","16","35.227"],["3891da7b","query","148","391.930"],["380edea5","query","59","465.977"],["b8ccfe2a","explore","75","100.832"],["b7de74ad","query","17","413.334"],["3920dfb4","index","54","48.093"],["38539d8c","explore","22","145.305"],["b432dbc8","explore","86","145.824"],["38aa30c2","query","370","380.361"],["b9098814","welcome","32","13.252"],["b8a70c57","explore","35","68.489"],["396197d3","index","38","48.170"],["b7821e5c","query","402","363.457"],["b80168ac","index","34","60.685"],["39132f5c","","50",""],["b8b0892f","explore","148","128.045"],["374a37eb","query","89","315.412"],["b74acf21","query","124","268.385"],["b7aa9958","explore","173","139.197"],["37ac6a09","explore","22","148.110"],["38cae142","query","93","412.737"],["3891da7b","welcome","79","18.295"],["380edea5","explore","72","7.104"],["b9856d43","welcome","88","27.097"],["36a3d2fe","welcome","161","44.632"],["38a5cc26","query","52","453.232"],["3917dd99","index","22","71.851"],["38cef8ac","explore","92","63.530"],["b84c5c67","query","93","466.539"],["b9316463","welcome","7","24.574"],["3900e284","explore","166","122.200"],["3819d95d","query","17","352.988"],["b8e8b49d","query","101","426.325"],["b8fdf6d5","","85",""],["3891f3e2","welcome","21","23.847"],["b82af9b9","query","108","313.257"],["b77f942a","explore","76","84.150"],["37ba28ff","explore","63","129.342"],["37d701af","welcome","111","28.867"],["b902786e","welcome","12","36.404"],["b8e22a2e","query","91","393.175"],["b7b4e7ac","explore","22","107.732"],["b94b611d","query","34","287.980"],["3790a77c","","252",""],["b9101f6d","query","35","510.588"],["38f4c8db","query","89","346.225"],["391c9704","explore","22","176.182"],["b78358d5","query","111","354.771"],["38e85a88","welcome","8","25.183"],["381e3950","welcome","45","29.817"],["38da8baa","welcome","63","25.141"],["b902786e","query","116","425.101"],["3968d642","","102",""],["38539d8c","explore","153","126.917"],["b834e77f","query","79","303.433"],["3790a77c","welcome","26","32.422"],["b95d95b8","query","50","326.758"],["38861a87","index","4","25.040"],["b7d7b5f5","query","192","368.714"],["b81579d6","query","17","387.477"],["36a3d2fe","index","4","49.620"],["b7aa9958","query","37","432.791"],["b8faab12","welcome","7","31.459"],["38e85a88","query","22","374.769"],["3920dfb4","query","26","347.802"],["b8781981","","79",""],["38d9a089","query","102","416.632"],["b938dc06","explore","22","128.413"],["b8a0d52a","query","102","311.675"],["b9418299","","61",""],["b8bf9af4","index","4","51.552"],["b8ac2813","query","17","377.076"],["382ff46f","welcome","14","26.410"],["b8bb9d02","explore","144","145.831"],["b937fd4b","query","514","385.458"],["37d8b9ed","explore","113","77.185"],["b8a0d52a","query","93","343.258"],["b7894aac","query","17","371.522"],["36aa7870","query","90","310.832"],["3907e5b0","index","5","42.385"],["37eb2fcd","welcome","34","11.926"],["b83857e0","query","17","336.973"],["b90ce463","explore","22","102.204"],["37383af0","query","17","393.272"],["382f4c24","explore","55","78.483"],["38420c72","query","78","484.899"],["3790a77c","explore","46","129.037"],["391c9704","query","377","213.427"],["b91dabaf","query","191","414.340"],["b754f50b","explore","22","107.692"],["b8a754d1","query","17","458.223"],["391b2370","welcome","50","37.788"],["b7352e58","explore","92","128.259"],["b7b4e7ac","explore","36","49.692"],["b896dfeb","explore","69","113.334"],["39132f5c","explore","42","100.375"],["b696bfa2","explore","135","92.146"],["3946238e","welcome","21","33.381"],["b937fd4b","query","17","330.060"],["387c10ce","query","39","427.077"],["387bd683","query","254","360.553"],["37383af0","explore","22","87.781"],["37afb00b","welcome","14","33.561"],["b81edf15","query","59","332.995"],["b754f50b","explore","22","72.383"],["3790a77c","","49",""],["b7707626","welcome","98","24.883"],["38948563","","18",""],["383204f1","","42",""],["38aa11a2","explore","22","97.280"],["38aa30c2","query","17","282.473"],["36f7fdad","welcome","62","41.596"],["3913fdaf","query","121","357.223"],["371b3e13","query","50","407.265"],["b9893bc9","explore","22","128.421"],["b7c012a8","welcome","77","28.723"],["379333c6","query","17","398.357"],["b80fcf1d","explore","219","86.390"],["3909e239","index","4","52.083"],["b9200590","query","112","357.324"],["383c44cb","query","33","429.158"],["363d3fbf","query","57","247.884"],["b9098814","explore","55","167.634"],["3906759e","explore","253","137.240"],["3891f3e2","explore","28","88.760"],["394fc6e8","query","88","340.972"],["b94525bf","query","242","330.510"],["b95d95b8","welcome","10","30.841"],["b6633f1a","index","9","35.740"],["38e60476","query","53","332.551"],["37ea053c","welcome","22","31.027"],["b93477eb","index","13","43.441"],["38539d8c","query","150","371.155"],["b6f10532","explore","67","67.732"],["b938dc06","index","30","65.311"],["b8d7bdee","query","60","340.312"],["381e3950","query","17","379.248"],["b92d0688","query","167","396.439"],["3882c89c","welcome","10","34.985"],["b8bf9af4","explore","115","125.461"],["38b52594","welcome","10","29.166"],["b7339a70","query","81","478.357"],["b9316463","query","114","377.102"],["38ea393f","query","17","413.487"],["3915cc59","query","38","518.081"],["b834e77f","query","26","468.861"],["39875084","explore","51","168.658"],["3895c490","welcome","28","13.780"],["b904a87b","query","35","313.273"],["b8c875ac","query","23","325.746"],["37d701af","welcome","7","30.605"],["36a3d2fe","query","48","452.360"],["b85f1c7f","explore","94","131.806"],["36349e28","index","4","47.481"],["b714dc46","explore","22","181.952"],["b8a70c57","query","93","281.171"],["b88ada11","query","65","429.905"],["38da8baa","","26",""],["395b5e7b","query","167","420.802"],["383c44cb","explore","142","52.588"],["b92d0688","welcome","33","27.455"],["b901e1ee","query","40","469.070"],["374a37eb","explore","112","141.411"],["b933999c","index","7","52.696"],["38a7f88b","explore","22","73.667"],["393ef37f","explore","46","110.684"],["b7707626","welcome","101","34.628"],["b8a0d52a","welcome","7","23.892"],["38f8933d","query","49","444.610"],["b88ada11","welcome","7","40.504"],["38a5cc26","query","111","327.046"],["37dadc3e","query","62","297.611"],["38e8ab3d","","58",""],["b8255a74","explore","35","128.076"],["371b3e13","explore","48","34.636"],["391e0466","welcome","7","11.219"],["b8903a5b","index","25","31.686"],["3891f3e2","explore","116","75.270"],["b789800a","","70",""],["b8d05715","explore","22","166.002"],["b81579d6","query","159","296.750"],["39365da1","","26",""],["b88d8eb8","query","99","426.047"],["39132f5c","explore","22","116.432"],["381e58d4","index","49","51.147"],["b9418299","explore","94","119.795"],["3880ebea","explore","144","102.829"],["374a37eb","query","41","366.738"],["3606bab5","welcome","63","42.024"],["3946238e","index","11","24.637"],["3883164c","welcome","40","23.074"],["3792ae33","explore","31","37.087"],["b72f2109","explore","22","94.133"],["3790a77c","query","62","386.708"],["37d701af","query","18","372.864"],["38861a87","explore","59","0.887"],["37ea053c","explore","68","100.409"],["b980e6ce","explore","54","45.718"],["b8834bbe","query","140","437.447"],["388aadd7","query","17","381.579"],["b7aefa94","query","36","364.465"],["389fde1c","welcome","44","32.451"],["396197d3","query","17","329.486"],["b84c5c67","explore","188","82.938"],["b92a41bc","","55",""],["38a7f88b","query","116","356.204"],["b78139ab","query","676","302.202"],["38d8c63a","query","63","460.541"],["3883164c","explore","153","96.824"],["395fce5f","index","33","62.929"],["b82f8b2a","explore","152","91.940"],["b905f518","explore","703","73.775"],["b83857e0","index","15","79.521"],["b8d05715","welcome","68","18.609"],["b7ef02de","welcome","63","34.141"],["b754f50b","query","208","413.837"],["37247a19","explore","87","72.974"],["b7821e5c","explore","200","172.350"],["b86b60fc","explore","40","152.165"],["38afab8e","query","37","465.473"],["38b537e4","welcome","49","20.926"],["390a94c6","welcome","28","21.471"],["36f3e2b0","explore","24","125.647"],["b8f1345d","explore","31","92.784"],["b801e6e5","explore","22","131.905"],["b8c67786","explore","22","85.445"],["39290817","query","31","444.022"],["371b3e13","query","52","320.980"],["38a86427","query","171","394.884"],["b7a47e56","explore","22","94.591"],["b9005d0b","explore","22","152.885"],["3933a80e","query","101","340.077"],["38b537e4","query","98","453.431"],["38d49209","explore","57","170.424"],["b8326597","index","31","61.325"],["38ded491","query","17","384.565"],["b9324e4e","explore","217","96.546"],["b7a47e56","welcome","33","39.560"],["38ebcacd","welcome","13","25.173"],["b835e95b","query","60","267.069"],["38861a87","query","94","382.932"],["b8ea6996","query","169","471.043"],["39087f58","welcome","62","25.120"],["380494da","welcome","26","26.471"],["375ad4d0","welcome","7","35.860"],["382b613e","explore","157","107.406"],["b8ad224b","explore","80","95.407"],["3686429c","index","35","51.790"],["b80a0db4","","25",""],["b78358d5","welcome","7","28.592"],["b8834bbe","explore","153","131.602"],["395fce5f","query","17","330.264"],["38aa11a2","explore","22","165.667"],["b834e77f","query","22","305.326"],["b809a459","index","46","56.316"],["b78358d5","welcome","162","34.876"],["389fde1c","welcome","7","34.633"],["b8290074","explore","41","112.510"],["384dc7aa","query","64","371.290"],["38afab8e","query","20","441.508"],["b8faab12","query","48","351.256"],["391c2252","index","4","53.813"],["394fc6e8","","20",""],["391c2252","query","56","343.886"],["38e85a88","explore","232","168.231"],["37247a19","query","119","432.153"],["38368d7e","index","57","55.991"],["b7707626","query","17","386.950"],["38d49209","query","30","457.995"],["39372d62","welcome","7","32.059"],["b8ac2813","explore","33","135.582"],["38a86427","explore","129","107.490"],["b8f1bf15","query","59","426.040"],["37ba28ff","welcome","171","26.770"],["b8ad224b","explore","91","214.372"],["b7707626","explore","348","111.259"],["3836f29a","index","8","24.699"],["b78bf9a5","welcome","84","17.152"],["39875084","query","63","492.053"],["39769889","explore","22","94.237"],["36f7fdad","query","141","370.017"],["b7abd6cd","index","15","60.643"],["3891f3e2","explore","22","151.529"],["3907e5b0","query","161","409.016"],["38b30542","","66",""],["b7e4ccd5","query","39","436.896"],["b7f7db07","query","33","294.874"],["b881be6d","query","87","321.785"],["386e6d49","query","39","443.269"],["b8bf9af4","","40",""],["385d970c","explore","67","108.025"],["b94b611d","query","115","496.569"],["b88d8eb8","","139",""],["3792ae33","welcome","20","22.346"],["37af77a3","welcome","7","33.804"],["382b8a89","welcome","31","27.944"],["b8319d86","index","14","52.797"],["39744ff2","query","17","317.750"],["377d4673","query","27","388.555"],["b94525bf","explore","87","96.552"],["b8a754d1","welcome","13","32.573"],["b432dbc8","explore","24","116.862"],["38c738d1","query","17","267.319"],["385b6916","query","228","480.520"],["b8fdf6d5","explore","372","117.483"],["39472aee","welcome","23","23.364"],["b8f1345d","explore","528","124.808"],["b834e77f","explore","65","38.755"],["37d63bbb","welcome","102","46.105"],["b7ef02de","query","38","484.281"],["38447a00","query","191","297.483"],["b82f8b2a","","44",""],["3792ae33","explore","149","101.371"],["38d95664","index","20","26.775"],["387bd683","welcome","31","30.990"],["386139d9","query","17","410.497"],["b90ce463","query","17","344.096"],["b81579d6","explore","68","156.717"],["3913fdaf","explore","22","59.131"],["371b3e13","welcome","42","33.064"],["381e58d4","query","162","339.476"],["380edea5","welcome","7","32.490"],["371b3e13","explore","30","138.343"],["b83524be","query","268","351.517"],["b8beba55","query","17","382.073"],["381e3950","welcome","24","29.345"],["38420c72","query","17","418.704"],["b8ac8acd","welcome","23","32.209"],["38e60476","index","8","62.000"],["38d49209","explore","204","82.589"],["371ef2ec","query","20","549.354"],["363d3fbf","query","86","366.794"],["b8acc8e1","index","4","40.506"],["b810076c","welcome","46","17.543"],["383204f1","index","27","73.860"],["38868413","query","17","427.382"],["b432dbc8","query","119","385.175"],["b8a03224","query","84","337.463"],["b8319d86","","10",""],["3790a77c","query","88","322.831"],["b937fd4b","query","137","409.405"],["37383af0","query","160","286.885"],["390a94c6","explore","151","90.891"],["b9552f4f","explore","149","125.761"],["3913fdaf","welcome","21","33.484"],["b880c13a","explore","101","160.136"],["39083a44","explore","147","80.455"],["b7abd6cd","welcome","56","23.562"],["b94525bf","index","4","55.472"],["386c41b3","explore","193","143.156"],["b712de52","query","161","374.413"],["b7352e58","explore","36","116.340"],["38e8ab3d","query","211","424.129"],["391c2252","explore","88","147.240"],["b8a6645b","query","111","384.411"],["39092208","welcome","44","26.335"],["39875084","query","17","437.394"],["380494da","welcome","52","36.297"],["b86c757d","welcome","35","43.195"],["b8fdf6d5","","99",""],["38368d7e","explore","227","202.611"],["b904a87b","explore","109","49.475"],["391e0466","explore","139","163.830"],["38c7a130","query","53","358.417"],["390d2410","welcome","73","24.380"],["b89da5c6","explore","43","170.307"],["b7352e58","","11",""],["38edbb55","query","155","516.308"],["38868413","query","42","384.164"],["b7352e58","index","44","46.865"],["38592e00","explore","51","143.960"],["3946238e","explore","124","133.967"],["b7f7db07","index","16","54.408"],["b85081f3","query","94","522.866"],["3891f3e2","welcome","7","46.281"],["b904a87b","welcome","42","45.494"],["b890dc6a","query","49","433.324"],["b7a47e56","index","12","45.687"],["b87ea259","welcome","27","26.184"],["385b96d4","query","61","439.710"],["b8d05715","query","81","368.110"],["387bd683","welcome","7","31.293"],["38cef8ac","query","60","561.472"],["3920dfb4","","98",""],["3796f292","query","20","456.990"],["b8823cc9","welcome","18","21.372"],["381e3950","explore","163","56.001"],["b84c5c67","explore","126","96.186"],["394fc6e8","query","171","411.914"],["b90b128b","","180",""],["37ac6a09","query","17","337.031"],["b7e4ccd5","explore","59","57.772"],["b7474352","explore","83","107.815"],["b834730b","explore","242","90.355"],["39035eea","query","62","386.620"],["b7474352","query","192","326.185"],["39365da1","query","61","368.417"],["b77f942a","query","53","255.156"],["38b30542","query","297","460.612"],["b9856d43","index","84","46.513"],["38a7f88b","explore","22","122.715"],["b8ea6996","query","314","461.396"],["b8e22a2e","query","17","361.193"],["b75759c1","query","24","393.891"],["b8bb3849","explore","247","88.664"],["393c832e","index","4","53.645"],["b7821e5c","welcome","50","40.227"],["b81f57a4","","71",""],["b80b6056","index","9","39.754"],["b7c012a8","explore","171","146.868"],["b8ccfe2a","welcome","13","27.857"],["3956dea1","explore","22","148.341"],["b789800a","explore","82","80.835"],["3836f29a","query","37","352.309"],["39083a44","query","57","345.885"],["39083a44","query","104","444.006"],["b904a87b","","13",""],["b9101f6d","","10",""],["38f4c8db","welcome","14","32.663"],["3943830a","index","13","80.945"],["b714dc46","explore","22","100.914"],["b94525bf","query","38","321.237"],["3883164c","welcome","24","34.500"],["b8290074","index","32","56.599"],["b83857e0","query","204","416.488"],["b8f3e8b9","query","291","397.617"],["38ebcacd","query","17","404.002"],["38d7936e","index","31","26.931"],["b8e22a2e","query","17","463.021"],["395b5e7b","index","14","64.015"],["396197d3","query","27","364.339"],["3920dfb4","explore","171","190.262"],["363d3fbf","explore","22","120.193"],["38adbc1c","query","17","481.218"],["b80d45c6","explore","124","96.180"],["b896dfeb","query","96","320.053"],["b8045be3","query","17","301.250"],["3913fdaf","query","113","334.040"],["38d9a089","welcome","38","33.543"],["b835e95b","","283",""],["396197d3","explore","150","152.510"],["b8289f1a","","17",""],["b78b2440","explore","22","130.788"],["3796f292","explore","153","50.983"],["b904a87b","explore","22","104.439"],["b8c1fc74","explore","193","92.212"],["38868413","welcome","30","23.560"],["38f0a207","welcome","112","31.227"],["b94b611d","explore","31","85.405"],["b8faab12","welcome","108","35.791"],["3880ebea","query","51","472.202"],["b92d0688","","73",""],["b8a03224","","10",""],["383c44cb","welcome","102","23.320"],["b8c875ac","welcome","7","33.898"],["37c3532d","query","261","451.140"],["b7a47e56","welcome","15","27.333"],["3915cc59","query","150","396.988"],["3880ebea","query","529","408.211"],["37dadc3e","welcome","11","33.091"],["394b68a5","query","180","406.838"],["38b96a95","explore","295","110.001"],["b8a6645b","query","100","316.328"],["b9893bc9","","28",""],["374b43a9","index","48","48.300"],["b8b0892f","welcome","7","42.365"],["b8ea6996","query","118","411.380"],["34f12b30","query","97","367.113"],["3891da7b","explore","47","51.385"],["3907e5b0","query","41","357.435"],["381e58d4","query","211","408.612"],["3822edba","explore","163","200.523"],["b87ea259","query","41","266.554"],["b888e833","query","90","374.713"],["b7968805","explore","494","109.910"],["39290817","","39",""],["3606bab5","explore","404","58.881"],["b88d8eb8","explore","71","142.142"],["b94525bf","index","18","34.106"],["379fe829","explore","22","149.071"],["b7ef02de","index","48","67.710"],["382b8a89","query","17","374.989"],["b789800a","explore","38","110.827"],["39035eea","welcome","7","40.358"],["38ea393f","","33",""],["b881be6d","query","73","380.507"],["b5e7f657","query","44","314.356"],["b8c67786","explore","80","120.087"],["3917dd99","welcome","29","36.538"],["39083a44","query","56","286.832"],["b6e86a47","welcome","16","33.393"],["38592e00","index","18","62.950"],["b8da5ce2","index","6","53.303"],["b8f3e8b9","query","40","380.501"],["385b96d4","index","4","54.790"],["383c44cb","query","17","372.369"],["38539d8c","","38",""],["b82bcf61","query","68","442.926"],["b8ad224b","explore","68","84.873"],["b890dc6a","explore","126","96.672"],["3600fd8c","welcome","71","32.467"],["3895c490","query","59","372.922"],["b85081f3","query","66","297.453"],["b9b22f3d","explore","103","90.878"],["39035eea","welcome","37","19.986"],["b8290074","query","86","336.537"],["38f26220","query","354","309.992"],["3917dd99","query","266","390.646"],["b9101f6d","welcome","114","37.464"],["38af774a","index","4","24.991"],["395fce5f","query","198","382.279"],["b80b6056","welcome","33","25.582"],["38d8c63a","explore","98","121.831"],["3882c89c","welcome","8","23.153"],["385d970c","welcome","30","34.638"],["b90fca82","index","32","36.985"],["38368d7e","query","54","410.504"],["b81edf15","explore","262","196.998"],["37d701af","index","8","43.042"],["37ba28ff","explore","22","150.530"],["38adbc1c","index","16","42.908"],["b7de74ad","explore","22","87.750"],["b90182be","query","99","429.845"],["b432dbc8","query","243","433.933"],["b91dabaf","explore","73","132.199"],["38420c72","query","260","410.456"],["b8c1fc74","explore","174","172.613"],["39875084","explore","22","151.874"],["36bf0d6a","explore","97","30.398"],["b8971322","explore","22","140.116"],["38a7f88b","welcome","102","35.381"],["37c3eb17","","47",""],["38420c72","query","48","479.569"],["b83857e0","","73",""],["b881be6d","explore","105","141.701"],["b7608214","query","26","481.118"],["b31efa97","welcome","48","25.614"],["b81edf15","index","7","53.697"],["b74acf21","explore","22","102.262"],["b8ad224b","query","41","390.403"],["b9b22f3d","welcome","7","39.636"],["38da8baa","welcome","51","31.631"],["b90b46ff","explore","107","60.014"],["38343e84","query","110","290.607"],["b8beba55","query","17","296.997"],["3882d1ef","query","110","366.391"],["3900e284","welcome","68","32.324"],["37c3532d","index","4","56.588"],["37eb2fcd","index","4","52.333"],["37d701af","query","144","301.348"],["382ff46f","query","55","424.548"],["b78139ab","","27",""],["37494840","query","29","485.812"],["b7339a70","index","18","57.785"],["3920dfb4","welcome","7","17.017"],["b82bcf61","","27",""],["38aa11a2","explore","428","91.670"],["b8ca7291","query","63","371.551"],["37e71d7c","query","316","399.226"],["b9098814","explore","162","16.535"],["3915cc59","query","45","290.143"],["b85c022e","","11",""],["3819d95d","query","35","314.432"],["b8ac8acd","","124",""],["b8d7bdee","query","17","411.035"],["b90182be","","49",""],["b75759c1","query","64","409.389"],["382f4c24","query","17","383.830"],["3909e239","index","4","54.039"],["38a7f88b","explore","144","12.026"],["b90182be","explore","22","108.624"],["b8b0892f","query","25","349.488"],["b90fca82","query","162","402.835"],["b9b22f3d","query","17","403.081"],["b7f4d0c1","explore","53","103.168"],["38da8baa","explore","22","135.213"],["b93477eb","welcome","7","43.676"],["3913fdaf","index","54","66.338"],["b78358d5","welcome","26","27.175"],["b82af9b9","welcome","8","25.232"],["b94525bf","explore","115","103.950"],["381e3950","explore","464","156.295"],["38843b38","welcome","34","43.581"],["b9316463","query","17","332.199"],["3891f3e2","query","70","449.499"],["b77f942a","query","56","367.410"],["38749f05","explore","22","198.537"],["39875084","","65",""],["38c7a130","welcome","52","27.924"],["b8f13334","explore","50","95.010"],["38f4230b","query","32","326.261"],["b90b128b","explore","137","62.370"],["382f4c24","welcome","49","27.415"],["37ea053c","query","385","473.229"],["3822edba","query","27","431.152"],["385f952a","index","28","52.986"],["39290817","query","141","348.209"],["b938dc06","welcome","40","37.780"],["374a37eb","query","434","355.343"],["37a768f1","explore","158","7.774"],["b8c875ac","welcome","102","12.492"],["38592e00","query","116","356.814"],["b88ada11","explore","432","171.590"],["390d2410","explore","71","129.921"],["3836f29a","query","54","369.729"],["37d8b9ed","explore","69","44.159"],["b8c875ac","query","88","353.976"],["38f4230b","query","27","287.936"],["b8529553","welcome","63","32.972"],["386bb217","query","87","353.317"],["b8da5ce2","explore","198","127.124"],["b84ad865","index","4","27.560"],["38beeb4d","query","45","428.913"],["38b23f71","welcome","7","28.272"],["3909e239","welcome","16","23.749"],["3943830a","welcome","20","10.539"],["37d78acc","explore","82","102.449"],["b8045be3","query","51","446.336"],["b8b0892f","explore","22","81.674"],["b81f57a4","","55",""],["38420c72","explore","22","99.031"],["b901a7bb","query","149","417.577"],["38420c72","welcome","8","31.169"],["b78bf9a5","query","136","431.573"],["b9106aff","query","53","328.543"],["38e8ab3d","query","77","391.590"],["b7c012a8","welcome","26","38.602"],["387e5fd3","","108",""],["3822edba","query","30","424.556"],["375ad4d0","query","136","351.619"],["b726fc97","query","17","370.448"],["3882d1ef","query","17","288.351"],["b8971322","welcome","123","28.756"],["3882c89c","index","8","23.740"],["b8e92871","query","24","453.369"],["38da8baa","query","28","384.548"],["393ef37f","index","4","55.461"],["b7894aac","query","37","422.925"],["389fde1c","index","62","57.716"],["38592e00","query","39","343.520"],["b74acf21","explore","22","136.212"],["b94525bf","explore","33","108.886"],["b834730b","query","46","419.324"],["b31efa97","index","12","33.274"],["b6979500","query","227","391.078"],["b6979500","query","31","345.514"],["b6e86a47","query","17","439.868"],["b75759c1","welcome","59","48.531"],["b9200590","query","17","401.611"],["b7276af1","query","65","510.356"],["38824d6d","query","221","335.999"],["38f4230b","query","17","358.987"],["b7f7db07","explore","200","105.246"],["b7968805","explore","82","115.076"],["b7c012a8","query","63","386.491"],["b6f10532","query","37","375.495"],["b7707626","query","38","326.010"],["36f7fdad","query","150","258.215"],["38948563","welcome","30","32.259"],["38edbb55","explore","22","136.051"],["b808f9b5","explore","22","119.835"],["38b23f71","welcome","16","21.593"],["3946238e","explore","77","130.066"],["391e0466","query","17","383.130"],["3968d642","query","64","413.271"],["b7276af1","welcome","20","30.435"],["38d95664","","10",""],["b9552f4f","","10",""],["38afab8e","query","72","440.370"],["b8529553","query","124","383.257"],["b8c1fc74","","78",""],["382b8a89","index","8","49.684"],["384dc7aa","query","195","356.638"],["375ad4d0","explore","77","194.597"],["38f4c8db","welcome","20","32.488"],["38843b38","explore","371","173.472"],["b8f3e8b9","query","104","326.123"],["393c832e","explore","100","101.527"],["b80168ac","explore","199","105.846"],["b8c67786","query","17","411.220"],["374a37eb","query","126","403.239"],["b7339a70","","89",""],["38539d8c","welcome","7","26.786"],["386bb217","explore","136","149.019"],["b726fc97","query","17","401.404"],["390c3cec","welcome","58","38.803"],["b8d05715","welcome","55","26.001"],["3686429c","explore","241","138.042"],["37d9801d","query","30","363.159"],["b432dbc8","query","17","395.767"],["38a5cc26","welcome","89","32.053"],["396197d3","query","17","410.242"],["b880c13a","explore","74","93.560"],["b938dc06","query","112","417.001"],["383204f1","explore","153","158.955"],["b81579d6","query","92","408.756"],["3882c89c","explore","39","159.297"],["37ea0427","query","17","356.261"],["b8255a74","query","112","379.306"],["b9101f6d","explore","23","113.585"],["b8bee8a9","explore","65","140.005"],["389fde1c","","48",""],["38820dcb","","96",""],["b881be6d","query","253","391.455"],["3946238e","query","17","341.745"],["b901e1ee","query","36","410.810"],["b82bcf61","index","8","50.396"],["38868413","explore","292","116.788"],["b847bf23","explore","22","139.916"],["3811afac","welcome","25","29.707"],["3946238e","welcome","48","44.831"],["382f4c24","welcome","43","34.453"],["3972909f","index","62","30.595"],["b91dabaf","query","17","368.927"],["386e6d49","query","218","332.414"],["37265bd1","query","93","470.201"],["b8cf3b88","","10",""],["393ef37f","index","14","45.066"],["b8bb3849","explore","111","144.853"],["b8529553","index","58","42.799"],["b6a668ba","explore","84","112.778"],["b904a87b","explore","22","151.661"],["b9316463","query","33","469.171"],["389fde1c","","10",""],["b8c875ac","query","22","413.002"],["b7608214","explore","276","111.329"],["b8a0d52a","query","209","476.283"],["3796f292","explore","142","115.182"],["b82f8b2a","query","19","389.510"],["b8e22a2e","welcome","7","35.066"],["39132f5c","query","23","501.439"],["b9077d3a","welcome","11","22.231"],["b8b22c28","query","71","350.496"],["381e58d4","explore","101","17.628"],["371b3e13","query","127","313.639"],["37383af0","welcome","23","36.367"],["b8319d86","query","51","363.700"],["b90ce463","query","86","490.470"],["b87ea259","query","103","319.449"],["39132f5c","index","14","53.582"],["382b613e","welcome","41","23.897"],["379333c6","","17",""],["b881be6d","query","33","408.103"],["385b96d4","welcome","59","31.376"],["379fe829","explore","40","120.052"],["37d8b9ed","index","4","21.670"],["b86b60fc","welcome","7","32.254"],["3891da7b","welcome","15","22.630"],["b8beba55","welcome","34","19.306"],["b8e92871","explore","22","125.439"],["37c3532d","explore","47","126.957"],["38e8ab3d","welcome","13","22.777"],["b904a87b","query","61","271.916"],["38e85a88","explore","22","132.766"],["3913fdaf","","22",""],["b8780b92","query","90","278.932"],["b919dc4a","explore","54","112.706"],["b8c875ac","","41",""],["b9b22f3d","explore","204","69.654"],["37d63bbb","query","545","499.998"],["37265bd1","query","93","399.918"],["b81edf15","query","151","425.734"],["b8246fe0","explore","627","82.736"],["3891da7b","","20",""],["39152737","","63",""],["b8d05715","query","43","313.060"],["36a3d2fe","index","24","30.510"],["b8c875ac","index","48","36.872"],["3900e284","query","80","376.483"],["394fc6e8","explore","146","134.667"],["b84c5c67","explore","172","69.375"],["37d78acc","explore","155","124.045"],["b8fdf6d5","query","34","370.090"],["395fce5f","query","17","357.202"],["b8cadf66","query","17","372.327"],["38afab8e","query","310","291.135"],["38ebcacd","query","72","338.114"],["b87ea259","welcome","63","25.103"],["b948b6f9","explore","173","145.055"],["b8326597","explore","80","69.315"],["b805419d","","63",""],["374a37eb","welcome","25","28.907"],["38539d8c","","70",""],["3906759e","explore","50","170.597"],["385f952a","explore","44","150.319"],["3900e284","query","73","355.206"],["37eb2fcd","query","59","356.114"],["386bb217","welcome","36","21.602"],["3796f292","query","41","369.446"],["b8529553","explore","37","145.935"],["b80d45c6","query","37","322.502"],["38861a87","query","17","381.480"],["382f4c24","explore","134","137.628"],["b7939ddb","query","25","434.821"],["383204f1","query","81","403.639"],["39744ff2","query","97","346.640"],["371b3e13","","53",""],["38368d7e","index","13","45.344"],["b940c33b","","141",""],["37ea0427","query","17","460.689"],["b7a97dbb","welcome","7","23.512"],["b7608214","","16",""],["38820dcb","query","115","373.418"],["3600fd8c","index","7","43.300"],["37ac6a09","explore","194","96.169"],["b77f942a","welcome","67","30.852"],["b7d7b5f5","","22",""],["b74acf21","welcome","16","19.628"],["b6e86a47","query","85","442.023"],["b7f4d0c1","welcome","38","20.497"],["b78b2440","index","32","52.301"],["b937fd4b","explore","24","165.007"],["3891da7b","index","56","62.195"],["386139d9","query","84","369.358"],["36653a24","","15",""],["38420c72","explore","89","160.559"],["39290817","query","17","286.273"],["b8cf3b88","welcome","19","36.422"],["b893f1e9","","47",""],["b8f1345d","welcome","29","24.778"],["b8ac2813","explore","27","35.461"],["b85c022e","explore","75","112.628"],["395b5e7b","index","16","63.970"],["37c3532d","","10",""],["36349e28","query","295","383.319"],["37e71d7c","explore","22","103.013"],["390c3cec","query","159","394.753"],["3943830a","query","72","332.599"],["395fce5f","explore","22","87.760"],["b847bf23","query","103","444.519"],["388aadd7","explore","59","58.110"],["b83524be","","182",""],["38cae142","query","17","400.776"],["38ded491","welcome","7","32.792"],["b91c49f9","query","17","425.788"],["b7939ddb","query","48","316.677"],["3606bab5","query","32","323.819"],["b8ac8acd","welcome","28","26.664"],["3851b535","query","99","242.658"],["b8319d86","query","20","408.432"],["363d3fbf","query","21","469.960"],["393ef37f","index","6","46.118"],["390d2410","welcome","43","25.198"],["b80a0db4","explore","90","75.713"],["b8bf9af4","query","30","449.783"],["381e58d4","welcome","16","42.190"],["b92b2caf","query","574","508.906"],["39372d62","query","17","362.795"],["b940c33b","","28",""],["385b341d","explore","288","64.884"],["b80a0db4","query","17","311.146"],["b92a41bc","explore","473","79.638"],["b8f13334","query","37","325.272"],["b9122007","","192",""],["3895c490","explore","393","120.268"],["b905f518","index","21","35.523"],["38edbb55","","92",""],["b904a87b","","15",""],["38d8c63a","index","16","12.281"],["b8781981","query","17","289.727"],["b8f3e8b9","query","92","327.711"],["387e5fd3","explore","60","170.146"],["3920dfb4","query","42","507.694"],["b834730b","index","6","61.781"],["b6a668ba","query","59","426.430"],["b7de74ad","query","17","481.498"],["b754f50b","query","68","412.146"],["b72f2109","query","29","408.526"],["b834730b","query","24","395.287"],["37eb2fcd","explore","80","192.229"],["38b52594","explore","161","83.620"],["b78bf9a5","welcome","31","29.955"],["b8823cc9","index","89","49.710"],["3836f29a","explore","305","125.853"],["b8a0d52a","index","8","33.248"],["b8f1345d","","63",""],["b9101f6d","explore","65","128.030"],["36f3e2b0","explore","25","86.732"],["38da8baa","query","17","412.934"],["b82f8b2a","welcome","128","28.415"],["b7de74ad","explore","215","119.770"],["b80a0db4","query","46","401.509"],["b881be6d","explore","369","139.919"],["383c44cb","query","17","321.728"],["b948b6f9","query","17","449.859"],["38beeb4d","explore","73","16.383"],["b78cd4cc","explore","45","121.267"],["b7968805","explore","58","47.980"],["b9418299","query","210","362.911"],["b9106aff","welcome","7","35.104"],["38824d6d","query","110","349.628"],["38978417","explore","185","121.427"],["37dadc3e","welcome","13","27.566"],["3943830a","","10",""],["38e85a88","query","93","413.188"],["b8255a74","welcome","99","30.702"],["374a37eb","","21",""],["390a94c6","welcome","19","23.293"],["38447a00","welcome","12","25.731"],["37d63bbb","welcome","13","24.363"],["396197d3","index","7","44.520"],["b8f1345d","explore","341","108.450"],["b937fd4b","index","30","45.979"],["b795879c","query","17","380.917"],["b92b2caf","query","112","417.908"],["b7ef02de","query","17","356.034"],["b8903a5b","query","153","389.368"],["363d3fbf","index","20","58.955"],["b31efa97","welcome","167","20.041"],["b714dc46","explore","95","113.860"],["391e0466","explore","693","73.687"],["b8beba55","explore","22","58.723"],["386e6d49","query","55","362.558"],["38c7a130","explore","135","46.499"],["39083a44","query","134","297.309"],["b8ac8acd","query","21","465.567"],["3596f875","query","135","343.734"],["38948563","index","48","71.398"],["b8319d86","explore","150","51.027"],["b8e92871","query","274","470.793"],["388aadd7","query","17","397.960"],["b8c1fc74","welcome","9","37.527"],["383204f1","query","135","339.814"],["381e3950","explore","114","138.300"],["34f12b30","explore","22","91.464"],["3933a80e","query","245","360.323"],["b89da5c6","query","17","435.991"],["38beeb4d","query","102","442.439"],["386139d9","explore","47","125.022"],["382f9c89","query","249","297.500"],["396197d3","query","108","404.906"],["3792ae33","index","4","43.036"],["3915cc59","query","222","508.050"],["385d970c","welcome","45","43.945"],["b755da2b","query","29","333.942"],["b8fdf6d5","welcome","27","32.020"],["b890dc6a","query","20","487.873"],["b919dc4a","query","40","405.979"],["b89f8df2","","10",""],["b8da5ce2","query","21","421.973"],["b7339a70","","44",""],["b8ccfe2a","query","160","429.348"],["b9106aff","query","17","413.878"],["b84ad865","query","104","338.563"],["3895c490","query","79","442.689"],["37af77a3","query","86","395.035"],["37ea0427","explore","108","99.358"],["b8f1bf15","welcome","20","25.801"],["b90b46ff","explore","28","113.193"],["b83524be","query","17","389.186"],["377d4673","explore","22","113.694"],["390a94c6","explore","22","81.668"],["b8cadf66","welcome","84","34.857"],["379d5ea8","welcome","17","36.038"],["39744ff2","query","21","412.791"],["b696bfa2","explore","43","67.984"],["37ea0427","query","61","380.354"],["36ce2e37","explore","111","119.077"],["38b45947","explore","84","40.737"],["38da8baa","explore","26","188.273"],["38948563","index","4","33.565"],["b89da5c6","welcome","18","40.052"],["b7aa9958","welcome","7","13.284"],["3907e5b0","index","17","35.821"],["37e71d7c","","41",""],["3907e5b0","query","879","340.698"],["38b96a95","welcome","21","26.518"],["b85f1c7f","query","17","417.117"],["b9101f6d","welcome","7","28.533"],["3895c490","explore","123","83.356"],["b7de74ad","query","44","339.861"],["3891da7b","explore","303","160.102"],["38b23f71","welcome","7","50.915"],["b801e6e5","","28",""],["383204f1","query","17","402.264"],["38c09959","explore","114","61.172"],["b714dc46","query","205","260.628"],["b72d9375","index","11","49.639"],["b8246fe0","query","17","359.286"],["b809a459","index","29","48.443"],["b893f1e9","explore","22","86.208"],["3891f3e2","explore","86","164.460"],["387e5fd3","welcome","14","39.374"],["392d18b2","explore","91","133.203"],["386e6d49","index","4","28.027"],["b7f7db07","welcome","16","35.121"],["391c9704","explore","205","50.010"],["b8b22c28","explore","240","98.984"],["b880c13a","explore","48","151.520"],["38824d6d","index","8","47.406"],["394fc6e8","explore","110","61.197"],["b89da5c6","query","300","356.121"],["b7474352","welcome","23","16.265"],["b7352e58","query","61","434.554"],["b86c757d","explore","154","86.084"],["b937fd4b","welcome","41","35.067"],["38dd6b90","query","61","343.652"],["3895c490","explore","22","68.681"],["b81dde6c","welcome","21","34.954"],["b92d0688","index","30","53.478"],["b696bfa2","query","17","429.292"],["37e71d7c","","15",""],["389fde1c","explore","360","131.674"],["b52a98aa","query","49","390.162"],["b7f4d0c1","explore","142","148.807"],["b795879c","welcome","131","34.821"],["b9316463","explore","51","152.804"],["38ebcacd","query","89","376.413"],["394fc6e8","query","59","363.734"],["b8c67786","query","59","432.972"],["385b341d","query","51","410.263"],["b6a668ba","query","27","413.063"],["36bf0d6a","welcome","20","20.156"],["36aa7870","explore","52","108.329"],["b890dc6a","explore","40","132.620"],["38b52594","explore","22","131.329"],["37afb00b","","10",""],["38b537e4","explore","265","154.661"],["37ea053c","explore","216","162.124"],["b7210d82","welcome","26","42.067"],["37ea0427","query","148","296.054"],["b8246fe0","welcome","17","26.071"],["b84ad865","welcome","23","20.335"],["b82f8b2a","explore","57","49.905"],["b7c012a8","query","39","484.290"],["38a86427","welcome","68","31.982"],["b8bab8ec","query","46","398.192"],["393ef37f","query","208","465.061"],["b830c67c","explore","130","167.409"],["b7352e58","explore","22","152.772"],["3796f292","index","10","55.068"],["b9856d43","query","110","369.668"],["3972909f","explore","61","56.505"],["391c9704","welcome","7","30.014"],["37d63bbb","explore","91","56.828"],["39035eea","index","29","33.997"],["3883164c","query","46","250.365"],["b8255a74","","26",""],["b88d8eb8","query","17","395.218"],["b890dc6a","query","71","449.303"],["382b613e","welcome","19","34.678"],["b87ea259","explore","22","140.728"],["38c738d1","welcome","60","36.188"],["38a5cc26","query","74","266.115"],["38ea393f","index","61","43.397"],["37c3eb17","explore","22","131.824"],["3906759e","explore","22","77.809"],["377d4673","explore","203","98.213"],["38a5cc26","query","59","430.921"],["3891f3e2","explore","99","122.222"],["b801e6e5","welcome","9","33.948"],["b31efa97","","10",""],["b82af9b9","welcome","49","36.232"],["38cef8ac","explore","111","49.867"],["b72f231c","explore","22","82.324"],["371ef2ec","","95",""],["b31efa97","","93",""],["374a37eb","query","17","404.912"],["b8cadf66","welcome","38","30.716"],["3900e284","","69",""],["38948563","query","54","289.832"],["39744ff2","query","172","355.973"],["386139d9","explore","246","164.592"],["b91c49f9","query","247","362.839"],["371b3e13","welcome","7","18.588"],["38343e84","query","169","292.696"],["38d95664","query","32","394.181"],["b92b2caf","index","12","70.149"],["384dc7aa","explore","66","106.731"],["380edea5","explore","34","67.030"],["b8c1fc74","explore","349","94.880"],["b888e833","explore","176","139.988"],["38978417","welcome","37","39.101"],["b72f231c","","10",""],["b8290074","index","102","22.223"],["38af774a","query","17","419.926"],["b7474352","explore","22","119.529"],["37d9801d","explore","41","121.654"],["37ea0427","index","8","63.317"],["b80a0db4","query","49","391.216"],["b8c1fc74","explore","22","136.713"],["b72f231c","query","50","496.270"],["b6a668ba","index","4","48.527"],["b7894aac","explore","22","78.732"],["393c832e","query","43","392.016"],["38b537e4","index","4","49.347"],["3686429c","query","30","407.894"],["b432dbc8","explore","258","116.569"],["39769889","index","9","52.285"],["384dc7aa","explore","40","132.138"],["b80e549c","query","27","466.724"],["39132f5c","welcome","13","27.767"],["b9077d3a","explore","243","182.967"],["36653a24","explore","118","166.152"],["39372d62","explore","100","110.757"],["37c3532d","index","19","32.093"],["b8d05715","","90",""],["38b52594","welcome","76","14.378"],["b919a166","query","23","456.654"],["384dc7aa","explore","95","101.051"],["38b96a95","query","41","302.978"],["b8903a5b","explore","72","41.014"],["b7fc776f","query","176","355.619"],["37265bd1","index","15","64.059"],["b9077d3a","query","105","403.092"],["379333c6","explore","62","136.673"],["b89f8df2","query","35","369.663"],["38e8ab3d","explore","170","67.283"],["38420c72","query","157","447.093"],["b902786e","welcome","24","14.754"],["3882d1ef","explore","79","42.641"],["b8529553","welcome","11","22.980"],["38a7f88b","explore","97","63.278"],["b92a41bc","query","31","385.282"],["b9122007","welcome","7","23.544"],["b82bcf61","query","20","412.741"],["b7821e5c","","10",""],["37d9801d","query","47","321.573"],["b90ce38e","query","59","391.579"],["38ebcacd","explore","63","130.912"],["b81dde6c","explore","22","91.080"],["b8bb3849","explore","85","92.914"],["3819d95d","explore","34","107.562"],["b8b22c28","explore","46","142.755"],["38d95664","explore","142","117.367"],["b93477eb","index","16","47.115"],["38aa11a2","welcome","33","26.841"],["385823a9","query","92","515.304"],["b9077d3a","explore","198","114.025"],["37d701af","index","4","65.713"],["b7fc776f","welcome","8","34.132"],["3913fdaf","query","23","436.684"],["3913fdaf","query","17","304.769"],["37ea0427","query","27","447.180"],["b893f1e9","query","31","422.308"],["38dd6b90","query","51","336.814"],["b8acc8e1","welcome","7","40.572"],["b906df62","welcome","10","26.652"],["38843b38","query","125","420.212"],["38f4c8db","","62",""],["b78bf9a5","explore","22","79.088"],["b8255a74","explore","22","170.818"],["37ea053c","explore","162","145.105"],["387bd683","explore","23","94.386"],["386139d9","explore","22","106.188"],["b8583fdd","query","284","391.586"],["b901e1ee","welcome","10","37.927"],["38cae142","welcome","7","50.221"],["b78b2440","","10",""],["385b96d4","query","29","359.380"],["b78139ab","explore","103","152.359"],["b78139ab","welcome","25","35.921"],["38a57213","explore","76","67.403"],["385b341d","explore","32","27.546"],["39132f5c","welcome","59","29.479"],["b9418299","index","4","42.282"],["b9856d43","explore","241","112.965"],["382b613e","explore","67","132.268"],["b85c022e","","25",""],["38f26220","query","200","355.342"],["b80e549c","explore","53","109.493"],["b834730b","welcome","19","29.682"],["38d7936e","explore","148","93.110"],["b91c49f9","","25",""],["38e8ab3d","explore","78","149.426"],["39365da1","explore","116","150.692"],["b8bee8a9","welcome","16","30.208"],["b9b22f3d","welcome","8","30.743"],["b8971322","query","17","388.334"],["382b613e","query","17","310.125"],["b801e6e5","index","5","52.119"],["b8780b92","index","6","81.453"],["b52a98aa","query","17","447.934"],["b7a47e56","explore","245","152.012"],["b8e92871","query","36","410.139"],["b8326597","query","29","292.904"],["391c2252","query","25","370.364"],["36f3e2b0","welcome","16","35.469"],["b8c67786","query","17","348.790"],["b8a754d1","query","17","330.295"],["3819d95d","welcome","31","14.733"],["37265bd1","query","29","401.095"],["38beeb4d","query","17","391.890"],["382ff46f","explore","25","160.369"],["b8cf3b88","explore","22","117.850"],["3882d1ef","explore","22","148.613"],["38343e84","query","226","385.760"],["390c3cec","query","21","366.870"],["b87ea259","explore","22","139.212"],["b8faab12","welcome","54","24.239"],["b8834bbe","explore","159","69.025"],["385f952a","","50",""],["38dd6b90","","10",""],["380edea5","query","84","374.680"],["b9893bc9","welcome","7","16.898"],["3796f292","explore","22","176.678"],["38978417","explore","159","139.013"],["b84ad865","explore","319","27.610"],["b92a41bc","welcome","10","22.821"],["b9106aff","explore","279","101.599"],["b9101f6d","explore","119","67.298"],["38adbc1c","","58",""],["37247a19","query","78","342.711"],["b9200590","query","247","376.683"],["b78bf9a5","query","31","367.303"],["38f4230b","query","67","380.534"],["34f12b30","query","107","420.568"],["37afb00b","query","17","478.110"],["38e85a88","explore","37","176.867"],["b78b2440","index","4","40.084"],["b7ef02de","explore","55","145.486"],["b89da5c6","query","17","416.178"],["37ea053c","explore","424","82.090"],["b52a98aa","query","92","482.040"],["3606bab5","explore","133","110.656"],["3946238e","welcome","41","32.767"],["b91dabaf","welcome","11","20.979"],["36aa7870","welcome","10","32.285"],["b8faab12","welcome","30","20.544"],["b9005d0b","explore","22","159.574"],["395b5e7b","index","14","74.226"],["b7e4ccd5","query","28","276.563"],["b6f10532","welcome","26","29.421"],["b8cb4c88","query","17","349.472"],["b835e95b","explore","22","147.284"],["b9098814","query","17","431.464"],["b6e86a47","explore","69","99.491"],["b8045be3","query","112","310.912"],["3792ae33","query","359","320.371"],["3943830a","explore","37","166.350"],["3943830a","welcome","32","24.668"],["b7f4d0c1","explore","30","103.244"],["390d2410","query","28","408.423"],["b7894aac","explore","211","148.459"],["380494da","explore","56","136.052"],["38af774a","welcome","7","23.509"],["38cae142","query","20","445.038"],["b888e833","explore","159","98.549"],["38f4c8db","","45",""],["b890dc6a","explore","121","144.361"],["37247a19","query","82","390.393"],["b8a03224","query","221","421.871"],["37af77a3","explore","402","120.337"],["38afab8e","index","8","59.280"],["36a3d2fe","query","159","384.522"],["34f12b30","","10",""],["37dadc3e","welcome","7","19.815"],["3600fd8c","query","61","370.793"],["38a86427","query","18","318.446"],["36f3e2b0","explore","299","95.353"],["b789800a","query","17","392.073"],["b7c012a8","explore","22","18.889"],["b8d05715","query","115","359.376"],["3906759e","query","50","313.871"],["b7276af1","query","29","444.939"],["38cef8ac","index","33","71.310"],["386c41b3","query","228","375.038"],["b8ccfe2a","welcome","14","45.178"],["b78139ab","welcome","40","39.631"],["b888e833","explore","189","124.646"],["388aadd7","query","116","316.308"],["3907e5b0","query","51","308.775"],["3891f3e2","explore","47","89.044"],["b835e95b","explore","22","94.156"],["b9106aff","index","18","51.752"],["37e71d7c","index","13","65.844"],["382f9c89","explore","85","93.178"],["b90ce38e","query","380","356.096"],["b938dc06","query","615","360.371"],["39372d62","explore","269","142.900"],["b6f10532","welcome","9","37.713"],["38dd6b90","query","289","345.597"],["37a768f1","welcome","17","29.800"],["b7608214","welcome","50","19.979"],["3943830a","welcome","77","26.613"],["b80b6056","welcome","76","32.601"],["b90fca82","query","49","361.761"],["b726fc97","index","7","24.145"],["384dc7aa","explore","69","108.780"],["39087f58","welcome","175","36.434"],["37383af0","query","40","296.742"],["38b45947","query","17","260.926"],["395b5e7b","welcome","75","10.612"],["b9324e4e","welcome","29","29.818"],["38978417","","59",""],["39152737","","16",""],["38d95664","","13",""],["b9893bc9","welcome","134","31.627"],["36ce2e37","explore","94","178.735"],["38da8baa","","27",""],["b8ac2813","query","58","365.329"],["3851b535","explore","29","135.356"],["389fde1c","explore","79","113.121"],["b808f9b5","explore","58","131.929"],["b9077d3a","explore","52","144.485"],["b8d05715","explore","22","131.368"],["b81f57a4","query","129","421.111"],["b9200590","welcome","8","36.516"],["b8903a5b","query","32","396.041"],["384dc7aa","explore","45","135.936"],["381e58d4","explore","60","172.785"],["b7a97dbb","query","58","293.233"],["379333c6","query","101","390.516"],["384dc7aa","explore","120","37.095"],["b8fdf6d5","welcome","14","28.531"],["391c2252","explore","22","129.404"],["36aa7870","welcome","7","30.683"],["390a94c6","","17",""],["39152737","query","17","310.083"],["37383af0","index","27","72.064"],["3943830a","","59",""],["387c10ce","query","87","319.649"],["b7939ddb","explore","145","69.731"],["b80a0db4","","97",""],["b8a70c57","explore","207","109.828"],["b7821e5c","index","11","66.429"],["b8a1e1e5","explore","22","169.860"],["b933999c","query","57","347.415"],["380494da","explore","154","148.687"],["394b68a5","welcome","55","19.789"],["3907e5b0","index","4","58.975"],["b82f8b2a","query","207","382.241"],["b6633f1a","","40",""],["b9893bc9","welcome","17","17.345"],["39875084","welcome","63","35.700"],["37d9801d","query","54","297.670"],["b85c022e","query","145","283.188"],["b9098814","welcome","9","28.687"],["3600fd8c","welcome","22","30.120"],["b78cd4cc","welcome","79","33.054"],["b8529553","query","50","346.767"],["37a768f1","welcome","16","38.301"],["382b8a89","explore","111","113.319"],["36bf0d6a","welcome","41","29.711"],["b7894aac","query","17","445.516"],["b9552f4f","query","119","290.465"],["b78358d5","query","91","466.805"],["b904a87b","","10",""],["b78358d5","explore","122","159.455"],["38343e84","query","70","318.973"],["379333c6","query","120","296.124"],["b7abd6cd","explore","92","103.898"],["b8a754d1","explore","41","179.880"],["b805419d","query","50","424.486"],["383204f1","query","65","292.202"],["36ce2e37","index","46","44.106"],["b86c757d","welcome","120","23.990"],["3909e239","query","28","236.303"],["b8ad224b","explore","509","94.904"],["b78358d5","explore","22","73.165"],["3943830a","explore","91","176.136"],["37c3eb17","query","94","337.900"],["b8e92871","query","31","473.139"],["3796f292","query","23","442.779"],["b948b6f9","explore","126","135.655"],["b81edf15","query","17","365.960"],["b7b4e7ac","welcome","7","31.805"],["3913fdaf","query","62","338.850"],["38368d7e","explore","126","117.337"],["b8ccfe2a","explore","22","127.793"],["380edea5","query","87","339.388"],["b8f1bf15","explore","88","71.469"],["b808f9b5","query","63","352.208"],["379fe829","welcome","23","34.225"],["b888e833","query","17","385.648"],["37c3532d","explore","123","125.162"],["3792ae33","explore","66","128.652"],["b92b2caf","query","17","480.566"],["b8a6645b","index","30","54.213"],["3915cc59","explore","22","137.803"],["386e6d49","query","43","317.266"],["38c09959","index","33","41.370"],["379fe829","","10",""],["392d18b2","query","58","343.670"],["3790a77c","query","19","405.386"],["b902786e","welcome","150","40.673"],["36ce2e37","query","110","434.436"],["3915cc59","explore","22","152.624"],["38824d6d","","10",""],["38e60476","query","17","361.589"],["391c2252","query","105","360.920"],["b91c49f9","welcome","31","24.047"],["389fde1c","query","31","353.803"],["b92b2caf","explore","59","89.053"],["3913fdaf","welcome","160","17.411"],["b808f9b5","welcome","147","41.935"],["b8290074","explore","22","112.016"],["39092208","index","28","50.571"],["b696bfa2","query","45","381.140"],["39744ff2","query","19","361.190"],["39472aee","query","52","389.098"],["b8a1e1e5","query","159","416.297"],["391b2370","welcome","9","37.784"],["b810076c","query","34","310.110"],["b85c022e","welcome","7","36.845"],["3917dd99","explore","190","103.618"],["b72f231c","explore","119","104.781"],["38e60476","query","98","413.110"],["3880ebea","","10",""],["b81edf15","index","21","78.229"],["b8f1345d","query","23","351.095"],["b9552f4f","welcome","7","34.785"],["b8b22c28","welcome","79","27.888"],["b8b0892f","query","17","417.727"],["b80d45c6","query","38","339.997"],["b834e77f","index","36","40.057"],["3891f3e2","query","36","368.142"],["389fde1c","","62",""],["381dc7c6","query","23","448.456"],["388aadd7","query","19","339.155"],["b81dde6c","explore","73","178.058"],["b78bf9a5","query","17","335.688"],["38447a00","","54",""],["375ad4d0","query","251","402.871"],["3880ebea","explore","73","110.132"],["b906df62","","87",""],["b8ad224b","index","5","49.666"],["37afb00b","explore","389","100.367"],["394b68a5","query","203","297.021"],["b8ac8acd","","43",""],["38aa30c2","query","17","343.680"],["38868413","query","25","362.299"],["3946238e","query","17","322.632"],["b8781981","query","50","375.703"],["393ef37f","query","61","325.507"],["b8834bbe","query","48","268.994"],["b7aa9958","query","65","307.996"],["38b23f71","query","196","409.170"],["b80d45c6","welcome","22","35.199"],["387bd683","explore","67","56.027"],["b8971322","welcome","51","27.907"],["375ad4d0","welcome","7","38.548"],["b8bee8a9","welcome","84","28.915"],["38edbb55","query","193","353.514"],["38368d7e","explore","22","135.402"],["b8a1e1e5","","136",""],["39744ff2","query","41","343.904"],["b901e1ee","explore","34","106.917"],["b8cb4c88","explore","90","109.029"],["b86b60fc","explore","158","180.786"],["3606bab5","explore","121","137.841"],["b7474352","query","20","402.468"],["3913fdaf","query","17","324.411"],["b9418299","explore","40","153.374"],["b888e833","explore","63","128.282"],["3836f29a","welcome","184","29.133"],["395fce5f","query","17","358.595"],["3920dfb4","explore","74","183.142"],["38aa11a2","query","17","272.083"],["380edea5","welcome","18","20.309"],["b8255a74","query","91","400.747"],["b90b46ff","explore","205","107.895"],["b9552f4f","","113",""],["b940c33b","query","26","378.679"],["b9106aff","query","122","367.954"],["3883164c","query","237","348.343"],["b90b128b","","10",""],["b905f518","query","41","447.372"],["38843b38","explore","161","97.223"],["b81f57a4","query","132","313.314"],["391c9704","","10",""],["b83524be","explore","70","105.488"],["b82f8b2a","query","209","390.417"],["38d9a089","query","17","353.583"],["b805419d","query","17","492.246"],["b87ea259","query","96","348.390"],["b80d45c6","explore","153","142.620"],["38d9a089","query","44","436.066"],["b7fc776f","query","42","305.516"],["380edea5","query","42","332.991"],["b893f1e9","explore","244","5.409"],["385b6916","explore","75","91.687"],["b7f7db07","explore","108","115.259"],["393ef37f","welcome","16","41.756"],["37dadc3e","welcome","23","34.585"],["b88ada11","query","17","380.779"],["382f4c24","query","186","328.867"],["b7608214","query","86","265.057"],["39290817","index","17","48.703"],["b78139ab","query","57","363.468"],["b78b2440","","31",""],["39087f58","welcome","39","25.731"],["b7ef02de","explore","142","117.847"],["b80fcf1d","explore","454","148.831"],["b8319d86","query","97","379.864"],["37d701af","query","17","484.435"],["38ebcacd","explore","22","165.606"],["b7608214","explore","103","135.016"],["3968d642","query","17","300.726"],["b7abd6cd","welcome","50","24.229"],["3880ebea","query","104","400.276"],["38aa11a2","explore","67","111.031"],["379333c6","query","437","400.250"],["38edbb55","index","6","54.477"],["b8326597","index","43","33.569"],["393ef37f","explore","44","120.768"],["b8319d86","query","41","291.540"],["377d4673","welcome","10","24.278"],["36bf0d6a","welcome","12","31.063"],["b901a7bb","query","137","409.053"],["b7a97dbb","welcome","17","12.527"],["b88d8eb8","query","17","332.964"],["36aa7870","query","18","283.690"],["b890dc6a","","10",""],["b432dbc8","welcome","42","20.304"],["3968d642","query","70","364.054"],["b8beba55","query","78","487.883"],["38f0a207","welcome","26","25.927"],["390d2410","query","242","355.054"],["b755da2b","explore","364","72.089"],["38a7f88b","query","99","407.948"],["380494da","explore","315","139.506"],["b8cf3b88","query","139","337.911"],["391c9704","welcome","22","37.688"],["3915cc59","welcome","9","23.961"],["379d5ea8","explore","138","75.622"],["b9122007","explore","74","107.075"],["37dadc3e","explore","40","62.239"],["381e3950","welcome","123","38.021"],["39472aee","query","29","414.088"],["39152737","explore","229","69.607"],["b8781981","query","18","456.561"],["381e3950","explore","153","75.697"],["38861a87","query","120","354.635"],["38978417","explore","42","33.856"],["b8ac8acd","index","18","40.587"],["b7d7b5f5","query","299","437.445"],["38843b38","query","80","399.594"],["b835e95b","query","31","414.500"],["b904a87b","","57",""],["3943830a","query","121","437.863"],["b82bcf61","query","41","423.995"],["3836f29a","query","64","454.131"],["b86c757d","index","4","30.644"],["38d49209","query","17","498.139"],["38ebcacd","welcome","9","14.546"],["387c10ce","explore","130","153.170"],["39087f58","query","119","389.564"],["38948563","explore","194","130.593"],["39472aee","welcome","14","30.970"],["b78358d5","explore","32","140.020"],["b81edf15","query","38","443.239"],["38cef8ac","explore","175","70.913"],["38beeb4d","query","93","435.236"],["381e3950","query","17","511.299"],["b9316463","query","18","379.078"],["38afab8e","query","42","329.651"],["b8d7bdee","welcome","11","23.174"],["391e0466","welcome","141","27.671"],["38824d6d","query","176","336.133"],["36ce2e37","explore","147","99.794"],["374a37eb","explore","22","99.653"],["3600fd8c","explore","231","121.988"],["b83524be","welcome","23","41.256"],["391c2252","explore","181","127.338"],["b86c757d","explore","92","175.371"],["b6633f1a","welcome","21","28.043"],["b8ccfe2a","query","17","278.335"],["38f4c8db","explore","22","103.644"],["3883164c","query","17","339.751"],["37e71d7c","explore","46","89.507"],["b90fca82","query","64","333.958"],["b904a87b","query","63","329.491"],["381dc7c6","query","75","410.332"],["38ebcacd","query","28","423.951"],["36f7fdad","query","18","282.146"],["b80e549c","explore","148","114.626"],["39083a44","welcome","7","28.420"],["b80a0db4","","181",""],["38ded491","welcome","33","23.749"],["38f0a207","query","19","384.619"],["b91c49f9","query","18","542.620"],["39744ff2","welcome","7","25.425"],["38b23f71","welcome","9","34.298"],["3909e239","index","65","70.227"],["385b96d4","query","125","350.090"],["b8255a74","welcome","21","30.301"],["b8a754d1","query","17","291.433"],["38948563","","15",""],["b90182be","query","126","341.673"],["b78bf9a5","welcome","57","27.458"],["38a86427","welcome","20","23.841"],["38da8baa","query","31","375.080"],["38a5cc26","","79",""],["b91dabaf","welcome","25","7.673"],["3880ebea","query","74","455.693"],["b9200590","query","45","536.239"],["b7f4d0c1","explore","82","129.339"],["b8f1bf15","index","23","55.335"],["385d970c","explore","31","19.810"],["b7abd6cd","","14",""],["385f952a","query","79","364.051"],["b906df62","welcome","118","30.578"],["38beeb4d","welcome","18","33.759"],["b8a6645b","query","98","294.798"],["394b68a5","welcome","43","32.242"],["38400295","explore","48","120.556"],["390d2410","index","50","52.057"],["b835e95b","index","65","53.342"],["b905f518","explore","95","147.918"],["38539d8c","query","259","409.289"],["39875084","explore","22","120.496"],["b78139ab","","10",""],["b80168ac","welcome","45","26.158"],["396197d3","explore","47","183.429"],["38da8baa","explore","22","59.686"],["382ff46f","","28",""],["b81dde6c","index","4","79.922"],["3943830a","query","73","340.698"],["37ba28ff","query","78","299.820"],["387bd683","welcome","122","29.678"],["b919dc4a","query","51","445.196"],["b80b6056","query","67","378.226"],["b834730b","","19",""],["b890dc6a","query","48","447.674"],["38d8c63a","welcome","20","24.280"],["b92b2caf","explore","154","86.237"],["38d95664","query","128","440.344"],["b85f1c7f","index","49","30.416"],["b8319d86","explore","231","79.541"],["b9122007","explore","410","99.017"],["b8f1345d","query","81","577.196"],["37c3eb17","welcome","29","25.154"],["36349e28","explore","46","108.873"],["39092208","explore","22","88.371"],["b7ef02de","query","55","382.990"],["b795879c","welcome","61","35.314"],["b92a41bc","query","38","374.581"],["b81dde6c","explore","67","72.692"],["b8a1e1e5","query","17","424.688"],["b896dfeb","query","45","361.226"],["b933999c","welcome","7","37.832"],["b8ca7291","query","291","353.516"],["b432dbc8","query","141","326.540"],["38ea393f","query","72","337.407"],["3882c89c","","12",""],["b78139ab","welcome","19","22.643"],["b7821e5c","query","179","327.472"],["b74acf21","explore","66","61.975"],["3882c89c","","27",""],["38f0a207","explore","25","136.858"],["b906df62","explore","194","107.563"],["37ac6a09","query","152","405.990"],["3891da7b","","63",""],["b8326597","explore","73","120.200"],["b78358d5","explore","22","126.388"],["b8cf3b88","explore","167","100.233"],["385b341d","query","48","346.697"],["38a5cc26","query","226","453.864"],["b834730b","explore","141","154.654"],["39035eea","explore","145","91.148"],["b72f231c","explore","90","64.628"],["b89f8df2","explore","86","150.869"],["b7d7b5f5","explore","89","103.182"],["38af774a","query","35","413.142"],["382b8a89","","91",""],["b6a668ba","explore","108","98.360"],["3895c490","explore","35","128.206"],["b8781981","query","87","300.527"],["39372d62","explore","52","72.401"],["38d9a089","explore","62","150.485"],["b7abd6cd","explore","22","67.514"],["b8cadf66","welcome","21","36.162"],["38adbc1c","query","204","388.857"],["38447a00","explore","465","133.642"],["381e3950","welcome","7","46.493"],["37eb2fcd","explore","26","123.765"],["b88d8eb8","query","105","394.554"],["b948b6f9","query","85","372.691"],["b8780b92","","58",""],["b5e7f657","query","89","352.976"],["b8d05715","query","17","455.191"],["38b96a95","query","347","393.811"],["b8acc8e1","query","73","467.029"],["b8781981","explore","22","14.983"],["391b2370","","10",""],["b90ce38e","explore","42","198.706"],["b8bb9d02","explore","80","152.345"],["b78139ab","query","80","474.185"],["b80e549c","query","86","370.091"],["3811afac","index","45","16.068"],["383204f1","query","35","290.386"],["b7608214","query","66","424.347"],["3956dea1","query","59","443.673"],["b7c012a8","query","22","418.983"],["b7e4ccd5","welcome","31","38.551"],["b80168ac","explore","22","116.395"],["38afab8e","query","17","357.471"],["b6a668ba","explore","24","189.916"],["38ded491","explore","22","114.704"],["b72f2109","query","31","541.209"],["395b5e7b","query","170","458.300"],["36f7fdad","","10",""],["38c09959","query","17","432.914"],["b7474352","query","99","367.090"],["36bf0d6a","query","18","408.474"],["38368d7e","query","56","288.450"],["39472aee","welcome","10","22.559"],["b9893bc9","explore","278","87.948"],["393c832e","welcome","7","25.043"],["b78b2440","query","244","346.905"],["384dc7aa","welcome","22","26.743"],["38f0a207","","25",""],["b6e86a47","welcome","31","41.083"],["b8903a5b","explore","48","180.313"],["b8c875ac","query","142","435.530"],["36aa7870","query","31","291.408"],["b795879c","query","21","388.743"],["b755da2b","explore","82","134.046"],["38f4230b","explore","22","110.058"],["b7894aac","query","17","361.428"],["38b52594","query","292","396.370"],["38b537e4","explore","200","61.104"],["38e60476","query","105","354.476"],["38beeb4d","explore","70","76.685"],["381e58d4","index","27","15.936"],["37a768f1","query","17","374.524"],["b7474352","query","67","486.985"],["38b52594","explore","60","169.206"],["b754f50b","welcome","46","33.718"],["391c2252","explore","351","136.500"],["396197d3","index","25","56.068"],["3946238e","explore","112","46.652"],["b7276af1","welcome","94","32.309"],["38f8933d","index","49","44.594"],["390c3cec","explore","33","79.743"],["b31efa97","query","160","271.483"],["b8faab12","query","108","335.235"],["b9005d0b","welcome","62","33.888"],["b80fcf1d","query","121","301.892"],["391e0466","welcome","36","30.757"],["b7608214","query","102","336.471"],["391c2252","query","64","338.299"],["36653a24","query","112","410.931"],["39092208","explore","22","145.017"],["b89705a9","query","47","464.627"],["374b43a9","","102",""],["3836f29a","query","40","375.346"],["b893f1e9","index","14","43.749"],["38820dcb","query","67","315.084"],["38d9a089","explore","123","195.815"],["b8ac8acd","query","183","338.209"],["391b2370","query","221","359.202"],["b8ad224b","query","33","306.638"],["3906759e","query","116","331.873"],["b801e6e5","","10",""],["b6633f1a","query","135","350.051"],["b8529553","","50",""],["3606bab5","query","17","483.159"],["38d8c63a","explore","23","220.042"],["39092208","welcome","36","33.045"],["3909e239","welcome","20","21.484"],["b87ea259","query","39","376.297"],["382ff46f","explore","25","203.471"],["b89705a9","welcome","34","27.267"],["b8acc8e1","explore","194","113.616"],["b7c012a8","query","58","343.519"],["b881be6d","welcome","11","32.659"],["b948b6f9","query","118","369.242"],["383c44cb","welcome","7","33.630"],["38749f05","welcome","19","31.694"],["b7aefa94","welcome","203","24.901"],["b78139ab","query","140","307.455"],["39769889","query","89","226.025"],["39087f58","explore","22","104.278"],["b9122007","","26",""],["b7aa9958","index","11","47.478"],["b9077d3a","query","51","387.767"],["b5e7f657","query","17","391.131"],["b90182be","welcome","34","29.764"],["b789800a","query","347","390.919"],["b919dc4a","index","4","52.111"],["b7a47e56","query","146","437.997"],["b78cd4cc","query","148","279.802"],["38ea393f","query","18","446.892"],["391b2370","explore","22","111.960"],["b881be6d","query","17","371.184"],["b9418299","query","63","432.426"],["389fde1c","welcome","7","30.850"],["b8246fe0","explore","152","103.253"],["381dc7c6","explore","81","76.540"],["38ded491","query","17","390.943"],["38b52594","explore","184","101.970"],["b8c875ac","query","142","357.313"],["38c738d1","explore","22","102.623"],["b919a166","query","223","343.653"],["b8a1e1e5","explore","40","116.902"],["3920dfb4","welcome","7","34.636"],["b8a70c57","query","37","390.087"],["386bb217","query","170","335.495"],["395b5e7b","explore","210","127.170"],["391b2370","index","68","23.252"],["b8290074","index","4","47.684"],["b890dc6a","query","17","386.780"],["b75759c1","query","92","310.774"],["3796f292","query","115","349.104"],["385d970c","welcome","13","21.211"],["391c2252","explore","141","110.365"],["38861a87","welcome","80","36.136"],["b8583fdd","welcome","89","27.023"],["37494840","explore","22","130.523"],["b8045be3","","34",""],["382b8a89","welcome","56","28.419"],["b8834bbe","query","17","299.908"],["39372d62","query","253","433.225"],["b8529553","explore","34","125.897"],["b8246fe0","explore","165","197.909"],["3606bab5","index","24","31.812"],["3596f875","welcome","50","27.598"],["b84c5c67","welcome","47","22.609"],["382ff46f","explore","83","106.033"],["38d49209","index","60","51.784"],["37ea0427","query","24","532.137"],["38f8933d","query","62","230.290"],["b805419d","","39",""],["b938dc06","query","38","337.612"],["391b2370","explore","108","122.446"],["38b23f71","welcome","43","24.524"],["b8bab8ec","query","34","389.140"],["b8c1fc74","explore","190","72.349"],["b9077d3a","index","29","67.513"],["37d701af","explore","31","115.900"],["38cae142","explore","326","132.343"],["b902786e","query","165","469.486"],["b714dc46","explore","24","161.885"],["b881be6d","query","86","349.992"],["b77f942a","explore","22","59.775"],["b31efa97","welcome","40","29.302"],["3943830a","welcome","7","26.344"],["b7aa9958","query","102","325.373"],["b88d8eb8","query","32","423.846"],["b901a7bb","welcome","51","33.205"],["390d2410","welcome","9","33.109"],["b830c67c","explore","139","102.942"],["b8acc8e1","explore","91","114.210"],["b8971322","query","65","230.133"],["b92b2caf","welcome","7","27.722"],["382f9c89","explore","275","122.707"],["b72f2109","query","122","420.730"],["3882d1ef","query","23","381.552"],["3891da7b","query","211","397.342"],["b938dc06","explore","113","151.037"],["371b3e13","","274",""],["382ff46f","","85",""],["b8faab12","query","89","357.792"],["b5e7f657","explore","109","43.169"],["b94525bf","index","7","48.811"],["391e0466","index","45","43.180"],["38dd6b90","query","34","375.975"],["38948563","welcome","17","26.825"],["b980e6ce","welcome","11","29.405"],["b8a1e1e5","welcome","13","24.330"],["39472aee","explore","34","125.224"],["b82af9b9","welcome","7","24.710"],["b835e95b","query","102","348.107"],["38868413","index","4","79.786"],["b80a0db4","explore","183","88.524"],["b90fca82","query","17","380.333"],["3882c89c","","10",""],["385b6916","index","19","43.336"],["b8ac8acd","welcome","12","47.739"],["381dc7c6","welcome","75","33.586"],["b9324e4e","explore","22","93.257"],["39769889","welcome","28","31.690"],["38afab8e","query","25","532.023"],["39152737","query","55","284.988"],["b8c875ac","welcome","75","29.105"],["b8326597","explore","59","157.100"],["387e5fd3","query","70","321.923"],["34f12b30","welcome","34","25.903"],["38d9a089","welcome","33","30.064"],["b8f1bf15","explore","74","74.900"],["b9893bc9","query","91","459.608"],["b90182be","query","24","440.777"],["395fce5f","","21",""],["b8bee8a9","query","73","388.984"],["b830c67c","query","166","323.202"],["382f9c89","query","181","316.774"],["37ea053c","explore","23","102.990"],["38beeb4d","welcome","40","21.841"],["b90182be","welcome","78","34.003"],["b84ad865","explore","22","164.513"],["38af774a","explore","103","22.363"],["b9552f4f","query","17","337.452"],["b82af9b9","welcome","42","26.922"],["b90b46ff","query","17","319.466"],["38c7a130","query","93","411.227"],["39290817","query","17","379.780"],["391c9704","query","32","386.023"],["b8d7bdee","explore","337","100.366"],["b8a0d52a","welcome","57","1.436"],["38447a00","","177",""],["37d8b9ed","query","49","404.832"],["380494da","welcome","205","32.325"],["b904a87b","query","90","402.506"],["b8ad224b","","10",""],["39290817","","24",""],["b94b611d","explore","59","83.064"],["b881be6d","explore","30","67.920"],["382f9c89","explore","96","115.216"],["38ea393f","index","45","40.559"],["39290817","query","224","330.292"],["374b43a9","query","100","386.320"],["391c2252","query","78","479.692"],["379333c6","explore","46","135.652"],["b8cadf66","query","63","498.203"],["b7f7db07","query","48","384.214"],["b6633f1a","query","17","368.895"],["36aa7870","explore","137","120.749"],["b880c13a","welcome","7","39.429"],["382b613e","explore","39","133.796"],["b90fca82","query","75","329.648"],["39132f5c","query","46","426.580"],["b80d45c6","index","4","46.620"],["b919dc4a","query","99","418.659"],["38948563","index","24","93.121"],["385d970c","query","183","462.618"],["b9106aff","","119",""],["38aa11a2","","38",""],["396197d3","","211",""],["b789800a","query","17","486.120"],["b801e6e5","explore","185","116.187"],["386e6d49","query","24","266.637"],["38978417","welcome","42","25.948"],["b89da5c6","query","39","353.566"],["39035eea","explore","281","87.573"],["38d6f36c","query","72","407.217"],["371b3e13","query","17","336.916"],["b8cadf66","explore","22","212.741"],["b9552f4f","welcome","7","21.156"],["37c3532d","","80",""],["393ef37f","query","142","484.904"],["b8f1bf15","query","17","377.468"],["b8bb3849","query","121","332.894"],["b9122007","explore","43","98.055"],["b8f3e8b9","explore","163","140.717"],["3891da7b","query","202","464.688"],["381e58d4","query","34","467.096"],["b8ac2813","query","63","411.343"],["3909e239","query","81","384.418"],["b84ad865","explore","22","68.028"],["394b68a5","explore","22","95.683"],["37a768f1","welcome","7","22.030"],["b6a668ba","query","341","338.018"],["b8cf3b88","explore","22","159.631"],["b810076c","query","136","421.575"],["b7d7b5f5","explore","233","141.151"],["b726fc97","query","17","389.262"],["3906759e","explore","22","119.022"],["b8971322","query","17","349.339"],["383c44cb","explore","128","53.557"],["39372d62","welcome","7","27.781"],["39372d62","query","238","339.999"],["b8f3e8b9","query","92","325.005"],["b8faab12","index","32","56.946"],["b80fcf1d","","10",""],["b90fca82","query","75","456.466"],["3909e239","query","35","573.555"],["b808f9b5","query","54","366.805"],["b8a6645b","","260",""],["b7276af1","query","117","415.352"],["384665e3","explore","26","91.975"],["b72f2109","welcome","87","20.980"],["38343e84","index","4","63.630"],["b9005d0b","explore","73","67.496"],["b919dc4a","query","17","355.144"],["b795879c","explore","85","97.990"],["379fe829","query","17","303.643"],["b8bee8a9","query","221","385.477"],["37ac6a09","welcome","7","35.650"],["b8289f1a","explore","22","176.108"],["b80a0db4","","28",""],["b904a87b","query","17","283.970"],["37a768f1","query","17","424.773"],["b905f518","explore","22","120.014"],["38a86427","explore","22","157.661"],["37d63bbb","query","142","394.982"],["b712de52","query","123","266.908"],["38539d8c","query","23","378.151"],["b830c67c","query","91","436.314"],["b7939ddb","welcome","7","29.421"],["377d4673","query","17","430.285"],["395b5e7b","query","56","284.894"],["38843b38","index","19","42.626"],["38cef8ac","index","25","41.748"],["b8f13334","query","39","404.519"],["36bf0d6a","explore","82","108.263"],["b8f13334","explore","234","74.472"],["38861a87","explore","362","125.624"],["38f26220","welcome","62","28.051"],["b93b8201","index","4","31.026"],["38948563","query","72","325.972"],["381dc7c6","explore","312","52.865"],["38843b38","explore","142","96.626"],["36349e28","explore","350","179.281"],["b8780b92","index","4","43.446"],["38f4c8db","","18",""],["b905f518","explore","172","113.829"],["3796f292","explore","52","97.597"],["b8bab8ec","explore","79","93.054"],["b8583fdd","query","113","408.175"],["b80e549c","query","114","409.892"],["3972909f","index","27","58.029"],["b8c1fc74","query","46","400.514"],["b52a98aa","explore","22","100.836"],["b92a41bc","query","165","367.664"],["b7d7b5f5","query","17","437.969"],["b90b128b","query","86","476.036"],["386e6d49","welcome","10","38.465"],["b78139ab","index","28","53.108"],["3906759e","index","25","74.353"],["37a768f1","welcome","7","28.795"],["38824d6d","","55",""],["b72f231c","query","75","368.713"],["395fce5f","index","5","21.396"],["38e85a88","welcome","7","32.748"],["b8a1e1e5","query","176","366.747"],["38400295","query","17","389.803"],["b8ea6996","explore","22","157.609"],["b89f8df2","query","193","450.440"],["b7c012a8","query","20","362.069"],["3596f875","index","21","45.140"],["38f4230b","query","17","400.394"],["3606bab5","explore","33","154.341"],["b7608214","welcome","34","31.506"],["363d3fbf","query","46","446.852"],["390a94c6","query","149","424.939"],["b9122007","explore","49","80.915"],["381dc7c6","query","97","384.974"],["3917dd99","","23",""],["38f26220","query","17","361.079"],["b810076c","","36",""],["b8ea6996","explore","38","148.712"],["b82f8b2a","index","4","59.459"],["39769889","query","49","363.185"],["3822edba","query","40","389.864"],["b6f10532","query","24","429.103"],["b7939ddb","explore","22","93.099"],["38a86427","query","17","324.612"],["3883164c","query","17","413.705"],["385b6916","explore","528","116.325"],["38da8baa","welcome","7","25.218"],["b7608214","query","36","369.048"],["3600fd8c","","56",""],["b8e8b49d","explore","119","72.834"],["3895c490","explore","168","49.134"],["38b96a95","query","142","307.942"],["b834730b","query","340","399.886"],["396197d3","explore","229","125.394"],["b72d9375","explore","209","119.452"],["b809a459","index","74","58.017"],["b8f1345d","welcome","123","22.978"],["39744ff2","query","18","421.106"],["b90b128b","welcome","32","30.308"],["391c9704","query","85","397.857"],["b8255a74","explore","40","160.327"],["38420c72","query","139","395.809"],["39744ff2","query","179","312.326"],["3917dd99","explore","52","112.215"],["38d95664","welcome","13","30.141"],["b726fc97","query","119","444.585"],["b6e86a47","index","6","50.511"],["37c3532d","explore","70","125.429"],["b85081f3","welcome","16","26.753"],["b7a97dbb","query","70","383.786"],["b8a754d1","explore","47","119.178"],["b8ca7291","query","126","495.240"],["b7352e58","query","278","361.175"],["b82af9b9","explore","135","116.301"],["b52a98aa","explore","22","67.586"],["b8bb3849","query","54","370.573"],["394b68a5","welcome","22","40.460"],["b8ad224b","query","169","466.902"],["b8da5ce2","query","24","298.175"],["38400295","welcome","34","20.846"],["37c3532d","","70",""],["38c7a130","query","82","360.116"],["b940c33b","query","33","414.424"],["b80fcf1d","explore","124","147.268"],["b90ce463","query","114","430.591"],["386139d9","query","104","462.193"],["b72f231c","query","109","395.961"],["b9856d43","query","225","494.326"],["b904a87b","explore","229","115.476"],["b8bb9d02","query","256","470.110"],["b74acf21","query","228","386.201"],["3946238e","query","89","494.152"],["38af774a","query","110","381.499"],["b712de52","query","139","335.193"],["b95d95b8","welcome","37","30.683"],["3836f29a","welcome","111","42.764"],["b6f10532","query","107","412.555"],["b80b6056","explore","189","103.790"],["b8bb9d02","welcome","94","30.707"],["38a5cc26","explore","214","121.494"],["b7968805","welcome","7","44.503"],["b85081f3","welcome","14","36.620"],["b8e92871","welcome","20","31.280"],["b80168ac","query","53","432.583"],["37383af0","query","24","368.514"],["b8781981","index","15","24.433"],["b795879c","explore","372","91.349"],["3972909f","explore","22","128.756"],["b810076c","query","125","417.841"],["38f8933d","explore","27","127.216"],["b896dfeb","explore","46","195.923"],["39875084","query","84","429.707"],["371b3e13","explore","198","54.230"],["b948b6f9","explore","455","103.660"],["374a37eb","welcome","48","34.354"],["38aa11a2","welcome","33","40.064"],["b8a0d52a","welcome","11","16.651"],["b85f1c7f","welcome","39","28.926"],["b6f10532","index","18","60.968"],["b7707626","query","94","285.503"],["b801e6e5","query","17","479.216"],["b6979500","query","17","361.639"],["3891f3e2","welcome","7","24.865"],["b84ad865","explore","126","108.525"],["b87ea259","explore","29","126.153"],["b82f8b2a","explore","95","127.130"],["394b68a5","query","29","385.018"],["38b23f71","query","86","406.832"],["b80e549c","explore","225","143.629"],["38b23f71","welcome","78","30.338"],["36ce2e37","query","48","377.689"],["b8045be3","query","181","400.760"],["b9077d3a","index","4","33.809"],["b8a70c57","","11",""],["377d4673","query","54","406.182"],["b9122007","query","85","360.407"],["b83857e0","explore","257","72.981"],["38dd6b90","welcome","89","37.728"],["b7939ddb","query","79","339.343"],["3968d642","query","52","428.365"],["b905f518","explore","63","56.196"],["39769889","welcome","33","36.347"],["3819d95d","explore","31","137.355"],["b86b60fc","explore","25","115.741"],["b7608214","explore","22","138.915"],["386c41b3","index","4","62.801"],["37e71d7c","welcome","7","10.293"],["383c44cb","query","96","322.621"],["b86b60fc","index","31","29.996"],["b82af9b9","query","82","436.920"],["395fce5f","query","78","415.917"],["3882c89c","query","17","418.374"],["b940c33b","query","114","289.447"],["39472aee","query","89","397.028"],["b77f942a","query","149","462.005"],["b937fd4b","explore","261","102.535"],["38368d7e","explore","22","139.361"],["b834e77f","index","62","55.518"],["3790a77c","query","29","273.602"],["b714dc46","query","131","387.584"],["b8255a74","explore","49","108.986"],["b754f50b","query","167","414.370"],["b84c5c67","welcome","7","32.210"],["b888e833","welcome","28","33.459"],["36bf0d6a","explore","66","154.168"],["b94b611d","query","272","375.418"],["b9098814","explore","50","92.034"],["b87ea259","index","11","78.034"],["b80b6056","index","4","43.931"],["b880c13a","explore","22","164.759"],["38447a00","query","17","362.123"],["b8c875ac","explore","123","171.589"],["38749f05","explore","104","116.164"],["393c832e","query","66","433.286"],["38820dcb","query","17","380.728"],["38749f05","welcome","9","39.909"],["36bf0d6a","welcome","8","24.958"],["37afb00b","welcome","19","11.502"],["38420c72","explore","107","114.189"],["38948563","query","146","293.368"],["b8a0d52a","","32",""],["386c41b3","explore","32","160.545"],["381e3950","index","16","34.897"],["38b45947","query","44","364.765"],["b84ad865","query","17","351.364"],["b91dabaf","query","114","416.896"],["b754f50b","","25",""],["393ef37f","query","26","324.797"],["b901a7bb","","52",""],["b7b4e7ac","welcome","140","22.291"],["38592e00","index","8","47.566"],["b881be6d","welcome","238","36.831"],["37a768f1","query","17","394.049"],["384dc7aa","query","33","304.212"],["b80fcf1d","explore","30","90.423"],["39744ff2","query","75","369.036"],["39092208","index","40","48.124"],["b78b2440","query","95","266.995"],["37247a19","explore","27","196.499"],["b9005d0b","query","264","335.710"],["37247a19","welcome","16","21.991"],["3900e284","explore","62","147.787"],["39372d62","explore","44","84.688"],["b80b6056","explore","599","96.476"],["3882c89c","","62",""],["b90182be","query","17","454.939"],["b9324e4e","explore","100","109.903"],["3606bab5","explore","51","52.303"],["b919dc4a","explore","102","66.572"],["b880c13a","explore","22","62.761"],["b81dde6c","query","164","355.116"],["38820dcb","explore","202","128.165"],["3920dfb4","explore","198","92.361"],["b7608214","query","137","466.336"],["38aa11a2","query","36","452.609"],["38e85a88","query","68","375.820"],["395b5e7b","query","70","306.126"],["b90b46ff","index","5","60.593"],["3968d642","query","94","324.066"],["37c3532d","query","256","355.902"],["374b43a9","explore","84","137.425"],["b89da5c6","welcome","23","40.327"],["b7aefa94","query","75","382.523"],["37494840","query","94","509.138"],["b90b46ff","query","47","357.874"],["36653a24","explore","432","128.036"],["b8beba55","","10",""],["b5e7f657","query","59","347.540"],["396197d3","","34",""],["3882d1ef","welcome","52","30.870"],["38843b38","welcome","23","22.560"],["b8bf9af4","query","196","395.129"],["b8d7bdee","welcome","12","24.379"],["b7aa9958","","10",""],["38b23f71","explore","87","131.647"],["b78b2440","query","17","305.136"],["37ba28ff","welcome","40","25.650"],["b78358d5","welcome","58","35.365"],["38978417","explore","44","85.214"],["38a7f88b","welcome","7","34.892"],["381e3950","","47",""],["38d9a089","query","159","451.729"],["38ebcacd","query","21","344.898"],["384dc7aa","query","73","345.571"],["3596f875","query","36","334.701"],["b7e4ccd5","query","219","367.254"],["b8e92871","query","112","374.952"],["b74acf21","query","75","375.518"],["b902786e","explore","39","122.730"],["3882c89c","explore","87","134.514"],["36bf0d6a","explore","171","95.843"],["b8bf9af4","index","16","50.518"],["38843b38","index","28","44.946"],["3606bab5","explore","22","112.298"],["382b8a89","index","46","67.620"],["3686429c","query","70","360.534"],["38592e00","","78",""],["39083a44","","16",""],["385b96d4","query","17","322.707"],["b893f1e9","query","196","416.898"],["3943830a","query","17","295.815"],["38948563","query","23","254.407"],["b92d0688","query","107","319.321"],["b85c022e","query","17","400.765"],["38400295","query","194","376.346"],["391e0466","explore","69","62.525"],["b9098814","explore","141","127.029"],["b82bcf61","welcome","7","37.240"],["39290817","explore","351","142.044"],["387eb251","explore","28","133.704"],["37383af0","query","149","267.888"],["390c3cec","query","29","402.051"],["38368d7e","welcome","66","14.977"],["3883164c","query","17","395.830"],["37af77a3","query","45","232.284"],["b810076c","query","43","395.501"],["b86c757d","welcome","15","27.569"],["386bb217","query","34","344.258"],["b72f231c","query","136","402.282"],["37494840","explore","212","167.804"],["b8326597","explore","69","101.760"],["390d2410","explore","264","122.253"],["b7f4d0c1","explore","45","152.229"],["b7352e58","explore","44","60.815"],["38aa11a2","","20",""],["b8e22a2e","","12",""],["b805419d","query","25","338.516"],["36bf0d6a","query","37","379.165"],["b6e86a47","query","35","429.826"],["3882c89c","explore","484","151.416"],["b902786e","","124",""],["b810076c","explore","266","166.534"],["37c3eb17","explore","115","135.687"],["37eb2fcd","welcome","37","44.768"],["3972909f","welcome","14","24.809"],["377d4673","query","95","385.574"],["b8ea6996","explore","81","159.551"],["b9200590","explore","58","74.929"],["383c44cb","welcome","49","27.789"],["b8bee8a9","query","63","456.428"],["3891da7b","query","17","363.179"],["b919a166","index","21","23.713"],["38400295","query","72","453.922"],["b8cadf66","","53",""],["387bd683","index","27","44.555"],["b7d7b5f5","welcome","33","40.015"],["b6e86a47","index","12","62.960"],["b74acf21","explore","59","143.087"],["385b341d","query","109","268.215"],["38447a00","index","49","56.170"],["b810076c","","22",""],["b86c757d","welcome","20","28.042"],["38843b38","welcome","7","6.583"],["b8045be3","explore","142","82.806"],["b9101f6d","query","67","337.193"],["39744ff2","query","128","344.329"],["b72f2109","welcome","7","15.962"],["38cef8ac","welcome","7","19.243"],["385b341d","explore","363","88.864"],["b801e6e5","query","47","343.821"],["391c2252","explore","200","91.895"],["38afab8e","query","32","442.696"],["38b45947","explore","170","172.338"],["b81dde6c","explore","26","35.761"],["38843b38","welcome","7","23.330"],["3811afac","query","138","400.998"],["b6f10532","query","25","378.015"],["b7abd6cd","query","142","340.737"],["36349e28","welcome","7","30.431"],["386bb217","explore","165","117.134"],["38d8c63a","explore","45","154.962"],["b81dde6c","index","32","50.914"],["39152737","query","78","350.292"],["380494da","index","4","63.581"],["b8a6645b","welcome","15","26.124"],["37d63bbb","query","129","429.910"],["38b45947","query","31","429.980"],["b8a1e1e5","explore","22","63.719"],["b933999c","query","38","339.995"],["b6633f1a","explore","146","105.894"],["38948563","explore","178","158.887"],["b52a98aa","explore","22","124.456"],["b8e8b49d","explore","22","158.331"],["b7352e58","explore","72","4.900"],["38343e84","query","52","453.659"],["b89da5c6","explore","205","113.850"],["b80168ac","welcome","112","21.496"],["b919a166","index","4","54.668"],["382ff46f","query","201","435.993"],["385823a9","query","64","361.645"],["b8d7bdee","explore","144","171.124"],["b834e77f","welcome","59","24.815"],["391c2252","explore","22","94.754"],["b92a41bc","welcome","7","47.299"],["3943830a","index","11","53.443"],["37247a19","query","85","413.658"],["b834730b","welcome","10","42.567"],["b6979500","explore","231","71.963"],["b7608214","query","21","372.515"],["38843b38","query","46","342.196"],["38368d7e","query","159","429.061"],["b9324e4e","query","54","439.240"],["38400295","explore","70","94.738"],["b93b8201","index","56","45.709"],["b8f1345d","welcome","17","34.058"],["b726fc97","query","17","380.205"],["395fce5f","explore","27","152.051"],["b89da5c6","explore","104","56.412"],["39769889","explore","354","146.648"],["b8ac8acd","explore","69","110.639"],["38edbb55","query","96","379.257"],["38400295","query","81","305.220"],["b940c33b","index","20","61.037"],["b90b128b","explore","472","117.169"],["394fc6e8","query","232","388.248"],["38afab8e","explore","80","121.553"],["b8ca7291","query","97","461.256"],["b906df62","index","35","44.672"],["b8bb9d02","explore","48","90.226"],["b89da5c6","explore","126","91.871"],["385b341d","explore","72","97.841"],["b90182be","welcome","23","29.104"],["38868413","explore","130","120.000"],["b8971322","explore","22","73.825"],["b95d95b8","query","128","429.418"],["383c44cb","explore","83","115.720"],["37eb2fcd","query","249","409.603"],["b8246fe0","welcome","11","38.401"],["37265bd1","query","32","381.279"],["b9856d43","explore","84","132.388"],["38a7f88b","explore","22","121.267"],["b8c67786","explore","32","89.342"],["38f0a207","welcome","202","29.635"],["b7aefa94","index","4","60.536"],["b7352e58","explore","105","95.193"],["39365da1","query","17","363.651"],["b85f1c7f","query","165","476.193"],["b9005d0b","query","415","434.729"],["396197d3","query","49","403.770"],["b8b22c28","welcome","19","38.685"],["3915cc59","","106",""],["b31efa97","welcome","29","26.264"],["3915cc59","","10",""],["3882d1ef","welcome","23","44.999"],["b78cd4cc","query","117","416.465"],["b7abd6cd","query","104","406.511"],["38e60476","welcome","7","15.959"],["36653a24","explore","22","52.832"],["3891f3e2","explore","325","137.434"],["3946238e","welcome","7","18.792"],["b72d9375","explore","214","149.041"],["39035eea","query","87","367.738"],["b7abd6cd","query","92","345.549"],["b902786e","explore","320","67.530"],["396197d3","index","45","25.748"],["38948563","query","122","270.309"],["b8a03224","explore","275","104.373"],["b72d9375","query","188","317.509"],["37e71d7c","","26",""],["37dadc3e","welcome","18","41.132"],["b8834bbe","welcome","80","29.343"],["b94525bf","query","52","413.436"],["385b96d4","query","289","387.798"],["b78cd4cc","explore","48","201.518"],["380494da","query","44","405.180"],["38c09959","index","4","39.884"],["381dc7c6","index","4","33.666"],["39035eea","query","50","377.306"],["38dd6b90","","13",""],["382ff46f","welcome","53","23.683"],["390d2410","welcome","7","35.227"],["b8beba55","explore","153","133.799"],["b834730b","explore","106","107.784"],["37e71d7c","welcome","9","37.122"],["3596f875","query","81","343.760"],["38aa11a2","","53",""],["3796f292","index","4","68.701"],["b52a98aa","explore","336","103.837"],["b9856d43","index","20","72.472"],["385f952a","explore","90","60.199"],["396197d3","query","278","414.753"],["391b2370","query","170","298.807"],["b696bfa2","explore","109","101.824"],["38592e00","explore","130","108.641"],["b7352e58","explore","233","73.432"],["38e8ab3d","explore","31","116.510"],["3907e5b0","","30",""],["b8e22a2e","explore","79","82.014"],["3913fdaf","index","15","58.009"],["38a5cc26","query","78","390.930"],["383c44cb","query","103","311.309"],["b81f57a4","query","53","271.506"],["b80a0db4","query","151","271.307"],["b92d0688","welcome","11","37.667"],["b8ad224b","welcome","21","23.694"],["b9552f4f","query","170","303.807"],["b92b2caf","query","95","366.311"],["b755da2b","welcome","23","31.921"],["b7b4e7ac","explore","139","82.036"],["38b23f71","query","17","396.242"],["38861a87","welcome","8","29.597"],["b8ac8acd","query","84","361.257"],["38d95664","query","107","443.136"],["38ded491","explore","42","103.807"],["39769889","explore","102","95.862"],["387c10ce","query","228","264.094"],["b8e8b49d","query","17","340.013"],["b6f10532","welcome","7","40.304"],["b795879c","welcome","42","35.132"],["38420c72","explore","215","111.300"],["b830c67c","query","25","336.248"],["b8ac8acd","explore","22","51.563"],["37a768f1","explore","116","70.276"],["b82f8b2a","explore","35","90.108"],["38dd6b90","query","97","361.900"],["b80d45c6","welcome","7","36.493"],["38978417","query","23","255.874"],["388aadd7","query","95","282.867"],["b7abd6cd","explore","22","97.355"],["b880c13a","welcome","7","22.168"],["b9005d0b","welcome","7","24.815"],["b8acc8e1","explore","186","208.140"],["38447a00","welcome","64","31.311"],["36f3e2b0","","15",""],["396197d3","query","26","415.247"],["b919a166","query","94","515.782"],["37a768f1","query","65","458.367"],["b93477eb","welcome","12","27.453"],["381dc7c6","query","60","294.965"],["b7339a70","query","44","437.980"],["b80d45c6","explore","22","119.426"],["394b68a5","query","50","322.282"],["b8255a74","index","8","68.626"],["b8da5ce2","explore","296","105.621"],["3819d95d","welcome","7","28.524"],["b8ea6996","","56",""],["37eb2fcd","explore","22","81.498"],["39083a44","explore","65","63.797"],["38c09959","explore","33","110.138"],["b980e6ce","query","43","416.994"],["39152737","welcome","8","39.528"],["3907e5b0","query","17","311.715"],["38b45947","query","33","445.413"],["b85c022e","welcome","23","27.074"],["37c3532d","query","38","405.803"],["b8bf9af4","query","165","310.387"],["392d18b2","query","31","434.024"],["b93477eb","query","52","339.774"],["b8f1bf15","explore","122","127.310"],["b830c67c","explore","167","38.488"],["38d49209","welcome","9","45.086"],["b8e92871","","73",""],["b9552f4f","explore","205","100.997"],["387eb251","explore","33","120.152"],["37d63bbb","explore","22","99.129"],["b8d05715","explore","69","106.307"],["b754f50b","welcome","10","35.734"],["b7aefa94","","42",""],["387eb251","","54",""],["b5e7f657","explore","227","81.189"],["b714dc46","explore","68","103.517"],["b6f10532","query","58","437.309"],["b8a70c57","query","84","326.323"],["b948b6f9","query","17","413.579"],["b8326597","index","4","39.744"],["b9418299","query","52","403.242"],["38539d8c","","70",""],["b89705a9","query","52","338.277"],["37eb2fcd","query","17","443.347"],["38f4230b","index","7","45.334"],["387bd683","explore","99","131.219"],["b90ce38e","","20",""],["b9101f6d","query","31","443.392"],["b90b46ff","query","344","275.223"],["b8beba55","query","60","426.447"],["38a7f88b","explore","63","193.025"],["3851b535","query","48","461.251"],["b7968805","welcome","43","59.459"],["b9316463","index","25","29.546"],["37d9801d","index","4","58.000"],["b8a754d1","explore","153","126.804"],["b9893bc9","query","132","378.156"],["b78b2440","query","27","314.761"],["38adbc1c","","10",""],["385b96d4","query","22","244.569"],["b888e833","query","109","472.698"],["38868413","index","10","28.585"],["37265bd1","query","20","314.458"],["b72f231c","query","37","419.085"],["b31efa97","query","48","419.098"],["38b23f71","welcome","17","28.885"],["394fc6e8","query","30","336.509"],["38ea393f","query","250","448.798"],["38a7f88b","welcome","7","31.659"],["b89da5c6","explore","175","137.702"],["38dd6b90","welcome","9","27.789"],["b94525bf","explore","94","87.329"],["38c738d1","query","488","326.332"],["b7fc776f","query","114","333.575"],["38343e84","welcome","7","31.453"],["37d78acc","explore","154","90.599"],["38f26220","explore","22","103.479"],["b85f1c7f","explore","134","121.823"],["b696bfa2","index","4","71.960"],["387eb251","query","100","311.353"],["b8780b92","welcome","10","36.138"],["b8971322","explore","49","171.412"],["3851b535","index","4","62.061"],["b7d7b5f5","welcome","65","41.686"],["b8e22a2e","query","61","422.126"],["37265bd1","query","214","426.536"],["38da8baa","explore","79","149.018"],["b881be6d","","10",""],["b81579d6","explore","66","128.154"],["b8e22a2e","welcome","18","36.346"],["39087f58","query","78","356.008"],["b7a47e56","query","153","431.245"],["b31efa97","index","12","41.774"],["b7968805","welcome","78","33.187"],["39372d62","query","192","282.032"],["b888e833","explore","43","112.829"],["b9893bc9","welcome","18","29.440"],["38343e84","query","17","377.560"],["b8faab12","query","17","479.024"],["39290817","welcome","7","31.733"],["b9893bc9","explore","131","66.607"],["38e60476","welcome","80","27.924"],["b7fc776f","query","17","366.724"],["39769889","query","62","439.500"],["b9b22f3d","","21",""],["b72d9375","query","37","334.858"],["b8f3e8b9","welcome","27","30.121"],["b8da5ce2","welcome","16","27.532"],["b6e86a47","explore","159","143.217"],["38861a87","explore","31","162.423"],["374a37eb","explore","22","169.410"],["3907e5b0","welcome","81","37.140"],["b8529553","explore","172","93.263"],["b8ac2813","explore","535","93.639"],["36f3e2b0","","64",""],["374b43a9","query","17","433.975"],["37afb00b","query","17","385.337"],["b93b8201","query","17","455.614"],["38d7936e","explore","227","112.258"],["b82f8b2a","explore","25","76.421"],["3836f29a","explore","157","167.728"],["b789800a","explore","70","77.636"],["b81579d6","query","17","337.765"],["38a57213","","48",""],["b809a459","query","123","417.729"],["38f0a207","welcome","25","29.145"],["b9077d3a","query","45","319.154"],["3792ae33","welcome","63","33.706"],["b8a03224","","103",""],["3891da7b","welcome","142","32.680"],["b8b22c28","explore","55","158.078"],["b712de52","index","4","44.066"],["37c3eb17","explore","49","137.254"],["b8e8b49d","index","31","107.537"],["b91c49f9","welcome","18","32.114"],["b91dabaf","welcome","21","45.223"],["3913fdaf","explore","64","80.871"],["b8b0892f","explore","80","102.830"],["385b341d","query","17","452.766"],["38beeb4d","query","84","409.190"],["b8289f1a","welcome","56","32.107"],["b8290074","welcome","8","28.315"],["391c9704","query","93","281.066"],["386c41b3","query","21","359.038"],["39365da1","query","91","313.539"],["389fde1c","index","4","51.126"],["b7608214","query","17","429.961"],["b7821e5c","","10",""],["395fce5f","explore","38","100.269"],["384dc7aa","explore","159","102.467"],["b9324e4e","explore","30","115.142"],["b78358d5","welcome","7","33.402"],["b7339a70","query","73","451.820"],["b7a97dbb","query","32","442.882"],["b81dde6c","query","41","390.590"],["b8e8b49d","query","60","241.529"],["38d49209","","61",""],["38400295","query","64","404.873"],["b834e77f","explore","166","128.079"],["b8b0892f","query","79","409.199"],["3915cc59","query","40","351.919"],["38d6f36c","welcome","21","36.567"],["b80a0db4","explore","71","48.177"],["b8a70c57","explore","42","147.091"],["b6979500","query","350","408.865"],["b948b6f9","explore","22","149.543"],["b7ef02de","explore","140","93.282"],["38b96a95","query","73","495.746"],["36653a24","query","56","381.327"],["b8319d86","","151",""],["379d5ea8","query","43","413.372"],["b7939ddb","query","17","390.476"],["b83524be","query","17","357.281"],["39035eea","welcome","28","22.984"],["b80d45c6","query","48","359.778"],["b8f13334","","26",""],["b8e8b49d","query","27","437.665"],["b8ea6996","index","4","55.711"],["391b2370","welcome","28","34.432"],["39132f5c","query","72","384.212"],["b84ad865","welcome","78","12.578"],["b9893bc9","explore","93","78.925"],["b7b4e7ac","query","17","381.436"],["b7e4ccd5","welcome","21","43.005"],["b31efa97","explore","79","40.526"],["b830c67c","welcome","91","37.950"],["b8d05715","explore","141","103.387"],["38b537e4","","48",""],["385b6916","welcome","26","40.655"],["b80a0db4","explore","60","145.976"],["38e60476","welcome","43","37.899"],["b85081f3","index","23","59.219"],["39290817","query","17","390.537"],["37d701af","query","214","382.425"],["b9552f4f","query","33","338.698"],["b8a70c57","query","17","473.705"],["b905f518","explore","265","95.612"],["390d2410","welcome","29","26.704"],["b7a97dbb","query","147","368.518"],["386e6d49","query","71","493.845"],["b52a98aa","explore","43","118.741"],["38b537e4","query","17","315.564"],["b94b611d","","10",""],["371b3e13","query","17","226.093"],["b8a0d52a","query","143","385.177"],["b919a166","query","107","336.602"],["b835e95b","query","113","390.524"],["38edbb55","","85",""],["b8bb3849","","69",""],["b89705a9","query","17","321.773"],["38f4c8db","query","69","320.376"],["38592e00","explore","71","97.321"],["39132f5c","explore","74","88.398"],["b81dde6c","query","40","392.879"],["b91c49f9","explore","180","35.375"],["b7608214","explore","70","175.475"],["38c738d1","welcome","20","34.171"],["b938dc06","welcome","9","47.257"],["b92b2caf","welcome","7","25.138"],["38ebcacd","explore","109","113.247"],["b754f50b","welcome","7","43.954"],["38aa30c2","explore","212","56.339"],["3907e5b0","query","44","405.297"],["b7ef02de","query","52","336.515"],["3796f292","welcome","78","20.789"],["385b341d","query","105","481.903"],["38d9a089","welcome","38","32.565"],["b901e1ee","explore","22","243.176"],["b8ea6996","query","17","438.941"],["b85081f3","","32",""],["3915cc59","explore","208","200.239"],["38948563","welcome","7","8.592"],["38b30542","index","11","42.876"],["38e60476","welcome","82","23.267"],["3968d642","query","17","393.500"],["b902786e","explore","22","114.901"],["381e3950","explore","22","98.791"],["3596f875","explore","47","9.061"],["385823a9","","28",""],["b7b4e7ac","welcome","7","36.619"],["375ad4d0","explore","64","175.976"],["b90fca82","welcome","34","19.325"],["390c3cec","","44",""],["b8780b92","query","57","363.751"],["b805419d","explore","74","65.203"],["36a3d2fe","explore","22","113.807"],["382b8a89","query","90","333.657"],["38539d8c","welcome","8","33.957"],["b919a166","query","78","558.225"],["b78b2440","explore","65","89.401"],["385f952a","query","31","313.202"],["b7de74ad","welcome","7","37.344"],["39035eea","query","69","439.294"],["387e5fd3","welcome","48","30.668"],["385b6916","query","55","450.725"],["38aa11a2","welcome","60","46.169"],["b92d0688","","21",""],["38d8c63a","query","34","359.351"],["380edea5","explore","89","102.001"],["3796f292","query","80","370.140"],["b7e4ccd5","explore","87","151.442"],["3880ebea","","10",""],["b834e77f","query","224","376.350"],["3883164c","explore","115","133.955"],["b881be6d","explore","203","97.531"],["388aadd7","explore","64","145.440"],["b7fc776f","query","167","401.543"],["39744ff2","index","8","28.648"],["385d970c","query","20","343.981"],["b84c5c67","explore","46","70.239"],["387c10ce","","42",""],["b8c1fc74","welcome","7","23.039"],["3600fd8c","query","17","396.838"],["b8ac8acd","query","86","427.737"],["38f4c8db","explore","75","105.790"],["3811afac","query","17","383.908"],["388aadd7","query","17","315.629"],["b8319d86","query","69","431.015"],["38aa11a2","explore","141","52.175"],["b6f10532","explore","22","96.485"],["b85f1c7f","query","83","406.243"],["38f0a207","explore","45","161.494"],["b8a03224","query","296","458.074"],["b8781981","explore","94","88.436"],["36f7fdad","explore","132","61.581"],["b72f231c","welcome","10","20.201"],["3811afac","query","17","344.491"],["3906759e","","72",""],["b90ce38e","welcome","7","35.078"],["b8c1fc74","query","65","401.652"],["b74acf21","welcome","7","26.525"],["39744ff2","query","33","345.066"],["39365da1","explore","228","221.238"],["38368d7e","query","343","248.360"],["38ded491","query","22","488.947"],["394b68a5","index","38","32.581"],["3972909f","query","86","353.758"],["b89da5c6","","10",""],["b8823cc9","query","17","338.107"],["b87ea259","query","152","416.322"],["b8acc8e1","explore","22","128.790"],["b6979500","welcome","17","21.484"],["3790a77c","explore","22","104.083"],["b5e7f657","explore","101","104.892"],["b81579d6","query","120","357.766"],["38b23f71","query","144","416.824"],["380494da","query","19","386.710"],["3900e284","query","27","337.598"],["374a37eb","","12",""],["b808f9b5","explore","62","147.398"],["b75759c1","welcome","115","35.605"],["39152737","explore","170","140.701"],["b8cf3b88","query","47","412.869"],["b84ad865","explore","321","90.920"],["385b341d","welcome","69","38.649"],["b8326597","query","41","476.459"],["b7ef02de","query","48","390.012"],["390d2410","index","4","40.157"],["b432dbc8","explore","235","170.986"],["b8f1bf15","","61",""],["390d2410","query","58","223.009"],["b81dde6c","query","159","335.686"],["b80d45c6","explore","174","51.861"],["b881be6d","welcome","39","23.828"],["3943830a","explore","344","105.743"],["3792ae33","index","11","27.325"],["b72f2109","query","31","470.771"],["b80b6056","welcome","20","42.605"],["b7abd6cd","explore","87","96.329"],["b94b611d","explore","42","130.079"],["b72d9375","welcome","11","38.445"],["b9418299","query","28","439.800"],["363d3fbf","index","83","51.123"],["b8f13334","explore","162","89.389"],["38cef8ac","explore","76","158.072"],["38a7f88b","explore","29","54.649"],["39087f58","explore","22","147.242"],["b80a0db4","query","58","373.898"],["b52a98aa","query","148","404.230"],["37afb00b","explore","72","167.379"],["b9316463","welcome","7","30.674"],["b805419d","welcome","95","39.517"],["b81f57a4","explore","22","135.176"],["b9106aff","query","17","388.297"],["38b537e4","","10",""],["37d63bbb","query","28","356.596"],["391b2370","query","147","363.758"],["396197d3","explore","127","147.538"],["b85081f3","index","15","65.413"],["39472aee","query","17","424.548"],["b7821e5c","query","86","454.548"],["b7aa9958","query","38","397.241"],["371ef2ec","explore","207","93.531"],["37d63bbb","explore","208","53.595"],["b81dde6c","","35",""],["395b5e7b","query","76","438.828"],["3895c490","query","78","365.585"],["38a5cc26","query","43","318.831"],["b8255a74","index","14","50.435"],["b8903a5b","query","199","401.748"],["b80168ac","index","33","75.435"],["b8319d86","welcome","38","36.422"],["37c3eb17","query","17","470.121"],["37494840","query","72","417.257"],["b7de74ad","query","89","422.038"],["b86c757d","query","19","410.698"],["385b96d4","explore","642","45.061"],["38b23f71","explore","154","109.728"],["b696bfa2","welcome","40","38.348"],["b7aefa94","query","29","409.105"],["38343e84","","14",""],["b8246fe0","explore","22","148.028"],["b7de74ad","","73",""],["b896dfeb","query","17","313.602"],["390d2410","explore","68","89.952"],["b90ce463","query","65","420.411"],["b834730b","query","17","393.989"],["b84ad865","query","84","471.538"],["371b3e13","query","138","477.059"],["377d4673","index","28","55.889"],["b880c13a","query","17","332.970"],["36349e28","","42",""],["b7352e58","explore","83","132.888"],["381dc7c6","explore","133","54.601"],["377d4673","query","93","377.310"],["b86c757d","query","122","416.211"],["395b5e7b","explore","23","117.393"],["b8ca7291","explore","29","101.934"],["38aa30c2","explore","66","147.982"],["3895c490","query","17","379.884"],["393c832e","explore","22","72.977"],["3686429c","query","17","418.078"],["b8a03224","welcome","32","42.807"],["b714dc46","query","127","315.320"],["b95d95b8","query","19","447.880"],["b830c67c","welcome","50","32.237"],["b8583fdd","","82",""],["b88d8eb8","explore","116","126.279"],["b8a0d52a","query","296","428.371"],["b8780b92","explore","24","94.968"],["385b341d","query","174","473.252"],["b5e7f657","query","141","370.078"],["b938dc06","index","136","21.621"],["36f3e2b0","","116",""],["b81579d6","explore","58","115.628"],["3895c490","explore","158","174.728"],["38cef8ac","index","15","60.550"],["b901a7bb","query","86","351.009"],["b89da5c6","explore","326","151.376"],["b9098814","explore","22","133.479"],["38d8c63a","index","6","51.433"],["b7a97dbb","query","61","305.664"],["38d8c63a","query","118","415.266"],["b9098814","explore","25","116.293"],["b808f9b5","query","61","322.299"],["b92d0688","query","20","469.319"],["b80a0db4","","10",""],["b919a166","query","400","262.242"],["b8e92871","welcome","70","27.180"],["385b341d","explore","370","131.953"],["b8ccfe2a","welcome","30","37.039"],["b7aa9958","query","91","414.016"],["b7b4e7ac","query","23","324.320"],["b92a41bc","query","33","432.184"],["36653a24","","99",""],["b72f2109","index","28","58.915"],["b8bee8a9","explore","78","106.917"],["394b68a5","index","8","36.645"],["b8cb4c88","query","123","369.119"],["38f4230b","explore","106","59.783"],["37d701af","welcome","7","20.123"],["b72f231c","explore","63","134.632"],["b8c875ac","query","57","468.305"],["383c44cb","explore","22","120.120"],["3836f29a","query","71","490.866"],["b6e86a47","explore","33","105.916"],["38824d6d","welcome","9","14.480"],["b8ccfe2a","explore","22","73.289"],["b7894aac","query","55","473.828"],["377d4673","index","13","40.619"],["39087f58","query","68","412.541"],["3907e5b0","query","117","455.718"],["38b30542","query","76","418.682"],["39132f5c","index","26","43.105"],["38aa11a2","explore","96","110.670"],["38b96a95","query","131","344.071"],["b7707626","query","44","412.862"],["b7aefa94","query","52","248.205"],["b84c5c67","query","24","400.770"],["b808f9b5","explore","52","73.816"],["38d7936e","query","17","322.526"],["3920dfb4","explore","173","92.830"],["38368d7e","welcome","30","35.792"],["b7f4d0c1","query","29","378.742"],["b81f57a4","welcome","25","41.742"],["394fc6e8","welcome","7","28.104"],["b92d0688","explore","31","135.083"],["37d63bbb","query","63","396.310"],["38a57213","explore","22","63.818"],["b89da5c6","welcome","38","24.648"],["37d8b9ed","welcome","72","27.136"],["b7c012a8","welcome","71","35.419"],["3606bab5","explore","95","77.726"],["b933999c","query","334","370.860"],["37c3532d","explore","142","157.545"],["b906df62","query","39","409.139"],["39083a44","query","35","336.830"],["3851b535","","115",""],["385b341d","explore","115","80.897"],["b92b2caf","welcome","13","33.013"],["38843b38","query","27","450.764"],["b85f1c7f","index","22","45.609"],["b80b6056","query","64","444.506"],["b8bab8ec","query","164","403.647"],["39092208","index","47","58.461"],["3968d642","query","17","296.136"],["b9893bc9","index","30","44.488"],["b8ccfe2a","explore","22","102.618"],["b8a6645b","query","181","441.461"],["37af77a3","index","4","58.376"],["b6a668ba","index","4","58.128"],["b7de74ad","query","17","339.741"],["b834e77f","explore","250","152.031"],["b754f50b","explore","22","197.993"],["380edea5","index","4","42.900"],["b80e549c","welcome","58","27.025"],["b7de74ad","","67",""],["36f7fdad","explore","55","104.960"],["b7352e58","explore","22","152.355"],["387bd683","query","91","384.518"],["b9106aff","welcome","24","50.275"],["3880ebea","query","21","521.778"],["38c09959","query","27","364.691"],["b9552f4f","","54",""],["b7707626","query","77","303.301"],["387bd683","explore","34","93.131"],["b7968805","welcome","26","19.369"],["b8acc8e1","query","26","326.390"],["b8a70c57","explore","22","84.431"],["38e8ab3d","query","75","496.704"],["b789800a","explore","179","130.019"],["b6f10532","explore","262","160.898"],["b8246fe0","index","4","55.039"],["3819d95d","explore","252","126.879"],["38e85a88","welcome","7","27.108"],["37dadc3e","explore","84","20.469"],["b80d45c6","query","47","417.804"],["b7f4d0c1","welcome","10","23.795"],["b78139ab","explore","68","137.841"],["b91dabaf","explore","22","47.200"],["b8c875ac","query","161","376.438"],["b904a87b","query","29","376.803"],["b8ac2813","explore","118","100.074"],["3909e239","explore","46","212.598"],["b8c1fc74","index","23","30.016"],["383c44cb","query","30","360.714"],["38843b38","query","19","356.417"],["b81edf15","index","26","48.498"],["b90b128b","index","49","60.143"],["36f7fdad","index","7","57.969"],["379333c6","explore","133","156.118"],["b72f231c","index","4","30.481"],["38861a87","","230",""],["38af774a","query","174","449.388"],["b80e549c","explore","91","87.515"],["379fe829","query","130","374.286"],["387eb251","query","62","457.265"],["b8beba55","explore","62","94.477"],["b8ccfe2a","query","31","320.560"],["384665e3","explore","287","135.151"],["b7a97dbb","","15",""],["38b30542","query","44","422.098"],["b933999c","query","346","342.310"],["38b537e4","explore","407","49.421"],["37d78acc","welcome","15","34.123"],["3819d95d","query","73","503.980"],["b8bab8ec","query","173","420.619"],["b8290074","query","17","338.119"],["b7894aac","query","53","321.521"],["38978417","query","17","388.149"],["37494840","explore","40","103.010"],[""]]

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(20);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(22)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./../../node_modules/sass-loader/index.js!./app.scss", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./../../node_modules/sass-loader/index.js!./app.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(21)();
	// imports
	
	
	// module
	exports.push([module.id, "body {\n  margin: auto;\n  font-family: Lato, sans-serif !important; }\n\ntd, th {\n  padding-left: 1em !important; }\n\ninput {\n  border: none !important;\n  margin-left: 1em;\n  font-weight: normal; }\n\n.navbar {\n  font-size: 16px;\n  font-weight: 300; }\n\n.navbar-logo {\n  background-image: url(https://www.wagonhq.com/images/logo-mono.png);\n  background-position: 0% 50%;\n  background-repeat: no-repeat;\n  background-size: 61px 30px;\n  display: inline;\n  margin-right: 15px;\n  padding-bottom: 15px;\n  padding-left: 31px;\n  padding-right: 30px;\n  padding-top: 15px; }\n\nh2 {\n  box-sizing: border-box;\n  color: #183c69;\n  display: block;\n  font-family: Lato, sans-serif;\n  font-size: 34px;\n  font-weight: 500;\n  height: 30px;\n  line-height: 30.6px;\n  margin-bottom: 30px;\n  margin-top: 20px;\n  text-align: center; }\n", ""]);
	
	// exports


/***/ },
/* 21 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0;
	
	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function createStyleElement() {
		var styleElement = document.createElement("style");
		var head = getHeadElement();
		styleElement.type = "text/css";
		head.appendChild(styleElement);
		return styleElement;
	}
	
	function createLinkElement() {
		var linkElement = document.createElement("link");
		var head = getHeadElement();
		linkElement.rel = "stylesheet";
		head.appendChild(linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement());
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement();
			update = updateLink.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement();
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ }
/******/ ]);
//# sourceMappingURL=main.js.map