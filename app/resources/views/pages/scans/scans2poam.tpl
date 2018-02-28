<div class="container-fluid" data-name="Compare">
	<div class="row">
		<main class="col-sm-12 ml-sm-auto col-md-12 pt-3" role="main">
			<h1>Overview</h1>
			<div>
				This is the scans2poam Tool.  This will generate an merged POAM/RAR based off submitted scan results.
			</div>
			<br />
			<div id="accordion">
				<div class="card">
					<div class="card-header" id="headingOne">
						<h5 class="mb-0">
							<button class="btn btn-link" data-toggle="collapse" data-target="#scans-compare-files" aria-expanded="true" aria-controls="scans-compare-files">
								Folder Selection Form
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
												<span class="input-group-text span-info" style="width: 100px;" id="basic-addon1">Scan Files</span>
											</div>
											<div class="custom-file">
												<input type="file" id="files-scans" name="fileList" class="custom-file-input" nwdirectory="nwdirectory"/>
												<label class="custom-file-label" for="files-scans">Choose file</label>
											</div>
											
											<div class="input-group-text span-dark">
												<input type="checkbox" aria-label="Checkbox for following text input" checked="checked" id="files-recurse">
											</div>
											
											<div class="input-group-prepend">
												<span class="input-group-text span-dark" style="width: 100px;" id="basic-addon1">Recurse?</span>
											</div>
											
											<div class="input-group-append">
												<button type="button" class="btn btn-primary float-right" id="scans2poam-parse-btn">Scan</button>	
											</div>
										</div>
																		
									</form>
								</div>
							</p>
						</div>
					</div>
				</div>
				
				<div class="card">
					<div class="card-header" id="headingTwo">
						<h5 class="mb-0">
							<button class="btn btn-link" data-toggle="collapse" data-target="#scans-scan-files" aria-expanded="true" aria-controls="scans-scan-files" id="select-scan-files-card">
								Selected Scan Files
							</button>
						</h5>
					</div>
					<div id="scans-scan-files" class="collapse" aria-labelledby="headingTwo" data-parent="#accordion">
						<div class="card-body">
							<p class="card-text">
								<div class="container">
									<table class="table table-striped table-sm table-small-text"  id="tabScanFiles">
										<thead>
											<tr>
												<th style="width:25px !important;">#</th>
												<th style="width:200px;">Name</th>
												<th style="width:100px !important;">Created</th>
												<th style="width:100px !important;">Accessed</th>
												<th style="width:100px !important;">Modified</th>
												<th style="width:50px !important;">Size</th>
												<th style="width:50px !important;">File Type</th>
											</tr>
										</thead>
										<tbody>
										</tbody>
										<tfoot>
											<tr>
												<th colspan="7">
													<button class="btn btn-success float-right" type="button" id="btn-scans2poam-execute">Execute</button>
												</th>
											</tr>

										</tfoot>
									</table>
								</div>
								<br />
								
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

							<table class="table table-sm table-striped table-small-text data-table " id="scans-files">
							<thead>
								<tr>
									<th>#</th>
									<th>Security Controls</th>
									<th>Source</th>
									<th>Vuln Id</th>
									<th>Description</th>
									<th>Raw Risk</th>
									<th>Status</th>
									<th>Devices</th>
								</tr>
							</thead>
							<tbody>
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
	$("#files-scans").on("change",function(){
		$('label[for="'+$(this).attr('id')+'"]').text( $("#files-scans")[0].files[0].path  );
	});
	
	$('#scans2poam-parse-btn').on('click',function(){
		csts.controllers.Scans.scans2poam.invokeFileScan( $('#files-scans')[0].files[0].path ); 
	}); 

	$("button#btn-scans2poam-execute").on('click', function(){
		csts.controllers.Scans.scans2poam.execute( $('#files-scans') ); 
	});
</script>
