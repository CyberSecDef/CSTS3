csts.models.Accounts = {
  name: 'Accounts',
  manageLocalUsers: {
    computers: [],
    updateAccount(host, user, payload) {
      console.log('Models -> updateAccount');
      csts.models.Accounts.ps1 = csts.libs.ad.adsiUpdateAccount(host, user, payload);
      csts.models.Accounts.ps1.invoke()
        .then((output) => {
          csts.models.Accounts.ps1.dispose();
          console.log('adsi output');
        }).catch((err) => {
          $('#errors').html(err);
          $('#errors').show();
          $('#main-center-col').animate({ scrollTop: ($('#errors').offset().top) }, 1000);
          csts.models.Accounts.ps1.dispose();
        });
    },
    async execute(hosts, ous) {
      this.computers = hosts.replace(' ', ',')
        .replace(/(?:\r\n|\r|\n)/g, ',')
        .split(',')
        .filter(h => h !== undefined && h.trim() !== '');

      ous.sort();
      let ps = csts.libs.ad.getComputers(ous);
      ps.invoke()
        .then((output) => {
          ps.dispose();
          $.each(JSON.parse(output), (index, item) => {
            if (this.computers.filter(a => a === item.Properties.cn).length === 0) {
              this.computers.push(item.Properties.cn.toLowerCase());
            }
          });

          this.computers.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
          console.log(this.computers);

          this.computers.forEach((h) => {
            csts.plugins.wmi.Query({
              class: 'Win32_PingStatus', 
              where:`Address="${h}"`
            }, (err, res) => {
              if (typeof res[0].StatusCode !== 'undefined' && res[0].StatusCode === 0) {
                csts.plugins.wmi.Query({
                  class: 'Win32_UserAccount',
                  host: h,
                  where: 'LocalAccount = True',
                }, (uErr, users) => {
                  console.log(users);
                  users.forEach((user) => {
                    csts.controllers.Accounts.manageLocalUsers.addRow(
                      [
                        $('<input></input>').attr('type', 'checkbox').prop('checked', 'false').val(btoa(`${user.Name}@${h}`)).prop('outerHTML'),
                        h, user.Name, user.Description, user.Status,
                        user.Lockout.toString().toUpperCase(),
                        user.Disabled.toString().toUpperCase(),
                        user.PasswordRequired.toString().toUpperCase(),
                      ],
                    );
                  });
                });
              }
            });
          });

          //csts.controllers.Accounts.manageLocalAdmins.showSummary();
          //$('#headingTwo h5 button').click();
          //$('#myModal').modal('hide');
        })
        .catch((err) => { console.log(err); });
    },
  },
  userCount: {
    users: [],
    async execute(ous) {
      ous.sort();
      let ps = csts.libs.ad.getUsers(ous);
      ps.invoke()
        .then((output) => {
          ps.dispose();
          $.each(JSON.parse(output), (index, item) => {
            if (this.users.filter(a => a.Name === item.Properties.samaccountname).length === 0) {
              this.users.push({ 
                Path: item.Path,
                Name: item.Properties.samaccountname, 
                Disabled: (item.UAC & 2) !== 0,
                Smartcard: (item.UAC & 262144) !== 0,
                UAC: item.UAC });
            }
          });
          this.users.sort((a, b) => a.Name < b.Name ? -1 : a.Name > b.Name ? 1 : 0 );
          csts.controllers.Accounts.userCount.showSummary();
          $('#headingTwo h5 button').click();
          $('#myModal').modal('hide');
        })
        .catch((err) => { console.log(err); });
    },
  },
}
