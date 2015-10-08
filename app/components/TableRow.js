var Constants = require('../constants/TableConstants');
var Store = require('../stores/TableStore');
var Actions = require('../actions/TableActions');

var TableRow = React.createClass({
  render () {
    var contents = this.props.data.map((data) => {
      return (<td> {data} </td>);
    });
    return (
      <div className="tableRow">
        <tr> {contents} </tr>
      </div>
    );
  }
});

var styles ={
  base:{

  }
}

module.exports = TableRow;
