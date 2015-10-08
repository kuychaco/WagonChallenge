var Dispatcher = require('../dispatchers/Dispatcher');
var Constants = require('../constants/TableConstants');

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
