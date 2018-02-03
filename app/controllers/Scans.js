/*
	Package: csts.controllers.Scans
	This is the baseline controller for Scan type functions
*/
csts.controllers['Scans'] = ({
/*
	Variable: name
	The name of the controller
*/	
	name : 'Scans',
	
/*
	Variable: viewModels
	viewModels for the scans controller.  These are middleware between the views and controllers.
*/
	viewModels : {
		comparison : ko.observableArray().extend({notify: 'always'})
	},
	
/*
	Method: compare
	This is the function called from the router to load the compareRAR/POAM functionality
*/
	compare : function(){
		csts.plugins.ejs.renderFile('app/resources/views/pages/scans/compare.tpl',{
				fields : csts.models['Scans'].compareFields,
			},
			{ rmWhitespace : true},
			function(err,str){
				if(err){ console.log(err); $('#errors').html(err); }
				$('#main-center-col').html(str);
			}
		);
	},

/*
	Package: comparison
	Methods and variables related to the RAR/POAM comparison functionality
*/
	comparison : {
/*
	Method: parseFiles
	This method loads the file information for the selected RAR and POAM for the comparison functions
*/
		parseFiles : function(){
			$('#myModal').modal();
			$('#myModalLabel').text('Please Wait...');
			$('#myModalBody').text('Currently Parsing the Excel Documents.  Please wait.');
			$('#myModal').on('shown.bs.modal', function (e) {
				$('#tabSelFileInfo tbody').empty();
				var table = $('table#tabSelFileInfo').DataTable({ destroy: true, searching: false, paging: false});
				table.clear();
				stats = csts.models['Scans'].comparison.parseFile( $('#fileRar').val().trim() );
				
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
				
				stats = csts.models['Scans'].comparison.parseFile( $('#filePoam').val().trim() );
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
				
				$('#rarTabSel').find('option').remove()
				csts.models['Scans'].workbooks['rar'] = csts.plugins.xlsx.readFile( $('#fileRar').val().trim() );
				$.each(csts.models['Scans'].workbooks['rar'].SheetNames, function(index,item){
					$('#rarTabSel').append( $('<option></option>').text(item).prop('selected', (item.toLowerCase().replace(/[^a-zA-Z]/,'').indexOf('rar')>=0 ) ) );
				});

				
				$('#poamTabSel').find('option').remove()
				csts.models['Scans'].workbooks['poam'] = csts.plugins.xlsx.readFile( $('#filePoam').val().trim() );
				$.each(csts.models['Scans'].workbooks['poam'].SheetNames, function(index,item){
					$('#poamTabSel').append( $('<option></option>').text(item).prop('selected', (item.toLowerCase().replace(/[^a-zA-Z]/,'').indexOf('poam')>=0 ) ) );
				});
				
				$('#myModal').modal('hide');
			});
		},
/*
	Method: execute
	This method executes the comparison between a RAR and a POAM by calling the appropriate method in the Scans model.
	
	Parameters:
		fields - the fields that should be compared between the RAR and POAM
		
	See Also:
		<csts.models.Scans.executeComparison>
*/
		execute : function( fields ){
			$('#headingFour button').click();
			csts.models['Scans'].executeComparison( $('#rarTabSel').val(), $('#poamTabSel').val(), fields);
		},
		
	/*
	Method: fieldMove
	Handles moving data from the RAR to the POAM or vice versa
	
	Parameters:
		el - The calling element
*/	
		fieldMove : function( el ){
			guid = $(el).parents('tr').data('guid');
			
			fields = {
				guid	: guid,
				vulnId	: $("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(2)").text(),
				type	: $("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(3)").text(),
				mismatch: $(el).parents('tr').data('mismatch'),
				rarRow	: $("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(4)").text(),
				rarVal	: $("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(5)").text(),
				poamRow	: $("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(7)").text(),
				poamVal	: $("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(8)").text()
			}
			
			switch( $(el).data('action') ){
				case 'left' :
					if(fields.mismatch != 'POAM' && fields.mismatch != 'RAR'){
						csts.models['Scans'].setVal('rar', $('#rarTabSel').val(), (csts.models['Scans'].rarFields[ fields.type ]) + fields.rarRow,
							csts.models['Scans'].getVal('poam', $('#poamTabSel').val(), (csts.models['Scans'].poamFields[ fields.type ]) + fields.poamRow)
						)
						csts.plugins.xlsx.writeFile( csts.models['Scans'].workbooks['rar'],  $('#fileRar').val().trim(), { bookSST : true, bookType : 'xlsx', compression : true} );
						sel = ko.utils.arrayFilter(csts.controllers.Scans.viewModels.comparison(), function(i) { return i.guid == guid; })[0]
						sel.rarVal = sel.poamVal
						$("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(5)").text( fields.poamVal );
					}else{
						r = csts.models['Scans'].getVal('poam', $('#poamTabSel').val(), (csts.models['Scans'].poamFields['Raw Risk']) + fields.poamRow);
						i = '';
						l = '';
						switch(r){
							case 'I' :
								i = 'High';
								l = 'High';
								break;
							case 'II' :
								i = 'Medium';
								l = 'Medium';
								break;
							case 'III' :
								i = 'Low';
								l = 'Low';
								break;
							case 'IV' :
								i = 'None';
								l = 'Info';
								break;
						}
						
						csts.plugins.xlsx.utils.sheet_add_json(
							csts.models.Scans.workbooks.rar.Sheets.RAR, 
							[ 
								{ 
									'control' 		: csts.models['Scans'].getVal('poam', $('#poamTabSel').val(), (csts.models['Scans'].poamFields['Security Control']) + fields.poamRow),
									'source'		: csts.models['Scans'].getVal('poam', $('#poamTabSel').val(), (csts.models['Scans'].poamFields['Source']) + fields.poamRow).substring(
										0,
										csts.models['Scans'].getVal('poam', $('#poamTabSel').val(), (csts.models['Scans'].poamFields['Source']) + fields.poamRow).indexOf('Group ID:')
									),
									'threat'		: csts.models['Scans'].getVal('poam', $('#poamTabSel').val(), (csts.models['Scans'].poamFields['Source']) + fields.poamRow).substring(
										csts.models['Scans'].getVal('poam', $('#poamTabSel').val(), (csts.models['Scans'].poamFields['Source']) + fields.poamRow).indexOf('Group ID:')
									),
									'description'	: csts.models['Scans'].getVal('poam', $('#poamTabSel').val(), (csts.models['Scans'].poamFields['Description']) + fields.poamRow),
									'risk'			: '',
									'rawrisk'		: r,
									'impact'		: i,
									'likelihood'	: l,
									'correction'	: '',
									'mitigation'	: csts.models['Scans'].getVal('poam', $('#poamTabSel').val(), (csts.models['Scans'].poamFields['Mitigation']) + fields.poamRow),
									'remediation'	: csts.models['Scans'].getVal('poam', $('#poamTabSel').val(), (csts.models['Scans'].poamFields['Mitigation']) + fields.poamRow),
									'residualrisk'	: csts.models['Scans'].getVal('poam', $('#poamTabSel').val(), (csts.models['Scans'].poamFields['Residual Risk']) + fields.poamRow),
									'status'		: csts.models['Scans'].getVal('poam', $('#poamTabSel').val(), (csts.models['Scans'].poamFields['Status']) + fields.poamRow),
									'comment'		: csts.models['Scans'].getVal('poam', $('#poamTabSel').val(), (csts.models['Scans'].poamFields['Comment']) + fields.poamRow),
									'devices'		: ''
								}
								
							],
							{
								header : ['control','source','threat','description','risk','rawrisk','impact','likelihood','correction','mitigation','remediation','residualrisk','status','comment','devices'],
								origin : -1,
								skipHeader : true
							}
						);
						
						csts.plugins.xlsx.writeFile( csts.models['Scans'].workbooks['rar'],  $('#fileRar').val().trim(), { bookSST : true, bookType : 'xlsx', compression : true} );
					}
					break;
				case 'merge' :
						var text = (
							$("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(8)").text() +
							'\n' + 
							$("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(5)").text()
						).replace(/see rar[\.]*/ig,'')
						
						csts.models['Scans'].setVal('rar',  $('#rarTabSel').val(),  (csts.models['Scans'].rarFields[  fields.type ]) + fields.rarRow, text)
						csts.models['Scans'].setVal('poam', $('#poamTabSel').val(), (csts.models['Scans'].poamFields[ fields.type ]) + fields.poamRow, text)
						
						csts.plugins.xlsx.writeFile( csts.models['Scans'].workbooks['rar'],  $('#fileRar').val().trim(),  { bookSST : true, bookType : 'xlsx', compression : true} );
						csts.plugins.xlsx.writeFile( csts.models['Scans'].workbooks['poam'], $('#filePoam').val().trim(), { bookSST : true, bookType : 'xlsx', compression : true} );
						
						sel = ko.utils.arrayFilter(csts.controllers.Scans.viewModels.comparison(), function(i) { return i.guid == guid; })[0]
						sel.rarVal = text
						sel.poamVal = text
						
						
						$("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(5)").text( text );
						$("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(8)").text( text );
				
					break;
				case 'right' :
					if(fields.mismatch != 'POAM' && fields.mismatch != 'RAR'){
						csts.models['Scans'].setVal('poam', $('#poamTabSel').val(), (csts.models['Scans'].poamFields[ fields.type ]) + fields.poamRow,
							csts.models['Scans'].getVal('rar', $('#rarTabSel').val(), (csts.models['Scans'].rarFields[ fields.type ]) + fields.rarRow)
						)
						csts.plugins.xlsx.writeFile( csts.models['Scans'].workbooks['poam'],  $('#filePoam').val().trim(), { bookSST : true, bookType : 'xlsx', compression : true} );
						sel = ko.utils.arrayFilter(csts.controllers.Scans.viewModels.comparison(), function(i) { return i.guid == guid; })[0]
						sel.poamVal = sel.rar
						$("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(8)").text( fields.rarVal );
					}else{
						r = csts.models['Scans'].getVal('rar', $('#rarTabSel').val(), (csts.models['Scans'].rarFields['Raw Risk']) + fields.rarRow);
						i = '';
						l = '';
						switch(r){
							case 'I' :
								i = 'High';
								l = 'High';
								break;
							case 'II' :
								i = 'Medium';
								l = 'Medium';
								break;
							case 'III' :
								i = 'Low';
								l = 'Low';
								break;
							case 'IV' :
								i = 'None';
								l = 'Info';
								break;
						}
						
						csts.plugins.xlsx.utils.sheet_add_json(
							csts.models.Scans.workbooks.rar.Sheets.RAR, 
							[ 
								{ 
									'blank'			: '',
									'description'	: csts.models['Scans'].getVal('rar', $('#rarTabSel').val(), (csts.models['Scans'].rarFields['Description']) + fields.rarRow),
									'control' 		: csts.models['Scans'].getVal('rar', $('#rarTabSel').val(), (csts.models['Scans'].rarFields['Security Control']) + fields.rarRow),
									'office'		: '',
									'security'		: '',
									'rawrisk'		: r,
									'mitigation'	: csts.models['Scans'].getVal('poam', $('#poamTabSel').val(), (csts.models['Scans'].poamFields['Mitigation']) + fields.poamRow),
									'residualrisk'	: csts.models['Scans'].getVal('poam', $('#poamTabSel').val(), (csts.models['Scans'].poamFields['Residual Risk']) + fields.poamRow),
									'resources'		: '',
									'scd'			: '',
									'milestonesWD'	: '',
									'milestronsWC'	: '',
									'source'		: csts.models['Scans'].getVal('rar', $('#rarTabSel').val(), (csts.models['Scans'].rarFields['Source']) + fields.rarRow) +
										"\n" +
										csts.models['Scans'].getVal('rar', $('#rarTabSel').val(), (csts.models['Scans'].rarFields['Test Id']) + fields.rarRow),
									'status'		: csts.models['Scans'].getVal('rar', $('#rarTabSel').val(), (csts.models['Scans'].rarFields['Status']) + fields.rarRow),
									'comment'		: csts.models['Scans'].getVal('rar', $('#rarTabSel').val(), (csts.models['Scans'].rarFields['Comment']) + fields.rarRow),
								}
								
							],
							{
								header : ['blank','description','control', 'office','security','rawrisk','mitigation','residualrisk','resources','scd','milestonesWD','milestronsWC','source','status','comment'],
								origin : -1,
								skipHeader : true
							}
						);
						
						csts.plugins.xlsx.writeFile( csts.models['Scans'].workbooks['poam'],  $('#filePoam').val().trim(), { bookSST : true, bookType : 'xlsx', compression : true} );
					}
				
					break;
			}
		}	
	}
});