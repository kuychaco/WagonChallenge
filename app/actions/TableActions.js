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
  },
  // setSessionIDFilter: function(searchTerm) {
  //   Dispatcher.dispatch({
  //     type: Constants.SET_SESSIONID_FILTER,
  //     searchTerm: searchTerm
  //   });
  // },
  // setPageFilter: function(pageType) {
  //   Dispatcher.dispatch({
  //     type: Constants.SET_PAGE_FILTER,
  //     pageType: pageType
  //   });
  // }
};

module.exports = TableActions;
