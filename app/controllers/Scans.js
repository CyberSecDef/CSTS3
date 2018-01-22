if(!global.controllers){global.controllers = {};}
global.controllers['Scans'] = ({
	name : 'Scans',
	compare : function(){
		console.log('executing Scans@compare');
		
		ejs.renderFile('app/resources/views/pages/scans/compare.tpl',{},{},function(err,str){
			if(err){
				console.log(err);
			}
			$('#main-center-col').html(str);
		}) 
	}
	
});