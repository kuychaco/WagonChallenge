

var AppHeader = React.createClass({
  render () {
    return(
      <nav className="navbar navbar-default navbar-static-top" role="navigation">
        <div className="container">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#wagon-navbar-collapse">
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>

            <a href="https://www.wagonhq.com" target="_blank">
            <span className="navbar-brand">
            <div className="navbar-logo"></div>
            <span>Wagon </span>
            </span>
            </a>
          </div>

          <div className="collapse navbar-collapse" id="wagon-navbar-collapse">
            <ul className="nav navbar-nav navbar-right">
              <li><a href="https://linkedin.com/in/katrinauychaco" target="_blank">About</a></li>
              <li><a href="https://g​ithub.com/kuychaco" target="_blank">GitHub</a></li>
              <li><a href="https://medium.com/@katrinauychaco" target="_blank">Blog</a></li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
});

module.exports = AppHeader;
