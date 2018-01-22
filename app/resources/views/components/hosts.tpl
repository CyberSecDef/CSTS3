
<div class="hostManual resizable">
	Manual entry
</div>
<div id="tree" class="hostTree resizeable">
	<ul>
		<li id="rootNode">
			<input type="checkbox" />
			<span>Root</span>
			<ul>
				<li id="notRootNode" data-tag="ThisIsATest">
					<input type="checkbox" /><span>Node 1.1</span>
					<ul>
						<li><input type="checkbox" /><span>Node 1.1.1</span></li>
					</ul>
				</li>
			</ul>
			
		</li>
	</ul>
</div>


<script>
	$(document).ready(function() {
		$('#tree').css('height', (window.innerHeight - 120 - $('div.hostManual').css('height').replace('px','')) + 'px'  );

        var hostTree = $('#tree').tree({ 
			checkbox:true, 
			selectable:false,
            onCheck : {
				ancestors :	null
			}
        });
			 
		hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );
hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } } );




		hostTree.tree('addNode',{ span : {  'html' : "<input type='checkbox'/>Test" } }, "li[data-tag='ThisIsATest']" );

		$('.resizable').resizable( {
			containment: '#main-right-col',
			minWidth: 400,
			minHeight:150,
			maxHeight:300,
			stop : function( event, ui){
				$('#tree').css('height', window.innerHeight - 120 - ui.size.height);
			}
		});

		$(window).on('resize',function(){
			$('#tree').css('height', (window.innerHeight - 120 - $('div.hostManual').css('height').replace('px','')) + 'px'  );
		});
    });

	
	


	const shell = require('node-powershell');
	let ps = new shell({
	  executionPolicy: 'Bypass',
	  noProfile: true
	});

	ps.addCommand("$objDomain = New-Object System.DirectoryServices.DirectoryEntry")
	ps.addCommand("$objSearcher = New-Object System.DirectoryServices.DirectorySearcher")
	ps.addCommand("$objSearcher.SearchRoot = $objDomain")
	ps.addCommand("$objSearcher.PageSize = 1000")
	ps.addCommand("$objSearcher.SearchScope = 'OneLevel'")
	ps.addCommand("$results = @();")
	ps.addCommand("$objSearcher.findall() | sort-object { $_.properties.ou} | ? { $_.path -like '*//OU=*'} | % { $results += @{ 'Name' = $($_.properties.name) ; 'OU' = $($_.properties.ou); 'Path' = $($_.properties.adspath); 'DN' =  $($_.properties.distinguishedname); } }")
	ps.addCommand("add-type -assembly system.web.extensions")
	ps.addCommand("$ps_js=new-object system.web.script.serialization.javascriptSerializer")
	ps.addCommand("$ps_js.Serialize($results) ")

	ps.invoke()
	.then(output => {
		console.log(output);
		$.each( JSON.parse(output), function(index, item){
			
			
		console.log(item);
	  });
	})
	.catch(err => {
	  console.log(err);
	  ps.dispose();
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




</script>