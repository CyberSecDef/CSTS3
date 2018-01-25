csts.models['Scans'] = {
	name : 'Scans',
	compareFields : [ 'Comments', 'Description', 'Mitigations', 'Raw Risk', 'Residual Risk', 'Security Controls', 'Source', 'Status'],
	workbooks : {},
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

	},
	executeComparison : function(){
		var rowIndex = 0;
		var rarRow = 0;
		var $items = [];
				
		rarRow = 8;
		while(rarRow < 3000 && 
			(
				typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['A'+rarRow] != 'undefined' &&
				(csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['A'+rarRow].v != '' || typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['A'+rarRow].v != 'undefined')  &&
				(csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['B'+rarRow].v != '' || typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['B'+rarRow].v != 'undefined') 
			)
		){

			if(
				typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['F'+rarRow] != 'undefined' &&
				csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['F'+rarRow].v != 'IV' &&
				typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['B'+rarRow].v != 'undefined' &&
				csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['B'+rarRow].v != '' 
				
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
		
		
		//all rar foundings are found, time to search the poam
		var results = [];
		$.each($items, function(){
			poamRow = 8;
			var found = false;
			//loop through all the poam until blanks are recieved
			while(poamRow < 3000 && 
				(
					typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow] != 'undefined' ||
					typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['L'+poamRow] != 'undefined' ||
					typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['N'+poamRow] != 'undefined' ||
					typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['O'+poamRow] != 'undefined'
				)
			){

				if(	
					(
						typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow] != 'undefined' &&
						csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow].v.toUpperCase().indexOf( $.trim(this.vulnId).toUpperCase() ) >= 0
					) || 
					(
						typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['M'+poamRow] != 'undefined' &&
						csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['M'+poamRow].v.toUpperCase().indexOf( this.vulnId.toUpperCase() ) >= 0
					)
				){
					found = true;

					if(
						typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['N'+poamRow] != 'undefined' &&
						this.status.toUpperCase() != csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['N'+poamRow].v.toUpperCase() &&
						$("input[type='checkbox'][name='comparisonFields'][value='Status']").prop("checked") 
					){
						results.push({
							vulnId : this.vulnId,
							type   : 'Status',
							rarRow : this.row,
							rarVal : this.status,
							poamRow : poamRow,
							poamVal : csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['N'+poamRow].v.toUpperCase()
						});
					}

					if(
						typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['C'+poamRow] != 'undefined' &&
						this.control.toUpperCase() != csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['C'+poamRow].v.toUpperCase() &&
						$("input[type='checkbox'][name='comparisonFields'][value='Security Controls']").prop("checked") 
					){
						results.push({
							vulnId : this.vulnId,
							type   : 'Security Control',
							rarRow : this.row,
							rarVal : this.control,
							poamRow : poamRow,
							poamVal : csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['C'+poamRow].v.toUpperCase()
						});
					}

					if(
						typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['M'+poamRow] != 'undefined' &&
						csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['M'+poamRow].v.toUpperCase().indexOf( this.source.toUpperCase() ) > 0 &&
						$("input[type='checkbox'][name='comparisonFields'][value='Source']").prop("checked") 
					){
						results.push({
							vulnId : this.vulnId,
							type   : 'Source',
							rarRow : this.row,
							rarVal : this.source,
							poamRow : poamRow,
							poamVal : csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['M'+poamRow].v.toUpperCase()
						});
					}

					if(
						typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['F'+poamRow] != 'undefined' &&
						this.rawRisk.toUpperCase().replace('CAT','') != csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['F'+poamRow].v.toUpperCase() &&
						$("input[type='checkbox'][name='comparisonFields'][value='Raw Risk']").prop("checked") 
					){
						results.push({
							vulnId : this.vulnId,
							type   : 'Raw Risk',
							rarRow : this.row,
							rarVal : this.rawRisk,
							poamRow : poamRow,
							poamVal : csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['F'+poamRow].v.toUpperCase()
						});
					}

					if(
						typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['H'+poamRow] != 'undefined' &&
						this.residualRisk.toUpperCase().replace('CAT','') != csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['H'+poamRow].v.toUpperCase() &&
						$("input[type='checkbox'][name='comparisonFields'][value='Residual Risk']").prop("checked") 
					){
						results.push({
							vulnId : this.vulnId,
							type   : 'Residual Risk',
							rarRow : this.row,
							rarVal : this.residualRisk,
							poamRow : poamRow,
							poamVal : csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['H'+poamRow].v.toUpperCase()
						});
					}

					if(
						(	
							typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow] != 'undefined' &&
							($.trim(this.vulnId) + ' - ' + $.trim(this.description)).toUpperCase() != $.trim( csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow].v ).toUpperCase() &&
							('('+$.trim(this.vulnId)+')' + ' - ' + $.trim(this.description)).toUpperCase() != $.trim( csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow].v ).toUpperCase() &&
							$.trim( csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow].v.toUpperCase() ).replace(/\W/g , '').indexOf(
								this.description.toUpperCase().replace(/\W/g , '')
							) == -1
						) &&
						$("input[type='checkbox'][name='comparisonFields'][value='Description']").prop("checked") 
					){
						results.push({
							vulnId : this.vulnId,
							type   : 'Description',
							rarRow : this.row,
							rarVal : this.description,
							poamRow : poamRow,
							poamVal : csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow].v.toUpperCase()
						});
					}

					if(
						(	
							typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['G'+poamRow] != 'undefined' &&
							( csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['G'+poamRow].v.toUpperCase() ).replace(/\W/g , '').indexOf(
							'' + this.mitigation.toUpperCase().replace(/\W/g , '')
							) == -1
						) &&
						$("input[type='checkbox'][name='comparisonFields'][value='Mitigations']").prop("checked") 
					){
						results.push({
							vulnId : this.vulnId,
							type   : 'Mitigation',
							rarRow : this.row,
							rarVal : this.mitigation,
							poamRow : poamRow,
							poamVal : csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['G'+poamRow].v.toUpperCase()
						});
					}

					if(
						(	
							typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['O'+poamRow] != 'undefined' &&
							( csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['O'+poamRow].v.toUpperCase() ).replace(/\W/g , '').indexOf(
							'' + this.comment.toUpperCase().replace(/\W/g , '')
							) == -1
						) &&
						$("input[type='checkbox'][name='comparisonFields'][value='Comments']").prop("checked") 
					){
						results.push({
							vulnId : this.vulnId,
							type   : 'Comment',
							rarRow : this.row,
							rarVal : this.comment,
							poamRow : poamRow,
							poamVal : csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['O'+poamRow].v.toUpperCase()
						});
					}
				}
				poamRow++;
			}
			if(!found){
				if( this.status != 'Completed'){
					results.push({
						vulnId : this.vulnId,
						type   : 'Missing from POAM',
						rarRow : this.row,
						rarVal : this.description,
						poamRow : '',
						poamVal : ''
					});
				}
			}
		});
		
		//see if anything is in the POAM, but not in the rar
		var $items = [];
		var poamRow = 8;
		while(poamRow < 3000 && 
			(
				 typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow] != 'undefined' &&
				(typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow] != 'undefined' || csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow].v != '' ) &&
				(typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['N'+poamRow] != 'undefined' || csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['N'+poamRow].v != '' )
			)
		){
			if(
				typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['N'+poamRow] != 'undefined' &&	csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['N'+poamRow].v != 'IV' &&
				typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow] != 'undefined' && csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow].v != '' 				
			){
				
				var vulnId = '';
				if(typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['M'+poamRow] != 'undefined'){
					vulnId = csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['M'+poamRow].v
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
						console.log(vulnId);
					}
				}

				$items.push( 
					{
						row					: poamRow,
						vulnId				: vulnId,
						description			: typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow] != 'undefined' ? csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow].v : '', 	
						control 			: typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['C'+poamRow] != 'undefined' ? csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow].v : '', 	
						source  			: typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['M'+poamRow] != 'undefined' ? csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow].v : '', 	
						testId 				: typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['M'+poamRow] != 'undefined' ? csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow].v : '', 	
						rawRisk 			: typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['F'+poamRow] != 'undefined' ? csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow].v : '', 	
						mitigation 			: typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['H'+poamRow] != 'undefined' ? csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow].v : '', 	
						status 				: typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['N'+poamRow] != 'undefined' ? csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow].v : '', 	
						comment 			: typeof csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['O'+poamRow] != 'undefined' ? csts.models['Scans'].workbooks['poam'].Sheets[$('#poamTabSel').val()]['B'+poamRow].v : '', 	
					}
				);
			}
			poamRow++;
		}

		$.each($items, function(){
			rarRow = 8;
			var found = false;

			while(rarRow < 3000 && 
				(
					typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['B'+rarRow] != 'undefined' ||
					typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['C'+rarRow] != 'undefined' ||
					typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['F'+rarRow] != 'undefined' ||
					typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['M'+rarRow] != 'undefined' ||
					typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['N'+rarRow] != 'undefined'
				)
			){
				if( typeof csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['C'+rarRow] != 'undefined' && 
					csts.models['Scans'].workbooks['rar'].Sheets[$('#rarTabSel').val()]['C'+rarRow].v.toUpperCase().indexOf( this.vulnId.toUpperCase() ) >= 0
				){
					// console.log(this.vulnId);
					// console.log(rarRow);
					found = true;
				}
				rarRow++;
			}

			if(!found){
				if( this.status != 'Completed'){
					results.push({
						vulnId : this.vulnId,
						type   : 'Missing from RAR',
						rarRow : '',
						rarVal : '',
						poamRow : this.row,
						poamVal : this.description
					});
				}
			}
		});


		console.log(results);
		
	}
};