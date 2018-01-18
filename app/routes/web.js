if(!nw.global.routes){nw.global.routes = {};}
$.extend(nw.global.routes,
{
	'/Test' : function(){ console.log('in here'); $('#main-center-col').html('this is a test') },
	'/Home' : 'Home@index',
	
});
