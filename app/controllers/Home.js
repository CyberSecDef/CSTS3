/*
  Namespace: Controllers.Home

  Description:
    This is the baseline controller for the CSTS

  License:
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

  Category:
    Controller

  Package:
    CSTSv3

  Author:
    Robert Weber <wwwdaze2000@gmail.com>

  Copyright:
    2018 - RFW
*/
csts.controllers.Home = ({

/*
  Variables: Properties

  controllerName - the name of the controller
*/
  controllerName: 'Home',

  /*
    Class: Controllers.Home.main
    This is the container for the main homepage functions
  */
  main: {
    /*
      Method: showHome

      Description:
        Method that is called for the main home page of the application

      Returns:
        {void}
    */
    showHome() {
      csts.plugins.ejs.renderFile('app/resources/views/pages/home/home.tpl', {}, {}, (err, str) => {
        $('#main-center-col').html(str);
      });
    },
  },

});

