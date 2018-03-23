<div class="errors alert alert-danger collapse" id="errors"></div>
<div class="container-fluid" data-name="Compare">
	<div class="row">
		<main class="col-sm-12 ml-sm-auto col-md-12 pt-3" role="main">
			<h1>Overview</h1>
			<div>
					<div class="alert alert-secondary border-secondary" role="alert">
						This is the POAM/RAR Management Tool.	This tool will allow you to execute multiple processes on your Excel based POAM's and RAR's.	Please select the applicable files below.
					</div>

				<div class="alert alert-warning border-warning" role="alert">
					<strong>Note:</strong>  The processed RAR and POAMs must have the column headers on the first row.  The RAR and POAM must also be no more than 5000 rows long.
				</div>
			</div>
			
			<div id="accordion">
			
				<div class="card">
					<div class="card-header" id="headingOne">
						<h5 class="mb-0">
							<button class="btn btn-link" data-toggle="collapse" data-target="#scans-compare-files" aria-expanded="true" aria-controls="scans-compare-files">
								File Selection Form
							</button>
						</h5>
					</div>
					
					<div id="scans-compare-files" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
						<div class="card-body">
							<p class="card-text">
								<div class="container">
									<form>
										<div class="input-group mb-3">
											<div class="input-group-prepend">
												<span class="input-group-text span-info" style="width: 100px;" id="basic-addon1">RAR File</span>
											</div>
											<div class="custom-file">
												<input type="file" class="custom-file-input" id="fileRar">
												<label class="custom-file-label" for="fileRar">Choose file</label>
											</div>
											
										</div>
										<div class="input-group mb-3">
											<div class="input-group-prepend">
												<span class="input-group-text span-info" style="width: 100px;" id="basic-addon1">POAM File</span>
											</div>
											<div class="custom-file">
												<input type="file" class="custom-file-input" id="filePoam">
												<label class="custom-file-label" for="filePoam">Choose file</label>
											</div>										
										</div>
										
										
									</form>
									<table class="table table-striped table-sm table-small-text"  id="tabSelFileInfo">
										<thead>
											<tr>
												<th>Type</th>
												<th>Name</th>
												<th>Created</th>
												<th>Accessed</th>
												<th>Modified</th>
												<th>Size</th>
												<th>File Type</th>
											</tr>
										</thead>
										<tbody>
										</tbody>
									</table>
								</div>
							</p>
						</div>
					</div>
				</div>
				
				<div class="card">
					<div class="card-header" id="headingThree">
						<h5 class="mb-0">
							<button class="btn btn-link" data-toggle="collapse" data-target="#scans-compare-file-parameters" aria-expanded="true" aria-controls="scans-compare-file-parameters">
								Parameters
							</button>
						</h5>
					</div>
					
					<div id="scans-compare-file-parameters" class="collapse" aria-labelledby="headingThree" data-parent="#accordion">
						<div class="card-body">
							<p class="card-text">
								<div class="container">
									<form>
									
										<div class="form-group row">
											<label class="col-sm-2 col-form-label"><h4>Fields:</h4> </label>
											<div class="col-sm-10" id="fieldcompareRarPoam">
												<% fields.forEach(function(field) { %>
													<div class="form-check form-check-inline">
														<label class="form-check-label">
															<input class="form-check-input" type="checkbox" value="<%= field %>" name="compareRarPoamnFields" checked="checked" /><%= field %>
														</label>
													</div>
												<% }); %>
											</div>
										</div>
										<div class="input-group mb-3">
											<div class="input-group-prepend">
												<span class="input-group-text" id="basic-addon1">RAR Tab</span>
											</div>
											<select class="form-control" aria-label="RAR Tab" name="rarTabSel" id="rarTabSel"></select>
											<div class="input-group-prepend">
												<span class="input-group-text" id="basic-addon1">POAM Tab</span>
											</div>
											<select class="form-control" aria-label="POAM Tab" name="poamTabSel" id="poamTabSel"></select>
											<div class="input-group-append">
												<button type="button" class="btn btn-primary float-right" id="scans-compareRarPoam-execute-btn">Execute</button>	
											</div>
										</div>
										
									</form>
								</div>
							</p>
						</div>
					</div>
				</div>

				
				<div class="card">
					<div class="card-header" id="headingFour">
						<h5 class="mb-0">
							<button class="btn btn-link collapsed" data-toggle="collapse" data-target="#scans-compare-results" aria-expanded="false" aria-controls="scans-compare-results">
								Results
							</button>
						</h5>
					</div>
					<div id="scans-compare-results" class="collapse" aria-labelledby="headingFour" data-parent="#accordion">
						<div class="card-body">
							
							<form class="form-inline float-right">
								<div class="form-group mb-2">
									<div class="btn-group" role="group">
										<button class="btn btn-outline-primary" type="button" id="exportDOC">
											<i class="fas fa-file-word"></i>
										</button>
										<button class="btn btn-outline-danger" type="button" id="exportPDF">
											<i class="fas fa-file-pdf"></i>
										</button>
										<button class="btn btn-outline-success" type="button" id="exportCSV">
											<i class="fas fa-file-excel"></i>
										</button>
									</div>
								</div>
							</form>

							<table class="table table-sm table-striped table-small-text data-table" id="scans-compare-results">
							<thead>
								<tr>
									<th style="width: 7% !important;">#</th>
									<th style="width: 12% !important;">Vuln Id</th>
									<th style="width: 15% !important;">Type</th>
									<th style="width: 7% !important;">RAR Row</th>
									<th style="width: 20% !important;">RAR Value</th>
									<th style="width: 12% !important;">Actions</th>
									<th style="width: 7% !important;">POAM Row</th>
									<th style="width: 20% !important;">POAM Value</th>
								</tr>
							</thead>
							<tbody data-bind="foreach: compareRarPoam" >
								<tr data-bind="attr: { 'data-guid': guid, 'data-mismatch': mismatch }">
									<td data-bind="text: rowId"></td>
									<td data-bind="text: vulnId"></td>
									<td data-bind="text: type"></td>
									<td data-bind="text: rarRow"></td>
									<td style="white-space:pre-wrap" data-bind="text: rarVal"></td>
									<td class="input-group mb-3">
										<div class="input-group-prepend">
											<button type="button" class="btn btn-sm btn-compare-action" data-action="left"><i class="fas fa-long-arrow-alt-left"></i></button>
										</div>
										<button  type="button"  class="btn btn-sm btn-compare-action" data-action="merge"><i class="fas fa-exchange-alt"></i></button>
										<div class="input-group-apppend">
											<button  type="button"  class="btn btn-sm btn-compare-action" data-action="right"><i class="fas fa-long-arrow-alt-right"></i></button>
										</div>
									
									</td>
									<td data-bind="text: poamRow"></td>
									<td style="white-space:pre-wrap" data-bind="text: poamVal"></td>
								</tr>
							</tbody>
						</table>
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
</div>

