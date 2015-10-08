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
  render () {
    var contents = this.state.headerNames.map((header) => {
      return (<th key={header}> {header} </th>);
    });
    return (
      <div className="tableHeader">
        <thead> <tr> {contents} </tr> </thead>
      </div>
    )
  }
});

var styles ={
  base:{

  }
}

module.exports = TableHeader;
