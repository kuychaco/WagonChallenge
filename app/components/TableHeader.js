var Actions = require('../actions/TableActions');
var Store = require('../stores/TableStore');
var _ = require('underscore');


function getStateFromStores() {
  return {
    headerNames: Store.getHeaderNames()
  };
};

var TableHeader = React.createClass({
  getInitialState () {
    return getStateFromStores();
  },
  handleKeyUp (columnIndex, e) {
    var searchTerm = React.findDOMNode(this.refs[columnIndex]).value.trim();
    Actions.setFilter(columnIndex, searchTerm);
    console.log('Filter for', searchTerm);
  },
  render () {
    var contents = this.state.headerNames.map((header, columnIndex) => {
      return (
        <th key={header}>
          {header.toUpperCase()}
          <input type="text" placeholder="search" ref={columnIndex} onKeyUp={_.debounce(this.handleKeyUp.bind(this, columnIndex), 200)} />
        </th>);
    });
    return (
      <div className="tableHeader">
        <thead>
          <tr> {contents} </tr> </thead>
      </div>
    )
  }
});

module.exports = TableHeader;
