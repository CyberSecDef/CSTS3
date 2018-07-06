<div class="errors alert alert-danger collapse" id="errors"></div>
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
          <p class="alert alert-warning">Click on the Account Type in the summary results to see a detailed user list</p>
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
                        Please select the applicable OU's from the list on the right hand side of the application, then click on the 'Execute' button.
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

          <div id="accounts-userCount-results" class="collapse " aria-labelledby="headingTwo" data-parent="#accordion">
            <br />
            
            <form class="form-inline float-right">
              <div class="form-group mb-2">
                <div class="btn-group" role="group">
                  <button class="btn btn-outline-primary exportDOC" type="button" data-table="accounts-userCount-results-tbl" data-name="userCountSummary.doc">
                    <i class="fas fa-file-word"></i>
                  </button>
                  <button class="btn btn-outline-danger exportPDF" type="button" data-table="accounts-userCount-results-tbl"  data-name="userCountSummary.pdf">
                    <i class="fas fa-file-pdf"></i>
                  </button>
                  <button class="btn btn-outline-success exportCSV" type="button" data-table="accounts-userCount-results-tbl"  data-name="userCountSummary.csv">
                    <i class="fas fa-file-excel"></i>
                  </button>
                </div>
              </div>
            </form>

            <table class="center-this table table-striped table-sm table-small-text table-bordered"  id="accounts-userCount-results-tbl">
              <thead>
                <tr>
                  <th>Account Types</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>

            <form class="form-inline float-right">
              <div class="form-group mb-2">
                <div class="btn-group" role="group">
                  <button class="btn btn-outline-primary exportDOC" type="button" data-table="accounts-usercount-detailed-results-table"  data-name="userCountDetails.doc">
                    <i class="fas fa-file-word"></i>
                  </button>
                  <button class="btn btn-outline-danger exportPDF" type="button" data-table="accounts-usercount-detailed-results-table" data-name="userCountDetails.pdf">
                    <i class="fas fa-file-pdf"></i>
                  </button>
                  <button class="btn btn-outline-success exportCSV" type="button" data-table="accounts-usercount-detailed-results-table" data-name="userCountDetails.csv">
                    <i class="fas fa-file-excel"></i>
                  </button>
                </div>
              </div>
            </form>
            <table class="table table-striped table-sm table-small-text"  id="accounts-usercount-detailed-results-table">
              <thead>
                <tr>
                  <th class="w-50">Path</th>
                  <th>Username</th>
                  <th>Description</th>
                  <th>Disabled</th>
                  <th>Smartcard</th>
                  
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

  $('div#accounts-userCount-results form button.exportDOC').on('click',function(){
    table = $(this).data('table');
    $results = $('<table></table>').append( $( `#${table}` ).clone() );
    $results.css('width', '100%');
    $results.find('*').removeClass();
    $results.find('*').css('background-color', '#fff').css('color', '#000').css('font-size', '12pt');
    $results.find('td, th').css('text-align', 'left').css('border-collapse', 'collapse').css('border', '1px solid #000')
		csts.libs.export.saveDOC($results.html(), $(this).data('name'))
  });
  
  $('div#accounts-userCount-results form button.exportCSV').on('click',function(){
    data = {};
		data.columns = $("th",$("table#" + $(this).data('table') + " thead")).map(function() {  return (this.innerText || this.textContent) }).get();
    data.rows = [];
		$.each( $("table#" + $(this).data('table') + " tbody tr"), function(d,el){
			data.rows.push( $(el).find('td, th').map(function() {  return (this.innerText || this.textContent) }).get() )
		})
		csts.libs.export.saveCSV(data, $(this).data('name'))
  });


  $('div#accounts-userCount-results form button.exportPDF').on('click',function(){
    data = {};
    data.styles = {
			columnStyles : { },
			styles : { overflow: 'linebreak', fontSize: 8, lineWidth: 1},
    };
    data.columns = $("th",$("table#" + $(this).data('table') + " thead")).map(function() {  return (this.innerText || this.textContent) }).get();
    for(let i = 0; i < data.columns.length; i = i +=1){
      data.styles.columnStyles[i] = {columnWidth: (720/data.columns.length)}
    }

    data.rows = [];
    $.each( $("table#" + $(this).data('table') + " tbody tr"), function(d,el){
			data.rows.push( $(el).find('td, th').map(function() {  return (this.innerText || this.textContent) }).get() )
    })
		csts.libs.export.savePDF(data, $(this).data('name'))
  });
	
</script>