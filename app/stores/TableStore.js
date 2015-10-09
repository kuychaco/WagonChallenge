var Dispatcher = require('../dispatchers/Dispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/TableConstants');
var assign = require('object-assign');

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
  data.forEach((row, index) => {
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
  filteredData = filterTerms.reduce((filteredData, filterTerm, index) => {
    return (filterTerm === undefined) ? filteredData : filteredData.filter((row) => {
      return row[index] && row[index].indexOf(filterTerm) > -1;
    });
  }, data);
  console.log('Filtered data for: column', columnIndex, '=', searchTerm);
}

module.exports = TableStore;