<script>

	$(document).ready(function(){
		csts.controllers['Scans'].viewModels.compareRarPoam.removeAll();
		$.each( $("*[data-bind]"), function(){ 
			ko.removeNode( $(this) ); 
		});
		ko.applyBindings({ compareRarPoam: csts.controllers.Scans.viewModels.compareRarPoam }, $('table#scans-compare-results tbody')[0] );
	});
	
	$(window).bind('beforeunload', function(){
		$('#scans-compare-results tbody tr').remove();
		ko.removeNode( csts.controllers['Scans'].viewModels.compareRarPoam ); 
		ko.cleanNode( csts.controllers['Scans'].viewModels.compareRarPoam ); 
		ko.removeNode( $('#scans-compare-results tbody tr')[0] );
		ko.cleanNode( $('#scans-compare-results tbody tr')[0] );
		csts.controllers['Scans'].viewModels.compareRarPoam.destroy()
		csts.controllers['Scans'].viewModels.compareRarPoam = {};
		csts.controllers['Scans'].viewModels.compareRarPoam.removeAll();
	});

	$("#fileRar, #filePoam").on("change",function(){
		$('label[for="'+$(this).attr('id')+'"]').text( csts.plugins.path.basename( $(this).val() ) );
		if($('#fileRar').val().trim() != '' && $('#filePoam').val().trim() != ''){
			csts.controllers['Scans'].compareRarPoam.parseFiles();
		}
	});
	
	$('button#scans-compareRarPoam-execute-btn').on('click',function(){
		$('#scans-compare-results tbody tr').remove();
		csts.controllers.Scans.compareRarPoam.executeComparison(  $("input:checked[type='checkbox'][name='compareRarPoamnFields']").serializeArray() );
		$('button.btn-compare-action').on('click', function(){ csts.controllers['Scans'].compareRarPoam.moveField( $(this) ); } );
	});
	
	$('button#exportDOC').on('click',function(){
		$results = $('#scans-compare-results').clone();
		$results.find('th').remove(':nth-child(6)');
		$results.find('td').remove(':nth-child(6)');
		csts.libs.export.saveDOC($results.html(), 'compareRarPoam.doc')
	});
	
	$('button#exportPDF').on('click',function(){
		data = {};
		data.styles = {
			columnStyles : { 0: {columnWidth: 40}, 1: {columnWidth: 75}, 2: {columnWidth: 125}, 3: {columnWidth: 40}, 4: {columnWidth: 200}, 5: {columnWidth: 40}, 6: {columnWidth: 200}},
			styles : { overflow : 'linebreak', fontSize : 8, lineWidth : 1} 
		}
		
		data.columns = $("th",$("table#scans-compare-results")).not('th:nth-child(6)').map(function() {  return (this.innerText || this.textContent) }).get();
		data.rows = [];
		$.each( $("table#scans-compare-results tbody tr"), function(d,el){ 
			data.rows.push( [ 
				$(el).find('td:nth-child(1)').text(),
				$(el).find('td:nth-child(2)').text(),
				$(el).find('td:nth-child(3)').text(),
				$(el).find('td:nth-child(4)').text(),
				$(el).find('td:nth-child(5)').text(),
				$(el).find('td:nth-child(7)').text(),
				$(el).find('td:nth-child(8)').text()
			] )
		})
		console.log(data);
			
		csts.libs.export.savePDF(data, 'compareRarPoam.pdf')
	});
	
	$('button#exportCSV').on('click',function(){
		data = {};
		data.columns = $("th",$("table#scans-compare-results")).not('th:nth-child(6)').map(function() {  return (this.innerText || this.textContent) }).get();
		data.rows = [];
		$.each( $("table#scans-compare-results tbody tr"), function(d,el){ 
			data.rows.push( [ 
				$(el).find('td:nth-child(1)').text(),
				$(el).find('td:nth-child(2)').text(),
				$(el).find('td:nth-child(3)').text(),
				$(el).find('td:nth-child(4)').text(),
				$(el).find('td:nth-child(5)').text(),
				$(el).find('td:nth-child(7)').text(),
				$(el).find('td:nth-child(8)').text()
			] )
		})
		csts.libs.export.saveCSV(data, 'compareRarPoam.csv')
	});
	
	
</script>
