csts.controllers['Scans'] = ({
	name : 'Scans',
	viewModels : {
		comparison : ko.observableArray()
	},
	compare : function(){
		console.log('executing Scans@compare');
		
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
	parseComparisonFiles : function(){
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
	executeComparison : function( fields ){
		$('#headingFour button').click();
		csts.models['Scans'].executeComparison( $('#rarTabSel').val(), $('#poamTabSel').val(), fields);
	},
	fieldMove : function( el ){
		guid = $(el).parents('tr').data('guid');
		
		fields = {
			guid	: guid,
			vulnId	: $("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(2)").text(),
			type	: $("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(3)").text(),
			rarRow	: $("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(4)").text(),
			rarVal	: $("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(5)").text(),
			poamRow	: $("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(7)").text(),
			poamVal	: $("table#scans-compare-results tbody tr[data-guid='" + guid + "'] td:nth-child(8)").text()
		}
		
		switch( $(el).data('action') ){
			case 'left' :
				//update excel
				
				csts.models['Scans'].setVal(
					'rar', 
					$('#rarTabSel').val(), 
					(csts.models['Scans'].rarFields[ fields.type ]) + fields.rarRow,
					csts.models['Scans'].getVal(
						'poam', 
						$('#poamTabSel').val(), 
						(csts.models['Scans'].poamFields[ fields.type ]) + fields.poamRow
					)
				)
				
				csts.plugins.xlsx.writeFile( csts.models['Scans'].workbooks['rar'],  $('#fileRar').val().trim(), { bookSST : true, bookType : 'xlsx', compression : true} );
				
				console.log( 
					csts.models['Scans'].getVal('rar', $('#rarTabSel').val(), (csts.models['Scans'].rarFields[ fields.type ]) + fields.rarRow)
					
				);
				
				
				// writeFile
				
				//update viewModels
				
				//update UI
				break;
			case 'merge' :
				break;
			case 'right' :
				break;
		}
		
		
		
	}
});