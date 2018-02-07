/*
  Namespace: csts.libs.ad
  Active Directory functions
*/
csts.libs.ad = {
  /*
    Method: fqdn
    Determines the hosts fully qualified domain name

    Parameters:

    Returns:
      String - FQDN of host

    See Also:
      <ouChildren>
  */
  fqdn() {
    if (typeof process.env.USERDNSDOMAIN !== 'undefined') {
      return process.env.USERDNSDOMAIN;
    } else if (typeof process.env.USERDOMAIN !== 'undefined') {
      return process.env.USERDOMAIN;
    }
    return 'local';
  },

  /*
    Method: ouChildren
    Returns the child nodes for a given OU

    Parameters:
      ou - String of path to OU

    Returns:
      String - JSON object of OU children

    See Also:
      <fqdn>
  */
  ouChildren(ou) {
    const ps = (new csts.plugins.Shell({
      executionPolicy: 'Bypass',
      noProfile: true,
    }));

    if (typeof ou !== 'undefined' && ou !== '') {
      ps.addCommand(`$objPath= New-Object System.DirectoryServices.DirectoryEntry '${ou}'`);
    } else {
      ps.addCommand('$objPath= New-Object System.DirectoryServices.DirectoryEntry');
    }
    ps.addCommand('$objSearcher = New-Object System.DirectoryServices.DirectorySearcher');
    ps.addCommand('$objSearcher.SearchRoot = $objPath');
    ps.addCommand('$objSearcher.PageSize = 1000');
    ps.addCommand("$objSearcher.SearchScope = 'OneLevel'");
    ps.addCommand('$results = @();');
    ps.addCommand("$objSearcher.findall() | sort-object { $_.properties.ou} | ? { $_.path -like '*//OU=*'} | % { $results += @{ 'Name' = $($_.properties.name) ; 'OU' = $($_.properties.ou); 'Path' = $($_.properties.adspath); 'DN' =  $($_.properties.distinguishedname); } }");
    ps.addCommand('add-type -assembly system.web.extensions');
    ps.addCommand('$ps_js=new-object system.web.script.serialization.javascriptSerializer');
    ps.addCommand('$ps_js.Serialize($results) ');
    return ps;
  },
};
