var Store = require('../stores/TableStore');

var TableRow = require('./TableRow');
var TableHeader = require('./TableHeader');

var _ = require('lodash');

var WebAPIUtils = require('../utils/WebAPIUtils');
WebAPIUtils.getData();

function getStateFromStores() {
  return {
    data: Store.getData()
  };
};

var MyTable = React.createClass({
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
    var contents = _.map(this.state.data, (rowData, i) => {
      return (<TableRow key={'id-'+rowData[0]+i} data={rowData} />);
    });
    return(
      <div className="table" style={styles}>
        <Table striped bordered condensed hover>
          <TableHeader />
          <tbody>
            {contents}
          </tbody>
        </Table>
      </div>
    );
  }
});

//Inline CSS Styles(excludes hover)
var styles ={
  table:{
    margin: 'auto'
  }
}

module.exports = MyTable;
