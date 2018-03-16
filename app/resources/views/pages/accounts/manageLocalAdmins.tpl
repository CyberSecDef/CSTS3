<div class="container-fluid" data-name="Compare">
  <div class="row">
    <main class="col-sm-12 ml-sm-auto col-md-12 pt-3" role="main">
      <h1>Overview</h1>
      <div>
          <div class="alert alert-secondary border-secondary" role="alert">
            <p>
              This module allows you to manage the local administrators on selected systems.
            </p>
          
            <p>
              This module can be used for reporting purposes to show how many
              administrators are present on selected computers, and what their account properties are.  
              The module can check to see if the accounts are disabled, locked, expired, etc.  This 
              information can be disseminated as needed to management personel. 
            </p>

            <p>
              This module also will allow you to update various attributes as needed.
            </p>

          </div>
          
      </div>
      
      <div id="accordion">
      
        <div class="card">
          <div class="card-header" id="headingOne">
            <h5 class="mb-0">
              <button class="btn btn-link" data-toggle="collapse" data-target="#accounts-manageLocalAdmins-execute" aria-expanded="true" aria-controls="accounts-manageLocalAdmins-execute">
                Report Execution
              </button>
            </h5>
          </div>
          
          <div id="accounts-manageLocalAdmins-execute" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
            <div class="card-body">
              <p class="card-text">
                <div class="container">
                  <div class="row">
                    <div class="col-10">
                        Please select the applicable systems by checking the OU's from the list on the right hand side of the application and manually entering hostnames in the hostname field on the right, then click on the 'Execute' button.
                    </div>
                    <div class="col-2">
                        <button type="button" class="btn btn-primary float-right" id="accounts-manageLocalAdmins-execute-btn">Execute</button>	  
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
              <button class="btn btn-link" data-toggle="collapse" data-target="#accounts-manageLocalAdmins-results" aria-expanded="true" aria-controls="accounts-manageLocalAdmins-results">
                Results
              </button>
            </h5>
          </div>

          <div id="accounts-manageLocalAdmins-results" class="collapse " aria-labelledby="headingTwo" data-parent="#accordion">
            <br />
            <div style="display:block;margin-bottom:60px;">
              <form class="form-inline float-right">
                <div class="form-group mb-2">
                  <div class="btn-group" role="group">
                    <button class="btn btn-outline-primary exportDOC" type="button" data-table="accounts-manageLocalAdmins-results-tbl" data-name="manageLocalAdminsSummary.doc">
                      <i class="fas fa-file-word"></i>
                    </button>
                    <button class="btn btn-outline-danger exportPDF" type="button" data-table="accounts-manageLocalAdmins-results-tbl"  data-name="manageLocalAdminsSummary.pdf">
                      <i class="fas fa-file-pdf"></i>
                    </button>
                    <button class="btn btn-outline-success exportCSV" type="button" data-table="accounts-manageLocalAdmins-results-tbl"  data-name="manageLocalAdminsSummary.csv">
                      <i class="fas fa-file-excel"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            <table class="center-this table table-sm table-striped table-small-text table-hover"  id="accounts-manageLocalAdmins-results-tbl" style="font-size:.6em !important; font-weight:normal !important; text-align:center;">
              <thead>
                <tr>
                  <th>Host</th>
                  <th>User</th>
                  <th>Desc</th>
                  <th>Status</th>

                  <th>Locked</th>
                  <th>Disabled</th>

                  <th>Pwd Changeable</th>
                  <th>Pwd Req</th>
                  <th>Pwd Expires</th>
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
  $(document).ready(function() {
    $('table#accounts-manageLocalAdmins-results-tbl').DataTable();
  });

  $('button#accounts-manageLocalAdmins-execute-btn').on('click',function(){
    csts.controllers.Accounts.manageLocalAdmins.execute();
  });

  $('div#accounts-manageLocalAdmins-results form button.exportDOC').on('click',function(){
    $results = $('<table></table>')
    $row = $('<tr></tr>');
    $.each( $("table#accounts-manageLocalAdmins-results-tbl thead tr th") , function(d,el){
      $row.append($('<th></th>').text( $(el).text() ));
    });
    $results.append($row);
    $.each( $("table#" + $(this).data('table')).DataTable().rows().data() , function(d,el){
      $row =  $('<tr></tr>');
      $.each(el, (dd, e) => {
        $row.append($('<td></td>').text(e));
      })
      $results.append($row);
		})
    $results.css('width', '100%');
    $results.find('*').removeClass();
    $results.find('*').css('background-color', '#fff').css('color', '#000').css('font-size', '12pt');
    $results.find('td, th').css('text-align', 'left').css('border-collapse', 'collapse').css('border', '1px solid #000')
		csts.libs.export.saveDOC($results.wrap('<table>').parent().html(), $(this).data('name'))
  });
  
  $('div#accounts-manageLocalAdmins-results form button.exportCSV').on('click',function(){
    data = {};
		data.columns = $("th",$("table#" + $(this).data('table') + " thead")).map(function() {  return (this.innerText || this.textContent) }).get();
    data.rows = [];

		$.each( $("table#" + $(this).data('table')).DataTable().rows().data() , function(d,el){
			data.rows.push( el )
		})
		csts.libs.export.saveCSV(data, $(this).data('name'))
  });


  $('div#accounts-manageLocalAdmins-results form button.exportPDF').on('click',function(){
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
    $.each($("table#" + $(this).data('table')).DataTable().rows().data(), (i,r) => { data.rows.push(r);});
		csts.libs.export.savePDF(data, $(this).data('name'))
  });
	
</script>