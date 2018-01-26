var csts = {
	init : function(){
		nw.Window.get().showDevTools()
		require('knockout')
		csts.require('../node_modules/knockout/build/output/knockout-latest.js');
		
		//include library files.  These are individually listed for ordering purposes
		$.each([
			'./public/js/jquery-ui.js',
			'./public/js/bootstrap.bundle.js',
			'./public/js/fontawesome-all.js',
			'./public/js/jquery.tree.js',
			'./public/js/jquery.dataTables.js',
		], function(index, item){csts.require(item)});

		//include routes
		$.each(
			csts.plugins.fs.readdirSync('./app/routes/'), 
			function(index, item){csts.require('./routes/' + item)}
		);

		//controllers
		$.each(
			csts.plugins.fs.readdirSync('./app/controllers/'), 
			function(index, item){csts.require('./controllers/' + item)}
		);

		//models
		$.each(
			csts.plugins.fs.readdirSync('./app/models/'), 
			function(index, item){csts.require('./models/' + item)}
		);
		
		csts.db.config = new csts.plugins.Datastore({ filename: 'app/database/config.db', autoload: true });		
		csts.db.config.count( { 'viewCount' : { $gt : 0 } }, function(err, count){
			if(count == 0){
				csts.db.config.insert({viewCount : 1});	
			}else{
				csts.db.config.findOne( { 'viewCount' : { $gt : 0 } }, function(err, res){
					csts.db.config.update({ _id : res._id}, { $set : {viewCount : (res.viewCount+1) } });
					csts.db.config.persistence.compactDatafile();
				});
			}
		})
		
		csts.plugins.tray.tooltip = "Cyber Security Tool Suite v3.0.0";
		csts.plugins.win.width 	= ( csts.plugins.win.width < 1280 ? 1280 : csts.plugins.win.width);
		csts.plugins.win.height = ( csts.plugins.win.height < 800 ? 800	 : csts.plugins.win.height);
		csts.plugins.ejs.delimeter = '$';

		csts.plugins.reload = csts.plugins.fs.watch('./app', {recursive: true}, function(eventType, filename) {
			if( filename.substring(0,8) != 'database' ){
				location.href='/app/index.html';
				reloadWatcher.close();
			}
		});

		csts.router = new csts.plugins.navigo(location.origin,false,'#');

		var dt = require( 'datatables.net' )();

		$(document).ready(function(){
			$.each(csts.routes, function(name, val){
				switch(typeof val){
					case 'string' :
						c = val.substring(0,val.indexOf('@'));
						f = val.substring(val.indexOf('@')+1);
						
						csts.router.on(name, csts.controllers[c][f] );
						console.log('Created router for ' + name);
						break;
					case 'function' :
						console.log("creating function call to " + name);
						console.log(val);
						csts.router.on(name, val);
						break;
				}
			});

			
			csts.db.config.findOne({ 'viewCount' : { $gt : 0 } },function(err,res){ 
				console.log(res.viewCount);
				$('#viewCount').text( res.viewCount ); 
				csts.plugins.ejs.cache.set('viewCount', res.viewCount);
			});
			
			
			csts.plugins.ejs.renderFile('app/resources/views/layouts/default.tpl',{
				'username' 	: process.env.USERNAME,
				'url' 		: location.valueOf().pathname.replace('/app','').replace('index.html','')
			},{},function(err,str){
				if(err){
					console.log(err);
				}
				$('body').html(str);
			}) ;

			//this function calls the routing without actually navigating away
			csts.plugins.win.on('navigation', function(frame, url, policy){
				$('#main-center-col *').remove();
				
				window.onbeforeunload = null; 
				policy.ignore();
				req = url.replace(location.origin,'')
				console.log("Request: '" + req + "'");
				$('#main-center-col').html('');
				csts.router.navigate(req);
				
				return false;
			});

			csts.controllers['Home'].index();
			
			//ADDED THIS FOR DEBUGGING PURPOSES
			csts.controllers['Scans'].compare();	
			
			
			
			$('footer.footer div div.status-bar-l').text( 'You are running on ' + csts.plugins.os.platform());

		})
	},
	require : function(script){
		$.ajax({
			url: script,
			dataType: "script",
			async: false,           // <-- This is the key
			success: function () {
				console.log('included ' + script);
			},
			error: function () {
				throw new Error("Could not load script " + script);
			}
		});
	},
	ad	: {
		fqdn	: function(){
			if(typeof process.env.USERDNSDOMAIN !== 'undefined'){
				return process.env.USERDNSDOMAIN;
			}else if(typeof process.env.USERDOMAIN !== 'undefined'){
				return process.env.USERDOMAIN;
			}else{
				return 'local';
			}
		},
		ouChildren 	: function(ou){
			let ps = (new csts.plugins.shell({executionPolicy: 'Bypass',noProfile: true}));
			let results = "";
			if(typeof ou !== 'undefined' && ou !== ''){
				ps.addCommand("$objPath= New-Object System.DirectoryServices.DirectoryEntry '" + ou + "'")
			}else{
				ps.addCommand("$objPath= New-Object System.DirectoryServices.DirectoryEntry")
			}
			ps.addCommand("$objSearcher = New-Object System.DirectoryServices.DirectorySearcher")
			ps.addCommand("$objSearcher.SearchRoot = $objPath")
			ps.addCommand("$objSearcher.PageSize = 1000")
			ps.addCommand("$objSearcher.SearchScope = 'OneLevel'")
			ps.addCommand("$results = @();")
			ps.addCommand("$objSearcher.findall() | sort-object { $_.properties.ou} | ? { $_.path -like '*//OU=*'} | % { $results += @{ 'Name' = $($_.properties.name) ; 'OU' = $($_.properties.ou); 'Path' = $($_.properties.adspath); 'DN' =  $($_.properties.distinguishedname); } }")
			ps.addCommand("add-type -assembly system.web.extensions")
			ps.addCommand("$ps_js=new-object system.web.script.serialization.javascriptSerializer")
			ps.addCommand("$ps_js.Serialize($results) ")
			return ps;
		}
	},
	db			: {},
	routes 		: {},
	router 		: {},
	models 		: {},
	controllers : {},
	utils		: {
		toggleHosts	: function(){
			if(	$('#main-right-col').is(':visible') ){
				$('#main-right-col').hide()
				$('#main-center-col').removeClass('col-10').addClass('col-12')
			}else{
				$('#main-right-col').show()
				$('#main-center-col').removeClass('col-12').addClass('col-10')
			}
		},
		guid : function(){
		  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
			(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
		  );
		}
	},
	plugins : {
		'crypto'	: require('crypto'),
		'dns'		: require('dns'),
		'fs' 		: require('fs'),
		'ejs'		: require('ejs'),
		'os'		: require('os'),
		'moment'	: require('moment'),
		'navigo'	: require('navigo'),
		'path'		: require('path'),
		'util'		: require('util'),
		'zlib'		: require('zlib'),
		'tray' 		: (new nw.Tray({ title: 'Tray', icon: 'app/public/images/csts.png' }) ),
		'win'		: nw.Window.get(),
		'reload'	: {},
		'shell'		: require('node-powershell'),
		'xlsx'		: require('xlsx'),	
		'Datastore' : require('nedb'),
	}

};
csts.init();