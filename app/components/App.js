var MyTable = require('./Table');
var AppHeader = require('./AppHeader');

var WebAPIUtils = require('../utils/WebAPIUtils');
WebAPIUtils.getData();

require('../stylesheets/app.scss');

var App = React.createClass({
  render () {
    return(
      <div>
        <AppHeader />
        <h2> Wagon Programming Challenge </h2>
        <Panel className="app">
          <MyTable/>
        </Panel>
      </div>
    );
  }
});

module.exports = App;
