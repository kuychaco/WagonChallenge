
class App extends React.Component{
  constructor(props) {
    super(props);
    $('body').css('backgroundColor','#1f352b');
    $('body').css('color','white');
  }

  render(){
    return(
      <div>
        <Jumbotron style={styles.jumbo}>
          <Row style={styles.row}>
            <img src="assets/images/mtn.png" className="col-md-1"/>
            <h1 className="col-md-10">Welcome to React-Flux-Starter-Kit</h1>
            <img src="assets/images/mtn.png" className="col-md-1"/>
          </Row>
        </Jumbotron>
        <Row  style={css(styles.body,styles.row)}>
          <h1 className="text-center">Using the Starter Kit</h1>
          <hr />
          <div className="col-md-3"></div>
          <div className="col-md-6" style={styles.display} >
            <h2>App Folder</h2>
            <h3>Components</h3>
            <p>All React Components Should go into this folder. To generate a React component you can use the installed mtn
              CLI:<br/><br/>
              <span style={styles.code}>mtn dew component [NameInCapCase] [-c]</span> <br/><br/>
              in the folder you want the component to be created in. Running the
              command with a
              <span style={styles.code}>-c</span>
              at the end will generate a component with additional comments for starting out. Another
              additional feature of the starter kit is a simple way to combine multiple style objects on a react component.
              We implement a function called css which can be use as follows: <br/><br/> <span style={styles.code}> {raw} </span><br/><br/>
              It also has many modules globally accessible such as:
              <ol><li>React</li><li>ReactBootstrap's Components</li><li>Jquery</li><li>JqueryUI</li></ol>
            </p>
            <h3>Flux</h3>
            <p>
              The Starter Kit holds a convention on how you should use flux and provides some nice generator commands to help
              build a flux architecture very quickly. Just like with generating a component you can generate flux files quickly.
              <br/><br/><span style={styles.code}>mtn dew flux [NameInCapCase] [-c]</span> <br/><br/> Again you can include the
              <span style={styles.code}>-c</span> argument to generate with additional comments.
              It generates 4 files
              using underscored_names for the files and CapCase names for the modules and has them properly linked together:
              <ol><li>[name]_actions.js</li><li>[name]_constants.js</li><li>[name]_dispatcher.js</li><li>[name]_store.js</li></ol>
            </p>
            <h3>Router</h3>
            <p>
              The Starter Kit comes built in with a router call future-router. It is a simple router that is supposed to help
              facilitate keeping state and transitioning easily between states. The router is located in app/router.js. It watches
              any changes to the window location and will invoke the corresponding route. This allows you to create a href with
              the url to navigate to or you can dynamically invoke a route. Since generating the href url can be tedious, there is an
              easy way to generate the url in a href attribute. Here's how you can go about using it:<br/><br/>
              <ol>
                <li>First create the route definition in router.js. You must include the root route as this is the entry point to the site.
                  Anything you want can happen in a route and a route allows arguments to be passed in as url-encoded arguments but usually you will
                  want to mount and unmoint components. <em>To do this you need to do the unmounting and mounting only in the router.</em>For example if
                  want to initially have the start page component mounted on a page tag, you would not in your component initally have it nested under it.
                  React requires that the unmounting and mounting happen in the same place. You can visit the home page for examples: <a href="https://github.com/timthez/future-router">Future Router</a>
                </li>
                <li>
                  You can use these routes in your components in an href like so: <br/><br/>
                  <span style={styles.code}>Router.route('nameOfRoute',{"{argsOBJ: 'args'}"})</span>
                  <br/><br/>
                  To invoke it dynamically such as on a button click:<br/><br/>
                  <span style={styles.code}>Router.route('nameOfRoute',{"{argsOBJ: 'args'}"},true)</span>
                </li>
              </ol>
            </p>
          </div>
          <div className="col-md-3"></div>
        </Row>
        <Row style={css(styles.row)}>
          <h1 className="text-center">What now?</h1>
          <hr />
          <div className="col-md-3"></div>
          <div className="col-md-6" style={styles.display} >
            <h1>Replace app.js</h1>
            <p>This start page's source code is currently app.js. I would recommend replacing it by deleting it and running <br/><br/>
            <span style={styles.code}>mtn dew component App</span> <br/> <br/>
            I would also like to note that it is not written in the way you should write a react application as it is not broken down into components for the sake of only having to delete
            a single file rather than several.
            </p>
            <h1>Useful Links</h1>
            <ul>
              <li><a href="http://reactkungfu.com/">React Kungfu</a></li>
              <li><a href="https://github.com/timthez/react-flux-starter-kit" >React-Flux-Starter-Kit</a></li>
              <li><a href="http://react-bootstrap.github.io/components.html">React Bootstrap</a></li>
              <li><a href="https://github.com/timthez/future-router">Future Router</a></li>
              <li></li>
            </ul>
          </div>
          <div className="col-md-3"></div>
        </Row>
         <Row style={css(styles.row)}>
          <h1 className="text-center">Good Luck and Happy Coding </h1>
          <h1 className="text-center">Grab yourself a DEW while your at it.</h1>
          </Row>
      </div>
    )
  }
};
var raw='<div style={ css(styles.base, styles.first, styles.second, ...) } >';
var styles ={
  jumbo:{
    color: '#1f352b',
    position: 'fixed',
    zIndex: '10'
  },
  row:{
    marginLeft: '0px',
    marginRight: '0px'
  },
  body:{
    paddingTop: '197px',
  },
  display:{
    backgroundColor: '#a4a4a4',
    color: '#1f352b',
    paddingBottom:'30px'
  },
  code:{
    backgroundColor: '#71907b',
    marginRight:'5px',
    marginLeft:'5px'
  }

}

module.exports = App;
