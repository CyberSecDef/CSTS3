/*
	Package: CSTS
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
	Method: init
	This function initializes the csts class
*/
	init : function(){
		new csts.plugins.cron('1-60/10 * * * * *', 
			function(){
				csts.plugins.si.mem(function(data){ 
					p = parseFloat( data.used / data.total )
					$('#memChart').css('background', ( '#' + Math.ceil( ( 0xFF * p)).toString(16) + Math.ceil( 0xFF - ( 0xFF * p)).toString(16) + '00' ) );
				});
			}, function(){},true
		);
		
		new csts.plugins.cron('1-60/10 * * * * *', 
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
						
						csts.router.on(name, csts.controllers[c][f] );
						dbg('Created router for ' + name);
						break;
					case 'function' :
						console.log("creating function call to " + name);
						console.log(val);
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

			csts.controllers['Home'].index();
						
			csts.plugins.isElevated().then(elevated => {
				$('footer.footer div div.status-bar-r').html( ( elevated ? '<i class="fas fa-chess-king"></i>' : '<i class="fas fa-user"></i>' ) );
			});

		})
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
	Package: ad
	Active directory wrapper 
*/
	ad	: {

/*
	Method: fqdn
	Determines the hosts fully qualified domain name
	
	Parameters:
	
	Returns:
		String - FQDN of host
	
	See Also:
		<ouChildren>
*/
		fqdn	: function(){
			if(typeof process.env.USERDNSDOMAIN !== 'undefined'){
				return process.env.USERDNSDOMAIN;
			}else if(typeof process.env.USERDOMAIN !== 'undefined'){
				return process.env.USERDOMAIN;
			}else{
				return 'local';
			}
		},

/*
	Method: ouChildren
	Returns the child nodes for a given OU
	
	Parameters:
		ou - String of path to OU
	
	Returns:
		String - JSON object of OU children
	
	See Also:
		<fqdn>
*/		
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

/*
	Package: export
	This object is responsible for exporting reports in DOC, PDF and CSV formats
*/
	export		: {

/*
	Method: doc
	Exports reports in DOC formats
	
	Parameters:
		content - The html content being exported
		filename - The name of the file to save as
*/
		doc	: function(content, filename){
			var css= [];
			for (var sheeti= 0; sheeti <  document.styleSheets.length; sheeti++) {
				var sheet= document.styleSheets[sheeti];
				var rules= ('cssRules' in sheet)? sheet.cssRules : sheet.rules;
				if(rules){
					for (var rulei= 0; rulei < rules.length; rulei++) {
						var rule= rules[rulei];
						if ('cssText' in rule)
							css.push(rule.cssText);
						else
							css.push(rule.selectorText+' {\n'+rule.style.cssText+'\n}\n');
					}
				}
			}
			styles = css.join('\n');
			csts.plugins.ejs.renderFile('app/resources/views/components/export/doc.tpl',{
				'styles' 	: styles
			},{},function(err,str){
				var parser = new DOMParser()
				el = parser.parseFromString(str, "text/xml");
				$(el).find('body').append( content );
				
				csts.utils.blob('text/html', el.documentElement.outerHTML , filename)
			}) ;
		},

/*
	Method: csv
	Exports reports in CSV	formats
	
	Parameters:
		data - JSON Object containing data to export
		filename - The name of the file to save as
*/
		csv : function(data, filename){
			var processRow = function (row) {
				var finalVal = '';
				for (var j = 0; j < row.length; j++) {
					var innerValue = row[j]
					if (row[j] instanceof Date) {
						innerValue = row[j].toLocaleString();
					};
					var result = innerValue.replace(/"/g, '""').replace(/[\u2018\u2019]/g, "").replace(/[\u201C\u201D]/g, '');

					if (result.search(/("|,|\n)/g) >= 0){
						result = '"' + result + '"';
					}
					if (j > 0){
						finalVal += ',';
					}
					finalVal += result;
				}
				return finalVal + '\n';
			};

			var csvFile = processRow( data.columns )
			$.each(data.rows, function(i, r){ 
				csvFile += processRow(  r  ); 
			});
			csts.utils.blob('text/csv', csvFile , filename)
		},

/*
	Method: pdf
	Exports reports in PDF formats
	
	Parameters:
		content - JSON Object containing data to export
		filename - The name of the file to save as
*/		
		pdf : function(data, filename){
			var pdf = new jsPDF('l','pt','letter');
			pdf.autoTable(data.columns, data.rows, data.styles);
			pdf.save( filename );
		}
	},

/*
	Package: utils
	Object that contains utility type functions for the CSTS
*/
	utils : {
		
/*
	Method: blob
	This method will allow files to be saved from the CSTS app (file save dialog)
	
	Parameters:
		mime - The mime type of the file to save
		content - The data to be saved
		filename - The name of the file to save asin
*/
		blob	: function(mime, content, filename){
			var blob = new Blob([content], { type: mime + ';charset=utf-8;' });
			if (navigator.msSaveBlob) {
				navigator.msSaveBlob(blob, filename);
			} else {
				var link = document.createElement("a");
				if (link.download !== undefined) {

					var url = URL.createObjectURL(blob);
					link.setAttribute("href", url);
					link.setAttribute("download", filename);
					link.style.visibility = 'hidden';
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				}
			}
		},

/*
	Method: toggleHosts
	Shows or hides the hosts column of the CSTS application
*/
		toggleHosts	: function(){
			if(	$('#main-right-col').is(':visible') ){
				$('#main-right-col').hide()
				$('#main-center-col').removeClass('col-10').addClass('col-12')
			}else{
				$('#main-right-col').show()
				$('#main-center-col').removeClass('col-12').addClass('col-10')
			}
		},

/*
	Method: guid
	Generates a GUID like string
*/
		guid : function(){
		  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
			(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
		  );
		},

/*
	Method: debug
	Will log a message to the console if the application environment is set to developmental
	
	Parameters:
		msg - A String or object to be logged
*/
		debug : function(msg){
			if(nw.App.manifest.environment == 'developmental'){
				console.log(msg);
			}
		}
	}
};