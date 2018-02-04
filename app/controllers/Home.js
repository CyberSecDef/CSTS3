/*
	Namespace: csts.controllers.home
	This is the baseline controller for the CSTS
*/
csts.controllers['Home'] = ({
	
/*
	Variable: name
	The name of the controller
*/
	name : 'Home',
	
	/*
		Namespace: csts.controllers.home.main
		This is the container for the main homepage functions
	*/
	main : {
		/*
			Method: index
			function that is called for the main home page of the application
		*/
		index : function(){
			csts.plugins.ejs.renderFile('app/resources/views/pages/home/home.tpl',{},{},function(err,str){
				if(err){
					console.log(err);
				}
				$('#main-center-col').html(str);
				
			}) 
		}		
	},

	
});
