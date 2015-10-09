var Actions = require('../actions/TableActions');
var Store = require('../stores/TableStore');

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
    if (e.which === 13) {
      Actions.setFilter(columnIndex, searchTerm);
      console.log('Filter for', searchTerm, 'in column', columnIndex);
    }
    else if (e.which === 8 && searchTerm.length === 0) {
      Actions.setFilter(columnIndex, undefined);
      console.log('Clear filter for column', columnIndex);
    }
  },
  render () {
    var contents = this.state.headerNames.map((header, columnIndex) => {
      return (
        <th key={header}>
          {header.toUpperCase()}
          <input type="text" placeholder="search" ref={columnIndex} onKeyUp={this.handleKeyUp.bind(this, columnIndex)} />
        </th>);
    });
    return (
      <div className="tableHeader">
        <thead>
          <tr> {contents} </tr>
        </thead>
      </div>
    )
  }
});

module.exports = TableHeader;
