/*
	Namespace: csts.models.scans
	This is the model for handling 'Scan' type functions
*/
csts.models['Scans'] = {
	/*
		Variables: Properties
		
		name - the name of the model
		compareFields - fields that can be compared
		rarFields - Mapping between fields and columns in a RAR spreadsheet
		poamFields - Mapping between fields and columns in a POAM spreadsheet
		workbooks - a container for any excel workbooks that are opened
	*/
	name : 'Scans',
	compareFields 	: [ 'Mitigation',       'Comment', 		 'Description',       'Raw Risk',       'Residual Risk',       'Security Control',       'Source',       'Status'],
	rarFields 		: { 'Mitigation' : 'J', 'Comment' : 'N', 'Description' : 'D', 'Raw Risk' : 'F', 'Residual Risk' : 'L', 'Security Control' : 'A', 'Source' : 'B', 'Status' : 'M', 'Test Id' : 'C', 'Likelihood' : 'H' },
	poamFields 		: { 'Mitigation' : 'G', 'Comment' : 'O', 'Description' : 'B', 'Raw Risk' : 'F', 'Residual Risk' : 'H', 'Security Control' : 'C', 'Source' : 'M', 'Status' : 'N' },
	workbooks : {},

	/*
		Namespace: csts.models.scans.scans2poam
		This is the container for the functions that deal with the scans2poam module
	*/
	scans2poam : {
		
	},
	/*
		Namespace: csts.models.scans.comparison
		This is the container for the functions that deal with the poam/rar comparison module
	*/
	comparison : {
		
		/*
			Method: execute
			This method will compare the data between a rar and a poam and return the differences
			
			Parameters:
				rarTab - the tab in the rar workbook being checked
				poamTab - the tab in the poam workbook being checked
				fields - the fields being compared
		*/	
		execute : function( rarTab, poamTab, fields ){
			var rowIndex = 0;
			var rarRow = 0;
			var $items = [];
			var resRow = 0;
			
			rarRow = 8;
			while(rarRow < 3000 &&  ( !csts.models['Scans'].workbooks['rar'].isBlank(rarTab,[ 'A'+rarRow, 'b'+rarRow]) ) ){
				if(	!csts.models['Scans'].workbooks['rar'].isBlank(rarTab,['F'+rarRow, 'B'+rarRow])  && csts.models['Scans'].workbooks['rar'].Sheets[rarTab]['F'+rarRow].v != 'IV'  ){
					var vulnId = csts.models['Scans'].comparison.getVulnId( 'rar',rarTab,'C'+rarRow);
					$items.push(
						{
							row					: rarRow,
							vulnId				: vulnId,
							control 			: csts.models['Scans'].workbooks['rar'].val(rarTab,'A'+rarRow),
							source  			: csts.models['Scans'].workbooks['rar'].val(rarTab,'B'+rarRow),
							testId 				: csts.models['Scans'].workbooks['rar'].val(rarTab,'C'+rarRow),
							description 		: csts.models['Scans'].workbooks['rar'].val(rarTab,'D'+rarRow),
							riskStatement 		: csts.models['Scans'].workbooks['rar'].val(rarTab,'E'+rarRow),
							rawRisk 			: csts.models['Scans'].workbooks['rar'].val(rarTab,'F'+rarRow),
							impact 				: csts.models['Scans'].workbooks['rar'].val(rarTab,'G'+rarRow),
							likelihood 			: csts.models['Scans'].workbooks['rar'].val(rarTab,'H'+rarRow),
							correctiveAction 	: csts.models['Scans'].workbooks['rar'].val(rarTab,'I'+rarRow),
							mitigation 			: csts.models['Scans'].workbooks['rar'].val(rarTab,'J'+rarRow),
							remediation 		: csts.models['Scans'].workbooks['rar'].val(rarTab,'K'+rarRow),
							residualRisk 		: csts.models['Scans'].workbooks['rar'].val(rarTab,'L'+rarRow),
							status 				: csts.models['Scans'].workbooks['rar'].val(rarTab,'M'+rarRow),
							comment 			: csts.models['Scans'].workbooks['rar'].val(rarTab,'N'+rarRow),
							devices 			: csts.models['Scans'].workbooks['rar'].val(rarTab,'O'+rarRow),
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
				while(poamRow < 3000 &&  ( !csts.models['Scans'].workbooks['poam'].isBlank(poamTab,[ 'B'+poamRow, 'L'+poamRow, 'N'+poamRow, 'O'+poamRow]) ) ){
					if(	csts.models['Scans'].comparison.compareVals('poam',poamTab,'B'+poamRow, this.vulnId) || csts.models['Scans'].comparison.compareVals('poam',poamTab,'M'+poamRow, this.vulnId) ){
						found = true;

						if( !csts.models['Scans'].comparison.compareVals('poam',poamTab,'N'+poamRow, this.status) &&  $.grep( fields, function(n,i){ return n.value == 'Status';}).length > 0 ){
							csts.controllers.Scans.viewModels.comparison.push({
								rowId  : ++resRow,
								guid   : csts.libs.utils.guid(),
								vulnId : this.vulnId,
								type   : 'Status',
								mismatch : 'STATUS',
								rarRow : this.row,
								rarVal : this.status,
								poamRow : poamRow,
								poamVal : csts.models['Scans'].workbooks['poam'].val(poamTab,'N'+poamRow)
							});
						}
						
						if( !csts.models['Scans'].comparison.compareVals('poam',poamTab,'C'+poamRow, this.control) &&  $.grep( fields, function(n,i){ return n.value == 'Security Controls';}).length > 0 ){
							csts.controllers.Scans.viewModels.comparison.push({
								rowId  : ++resRow,
								guid   : csts.libs.utils.guid(),
								vulnId : this.vulnId,
								type   : 'Security Controls',
								mismatch : 'CONTROL',
								rarRow : this.row,
								rarVal : this.control,
								poamRow : poamRow,
								poamVal : csts.models['Scans'].workbooks['poam'].val(poamTab,'C'+poamRow)
							});
						}
						
						if( !csts.models['Scans'].comparison.compareVals('poam',poamTab,'M'+poamRow, this.source) &&  $.grep( fields, function(n,i){ return n.value == 'Source';}).length > 0 ){
							csts.controllers.Scans.viewModels.comparison.push({
								rowId  : ++resRow,
								guid   : csts.libs.utils.guid(),
								vulnId : this.vulnId,
								type   : 'Source',
								mismatch : 'SOURCE',
								rarRow : this.row,
								rarVal : this.source,
								poamRow : poamRow,
								poamVal : csts.models['Scans'].workbooks['poam'].val(poamTab,'M'+poamRow)
							});
						}
						

						if(
							!csts.models['Scans'].comparison.compareVals('poam',poamTab,'F'+poamRow, this.rawRisk) &&
							this.rawRisk.toUpperCase().replace('CAT','') != csts.models['Scans'].workbooks['poam'].val(poamTab,'F'+poamRow) &&
							$.grep( fields, function(n,i){ return n.value == 'Raw Risk';}).length > 0
						){
							csts.controllers.Scans.viewModels.comparison.push({
								rowId  : ++resRow,
								guid   : csts.libs.utils.guid(),
								vulnId : this.vulnId,
								type   : 'Raw Risk',
								mismatch : 'RAWRISK',
								rarRow : this.row,
								rarVal : this.rawRisk,
								poamRow : poamRow,
								poamVal : csts.models['Scans'].workbooks['poam'].val(poamTab,'F'+poamRow)
							});
						}

						if(
							!csts.models['Scans'].comparison.compareVals('poam',poamTab,'H'+poamRow, this.residualRisk) &&
							this.residualRisk.toUpperCase().replace('CAT','') != csts.models['Scans'].workbooks['poam'].val(poamTab,'H'+poamRow) &&
							$.grep( fields, function(n,i){ return n.value == 'Residual Risk';}).length > 0
						){
							csts.controllers.Scans.viewModels.comparison.push({
								rowId  : ++resRow,
								guid   : csts.libs.utils.guid(),
								vulnId : this.vulnId,
								type   : 'Residual Risk',
								mismatch : 'RESIDUALRISK',
								rarRow : this.row,
								rarVal : this.residualRisk,
								poamRow : poamRow,
								poamVal : csts.models['Scans'].workbooks['poam'].val(poamTab,'H'+poamRow)
							});
						}

						if(
							(	
								!csts.models['Scans'].comparison.compareVals('poam',poamTab,'B'+poamRow, this.description) &&
								($.trim(this.vulnId) + ' - ' + $.trim(this.description)).toUpperCase() != $.trim( csts.models['Scans'].workbooks['poam'].val(poamTab,'B'+poamRow) ).toUpperCase() &&
								('('+$.trim(this.vulnId)+')' + ' - ' + $.trim(this.description)).toUpperCase() != $.trim( csts.models['Scans'].workbooks['poam'].val(poamTab,'B'+poamRow) ).toUpperCase() &&
								$.trim( csts.models['Scans'].workbooks['poam'].val(poamTab,'B'+poamRow).toUpperCase() ).replace(/\W/g , '').indexOf(
									this.description.toUpperCase().replace(/\W/g , '')
								) == -1
							) &&
							$.grep( fields, function(n,i){ return n.value == 'Residual Risk';}).length > 0
						){
							csts.controllers.Scans.viewModels.comparison.push({
								rowId  : ++resRow,
								guid   : csts.libs.utils.guid(),
								vulnId : this.vulnId,
								type   : 'Description',
								mismatch : 'DESCRIPTION',
								rarRow : this.row,
								rarVal : this.description,
								poamRow : poamRow,
								poamVal : csts.models['Scans'].workbooks['poam'].val(poamTab,'B'+poamRow)
							});
						}

						if(
							(	
								!csts.models['Scans'].comparison.compareVals('poam',poamTab,'G'+poamRow, this.mitigation) &&
								(csts.models['Scans'].workbooks['poam'].val(poamTab,'G'+poamRow).toUpperCase() ).replace(/\W/g , '').indexOf(
									'' + this.mitigation.toUpperCase().replace(/\W/g , '')
								) == -1
							) &&
							$.grep( fields, function(n,i){ return n.value == 'Mitigations';}).length > 0
						){
							csts.controllers.Scans.viewModels.comparison.push({
								rowId  : ++resRow,
								guid   : csts.libs.utils.guid(),
								vulnId : this.vulnId,
								type   : 'Mitigation',
								mismatch : 'MITIGATION',
								rarRow : this.row,
								rarVal : this.mitigation,
								poamRow : poamRow,
								poamVal : csts.models['Scans'].workbooks['poam'].val(poamTab,'G'+poamRow)
							});
						}

						if(
							(	
								!csts.models['Scans'].comparison.compareVals('poam',poamTab,'O'+poamRow, this.comment) &&
								( csts.models['Scans'].workbooks['poam'].val(poamTab,'O'+poamRow).toUpperCase() ).replace(/\W/g , '').indexOf(
									'' + this.comment.toUpperCase().replace(/\W/g , '')
								) == -1
							) &&
							$.grep( fields, function(n,i){ return n.value == 'Comments';}).length > 0
						){
							csts.controllers.Scans.viewModels.comparison.push({
								rowId  : ++resRow,
								guid   : csts.libs.utils.guid(),
								vulnId : this.vulnId,
								type   : 'Comment',
								mismatch : 'COMMENT',
								rarRow : this.row,
								rarVal : this.comment,
								poamRow : poamRow,
								poamVal : csts.models['Scans'].workbooks['poam'].val(poamTab,'O'+poamRow)
							});
						}
					}
					poamRow++;
				}
				if(!found){
					if( this.status != 'Completed'){
						csts.controllers.Scans.viewModels.comparison.push({
							rowId  : ++resRow,
							guid   : csts.libs.utils.guid(),
							vulnId : this.vulnId,
							type   : 'Missing from POAM',
							mismatch : 'POAM',
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
			while(poamRow < 3000 &&  !csts.models['Scans'].workbooks['poam'].isBlank(poamTab,[ 'B'+poamRow, 'N'+poamRow]) ){
				if( csts.models['Scans'].workbooks['poam'].val(poamTab,'F'+poamRow) != 'IV'){
					var vulnId = csts.models['Scans'].comparison.getVulnId( 'poam',poamTab,'M'+poamRow);

					$items.push( 
						{
							row					: poamRow,
							vulnId				: vulnId,
							description			: csts.models['Scans'].workbooks['poam'].val(poamTab,'B'+poamRow),
							control 			: csts.models['Scans'].workbooks['poam'].val(poamTab,'C'+poamRow),
							source  			: csts.models['Scans'].workbooks['poam'].val(poamTab,'M'+poamRow),
							testId 				: csts.models['Scans'].workbooks['poam'].val(poamTab,'M'+poamRow),
							rawRisk 			: csts.models['Scans'].workbooks['poam'].val(poamTab,'F'+poamRow),
							mitigation 			: csts.models['Scans'].workbooks['poam'].val(poamTab,'H'+poamRow),
							status 				: csts.models['Scans'].workbooks['poam'].val(poamTab,'N'+poamRow),
							comment 			: csts.models['Scans'].workbooks['poam'].val(poamTab,'O'+poamRow),
						}
					);
				}
				poamRow++;
			}

			$.each($items, function(){
				rarRow = 8;
				var found = false;

				while(rarRow < 3000 &&  !csts.models['Scans'].workbooks['poam'].isBlank(poamTab,[ 'B'+rarRow, 'C'+rarRow, 'F'+rarRow,'M'+rarRow, 'N'+rarRow]) ){
					if( !csts.models['Scans'].comparison.compareVals('rar',rarTab,'C'+rarRow, this.vulnId) ){
						found = true;
					}
					rarRow++;
				}

				if(!found){
					if( this.status != 'Completed'){
						csts.controllers.Scans.viewModels.comparison.push({
							rowId  : ++resRow,
							guid   : csts.libs.utils.guid(),
							vulnId : this.vulnId,
							type   : 'Missing from RAR',
							mismatch : 'RAR',
							rarRow : '',
							rarVal : '',
							poamRow : this.row,
							poamVal : this.description
						});
					}
				}
			});

			console.log(csts.controllers['Scans'].viewModels.comparison);
		},
		
		/*
			Method: getVulnId
			parses a cell and returns the vulnerability id 
			
			Parameters:
				workbook - the workbook being checked
				sheet - the sheet in a workbook being checked
				address - the address of the cell being checked
		*/	
		getVulnId : function(workbook, sheet, address){
			var vulnId = '';
			if(!csts.models['Scans'].workbooks[workbook].isBlank(sheet,address)){
				vulnId = csts.models['Scans'].workbooks[workbook].Sheets[sheet][address].v
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
			return vulnId;
		},

		/*
			Method: compareVals
			compares the value in a worksheet to the value submitted
			
			Parameters:
				workbook - the workbook being checked
				sheet - the sheet in a workbook being checked
				address - the address of the cell being checked
				val - the value being checked
		*/	
		compareVals : function(workbook, sheet, address, val){
			if(!csts.models['Scans'].workbooks[workbook].isBlank(sheet,address)){
				return (
					csts.models['Scans'].workbooks[workbook].Sheets[sheet][address].v.toUpperCase().indexOf( $.trim(val).toUpperCase() ) >= 0
				);
			}else{
				return false;
			}
		},
	
		/*
			Method: parseFile
			gets the filesystem statistics for the submitted file pathname
			
			Parameters:
				file - The file path being checked
		*/
		parseFile : function( file ){
			return csts.plugins.fs.statSync( file );
		}
	}
};