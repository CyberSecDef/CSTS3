csts.controllers['Scans'] = ({
	name : 'Scans',
	compare : function(){
		console.log('executing Scans@compare');
		
		csts.plugins.ejs.renderFile('app/resources/views/pages/scans/compare.tpl',{
				fields : [ 'Comments', 'Description', 'Mitigations', 'Raw Risk', 'Residual Risk', 'Security Controls', 'Source', 'Status']
			},{},function(err,str){
			if(err){
				console.log(err);
			}
			$('#main-center-col').html(str);

			$("#fileRar, #filePoam").on("change",function(){
				if($('#fileRar').val().trim() != '' && $('#filePoam').val().trim() != ''){
					csts.controllers['Scans'].parseFiles();
				}
			});

		}) 
	},
	parseFiles : function(){
		if( $('#fileRar').val().trim() != $('#filePoam').val().trim()){
			$('#myModal').modal();
			$('#myModalLabel').text('Please Wait...');
			$('#myModalBody').text('Currently Parsing the Excel Documents.  Please wait.');
			
			$('#myModal').on('shown.bs.modal', function (e) {
				stats = csts.plugins.fs.statSync( $('#fileRar').val().trim() );
				console.log(stats);

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

				$('#scans-compare-files-link').click();
				$('#myModal').modal('hide');


				var workbook = csts.plugins.xlsx.readFile( $('#fileRar').val().trim() );
				$.each(workbook.SheetNames, function(index,item){
					
					$div = $('<div>').addClass('form-check form-check-inline');
					$lab = $('<label>').addClass('form-check-label');
					$inp = $('<input>').addClass('form-check-input').attr('type','radio').attr('name','radRARSheet').val( item );
					$lab.append( $inp );
					$lab.append( $('<div>' + item + '</div>') );	

					$div.append( $lab );
					$div.append('&nbsp;&nbsp;&nbsp;');

					$('#rarSheets').append( $div.html() );



				});


				console.log(workbook);


			});
		}else{
			alert('The POAM and RAR can not be the same file.  Please select a valid POAM and RAR spreadsheet on the Home tab');
			$("div ul.navbar-nav li.nav-item a.nav-link[href='#Home']").click();					
		}
	}
	
});