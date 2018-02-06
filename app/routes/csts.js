/*
  Namespace: csts.routes
  This is the set of routes used by the csts application
*/
$.extend(csts.routes, {
  '/Test': function () { $('#main-center-col').html('this is a test'); },
  '/Home': 'Home@main.showHome',
  '/Scans/compareRarPoam': 'Scans@compareRarPoam.showIndex',
  '/Scans/scans2Poam': 'Scans@scans2poam.showIndex',
});
