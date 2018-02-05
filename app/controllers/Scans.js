/*
	Namespace: csts.controllers.Scans
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
		Namespace: csts.controllers.scans.scans2poam
		This is the scans2poam functionality
	*/
	
	scans2poam : {
		scanFiles : [],
		scans : {
			scap : {},
			acas : {},
			ckl : {}
		},
		$poamArr : {},
		$poamKeys : [],
		$scapOpen : [],
		$cklOpen : [],


		/*
			Method: index
			This is the function called from the router to load the scans2poam module
		*/
		index : function(){
			csts.plugins.ejs.renderFile('app/resources/views/pages/scans/scans2poam.tpl',{},
				{ rmWhitespace : true},
				function(err,str){
					if(err){ console.log(err); $('#errors').html(err); }
					$('#main-center-col').html(str);
				}
			);
		},
		
		/*
			Method: csts.controllers.scans.scans2poam.parse
			Grabs the files from the submitted path
		*/
		grabFiles : function(){
			var self = this;
			$('#myModal').modal();
			$('#myModalLabel').text('Please Wait...');
			$('#myModalBody').text('Currently Loading the Scanfiles.  Please wait.');
			$('#myModal').on('shown.bs.modal', function (e) {
				this.scanFiles = self.getScanFiles();	
				
				//load into table
				$('#tabScanFiles tbody').empty();
				var table = $('table#tabScanFiles').DataTable({ destroy: true, searching: true , paging: 25});
				table.clear();
				this.scanFiles.forEach(function(file, index){
					stats = csts.plugins.fs.statSync( file );
					
					table.row.add(
						[
							"<input type='checkbox' name='scan-file' value='" + file + "' checked='checked'/>",
							csts.plugins.path.basename( file ),
							csts.plugins.moment(stats.ctimeMs).format("MM/DD/YYYY HH:mm"), 
							csts.plugins.moment(stats.atimeMs).format("MM/DD/YYYY HH:mm"),
							csts.plugins.moment(stats.mtimeMs).format("MM/DD/YYYY HH:mm"),
							csts.plugins.numeral(stats.size).format('0.0 b'),
							csts.plugins.path.extname( file )
						] 
					)
				
				})
				
				table.rows().invalidate().draw();

				
				$('#myModal').modal('hide');
			});

			console.log('Executing');
			this.scanFiles.forEach(function(val,index){
				console.log(val);
			});
		},

		getScanFiles : function(){
			path = $("#files-scans")[0].files[0].path
			if( $('#files-recurse').prop('checked') ){
				files = csts.libs.utils.walkSync(path);
			}else{
				files = csts.plugins.fs.readdirSync(path);
			}
			//filter to just the types of scan files we need
			scans = files.filter( scan => ( 
				(scan.toLowerCase().indexOf('.xml') >= 0 && scan.toLowerCase().indexOf('xccdf') >= 0 ) || 
				scan.toLowerCase().indexOf('.zip') >= 0 ||
				scan.toLowerCase().indexOf('.ckl') >= 0 ) ||
				scan.toLowerCase().indexOf('.nessus') >= 0 
			)

			return scans;
		}
	},
	/*
		Namespace: csts.controllers.scans.comparison
		Methods and variables related to the RAR/POAM comparison functionality
	*/
	comparison : {

		/*
			Method: index
			This is the function called from the router to load the compareRAR/POAM functionality
		*/
		index : function(){
			
			csts.libs.ui.status('Loading RAR/POAM Comparison functions.');

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
				csts.libs.Workbooks.extend(csts.models['Scans'].workbooks['rar']);
				
				$.each(csts.models['Scans'].workbooks['rar'].SheetNames, function(index,item){
					$('#rarTabSel').append( $('<option></option>').text(item).prop('selected', (item.toLowerCase().replace(/[^a-zA-Z]/,'').indexOf('rar')>=0 ) ) );
				});

				
				$('#poamTabSel').find('option').remove()
				csts.models['Scans'].workbooks['poam'] = csts.plugins.xlsx.readFile( $('#filePoam').val().trim() );
				csts.libs.Workbooks.extend(csts.models['Scans'].workbooks['poam']);
				
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
				<models.scans.comparison.execute>
		*/
		execute : function( fields ){
			$('#headingFour button').click();
			csts.models['Scans'].comparison.execute( $('#rarTabSel').val(), $('#poamTabSel').val(), fields);
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
						//workbook
						csts.models['Scans'].workbooks['rar'].val($('#rarTabSel').val(), (csts.models['Scans'].rarFields[ fields.type ]) + fields.rarRow,
							csts.models['Scans'].workbooks['poam'].val($('#poamTabSel').val(), (csts.models['Scans'].poamFields[ fields.type ]) + fields.poamRow)
						)
						//excel
						csts.plugins.xlsx.writeFile( csts.models['Scans'].workbooks['rar'],  $('#fileRar').val().trim(), { bookSST : true, bookType : 'xlsx', compression : true} );
						//viewmodel
						sel = ko.utils.arrayFilter(csts.controllers.Scans.viewModels.comparison(), function(i) { return i.guid == guid; })[0]
						sel.rarVal = sel.poamVal
						//ui
						$("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(5)").text( fields.poamVal );
					}else{
						r = csts.models['Scans'].workbooks['poam'].val($('#poamTabSel').val(), (csts.models['Scans'].poamFields['Raw Risk']) + fields.poamRow);
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
						
						//workbook
						csts.plugins.xlsx.utils.sheet_add_json(
							csts.models.Scans.workbooks['rar'].Sheets[$('#rarTabSel').val()], 
							[ 
								{ 
									'control' 		: csts.models['Scans'].workbooks['poam'].val($('#poamTabSel').val(), (csts.models['Scans'].poamFields['Security Control']) + fields.poamRow),
									'source'		: csts.models['Scans'].workbooks['poam'].val($('#poamTabSel').val(), (csts.models['Scans'].poamFields['Source']) + fields.poamRow).substring(
										0,
										csts.models['Scans'].workbooks['poam'].val($('#poamTabSel').val(), (csts.models['Scans'].poamFields['Source']) + fields.poamRow).indexOf('Group ID:')
									),
									'threat'		: csts.models['Scans'].workbooks['poam'].val($('#poamTabSel').val(), (csts.models['Scans'].poamFields['Source']) + fields.poamRow).substring(
										csts.models['Scans'].workbooks['poam'].val($('#poamTabSel').val(), (csts.models['Scans'].poamFields['Source']) + fields.poamRow).indexOf('Group ID:')
									),
									'description'	: csts.models['Scans'].workbooks['poam'].val($('#poamTabSel').val(), (csts.models['Scans'].poamFields['Description']) + fields.poamRow),
									'risk'			: '',
									'rawrisk'		: r,
									'impact'		: i,
									'likelihood'	: l,
									'correction'	: '',
									'mitigation'	: csts.models['Scans'].workbooks['poam'].val($('#poamTabSel').val(), (csts.models['Scans'].poamFields['Mitigation']) + fields.poamRow),
									'remediation'	: csts.models['Scans'].workbooks['poam'].val($('#poamTabSel').val(), (csts.models['Scans'].poamFields['Mitigation']) + fields.poamRow),
									'residualrisk'	: csts.models['Scans'].workbooks['poam'].val($('#poamTabSel').val(), (csts.models['Scans'].poamFields['Residual Risk']) + fields.poamRow),
									'status'		: csts.models['Scans'].workbooks['poam'].val($('#poamTabSel').val(), (csts.models['Scans'].poamFields['Status']) + fields.poamRow),
									'comment'		: csts.models['Scans'].workbooks['poam'].val($('#poamTabSel').val(), (csts.models['Scans'].poamFields['Comment']) + fields.poamRow),
									'devices'		: ''
								}
								
							],
							{
								header : ['control','source','threat','description','risk','rawrisk','impact','likelihood','correction','mitigation','remediation','residualrisk','status','comment','devices'],
								origin : -1,
								skipHeader : true
							}
						);
						
						//excel
						csts.plugins.xlsx.writeFile( csts.models['Scans'].workbooks['rar'],  $('#fileRar').val().trim(), { bookSST : true, bookType : 'xlsx', compression : true} );
						
						//viewmodel
						sel = ko.utils.arrayFilter(csts.controllers.Scans.viewModels.comparison(), function(i) { return i.guid == guid; })[0]
						sel.rarVal = 'COPIED'
						//ui
						$("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(5)").text( 'COPIED');
						
					}
					break;
				case 'merge' :
						var text = (
							$("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(8)").text() +
							'\n' + 
							$("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(5)").text()
						).replace(/see rar[\.]*/ig,'')
						
						csts.models['Scans'].workbooks['rar'].val($('#rarTabSel').val(),  (csts.models['Scans'].rarFields[  fields.type ]) + fields.rarRow, text)
						csts.models['Scans'].workbooks['poam'].val($('#poamTabSel').val(), (csts.models['Scans'].poamFields[ fields.type ]) + fields.poamRow, text)
						
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
						csts.models['Scans'].workbooks['poam'].val($('#poamTabSel').val(), (csts.models['Scans'].poamFields[ fields.type ]) + fields.poamRow,
							csts.models['Scans'].workbooks['rar'].val($('#rarTabSel').val(), (csts.models['Scans'].rarFields[ fields.type ]) + fields.rarRow)
						)
						csts.plugins.xlsx.writeFile( csts.models['Scans'].workbooks['poam'],  $('#filePoam').val().trim(), { bookSST : true, bookType : 'xlsx', compression : true} );
						sel = ko.utils.arrayFilter(csts.controllers.Scans.viewModels.comparison(), function(i) { return i.guid == guid; })[0]
						sel.poamVal = sel.rar
						$("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(8)").text( fields.rarVal );
					}else{
						r = csts.models['Scans'].workbooks['rar'].val($('#rarTabSel').val(), (csts.models['Scans'].rarFields['Raw Risk']) + fields.rarRow);
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
									'description'	: csts.models['Scans'].workbooks['rar'].val($('#rarTabSel').val(), (csts.models['Scans'].rarFields['Description']) + fields.rarRow),
									'control' 		: csts.models['Scans'].workbooks['rar'].val($('#rarTabSel').val(), (csts.models['Scans'].rarFields['Security Control']) + fields.rarRow),
									'office'		: '',
									'security'		: '',
									'rawrisk'		: r,
									'mitigation'	: csts.models['Scans'].workbooks['poam'].val($('#poamTabSel').val(), (csts.models['Scans'].poamFields['Mitigation']) + fields.poamRow),
									'residualrisk'	: csts.models['Scans'].workbooks['poam'].val($('#poamTabSel').val(), (csts.models['Scans'].poamFields['Residual Risk']) + fields.poamRow),
									'resources'		: '',
									'scd'			: '',
									'milestonesWD'	: '',
									'milestronsWC'	: '',
									'source'		: csts.models['Scans'].workbooks['rar'].val($('#rarTabSel').val(), (csts.models['Scans'].rarFields['Source']) + fields.rarRow) +
										"\n" +
										csts.models['Scans'].workbooks['rar'].val($('#rarTabSel').val(), (csts.models['Scans'].rarFields['Test Id']) + fields.rarRow),
									'status'		: csts.models['Scans'].workbooks['rar'].val($('#rarTabSel').val(), (csts.models['Scans'].rarFields['Status']) + fields.rarRow),
									'comment'		: csts.models['Scans'].workbooks['rar'].val( $('#rarTabSel').val(), (csts.models['Scans'].rarFields['Comment']) + fields.rarRow),
								}
							],
							{
								header : ['blank','description','control', 'office','security','rawrisk','mitigation','residualrisk','resources','scd','milestonesWD','milestronsWC','source','status','comment'],
								origin : -1,
								skipHeader : true
							}
						);
						//excel
						csts.plugins.xlsx.writeFile( csts.models['Scans'].workbooks['poam'],  $('#filePoam').val().trim(), { bookSST : true, bookType : 'xlsx', compression : true} );
						
						//viewmodel
						sel = ko.utils.arrayFilter(csts.controllers.Scans.viewModels.comparison(), function(i) { return i.guid == guid; })[0]
						sel.poamVal = 'COPIED'
						//ui
						$("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(8)").text( 'COPIED');
					}
					break;
			}
		}	
	}
});