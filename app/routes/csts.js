$.extend(csts.routes,{
	'/Test' 			: function(){ console.log('in here'); $('#main-center-col').html('this is a test') },
	'/Home' 			: 'Home@index',
	'/Scans/compare' 	: 'Scans@compare'
});
