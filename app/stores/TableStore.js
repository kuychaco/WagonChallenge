var Dispatcher = require('../dispatchers/Dispatcher');
var EventEmitter = require('events').EventEmitter;
var Constants = require('../constants/TableConstants');
var assign = require('object-assign');

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
  filteredData = filterTerms.reduce((filteredData, filterTerm, index) => {
    return (filterTerm === undefined || filterTerm === '') ? data : data.filter((row) => {
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
