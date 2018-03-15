csts.models.Accounts = {
  name: 'Accounts',
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
