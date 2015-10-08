// var Constants = require('../constants/app_constants');
// var Store = require('../stores/app_store');
// var Actions = require('../actions/app_actions');
var Table = require('./table');

var WebAPIUtils = require('../utils/WebAPIUtils');
WebAPIUtils.getData();

var App = React.createClass({
  render () {
    return(
      <div className="app">
        App
        <Table/>
      </div>
    );
  }
});

//Inline CSS Styles(excludes hover)
var styles ={
  base:{

  }
}

module.exports = App;
