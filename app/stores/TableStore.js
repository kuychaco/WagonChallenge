var Dispatcher = require('../dispatchers/Dispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/TableConstants');
var assign = require('object-assign');

var _ = require('lodash');

var CHANGE_EVENT = 'change';

var headerNames = [];
var headerTypes = [];
var originalData = [];
var filterTerms = [];
var filteredData = [];
// var filteredSet = null;
// var pageRowsByType = {};


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

    case Constants.SET_PAGE_FILTER:
      filterByPageType(payload.pageType);
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
  _.forEach(data, (row, index) => {
    if (index === 0) { headers = row; return; }
    // if (!pageRowsByType[row[1]]) pageRowsByType[row[1]] = new Set();
    // pageRowsByType[row[1]].add(index);
    originalData.push(row);
  });
  // console.log(Object.keys(pageRowsByType));
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
  filteredData = _.reduce(filterTerms, (filteredData, filterTerm, index) => {
    return (filterTerm === undefined) ? filteredData : _.filter(filteredData, (row) => {
      return row[index] && row[index].indexOf(filterTerm) > -1;
    });
  }, originalData);
  console.log('Filtered data for: column', columnIndex, '=', searchTerm);
}

// function filterByPageType(pageType) {
//   if (filteredSet === null) {
//     filteredSet = pageRowsByType[pageType]
//   }
//   else {
//   }
//   filteredData = filterByPageType[pageType];
// }
//
// function filterByRange(column, min, max) {
//
// }
//
// function filterBySessionID(value) {
//
// }



module.exports = TableStore;
