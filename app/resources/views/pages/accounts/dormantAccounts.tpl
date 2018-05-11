<div class="errors alert alert-danger collapse" id="errors"></div>
<div class="container-fluid" data-name="Compare">
  <div class="row">
    <main class="col-sm-12 ml-sm-auto col-md-12 pt-3" role="main">
      <h1>Overview</h1>
      <div>
          <div class="alert alert-secondary border-secondary" role="alert">
            <p>
              This module will search for and display accounts that have not been logged in for a selected number of days.  
            </p>
          
            <p>
              This module will is able to search both active directory OU's and local
              systems for accounts that have not been used in a selectable period of 
              time.  This information can be disseminated as needed to management personel. 
            </p>

          </div>
      </div>
      
      <div id="accordion">
      
        <div class="card">
          <div class="card-header" id="headingOne">
            <h5 class="mb-0">
              <button class="btn btn-link" data-toggle="collapse" data-target="#accounts-dormantAccounts-execute" aria-expanded="true" aria-controls="accounts-dormantAccounts-execute">
                Report Execution
              </button>
            </h5>
          </div>
          
          <div id="accounts-dormantAccounts-execute" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
            <div class="card-body">
              <p class="card-text">
                <div class="container">
                  <div class="row">
                    <div class="col-8">
                      To execute, please:<br />
                      <li>Select the applicable OU's from the list on the right</li>
                      <li>Select a valid age filter</li>
                      <li>Shen click on the 'Execute' button</li>
                    </div>
                    <div class="col-4">
                      <div class="input-group">
                        <div class="input-group-append">
                            <input type="text" class="form-control" placeholder="Age :" readonly="readonly" style="width:75px;">
                          </div>
                        <div class="input-group-prepend">
                          <div id="dormant-age-minus" class="input-group-text"><i class="fas fa-minus"></i></div>
                        </div>
                        
                        
                        <input type="text" class="form-control" id="dormant-age-txt" value="30" style="width:100px;text-align:center;">
                        
                        
                        <div class="input-group-append">
                          <div id="dormant-age-plus" class="input-group-text"><i class="fas fa-plus"></i></div>
                        </div>

                      </div>

                      <div class="input-group-append">
                          <button type="button" class="btn btn-primary " id="accounts-dormantAccounts-execute-btn" style="width:300px;">Execute</button>	  
                      </div>
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
              <button class="btn btn-link" data-toggle="collapse" data-target="#accounts-dormantAccounts-results" aria-expanded="true" aria-controls="accounts-dormantAccounts-results">
                Results
              </button>
            </h5>
          </div>

          <div id="accounts-dormantAccounts-results" class="collapse " aria-labelledby="headingTwo" data-parent="#accordion">
            <br />
 
            <form class="form-inline float-right">
              <div class="form-group mb-2">
                <div class="btn-group" role="group">
                  <button class="btn btn-outline-primary exportDOC" type="button" data-table="accounts-dormantAccounts-detailed-results-table"  data-name="dormantAccountsDetails.doc">
                    <i class="fas fa-file-word"></i>
                  </button>
                  <button class="btn btn-outline-danger exportPDF" type="button" data-table="accounts-dormantAccounts-detailed-results-table" data-name="dormantAccountsDetails.pdf">
                    <i class="fas fa-file-pdf"></i>
                  </button>
                  <button class="btn btn-outline-success exportCSV" type="button" data-table="accounts-dormantAccounts-detailed-results-table" data-name="dormantAccountsDetails.csv">
                    <i class="fas fa-file-excel"></i>
                  </button>
                </div>
              </div>
            </form>
            <table class="table table-striped table-sm table-small-text"  id="accounts-dormantAccounts-detailed-results-table">
              <thead>
                <tr>
                    <th>Host</th>
                    <th>Account Type</th>
                    <th>Display Name</th>
                    <th>Username</th>
                    <th>Last Logon</th>
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
  $(document).ready(() => {
    const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

    const comparer = (idx, asc) => (a, b) => ((v1, v2) => 
        v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
        )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));

    $('table#accounts-dormantAccounts-detailed-results-table thead th').on('click', (e) => {
        Array.from($('table#accounts-dormantAccounts-detailed-results-table tbody').find('tr:nth-child(n+1)'))
            .sort(comparer(Array.from(e.target.parentNode.children).indexOf(e.target), this.asc = !this.asc))
            .forEach(tr => $('table#accounts-dormantAccounts-detailed-results-table tbody').append(tr) );
    });
  });

  $('div#dormant-age-plus').on('click',function(){
    $('#dormant-age-txt').val( parseInt( $('#dormant-age-txt').val().replace(/[^0-9]+/,'') ) + 1 || 0 );
  });

  $('div#dormant-age-minus').on('click',function(){
    $('#dormant-age-txt').val( parseInt( $('#dormant-age-txt').val().replace(/[^0-9]+/,'') ) - 1 || 0 );
  });

  $('button#accounts-dormantAccounts-execute-btn').on('click',function(){
    csts.controllers.Accounts.dormantAccounts.execute();
  });

  $('div#accounts-dormantAccounts-results form button.exportDOC').on('click',function(){
    table = $(this).data('table');
    $results = $('<table></table>').append( $( `#${table}` ).clone() );
    $results.css('width', '100%');
    $results.find('*').removeClass();
    $results.find('*').css('background-color', '#fff').css('color', '#000').css('font-size', '12pt');
    $results.find('td, th').css('text-align', 'left').css('border-collapse', 'collapse').css('border', '1px solid #000')
		csts.libs.export.saveDOC($results.html(), $(this).data('name'))
  });
  
  $('div#accounts-dormantAccounts-results form button.exportCSV').on('click',function(){
    data = {};
		data.columns = $("th",$("table#" + $(this).data('table') + " thead")).map(function() {  return (this.innerText || this.textContent) }).get();
    data.rows = [];
		$.each( $("table#" + $(this).data('table') + " tbody tr"), function(d,el){
			data.rows.push( $(el).find('td, th').map(function() {  return (this.innerText || this.textContent) }).get() )
		})
		csts.libs.export.saveCSV(data, $(this).data('name'))
  });


  $('div#accounts-dormantAccounts-results form button.exportPDF').on('click',function(){
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