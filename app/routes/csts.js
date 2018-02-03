/*
	Package: csts.routes
	This is the set of routes used by the csts application
*/
$.extend(csts.routes,{
	'/Test' 			: function(){ console.log('in here'); $('#main-center-col').html('this is a test') },
	'/Home' 			: 'Home@index',
	'/Scans/compare' 	: 'Scans@compare'
});
