/*
  Namespace: Controllers.Accounts

  Description:
    This is the Accounts controller for the CSTS

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
csts.controllers.Accounts = ({

/*
  Variables: Properties

  controllerName - the name of the controller
*/
  controllerName: 'Accounts',

  userCount: {
    name: 'User Counts',
    default: 'showIndex',
    showIndex() {
      csts.plugins.ejs.renderFile(
        'app/resources/views/pages/accounts/userCount.tpl', {}, {
          rmWhitespace: true,
        },
        (err, str) => {
          if (err) {
            $('#errors').html(err);
          }
          $('#main-center-col').html(str);
        },
      );
    },
    execute() {
      const caller = this;
      const ous = [];
      const users = [];
      $('#adOUTree input:checkbox:checked').each((i, c)=>{ous.push($(c).data('path'))});
      ous.sort();
      const ps = csts.libs.ad.getUsers(ous);
      ps.invoke().then((output) => {
        console.log(output);
        $.each(JSON.parse(output), (index, item) => {
          if (users.filter(a => a.Name === item.Properties.samaccountname).length === 0) {
            users.push({
              Path: item.Path,
              Disabled: item.Disabled,
              Name: item.Properties.samaccountname,
            });
          }
        });

      }).catch((err) => {
        console.log(err);
      });
      console.log(users);
    },


  },

});

