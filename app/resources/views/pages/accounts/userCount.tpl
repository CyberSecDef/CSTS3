<div class="container-fluid" data-name="Compare">
  <div class="row">
    <main class="col-sm-12 ml-sm-auto col-md-12 pt-3" role="main">
      <h1>Overview</h1>
      <div>
          <div class="alert alert-secondary border-secondary" role="alert">
            <p>
              This script displays user accounts from Active Directory based on multiple criteria.
            </p>
          
            <p>
              This script can be used for reporting purposes to determine how many
              users are present in selected OU's, and what their account properties are.  
              The script can check to see if the accounts are disabled, locked, expired, CAC Enforced,
              etc.  This information can be disseminated as needed to management personel. 
            </p>
          </div>
      </div>
      
      <div id="accordion">
      
        <div class="card">
          <div class="card-header" id="headingOne">
            <h5 class="mb-0">
              <button class="btn btn-link" data-toggle="collapse" data-target="#accounts-userCount-execute" aria-expanded="true" aria-controls="accounts-userCount-execute">
                Report Execution
              </button>
            </h5>
          </div>
          
          <div id="accounts-userCount-execute" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
            <div class="card-body">
              <p class="card-text">
                <div class="container">
                  <div class="row">
                    <div class="col-10">
                        Please select the applicable OU's from the list on the right hand side of the application.
                    </div>
                    <div class="col-2">
                        <button type="button" class="btn btn-primary float-right" id="accounts-userCount-execute-btn">Execute</button>	  
                    </div>
                  </div>
                </div>
              </p>
            </div>
          </div>
        </div>
      
        <div class="card">
          <div class="card-header" id="headingTwo">
            <h5 class="mb-0">
              <button class="btn btn-link" data-toggle="collapse" data-target="#accounts-userCount-results" aria-expanded="true" aria-controls="accounts-userCount-results">
                Results
              </button>
            </h5>
          </div>

          <div id="accounts-userCount-results" class="collapse" aria-labelledby="headingTwo" data-parent="#accordion">
            <br />
            
            <table class="table table-striped table-sm table-small-text"  id="accounts-userCount-results-tbl">
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
  $('button#accounts-userCount-execute-btn').on('click',function(){
    csts.controllers.Accounts.userCount.execute();
  });
</script>