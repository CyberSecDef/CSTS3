/*
  Namespace: Libs.AD

  Description:
    Active Directory Functions

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
    Library

  Package:
    CSTSv3

  Author:
    Robert Weber <wwwdaze2000@gmail.com>

  Copyright:
    2018 - RFW
*/
csts.libs.ad = {
  /*
    Array - shells
    Holds any shell objects until they can be disposed of at application termination
  */
  shells: {},

  /*
    Method: getFqdn

    Description:
      Determines the hosts fully qualified domain name

    Parameters:

    Returns:
      {String} - FQDN of host

  */
  getFqdn() {
    if (typeof process.env.USERDNSDOMAIN !== 'undefined') {
      return process.env.USERDNSDOMAIN;
    } else if (typeof process.env.USERDOMAIN !== 'undefined') {
      return process.env.USERDOMAIN;
    }
    return 'local';
  },

  /*
    Method: getOuChildren

    Description:
      Returns the child nodes for a given OU

    Parameters:
      ou - String of path to OU

    Returns:
      String - JSON object of OU children

  */
  getOuChildren(ou) {
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
  /*
    Method: getUsers

    Description:
      Returns the users contained within the specified OU

    Paramters:
      ou - string of path to OU
      filter - ldap filter for returned users

    Returns:
      string - JSON object of users
    */
  getUsers(ous, filter = '') {
    const ad = (new csts.plugins.Shell({ executionPolicy: 'Bypass', noProfile: true }));
    ad.addCommand(`$domainUsers = @();`);
    ous.forEach((ou) => {
      ad.addCommand(`$objstalesearcher = New-Object System.DirectoryServices.DirectorySearcher( ( [adsi]"${ou}" ) );`);
      ad.addCommand(`$objstalesearcher.filter = "(&(objectCategory=person)(objectClass=user)${filter})";`);
      ad.addCommand("$domainusers += $objstalesearcher.findall() | select *, @{e={[string]$adspath=$_.properties.adspath;$account=[ADSI]$adspath;$account.psbase.invokeget('userAccountControl')};n='UAC'}");
    });
    ad.addCommand('@( "[]", $($domainusers | ConvertTo-Json -compress))[ [int]($domainusers.length -gt 0)];');
    return ad;
  },

  getComputers(ous) {
    const ad = (new csts.plugins.Shell({ executionPolicy: 'Bypass', noProfile: true }));
    ad.addCommand('$domainComputers = @();');
    ous.forEach((ou) => {
      ad.addCommand(`$objstalesearcher = New-Object System.DirectoryServices.DirectorySearcher( ( [adsi]"${ou}" ) );`);
      ad.addCommand('$objstalesearcher.filter = "(&(objectCategory=computer))";');
      ad.addCommand('$domainComputers += $objstalesearcher.findall() | select *');
    });
    ad.addCommand('@( "[]", $($domainComputers | ConvertTo-Json -compress))[ [int]($domainComputers.length -gt 0)];');
    return ad;
  },
};

