var Actions = require('../actions/TableActions');
var Store = require('../stores/TableStore');

var TableRow = require('./TableRow');

function getStateFromStores () {
  return {
    headerTypes: Store.getHeaderTypes()
  }
}

var SearchRow = React.createClass({
  getInitialState () {
    return getStateFromStores()
  },
  handleSubmit (columnIndex, e) {
    e.preventDefault();
    var searchTerm = React.findDOMNode(this.refs[columnIndex]).value.trim();
    Actions.setFilter(columnIndex, searchTerm);
    console.log('Filter for', searchTerm);
  },
  render () {
    var types = this.state.headerTypes;
    var content = types.map((type, columnIndex) => {
      return (
        <td key={type+columnIndex}>
          <form onSubmit={this.handleSubmit.bind(this, columnIndex)}>
            <input type="text" placeholder={type} ref={columnIndex} />
          </form>
        </td>
      );
    });

    return (
      <div className="searchRow">
        <tr> {content} </tr>
      </div>
    );
  }
})


var styles ={
  base:{

  }
}

module.exports = SearchRow;
