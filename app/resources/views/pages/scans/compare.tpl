<div class="container-fluid" data-name="Compare">
	<div class="row">
		<main class="col-sm-12 ml-sm-auto col-md-12 pt-3" role="main">
			<h1>Overview</h1>
			<div>
				This is the POAM/RAR Management Tool.	This tool will allow you to execute multiple processes on your Excel based POAM's and RAR's.	Please select the applicable files below.
			</div>
			<br />
			
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
											<div class="col-sm-10" id="fieldComparison">
												<% fields.forEach(function(field) { %>
													<div class="form-check form-check-inline">
														<label class="form-check-label">
															<input class="form-check-input" type="checkbox" value="<%= field %>" name="comparisonFields" checked="checked" /><%= field %>
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
												<button type="button" class="btn btn-primary float-right" id="scans-comparison-execute-btn">Execute</button>	
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
							<table class="table table-sm table-striped table-small-text" id="scans-compare-results">
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
							<tbody data-bind="foreach: comparison" >
								<tr data-bind="attr: { 'data-guid': guid }">
									<td></td>
									<td data-bind="text: vulnId"></td>
									<td data-bind="text: type"></td>
									<td data-bind="text: rarRow"></td>
									<td data-bind="text: rarVal"></td>
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
									<td data-bind="text: poamVal"></td>
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
		csts.controllers['Scans'].viewModels.comparison.removeAll();
		$.each( $("*[data-bind]"), function(){ 
			ko.removeNode( $(this) ); 
		});
		ko.applyBindings({ comparison: csts.controllers.Scans.viewModels.comparison }, $('table#scans-compare-results tbody')[0] );
	});
	$(window).bind('beforeunload', function(){
		$('#scans-compare-results tbody tr').remove();
		ko.removeNode( csts.controllers['Scans'].viewModels.comparison ); 
		ko.cleanNode( csts.controllers['Scans'].viewModels.comparison ); 
		ko.removeNode( $('#scans-compare-results tbody tr')[0] );
		ko.cleanNode( $('#scans-compare-results tbody tr')[0] );
		csts.controllers['Scans'].viewModels.comparison.destroy()
		csts.controllers['Scans'].viewModels.comparison = {};
		csts.controllers['Scans'].viewModels.comparison.removeAll();
	});

	$("#fileRar, #filePoam").on("change",function(){
		$('label[for="'+$(this).attr('id')+'"]').text( csts.plugins.path.basename( $(this).val() ) );

		if($('#fileRar').val().trim() != '' && $('#filePoam').val().trim() != ''){
			csts.controllers['Scans'].parseComparisonFiles();
		}
	});
	
	$('button#scans-comparison-execute-btn').on('click',function(){
		$('#scans-compare-results tbody tr').remove();
		csts.controllers['Scans'].executeComparison(  $("input:checked[type='checkbox'][name='comparisonFields']").serializeArray() );
		$('button.btn-compare-action').on('click', function(){ csts.controllers['Scans'].fieldMove( $(this) ); } );
	});
</script>