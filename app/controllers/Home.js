csts.controllers['Home'] = ({
	name : 'Home',
	index : function(){
		console.log('executing Home@index');
		
		csts.plugins.ejs.renderFile('app/resources/views/pages/home/home.tpl',{},{},function(err,str){
			if(err){
				console.log(err);
			}
			$('#main-center-col').html(str);
			
		}) 
	}
	
});
