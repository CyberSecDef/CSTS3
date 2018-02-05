/*
	Namespace: csts
	This is the main CSTS class that bootstraps and loads everything.  This class also creates a global object that everything can be attached to.
*/
var csts = {
	
/*
	Variable: startTime
	The time the application started
*/
	startTime : (new Date().getTime() ),	
	
/*
	Variable: db
	Wrapper to hold all the database collections
*/
	db			: {},
	
/*
	Object: routes
	Wrapper to hold all the routes used in application navigation
*/
	routes 		: {},
	
/*
	Object: router
	This holds the router object
*/
	router 		: {},
	
/*
	Object: models
	Wrapper to hold all the model objects
*/
	models 		: {},
	
/*
	Object: libs
	Wrapper to hold all the generic library objects
*/
	libs 		: {},
	
/*
	Object: controllers
	Wrapper to hold all the controller objects
*/
	controllers : {},	

/*
	Object: plugins
	wrapper for all the plugins the CSTS uses from node modules
	
		crypto - cryptographic functions
		cpu - cpu statistics
		cron - cron jobs
		dns - dns framework
		fs - file system module
		ejs - Embedded JavaScript templates
		isElevated - determins if the user is elevated
		os - pulls information from the os
		moment - used for managing time objects
		navigo - the router used for navigating the site
		path - module to handle filesystem paths
		util - utility module
		zlib - zlib compression
		tray - works with the systray and taskbar
		win - module to manage the application window
		reload - watches for changes in the file system and reloads the application
		shell - allows nwjs to interface with powershell
		si - system information module
		xlsx - reads and writes various spreadsheet files
		Datastore - database module
		
*/
	plugins : {
		'crypto'	: require('crypto'),
		'cpu'		: require('cpu-stat'),
		'cron'		: require('cron').CronJob,
		'dns'		: require('dns'),
		'fs' 		: require('fs'),
		'ejs'		: require('ejs'),
		'isElevated': require('is-elevated'),
		'os'		: require('os'),
		'moment'	: require('moment'),
		'navigo'	: require('navigo'),
		'numeral'	: require('numeral'),
		'path'		: require('path'),
		'util'		: require('util'),
		'zlib'		: require('zlib'),
		'tray' 		: (new nw.Tray({ title: 'Tray', icon: 'app/public/images/csts.png' }) ),
		'win'		: nw.Window.get(),
		'reload'	: {},
		'shell'		: require('node-powershell'),
		'si'		: require('systeminformation'),
		'xlsx'		: require('xlsx'),	
		'Datastore' : require('nedb'),
	},
	
	/*
		Method: require
		Used to include dynamic files in the browser 
	*/
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
	
	
/*
	Method: init
	This function initializes the csts class
*/
	init : function(){
		new csts.plugins.cron('1-60/6 * * * * *', 
			function(){
				csts.plugins.si.mem(function(data){ 
					p = parseFloat( data.used / data.total )
					$('#memChart').css('background', ( '#' + Math.ceil( ( 0xFF * p)).toString(16) + Math.ceil( 0xFF - ( 0xFF * p)).toString(16) + '00' ) );
				});
			}, function(){},true
		);
		
		new csts.plugins.cron('1-60/6 * * * * *', 
			function(){
				csts.plugins.cpu.usagePercent(function(err, p, seconds) {
					$('#cpuChart').css('background', ( '#' + Math.ceil( ( 0xFF * (p/99))).toString(16) + Math.ceil( 0xFF - ( 0xFF * (p/99))).toString(16) + '00' ) );
				});
				
			}, function(){},true
		);

	
		if(nw.App.manifest.environment == 'developmental'){
			nw.Window.get().showDevTools()
		}
		
		require('knockout')
		csts.require('../node_modules/knockout/build/output/knockout-latest.js');
		csts.require('../node_modules/chart.js/dist/Chart.bundle.min.js');
		csts.require('../node_modules/jspdf/dist/jspdf.min.js');
		csts.require('../node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.min.js');
		
		//include library files.  These are individually listed for ordering purposes
		$.each([
			'./public/js/jquery-ui.js',
			'./public/js/bootstrap.bundle.js',
			'./public/js/fontawesome-all.min.js',
			'./public/js/jquery.tree.js',
			'./public/js/jquery.dataTables.js',
			'./public/js/dataTables.bootstrap4.min.js',
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
		
		//lib
		$.each(
			csts.plugins.fs.readdirSync('./app/lib/'), 
			function(index, item){csts.require('./lib/' + item)}
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
			if( filename.substring(0,8) != 'database' && filename.substring(0,4) != 'docs' ){
				// console.log(filename);
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
						
						function index(obj,i) {return obj[i]} //this is magic that allows dynamic dot objects for grouping routes (scans.comparison.index)
						if(f.indexOf('.') > 0){
							csts.router.on(name, f.split('.').reduce(index, csts.controllers[c]) );
						}else{
							csts.router.on(name, csts.controllers[c][f] );	
						}
						
						break;
					case 'function' :
						csts.router.on(name, val);
						break;
				}
			});

			
			csts.db.config.findOne({ 'viewCount' : { $gt : 0 } },function(err,res){ 
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

			csts.controllers['Home'].main.index();
						
			csts.plugins.isElevated().then(elevated => {
				$('footer.footer div div.status-bar-r').html( ( elevated ? '<i class="fas fa-chess-king"></i>' : '<i class="fas fa-user"></i>' ) );
			});

		})
		csts.plugins.win.resizeTo(1600,800);
		csts.plugins.win.on('resize',function(){ csts.plugins.win.setPosition('center');  })
		
	},
};