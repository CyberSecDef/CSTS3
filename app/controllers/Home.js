if(!global.controllers){global.controllers = {};}
global.controllers['Home'] = ({
	name : 'Home',
	index : function(){
		console.log('executing Home@index');
		
		ejs.renderFile('app/resources/views/pages/home/home.tpl',{},{},function(err,str){
			if(err){
				console.log(err);
			}
			$('#main-center-col').html(str);
		}) 
	}
	
});