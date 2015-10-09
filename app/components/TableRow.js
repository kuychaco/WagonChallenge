var Constants = require('../constants/TableConstants');
var Store = require('../stores/TableStore');
var Actions = require('../actions/TableActions');

var TableRow = React.createClass({
  render () {
    var data = this.props.data;
    var contents = data.map((value, index) => {
      return (<td key={value+index}> {value} </td>);
    });
    return (<tr> {contents} </tr>);
  }
});

module.exports = TableRow;
