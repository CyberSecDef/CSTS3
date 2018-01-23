var csts = {
	init : function(){
		//include library files.  These are individually listed for ordering purposes
		$.each([
			'./public/js/jquery-ui.js',
			'./public/js/bootstrap.bundle.js',
			'./public/js/fontawesome-all.js',
			'./public/js/jquery.tree.js',
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

		csts.plugins.tray.tooltip = "Cyber Security Tool Suite v3.0.0";
		csts.plugins.win.width 	= ( csts.plugins.win.width < 1280 ? 1280 : csts.plugins.win.width);
		csts.plugins.win.height = ( csts.plugins.win.height < 800 ? 800	 : csts.plugins.win.height);
		csts.plugins.ejs.delimeter = '$';

		csts.plugins.reload = csts.plugins.fs.watch('./', {recursive: true}, function() {
			location.href='/app/index.html';
			reloadWatcher.close();
		});

		csts.router = new csts.plugins.navigo(location.origin,false,'#');
		
		$(document).ready(function(){
			$.each(csts.routes, function(name, val){
				switch(typeof val){
					case 'string' :
						c = val.substring(0,val.indexOf('@'));
						f = val.substring(val.indexOf('@')+1);
						
						csts.router.on(name, csts.controllers[c][f] ).resolve();
						console.log('Created router for ' + name);
						break;
					case 'function' :
						console.log("creating function call to " + name);
						console.log(val);
						csts.router.on(name, val);
						break;
				}
			});

			csts.plugins.ejs.renderFile('app/resources/views/layouts/default.tpl',{
				'username' : process.env.USERNAME,
				'url' : location.valueOf().pathname.replace('/app','').replace('index.html','')
			},{},function(err,str){
				if(err){
					console.log(err);
				}
				$('body').html(str);
			}) ;

			csts.plugins.win.on('navigation', function(frame, url, policy){
				window.onbeforeunload = function() { return false; }
				policy.ignore();
				req = url.replace(location.origin,'')
				console.log("Request: " + req);
				
				router.navigate(req);
				return false;
			});

			csts.controllers['Home'].index();	
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
	ad			: {
		fqdn		: function(){
				if(typeof process.env.USERDNSDOMAIN !== 'undefined'){
					return process.env.USERDNSDOMAIN;
				}else if(typeof process.env.USERDOMAIN !== 'undefined'){
					return process.env.USERDOMAIN;
				}else{
					return 'local';
				}
			
		},
		map 		: function(){
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
			ps.addCommand("$objSearcher.SearchScope = 'SubTree'")
			ps.addCommand("$results = @();")
			ps.addCommand("$objSearcher.findall() | sort-object { $_.properties.ou} | ? { $_.path -like '*//OU=*'} | % { $results += @{ 'Name' = $($_.properties.name) ; 'OU' = $($_.properties.ou); 'Path' = $($_.properties.adspath); 'DN' =  $($_.properties.distinguishedname); } }")
			ps.addCommand("add-type -assembly system.web.extensions")
			ps.addCommand("$ps_js=new-object system.web.script.serialization.javascriptSerializer")
			ps.addCommand("$ps_js.Serialize($results) ")


			

			return ps;
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
	routes 		: {},
	router 		: {},
	models 		: {},
	controllers : {},
	plugins : {
		'tray' 		: (new nw.Tray({ title: 'Tray', icon: 'app/public/images/csts.png' }) ),
		'fs' 		: require('fs'),
		'ejs'		: require('ejs'),
		'os'		: require('os'),
		'navigo'	: require('navigo'),
		'win'		: nw.Window.get(),
		'reload'	: {},
		'shell'		: require('node-powershell'),
	}

};

csts.init();