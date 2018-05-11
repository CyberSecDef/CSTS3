csts.models.Accounts = {
  name: 'Accounts',
  dormantAccounts: {
    users: [],
    async execute(hosts, ous, age) {
      this.computers = hosts.replace(' ', ',')
        .replace(/(?:\r\n|\r|\n)/g, ',')
        .split(',')
        .filter(h => h !== undefined && h.trim() !== '');

      ous.sort();

      let ps = csts.libs.ad.getUsers(ous);
      ps.invoke()
        .then((output) => {
          ps.dispose();
          console.log(output);
          $.each(JSON.parse(output), (index, user) => {
            console.log(user);
            csts.controllers.Accounts.dormantAccounts.addRow([
              '',
              'Domain',
              user.Properties.displayname,
              user.Properties.name,
              (user.Properties.lastlogontimestamp !== null ? csts.plugins.moment(new Date((user.Properties.lastlogontimestamp / 1e4) - 1.16444736e13)).format('MM/DD/YYYY HH:mm:ss') : ''),
              '',
            ]);
          });
        });

      ps = csts.libs.ad.getComputers(ous);
      ps.invoke()
        .then((output) => {
          ps.dispose();
          console.log(output);
          $.each(JSON.parse(output), (index, item) => {
            if (item.Properties !== null && this.computers.filter(a => a === item.Properties.cn).length === 0) {
              console.log(item);
              this.computers.push(item.Properties.cn.toLowerCase());
            }
          });
          console.log(this.computers);
          this.computers.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
          let active = 0;
          if (this.computers.length < 1) {
            csts.controllers.Accounts.dormantAccounts.cease();
          }
          this.computers.forEach((h) => {
            console.log(h);
            active += 1;
            csts.plugins.wmi.Query({
              class: 'Win32_PingStatus',
              where: `Address="${h}"`,
            }, (err, res) => {
              if (typeof res[0].StatusCode !== 'undefined' && res[0].StatusCode === 0) {
                const accounts = JSON.parse(csts.libs.ad.adsiGetLocalAccounts(h, age));
                if (typeof accounts !== 'undefined') {
                  accounts.forEach((user) => {
                    csts.controllers.Accounts.dormantAccounts.addRow([h, user.AccountType, user.DisplayName, user.Username, (user.LastLogon !== null ? csts.plugins.moment(user.LastLogon.DateTime).format('MM/DD/YYYY HH:mm:ss') : '')]);
                  });
                }
              }
              active -= 1;
              if (active === 0) {
                csts.controllers.Accounts.dormantAccounts.cease();
              }
            });
          });
        })
        .catch((err) => { console.log(err); });
    }
  },
  manageLocalUsers: {
    computers: [],
    updateAccount(host, user, payload) {
      csts.models.Accounts.ps1 = csts.libs.ad.adsiUpdateAccount(host, user, payload);
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
              where: `Address="${h}"`,
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
        })
        .catch((err) => { console.log(err); });
    },
  },
}
