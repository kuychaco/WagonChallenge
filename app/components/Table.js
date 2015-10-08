var Store = require('../stores/TableStore');

var TableRow = require('./TableRow');
var TableHeader = require('./TableHeader');
var SearchRow = require('./SearchRow');

function getStateFromStores() {
  return {
    data: Store.getData()
  };
};

var Table = React.createClass({
  getInitialState() {
    return getStateFromStores();
  },
  componentDidMount() {
    Store.addChangeListener(this.onChange);
  },
  componentWillUnmount() {
    Store.removeChangeListener(this.onChange);
  },
  onChange() {
    this.setState(getStateFromStores());
  },
  render() {
    console.log('render')
    var contents = [];
    this.state.data.forEach((rowData, i) => {
      if (i===0) return;
      contents.push((
        <TableRow data={rowData} />
      ));
    });

    return(
      <div className="table">
        Table
        <table>
          <TableHeader />
          <tbody>
            <SearchRow />
            {contents}
          </tbody>
        </table>
      </div>
    );
  }
});

//Inline CSS Styles(excludes hover)
var styles ={
  base:{

  }
}

module.exports = Table;
