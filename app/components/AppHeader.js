

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

            <a href="/">
            <span className="navbar-brand">
            <div className="navbar-logo"></div>
            <span>Wagon Challenge</span>
            </span>
            </a>
          </div>

          <div className="collapse navbar-collapse" id="wagon-navbar-collapse">
            <ul className="nav navbar-nav navbar-right">
              <li><a href="linkedin.com/in/katrinauychaco">About</a></li>
              <li><a href="g​ithub.com/kuychaco">GitHub</a></li>
              <li><a href="https://medium.com/@katrinauychaco/demystify-backbone-js-series-introduction-736ee355cb08">Blog</a></li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
});

module.exports = AppHeader;
