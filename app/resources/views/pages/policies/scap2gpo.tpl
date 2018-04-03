<div class="errors alert alert-danger collapse" id="errors"></div>
<div class="container-fluid" data-name="Compare">
  <div class="row">
    <main class="col-sm-12 ml-sm-auto col-md-12 pt-3" role="main">
      <h1>Overview</h1>
      <div>
        <div class="alert alert-secondary border-secondary" role="alert">
          <p>
            This is a script will parse a SCAP Benchmark (XCCDF and OVAL Files) and will generated GPO Templates (ADM, ADMX, ADML)
          </p>
          <p>
            This module can be used for compliance policy purposes to generate Adminisrtative Templates that will speed up the policy implementation process.
          </p>
        </div>
      </div>

      <div id="accordion">
        <div class="card">
          <div class="card-header" id="headingOne">
            <h5 class="mb-0">
              <button class="btn btn-link" data-toggle="collapse" data-target="#policies-scap2gpo-execute" aria-expanded="true" aria-controls="policies-scap2gpo-execute">
                Template Generation
              </button>
            </h5>
          </div>

          <div id="policies-scap2gpo-execute" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
            <div class="card-body">
              <p class="card-text">
                <div class="container">
                  <form>
                    <div class="input-group mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text span-info" style="width: 100px;" id="basic-addon1">XCCDF File</span>
                      </div>
                      <div class="custom-file">
                        <input type="file" class="custom-file-input" id="xccdf-source">
                        <label class="custom-file-label" for="xccdf-source">Choose file</label>
                      </div>
                    </div>
                    <div class="input-group mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text span-info" style="width: 100px;" id="basic-addon2">OVAL File</span>
                      </div>
                      <div class="custom-file">
                        <input type="file" class="custom-file-input" id="oval-source">
                        <label class="custom-file-label" for="oval-source">Choose file</label>
                      </div>										
                    </div>
                  </form>
                  <button type="button" class="btn btn-primary float-right" id="policies-scap2gpo-execute-btn">Execute</button>
                  <br />
                </div>
              </p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header" id="headingTwo">
            <h5 class="mb-0">
              <button class="btn btn-link" data-toggle="collapse" data-target="#policies-scap2gpo-results" aria-expanded="true" aria-controls="policies-scap2gpo-results">
                Results
              </button>
            </h5>
          </div>

          <div id="policies-scap2gpo-results" class="collapse " aria-labelledby="headingTwo" data-parent="#accordion">
            <br />
            <div style="display:block;">
              <div class="row">
                <div class="col-10" id="results">

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>

<script>
  $(document).ready(() => {
    $("#oval-source, #xccdf-source").on("change",function(){
      $('label[for="'+$(this).attr('id')+'"]').text( csts.plugins.path.basename( $(this).val() ) );
    });
  });

  $('button#policies-scap2gpo-execute-btn').on('click', function () {

    csts.controllers.Policies.scap2gpo.execute();
  });
</script>
