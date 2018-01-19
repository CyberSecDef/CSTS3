<div id="tree" style="font-size:8pt;">
    <ul>
        <li id="rootNode">
            <input type="checkbox" />
			<span>Root</span>
            <ul>
                <li>
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
        var hostTree = $('#tree').tree({ checkbox:true
            /* specify here your options */
        });
			 
		node = hostTree.tree('addNode', {span : {  'html' : 'Test' }, li: {'class': 'leaf' }, input:{type:'checkbox'} } );
		console.log(node);
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

</script>