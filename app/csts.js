var csts = {
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
			
			//ADDED THIS FOR DEBUGGING PURPOSES
			csts.controllers['Scans'].compare();	
			
			csts.plugins.isElevated().then(elevated => {
				$('footer.footer div div.status-bar-r').html( ( elevated ? '<i class="fas fa-user-secret"></i>' : '<i class="fas fa-user"></i>' ) );
			});

		})
	},
	startTime : (new Date().getTime() ),
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
	export		: {
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

			console.log(data);
			var csvFile = processRow( data.columns )
			$.each(data.rows, function(i, r){ 
				csvFile += processRow(  r  ); 
			});
			csts.utils.blob('text/csv', csvFile , filename)
		},
		pdf : function(data, filename){
			var pdf = new jsPDF('l','pt','letter');
			pdf.autoTable(data.columns, data.rows, data.styles);
			pdf.save( filename );
		}
	},
	utils		: {
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
		},
		debug : function(msg){
			if(nw.App.manifest.environment == 'developmental'){
				console.log(msg);
			}
		}
	},
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
	}

};
///shortcuts
dbg = function(msg){ csts.utils.debug(msg);}
csts.init();