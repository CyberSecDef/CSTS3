/*
	Namespace: csts.routes
	This is the set of routes used by the csts application
*/
$.extend(csts.routes,{
	'/Test' 			: function(){ console.log('in here'); $('#main-center-col').html('this is a test') },
	'/Home' 			: 'Home@main.index',
	'/Scans/compare' 	: 'Scans@comparison.index',
	'/Scans/scans2Poam'	: 'Scans@scans2poam.index'
});
