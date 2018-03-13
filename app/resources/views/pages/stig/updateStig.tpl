<div class="container-fluid" data-name="Compare">
    <div class="row">
      <main class="col-sm-12 ml-sm-auto col-md-12 pt-3" role="main">
        <h1>Overview</h1>
        <div>
            <div class="alert alert-secondary border-secondary" role="alert">
              <p>
                This script copies all user data from one STIG (CKL) file to another.
              </p>
            
              <p>
                This Script is designed to make updating to a new STIG Checklist 
                version faster and easier.  It will move the asset data and all comments,
                finding details, status, severity override and justifications from the
                source file to the desintation STIG or CKL.  The Script assumes that the vulnerability ids
                are consistent from file to file.  It does not perform any checking for
                STIG items which may have been updated between versions and that will
                still need to be performed manually.  
              </p>
            </div>
        </div>
        
        <div id="accordion">
        
          <div class="card">
            <div class="card-header" id="headingOne">
              <h5 class="mb-0">
                <button class="btn btn-link" data-toggle="collapse" data-target="#stig-update-files" aria-expanded="true" aria-controls="stig-update-files">
                  File Selection Form
                </button>
              </h5>
            </div>
            
            <div id="stig-update-files" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
              <div class="card-body">
                <p class="card-text">
                  <div class="container">
                    <form>
                      <div class="input-group mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text span-info" style="width: 100px;" id="basic-addon1">Source</span>
                        </div>
                        <div class="custom-file">
                          <input type="file" class="custom-file-input" id="fileSource">
                          <label class="custom-file-label" for="fileSource">Choose file</label>
                        </div>
                        
                      </div>
                      <div class="input-group mb-3">
                        <div class="input-group-prepend">
                          <span class="input-group-text span-info" style="width: 100px;" id="basic-addon1">Destination</span>
                        </div>
                        <div class="custom-file">
                          <input type="file" class="custom-file-input" id="fileDestination">
                          <label class="custom-file-label" for="fileDestination">Choose file</label>
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

                    <button type="button" class="btn btn-primary float-right" id="stig-updateStig-execute-btn">Execute</button>	
                    <br />
                  </div>
                </p>
              </div>
            </div>
          </div>
        
          <div class="card">
            <div class="card-header" id="headingTwo">
              <h5 class="mb-0">
                <button class="btn btn-link" data-toggle="collapse" data-target="#stig-update-results" aria-expanded="true" aria-controls="stig-update-results">
                  Results
                </button>
              </h5>
            </div>

            <div id="stig-update-results" class="collapse" aria-labelledby="headingTwo" data-parent="#accordion">
              <br />
              <div class="alert alert-info col-10" style="margin-left:auto; margin-right:auto;" id="stig-updates-results-file"></div>

              <table class="table table-striped table-sm table-small-text"  id="stigUpdatesResultsTable">
                <thead>
                  <tr>
                    <th>Group</th>
                    <th>Vulnerability</th>
                    <th>Rule</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>

            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
  
  <script>
    $("#fileSource, #fileDestination").on("change",function(){
      $('label[for="'+$(this).attr('id')+'"]').text( csts.plugins.path.basename( $(this).val() ) );
      if($('#fileSource').val().trim() != '' && $('#fileDestination').val().trim() != ''){
        csts.controllers['STIG'].updateStig.parseFiles();
      }
    });

    $('button#stig-updateStig-execute-btn').on('click',function(){
      csts.controllers.STIG.updateStig.execute();
    });
  </script>