<div class="hostManual resizable"><textarea placeholder="Manual Host Entry (comma separated)" style="min-width:100%; width:100%;height:100%;resize: none;"></textarea></div>
<div id="adOUTree" class="hostTree resizeable"></div>
<script>
	$(document).ready(function() {
		$('#adOUTree').css('height', (window.innerHeight - 80 - $('div.hostManual').css('height').replace('px','')) + 'px'  );

        var hostTree = $('#adOUTree').tree({
			checkbox:true, 
			selectable:true,
			collapseEffect: null,
			dnd: false,
            onCheck : {
				ancestors :	null,
				node : 'expand'
			},
			select : function(event, element){
				console.log(event);
				console.log(element);
				csts.libs.ad.getOuChildren( $(element).find('input[type="checkbox"]').attr('data-path') )
					.invoke()
					.then( output => {
						console.log('Loading sub-nodes');
						if(element.find('li').length == 0){
							$.each( JSON.parse( output ), function(index, item){ 
								hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox' data-path='" + item.Path + "' />" + item.OU } }, element ); 
							})
						}
					}).catch(err => { 
						console.log(err) 
					})
			}
        });

		hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox' data-path='' />" + csts.libs.ad.getFqdn().toLowerCase() } } ); 


		function addNode(path, node){ 
			console.log(path);
			ps = csts.libs.ad.getOuChildren(path) 
			ps.invoke() 
				.then( output => { 
					$.each( JSON.parse( output ), function(index, item){  
						hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox' data-path='" + item.Path + "' />" + item.OU } }, node  );  
						hostTree.tree('collapse', $("input[data-path='" + item.Path + "']").parent().parent()); 
						//console.log( item.Path ); 
						//addNode(item.Path, $("input[data-path='" + item.Path + "']").parent().parent() ); 
					})  
				}).catch(err => {  
					//console.log(err)  
				}) 
		} 


		addNode( "", "div#adOUTree > ul > li"); 

		
		
		$('.resizable').resizable( {
			containment: '#main-right-col',
			minWidth: 200,
			minHeight:150,
			maxHeight:300,
			stop : function( event, ui){
				$('#adOUTree').css('height', window.innerHeight - 80 - ui.size.height);
			}
		});

		$(window).on('resize',function(){
			$('#adOUTree').css('height', (window.innerHeight - 80 - $('div.hostManual').css('height').replace('px','')) + 'px'  );
		});

		var i = 0;
		var dragging = false;
	   $('#dragbar').mousedown(function(e){
		   e.preventDefault();
		   
		   dragging = true;
		   var main = $('#main');
		   var ghostbar = $('<div>',{
				id:'ghostbar',
				css: {
					width: main.outerWidth(),
					top: main.offset().top,
					left: main.offset().left
				}
			}).appendTo('body');
		   
			$(document).mousemove(function(e){
				ghostbar.css("top",e.pageY+2);
			});
		});

	   $(document).mouseup(function(e){
		   if (dragging){
			   var percentage = (e.pageY / window.innerHeight) * 100;
			   var mainPercentage = 100-percentage;
			   
			   $('#console').text("side:" + percentage + " main:" + mainPercentage);
			   
			   $('#sidebar').css("height",percentage + "%");
			   $('#main').css("height",mainPercentage + "%");
			   $('#ghostbar').remove();
			   $(document).unbind('mousemove');
			   dragging = false;
			}
		});

    });

	
</script>
