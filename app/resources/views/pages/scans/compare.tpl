<div class="container-fluid" data-name="Compare">
	<div class="row">
		<main class="col-sm-12 ml-sm-auto col-md-12 pt-3" role="main">
			<h1>Overview</h1>
			<div>
				This is the POAM/RAR Management Tool.	This tool will allow you to execute multiple processes on your Excel based POAM's and RAR's.	Please select the applicable files below.
			</div>
			<br />
			
			<h3>
				<a data-toggle="" href="#scans-compare-files" role="button" aria-expanded="false" aria-controls="scan-compare-files" class="no-decoration" id="scans-compare-files-link">
					File Selection Form
				</a>
			</h3>
			<div class=" show" id="scans-compare-files">
				<div class="card">
					<div class="card-body">
						<div class="container">
							<form>
								<div class="form-group row">
									<label class="col-sm-2 col-form-label">RAR File</label>
									<div class="col-sm-10" id="rarContainer">
										<input type="file" id="fileRar"  class="custom-file">
									</div>
								</div>
								<div class="form-group row">
									<label class="col-sm-2 col-form-label">POAM File</label>
									<div class="col-sm-10">
										<input type="file" id="filePoam" class="custom-file">
									</div>
								</div>	
							</form>
						</div>
					</div>
				</div>	
			</div>

			<h3>
				<a data-toggle="" href="#scans-compare-file-info" role="button" aria-expanded="false" aria-controls="scans-compare-file-info" class="no-decoration" id="scans-compare-file-info-link">
					File Information
				</a>
			</h3>
			<div class="table-responsive  " id="scans-compare-file-info">
				<table class="table table-striped table-sm" id="tabSelFileInfo">
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


			<h3>
				<a data-toggle="" href="#scans-compare-file-parameters" role="button" aria-expanded="false" aria-controls="scans-compare-file-parameters" class="no-decoration" id="scans-compare-file-parameters-link">
					Parameters
				</a>
			</h3>

			<div class="" id="scans-compare-file-parameters">
				<div class="card" style="width:98%;margin: 10px auto 0px auto;" >
				
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
									</div>
									
									<div class="" >
										<button type="button" class="btn btn-primary float-right" id="scans-comparison-execute-btn">Execute</button>
									</div>
								</form>
							</div>
						</p>

					</div>
				</div>
			</div>

			<h3>
				<a data-toggle="" href="#scans-compare-results" role="button" aria-expanded="false" aria-controls="scans-compare-results" class="no-decoration" id="scans-compare-results-link">
					Results
				</a>
			</h3>
			<div class="row">
				<div class="card">
					<div class="card-body" style="padding-top:10px;">
						<table class="table table-sm table-striped" style="table-layout: fixed; font-size:10px;" id="scans-compare-results">
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
							<tbody data-bind="foreach: comparison">
								<tr>
									<td></td>
									<td data-bind="text: vulnId"></td>
									<td data-bind="text: type"></td>
									<td data-bind="text: rarRow"></td>
									<td data-bind="text: rarVal"></td>
									<td></td>
									<td data-bind="text: poamRow"></td>
									<td data-bind="text: poamVal"></td>
								</tr>
							</tbody>
						</table>

					</div>
				</div>

			</div>

	
		</main>
	</div>
</div>

<script>

$(document).ready(function(){
	ko.applyBindings({ comparison: csts.controllers.Scans.viewModels.comparison });
});


	$("#fileRar, #filePoam").on("change",function(){
		if($('#fileRar').val().trim() != '' && $('#filePoam').val().trim() != ''){
			csts.controllers['Scans'].parseComparisonFiles();
		}
	});
	
	$('button#scans-comparison-execute-btn').on('click',function(){
		$('#scans-compare-results tbody tr').remove();
		csts.controllers['Scans'].executeComparison();
	});
</script>