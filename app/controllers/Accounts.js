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
  manageLocalUsers: {
    name: 'Manage Local Accounts',
    default: 'showIndex',
    ActionEnum: Object.freeze({
      ENABLE: 0,
      DISABLE: 1,
      DELETE: 2,
    }),
    showIndex() {
      csts.plugins.ejs.renderFile(
        'app/resources/views/pages/accounts/manageLocalUsers.tpl',
        {},
        { rmWhitespace: true },
        (err, str) => {
          if (err) { 
            $('#errors').html(err).show();
            $('#main-center-col').animate({ scrollTop: ($('#errors').offset().top) }, 1000);
          }
          $('#main-center-col').html(str);
        },
      );
    },
    execute() {
      const caller = this;
      const ous = [];
      let hosts = $('div.hostManual textarea').val();
      $('#adOUTree input:checkbox:checked').each((i, c) => { ous.push($(c).data('path')); });
      $('table#accounts-manageLocalUsers-results-tbl tbody').empty();
      $('#errors').html('');
      $('#errors').hide();

      $('#myModal').modal();
      $('#myModalLabel').text('Please Wait...');
      $('#myModalBody').html('Currently Scanning systems.  Please wait.');
      $('#myModal')
        .one('shown.bs.modal', () => {
          csts.models.Accounts.manageLocalUsers.execute(hosts, ous);
          setTimeout(() => {
            $('#headingTwo h5 button').click();
            $('#myModal').modal('hide');
          }, 5000);
        });
    },
    addRow(row) {
      const rh = $('<tr></tr>');
      $.each(row, (r, e) =>{ rh.append( $('<td></td>').html( e ) ) });
      $('table#accounts-manageLocalUsers-results-tbl tbody').append(rh);

      const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

      const comparer = (idx, asc) => (a, b) => ((v1, v2) => 
          v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
          )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));

        Array.from($('table#accounts-manageLocalUsers-results-tbl tbody').find('tr:nth-child(n+1)'))
            .sort(comparer(1, true))
            .forEach(tr => $('table#accounts-manageLocalUsers-results-tbl tbody').append(tr) );
      
    },
    manageAccount(account, payload) {
      console.log('Controller -> manageAccount');
      $('#errors').html('');
      $('#errors').hide();
      const user = account.split('@')[0];
      const host = account.split('@')[1];
      csts.models.Accounts.manageLocalUsers.updateAccount(host, user, payload);
    },
  },
  userCount: {
    users: [],
    name: 'User Counts',
    default: 'showIndex',
    showIndex() {
      csts.plugins.ejs.renderFile(
        'app/resources/views/pages/accounts/userCount.tpl', {}, {
          rmWhitespace: true,
        },
        (err, str) => {
          if (err) { 
            $('#errors').html(err).show();
            $('#main-center-col').animate({ scrollTop: ($('#errors').offset().top) }, 1000);
          }
          $('#main-center-col').html(str);
        },
      );
    },
    execute() {
      const caller = this;
      const table = $('table#tabScanFiles').DataTable();
      const ous = [];

      $('#myModal').modal();
      $('#myModalLabel').text('Please Wait...');
      $('#myModalBody').html('Currently Parsing the OUs.  Please wait.');
      $('#myModal')
        .one('shown.bs.modal', () => {
          $('#adOUTree input:checkbox:checked').each((i, c) => { ous.push($(c).data('path')); });
          csts.models.Accounts.userCount.execute(ous);
          setTimeout(() => {
            $('#headingTwo h5 button').click();
            $('#myModal').modal('hide');
          }, 5000);
        });
    },
    showSummary() {
      $('#accounts-userCount-results-tbl tbody tr').remove();
      $('#accounts-userCount-results-tbl tbody')
        .append($('<tr></tr>')
          .append($('<th></th>').css('text-decoration','underline').text('Enabled').on('click', csts.models.Accounts.userCount.users.filter(a => a.Disabled === false), this.showUsers ))
          .append($('<td></td>').text(csts.models.Accounts.userCount.users.filter(a => a.Disabled === false).length))
        )
        .append($('<tr></tr>')
          .append($('<th></th>').css('text-decoration','underline').text('Disabled').on('click', csts.models.Accounts.userCount.users.filter(a => a.Disabled === true), this.showUsers ))
          .append($('<td></td>').text(csts.models.Accounts.userCount.users.filter(a => a.Disabled === true).length))
        )
        .append($('<tr></tr>')
          .append($('<th></th>').css('text-decoration','underline').text('Smartcard Required').on('click', csts.models.Accounts.userCount.users.filter(a => a.Smartcard === true), this.showUsers ))
          .append($('<td></td>').text(csts.models.Accounts.userCount.users.filter(a => a.Smartcard === true).length))
        )
        .append($('<tr></tr>')
          .append($('<th></th>').css('text-decoration','underline').text('Smartcard Not Required').on('click', csts.models.Accounts.userCount.users.filter(a => a.Smartcard === false), this.showUsers ))
          .append($('<td></td>').text(csts.models.Accounts.userCount.users.filter(a => a.Smartcard === false).length))
        )
        .append($('<tr></tr>')
          .append($('<th></th>').css('text-decoration','underline').text('Enabled Users, Smartcard Not Required').on('click', csts.models.Accounts.userCount.users.filter(a => a.Smartcard === false && a.Disabled === false), this.showUsers ))
          .append($('<td></td>').text(csts.models.Accounts.userCount.users.filter(a => a.Smartcard === false && a.Disabled === false).length))
        )
        .append($('<tr></tr>')
          .append($('<th></th>').css('text-decoration','underline').text('Enabled Users, Smartcard Required').on('click', csts.models.Accounts.userCount.users.filter(a => a.Smartcard === true && a.Disabled === false), this.showUsers ))
          .append($('<td></td>').text(csts.models.Accounts.userCount.users.filter(a => a.Smartcard === true && a.Disabled === false).length))
        )
        .append($('<tr></tr>')
          .append($('<th></th>').css('text-decoration','underline').text('Disabled Users, Smartcard Not Required').on('click', csts.models.Accounts.userCount.users.filter(a => a.Smartcard === false && a.Disabled === true), this.showUsers ))
          .append($('<td></td>').text(csts.models.Accounts.userCount.users.filter(a => a.Smartcard === false && a.Disabled === true).length))
        )
        .append($('<tr></tr>')
          .append($('<th></th>').css('text-decoration','underline').text('Disabled Users, Smartcard Required').on('click', csts.models.Accounts.userCount.users.filter(a => a.Smartcard === true && a.Disabled === true), this.showUsers ))
          .append($('<td></td>').text(csts.models.Accounts.userCount.users.filter(a => a.Smartcard === true && a.Disabled === true).length))
        )
        .append($('<tr></tr>')
          .append($('<th></th>').css('text-decoration','underline').text('Privileged').on('click', csts.models.Accounts.userCount.users.filter(a => a.Name.match( /(adm|dba|priv|psa|sadm|wadm)/ )), this.showUsers ))
          .append($('<td></td>').text(csts.models.Accounts.userCount.users.filter(a => a.Name.match( /(adm|dba|priv|psa|sadm|wadm)/ ) ).length))
        )
        .append($('<tr></tr>')
          .append($('<th></th>').css('text-decoration','underline').text('Privileged, Smartcard Required').on('click', csts.models.Accounts.userCount.users.filter(a => a.Smartcard === true && a.Name.match( /(adm|dba|priv|psa|sadm|wadm)/ )), this.showUsers ))
          .append($('<td></td>').text(csts.models.Accounts.userCount.users.filter(a => a.Smartcard === true && a.Name.match( /(adm|dba|priv|psa|sadm|wadm)/ ) ).length))
        )
        .append($('<tr></tr>')
          .append($('<th></th>').css('text-decoration','underline').text('Privileged, Smartcard Not Required').on('click', csts.models.Accounts.userCount.users.filter(a => a.Smartcard === false && a.Name.match( /(adm|dba|priv|psa|sadm|wadm)/ )), this.showUsers ))
          .append($('<td></td>').text(csts.models.Accounts.userCount.users.filter(a => a.Smartcard === false && a.Name.match( /(adm|dba|priv|psa|sadm|wadm)/ ) ).length))
        )
        .append($('<tr></tr>')
          .append($('<th></th>').css('text-decoration','underline').text('Privileged, Disabled').on('click', csts.models.Accounts.userCount.users.filter(a => a.Disabled === true && a.Name.match( /(adm|dba|priv|psa|sadm|wadm)/ )), this.showUsers ))
          .append($('<td></td>').text(csts.models.Accounts.userCount.users.filter(a => a.Disabled === true && a.Name.match( /(adm|dba|priv|psa|sadm|wadm)/ ) ).length))
        )
        .append($('<tr></tr>')
          .append($('<th></th>').css('text-decoration','underline').text('Privileged, Disabled, Smartcard Required').on('click', csts.models.Accounts.userCount.users.filter(a => a.Disabled === true && a.Smartcard === true && a.Name.match( /(adm|dba|priv|psa|sadm|wadm)/ )), this.showUsers ))
          .append($('<td></td>').text(csts.models.Accounts.userCount.users.filter(a => a.Disabled === true && a.Smartcard === true && a.Name.match( /(adm|dba|priv|psa|sadm|wadm)/ ) ).length))
        )
        .append($('<tr></tr>')
          .append($('<th></th>').css('text-decoration','underline').text('Privileged, Disabled, Smartcard Not Required').on('click', csts.models.Accounts.userCount.users.filter(a => a.Disabled === true && a.Smartcard === false && a.Name.match( /(adm|dba|priv|psa|sadm|wadm)/ )), this.showUsers ))
          .append($('<td></td>').text(csts.models.Accounts.userCount.users.filter(a => a.Disabled === true && a.Smartcard === false && a.Name.match( /(adm|dba|priv|psa|sadm|wadm)/ ) ).length))
        )
        .append($('<tr></tr>')
          .append($('<th></th>').css('text-decoration','underline').text('Total').on('click', csts.models.Accounts.userCount.users.filter(a => a), this.showUsers ) )
          .append($('<td></td>').text(csts.models.Accounts.userCount.users.filter(a => a).length))
        );
    },
    showUsers(u) {
      $('#accounts-usercount-detailed-results-table tbody tr').remove();
      u.data.forEach((i) => {
        $('#accounts-usercount-detailed-results-table tbody').append( $(`<tr><td>${i.Path}</td><td><u>${i.Name}</u></td><td>${i.Disabled}</td><td>${i.Smartcard}</td></tr>`) );
        $('#accounts-usercount-detailed-results-table tbody td:contains("true")').css('font-weight', 'bold').css('color', 'darkgreen').css('background-color', '#f9fff9').css('text-align','center');
        $('#accounts-usercount-detailed-results-table tbody td:contains("false")').css('font-weight', 'bold').css('color', 'darkred').css('background-color', '#fff9f9').css('text-align','center');
      });
    }

  },

});

