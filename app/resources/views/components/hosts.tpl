<div class="hostManual resizable"><textarea placeholder="Manual Host Entry (comma separated)" style="width:100%;height:100%;resize: none;"></textarea></div>
<div id="tree" class="hostTree resizeable"></div>
<script>
	$(document).ready(function() {
		$('#tree').css('height', (window.innerHeight - 120 - $('div.hostManual').css('height').replace('px','')) + 'px'  );

        var hostTree = $('#tree').tree({ 
			checkbox:true, 
			selectable:true,
            onCheck : {
				ancestors :	null,
				node : 'expand'
			},
			select : function(event, element){
				$(element).html('');
				csts.ad.ouChildren( $(element).find('input[type="checkbox"]').attr('data-path') ).invoke()
					.then( output => { 
						console.log(element);
						$.each( JSON.parse( output ), function(index, item){ 
							hostTree.tree('addNode',{ li : { 'class' : '' }, span : {  'html' : "<div style='white-space:nowrap;'><input type='checkbox' data-path='" + item.Path + "' />" + item.OU + '</div>'} }, element ); 
						}) 
					}).catch(err => { 
						console.log(err) 
					})
			}
        });

		hostTree.tree('addNode',{ li : { id : 'rootNode', 'class' : 'root-ou'}, span : {  'html' : "<input type='checkbox' data-path='' />" + csts.ad.fqdn().toLowerCase() } } ); 

		csts.ad.ouChildren().invoke()
			.then( output => { 
				$.each( JSON.parse( output ), function(index, item){ 
					hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox' data-path='" + item.Path + "' />" + item.OU } }, "li#rootNode" ); 
				}) 
			}).catch(err => { 
				console.log(err) 
			})
		
		$('.resizable').resizable( {
			containment: '#main-right-col',
			minWidth: 200,
			minHeight:150,
			maxHeight:300,
			stop : function( event, ui){
				$('#tree').css('height', window.innerHeight - 120 - ui.size.height);
			}
		});

		$(window).on('resize',function(){
			$('#tree').css('height', (window.innerHeight - 120 - $('div.hostManual').css('height').replace('px','')) + 'px'  );
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