csts.models['Scans'] = {
	name : 'Scans',
	compareFields : [ 'Comments', 'Description', 'Mitigations', 'Raw Risk', 'Residual Risk', 'Security Controls', 'Source', 'Status'],
	workbooks : {
	},
	parseComparisonFiles : function(){
		stats = csts.plugins.fs.statSync( $('#fileRar').val().trim() );
		$('#tabSelFileInfo tbody').empty();
		var table = $('table#tabSelFileInfo').DataTable({ searching: false, paging: false});
		table.clear();

		table.row.add(
			[
				"RAR", 
				csts.plugins.path.basename( $('#fileRar').val().trim() ),
				csts.plugins.moment(stats.ctimeMs).format("MM/DD/YYYY HH:mm"), 
				csts.plugins.moment(stats.atimeMs).format("MM/DD/YYYY HH:mm"),
				csts.plugins.moment(stats.mtimeMs).format("MM/DD/YYYY HH:mm"),
				stats.size,
				csts.plugins.path.extname( $('#fileRar').val().trim() )
			] 
		)
		
		stats = csts.plugins.fs.statSync( $('#filePoam').val().trim() );
		table.row.add(
			[
				"POAM", 
				csts.plugins.path.basename( $('#filePoam').val().trim() ),
				csts.plugins.moment(stats.ctimeMs).format("MM/DD/YYYY HH:mm"), 
				csts.plugins.moment(stats.atimeMs).format("MM/DD/YYYY HH:mm"),
				csts.plugins.moment(stats.mtimeMs).format("MM/DD/YYYY HH:mm"),
				stats.size,
				csts.plugins.path.extname( $('#filePoam').val().trim() )
			] 
		)

		table.rows().invalidate().draw();

		// $('#scans-compare-files').hide();
		// $('#scans-compare-file-info').show();
		// $('#scans-compare-file-parameters').show();
		$('#myModal').modal('hide');


		$('#rarTabSel').find('option').remove()
		$('#poamTabSel').find('option').remove()
		
		csts.models['Scans'].workbooks['rar'] = csts.plugins.xlsx.readFile( $('#fileRar').val().trim() );
		
		$.each(csts.models['Scans'].workbooks['rar'].SheetNames, function(index,item){
			$('#rarTabSel').append( $('<option></option>').text(item).prop('selected', (item.toLowerCase().replace(/[^a-zA-Z]/,'').indexOf('rar')>=0 ) ) );
		});

		csts.models['Scans'].workbooks['poam'] = csts.plugins.xlsx.readFile( $('#filePoam').val().trim() );
		$.each(csts.models['Scans'].workbooks['poam'].SheetNames, function(index,item){
			$('#poamTabSel').append( $('<option></option>').text(item).prop('selected', (item.toLowerCase().replace(/[^a-zA-Z]/,'').indexOf('poam')>=0 ) ) );
		});

		console.log( csts.models['Scans'].workbooks['poam'] );
	},
	executeComparison : function(){
		var rowIndex = 0;
		var rarRow = 0;
		var $items = [];
				
		rarRow = 8;
		while(rarRow < 300 && 
			(
				typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['A'+rarRow] != 'undefined' &&
				(csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['A'+rarRow].v != '' || typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['A'+rarRow].v != 'undefined')  &&
				(csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['B'+rarRow].v != '' || typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['B'+rarRow].v != 'undefined') 
			)
		){
			console.log(rarRow);
			
			if(
				csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['F'+rarRow].v != 'IV' &&
				csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['B'+rarRow].v != '' &&
				typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['B'+rarRow].v != 'undefined'
			){
				
				var vulnId = '';
				if(typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['C'+rarRow] != 'undefined'){
					vulnId = csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['C'+rarRow].v
					if( vulnId.indexOf("Vuln ID:") > 0){
						var temp = vulnId.split("\n");
						$.each(temp, function(i,item){
							i = item.split(":")
							if( $.trim(i[0]) == "Vuln ID"  && $.trim(i[1]) != ""){
								vulnId = $.trim(i[1]);
							}
							if( $.trim(i[0]) == "Plugin ID"  && $.trim(i[1]) != ""){
								vulnId = $.trim(i[1]);
							}
						});
					}
				}
							
							
				$items.push(
					{
						row					: rarRow,
						vulnId				: vulnId,
						control 			: typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['A'+rarRow] != 'undefined' ? csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['A'+rarRow].v : '', 
						source  			: typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['B'+rarRow] != 'undefined' ? csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['B'+rarRow].v : '',
						testId 				: typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['C'+rarRow] != 'undefined' ? csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['C'+rarRow].v : '',
						description 		: typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['D'+rarRow] != 'undefined' ? csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['D'+rarRow].v : '',
						riskStatement 		: typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['E'+rarRow] != 'undefined' ? csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['E'+rarRow].v : '',
						rawRisk 			: typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['F'+rarRow] != 'undefined' ? csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['F'+rarRow].v : '',
						impact 				: typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['G'+rarRow] != 'undefined' ? csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['G'+rarRow].v : '',
						likelihood 			: typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['H'+rarRow] != 'undefined' ? csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['H'+rarRow].v : '',
						correctiveAction 	: typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['I'+rarRow] != 'undefined' ? csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['I'+rarRow].v : '',
						mitigation 			: typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['J'+rarRow] != 'undefined' ? csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['J'+rarRow].v : '',
						remediation 		: typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['K'+rarRow] != 'undefined' ? csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['K'+rarRow].v : '',
						residualRisk 		: typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['L'+rarRow] != 'undefined' ? csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['L'+rarRow].v : '',
						status 				: typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['M'+rarRow] != 'undefined' ? csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['M'+rarRow].v : '',
						comment 			: typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['N'+rarRow] != 'undefined' ? csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['N'+rarRow].v : '',
						devices 			: typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['O'+rarRow] != 'undefined' ? csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['O'+rarRow].v : '',
					}
				);
			}
			rarRow++;
		}
		
		console.log( $items);
		
		//all rar foundings are found, time to search the poam
		
		$.each($items, function(){
			poamRow = 8;
			while(poamRow < 300 && 
				(
					typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow] != 'undefined' &&
					typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['N'+poamRow] != 'undefined' &&
					typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['O'+poamRow] != 'undefined'
				)
			){
				if( 
					csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow].v.indexOf( this.vulnId ) > 0 
				){
					
					console.log('Found: ' + this.vulnId);
				}
				
			
				poamRow++;
			}
		});
		
		
		
	}
};