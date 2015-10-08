TableStore = require('../stores/TableStore');
TableActions = require('../actions/TableActions');

module.exports.getData = function() {
  var data = require('../../data');
  TableActions.receiveData(data);
};
