<div class="errors alert alert-danger collapse" id="errors"></div>
<div class="container-fluid" data-name="Compare">
    <div class="row">
      <main class="col-sm-12 ml-sm-auto col-md-12 pt-3" role="main">
        <h1>Overview</h1>
        <div>
            <div class="alert alert-secondary border-secondary" role="alert">
              <p>
                This script will convert a STIG, SCAP or CKL to and from an Excel file, which makes it much easier to update on the mass scale.
              </p>
            
              <p>
                This Script is designed to make updating a STIG
                faster and easier.  It will move the asset data and all comments,
                finding details, status, severity override and justifications back and forth between the
                source file and a CSV file.  The Script assumes that the vulnerability ids
                are consistent from file to file.  
              </p>
            </div>
        </div>
        
        <div id="accordion">
        
          <div class="card">
            <div class="card-header" id="headingOne">
              <h5 class="mb-0">
                <button class="btn btn-link" data-toggle="collapse" data-target="#stig-convert-files" aria-expanded="true" aria-controls="stig-convert-files">
                  File Selection Form
                </button>
              </h5>
            </div>
            
            <div id="stig-convert-files" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
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
                    </form>
                    <table class="table table-striped table-sm table-small-text"  id="tabSelFileInfo">
                      <thead>
                        <tr>
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

                    <button type="button" class="btn btn-primary float-right" id="stig-convertStig-execute-btn">Execute</button>	
                    <br />
                  </div>
                </p>
              </div>
            </div>
          </div>
        
          <div class="card">
            <div class="card-header" id="headingTwo">
              <h5 class="mb-0">
                <button class="btn btn-link" data-toggle="collapse" data-target="#stig-convert-results" aria-expanded="true" aria-controls="stig-convert-results">
                  Results
                </button>
              </h5>
            </div>

            <div id="stig-convert-results" class="collapse" aria-labelledby="headingTwo" data-parent="#accordion">

            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
  
  <script>
    $("#fileSource").on("change",function(){
      $('label[for="'+$(this).attr('id')+'"]').text( csts.plugins.path.basename( $(this).val() ) );
      if($('#fileSource').val().trim() != ''){
        csts.controllers.STIG.stigXxls.parseFiles();
      }
    });

    $('button#stig-convertStig-execute-btn').on('click',function(){
      csts.controllers.STIG.stigXxls.execute();
    });
  </script>