/*
  Namespace: csts.controllers.Home
  This is the baseline controller for the CSTS
*/
csts.controllers.Home = ({

/*
  Variables: Properties

  controllerName - the name of the controller
*/
  controllerName: 'Home',

  /*
    Namespace: csts.controllers.Home.main
    This is the container for the main homepage functions
  */
  main: {
    /*
      Method: showHome
      function that is called for the main home page of the application
    */
    showHome() {
      csts.plugins.ejs.renderFile('app/resources/views/pages/home/home.tpl', {}, {}, (err, str) => {
        $('#main-center-col').html(str);
      });
    },
  },

});
