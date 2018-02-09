/*
  Namespace: csts.libs.ad
  Active Directory functions
*/
csts.libs.ad = {
  /*
    Array - shells
    Holds any shell objects until they can be disposed of at application termination
  */
  shells: {},

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
    if (csts.libs.utils.isBlank(csts.shells.ou)) {
      csts.shells.ou = (new csts.plugins.Shell({ executionPolicy: 'Bypass', noProfile: true }));
    }

    if (typeof ou !== 'undefined' && ou !== '') {
      csts.shells.ou.addCommand(`$objPath= New-Object System.DirectoryServices.DirectoryEntry '${ou}'`);
    } else {
      csts.shells.ou.addCommand('$objPath= New-Object System.DirectoryServices.DirectoryEntry');
    }
    csts.shells.ou.addCommand('$objSearcher = New-Object System.DirectoryServices.DirectorySearcher');
    csts.shells.ou.addCommand('$objSearcher.SearchRoot = $objPath');
    csts.shells.ou.addCommand('$objSearcher.PageSize = 1000');
    csts.shells.ou.addCommand("$objSearcher.SearchScope = 'OneLevel'");
    csts.shells.ou.addCommand('$results = @();');
    csts.shells.ou.addCommand("$objSearcher.findall() | sort-object { $_.properties.ou} | ? { $_.path -like '*//OU=*'} | % { $results += @{ 'Name' = $($_.properties.name) ; 'OU' = $($_.properties.ou); 'Path' = $($_.properties.adspath); 'DN' =  $($_.properties.distinguishedname); } }");
    csts.shells.ou.addCommand('add-type -assembly system.web.extensions');
    csts.shells.ou.addCommand('$ps_js=new-object system.web.script.serialization.javascriptSerializer');
    csts.shells.ou.addCommand('$ps_js.Serialize($results) ');
    return csts.shells.ou;
  },
};

