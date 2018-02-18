/*
  Namespace: Routes

  Description:
    This is the set of routes used by the csts application

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
    Routes

  Package:
    CSTSv3

  Author:
    Robert Weber <wwwdaze2000@gmail.com>

  Copyright:
    2018 - RFW

  Routes:
    Test - Test function
    Home - Main Home Page
    CompareRarPoam - The CompareRarPoam applet
    scans2poam - The scans2poam applet
*/
$.extend(csts.routes, {
  '/Test': () => { $('#main-center-col').html('this is a test'); },
  '/Home': 'Home@main.showHome',
  '/Scans/compareRarPoam': 'Scans@compareRarPoam.showIndex',
  '/Scans/scans2Poam': 'Scans@scans2poam.showIndex',
});

