var fs = require('fs');
var ejs = require('ejs');
ejs.delimeter = '$';

var os = require('os');	


var win = nw.Window.get();
if(win.width < 1280){
	win.width = 1280;
}

if(win.height < 800){
	win.height = 800;
}

var reloadWatcher=fs.watch('./', {recursive: true}, function() {
	location.href='/app/index.html';
	reloadWatcher.close();
});

var controllers = {};

var router = new Navigo(location.origin,false,'#');

$(document).ready(function(){
	$.each(nw.global.routes, function(name, val){
		switch(typeof val){
			case 'string' :
				c = val.substring(0,val.indexOf('@'));
				f = val.substring(val.indexOf('@')+1);
				
				router.on(name, global.controllers[c][f] ).resolve();
				console.log('Created router for ' + name);
				break;
			case 'function' :
				console.log("creating function call to " + name);
				console.log(val);
				router.on(name, val);
				
				break;
		}
	})

	ejs.renderFile('app/resources/views/layouts/default.tpl',{
		'username' : process.env.USERNAME,
		'url' : location.valueOf().pathname.replace('/app','').replace('index.html','')
	},{},function(err,str){
		if(err){
			console.log(err);
		}
		$('body').html(str);
	}) ;

	nw.Window.get().on('navigation', function(frame, url, policy){
		window.onbeforeunload = function() { return false; }
		policy.ignore();
		req = url.replace(location.origin,'')
		console.log("Request: " + req);
		
		router.navigate(req);
		return false;
	});


	global.controllers['Home'].index();	
	$('footer.footer div div.status-bar-l').text( 'You are running on ' + os.platform());

})