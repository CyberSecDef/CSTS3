<div class="errors alert alert-danger collapse" id="errors"></div>
<div class="container-fluid" data-name="Compare">
  <div class="row">
    <main class="col-sm-12 ml-sm-auto col-md-12 pt-3" role="main">
      <h1>Overview</h1>
      <div>
        <div class="alert alert-secondary border-secondary" role="alert">
          <p>
            This module allows you to manage the local users on selected systems.
          </p>

          <p>
            This module can be used for reporting purposes to show how many users are present on selected computers, and what their account properties are. The module can check to see if the accounts are disabled, locked, expired, etc. This information can be disseminated as needed to management personel.
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
              <button class="btn btn-link" data-toggle="collapse" data-target="#accounts-manageLocalUsers-execute" aria-expanded="true" aria-controls="accounts-manageLocalUsers-execute">
                Report Execution
              </button>
            </h5>
          </div>

          <div id="accounts-manageLocalUsers-execute" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
            <div class="card-body">
              <p class="card-text">
                <div class="container">
                  <div class="row">
                    <div class="col-10">
                      Please select the applicable systems by checking the OU's from the list on the right hand side of the application and manually entering hostnames in the hostname field on the right, then click on the 'Execute' button.
                    </div>
                    <div class="col-2">
                      <button type="button" class="btn btn-primary float-right" id="accounts-manageLocalUsers-execute-btn">Execute</button>
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
              <button class="btn btn-link" data-toggle="collapse" data-target="#accounts-manageLocalUsers-results" aria-expanded="true" aria-controls="accounts-manageLocalUsers-results">
                Results
              </button>
            </h5>
          </div>

          <div id="accounts-manageLocalUsers-results" class="collapse " aria-labelledby="headingTwo" data-parent="#accordion">
            <br />
            <div style="display:block;">
              <div class="row">
                <div class="col-10">
                  <form class="" style="margin-left:20px;" name="acctUpdateForm">
                    <div class="input-group mb-3" role="group">
                      <label class="input-group-text input-group-prepend" >Password:</label>
                      <input type="text" class="form-control input-group-prepend" style="border-bottom:2px solid #c33;border-top:2px solid #c33;" placeholder="New Password" name="newPassword">
                      

                      <select class="custom-select input-group-prepend" name="passRequired">
                                <option value="0" selected="selected">Required?</option>
                                <option value="1">Required</option>
                                <option value="2">Not Required</option>
                              </select>

                      
                    </div>
                    <div class="input-group mb-3">
                      <label class="input-group-text input-group-prepend">Account:</label>
                      <select class="custom-select" name="acctDisabled">
                                  <option value="0" selected="selected">Disabled?</option>
                                  <option value="1">Enable</option>
                                  <option value="2">Disable</option>
                                </select>

                      <select class="custom-select" name="acctLocked">
                                  <option value="0" selected="selected">Locked out?</option>
                                  <option value="1">Unlock</option>
                                </select>

                      <button class="btn btn-primary" name="acctUpdate" type="button" data-table="accounts-manageLocalUsers-results-tbl">Update</button>
                    </div>
                  </form>

                </div>
                <div class="col-2" style="text-align:right;">
                  <form class="" style="margin-right:20px;">
                    <div class="form-group mb-2">
                      <div class="btn-group" role="group">
                        <button class="btn btn-outline-primary exportDOC" type="button" data-table="accounts-manageLocalUsers-results-tbl" data-name="manageLocalUsersSummary.doc">
                              <i class="fas fa-file-word"></i>
                            </button>
                        <button class="btn btn-outline-danger exportPDF" type="button" data-table="accounts-manageLocalUsers-results-tbl" data-name="manageLocalUsersSummary.pdf">
                              <i class="fas fa-file-pdf"></i>
                            </button>
                        <button class="btn btn-outline-success exportCSV" type="button" data-table="accounts-manageLocalUsers-results-tbl" data-name="manageLocalUsersSummary.csv">
                              <i class="fas fa-file-excel"></i>
                            </button>
                      </div>
                    </div>
                  </form>

                </div>
              </div>

            </div>

            <table class="center-this table table-sm table-striped table-small-text table-hover" id="accounts-manageLocalUsers-results-tbl" style="font-size:.6em !important; font-weight:normal !important; text-align:center;">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Host</th>
                  <th>User</th>
                  <th>Desc</th>
                  <th>Status</th>
                  <th>Locked</th>
                  <th>Disabled</th>
                  <th>Pwd Req</th>
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
  $(document)
    .ready(function () {
      $('table#accounts-manageLocalUsers-results-tbl tbody tr')
        .on('click', () => {
          $(this)
            .toggleClass('active');
          $(this)
            .toggleClass('table-info');
        });
    });

  $('button#accounts-manageLocalUsers-execute-btn')
    .on('click', function () {
      csts.controllers.Accounts.manageLocalUsers.execute();

      setTimeout(() => {
        $('#accounts-manageLocalUsers-results-tbl')
          .tablesorter();
        $("table#accounts-manageLocalUsers-results-tbl")
          .trigger("update");
        var sorting = [
          [1, 0]
        ];
        $("table#accounts-manageLocalUsers-results-tbl")
          .trigger("sorton", [sorting]);
      }, 10000);
    });

  $("button[name='acctUpdate']").on('click', () => {
    const payload = {
      newPassword: $("input[name='newPassword']").val(),
      passRequired: $("select[name='passRequired']").val(),
      acctDisabled: $("select[name='acctDisabled']").val(),
      acctLocked: $("select[name='acctLocked']").val(),
    }
    $.each(
      $('table#accounts-manageLocalUsers-results-tbl').find('input:checked'), (i, c) => {
        csts.controllers.Accounts.manageLocalUsers.manageAccount(
          atob($(c).val()),
          payload,
        );
      });
    setTimeout(() => {$('button#accounts-manageLocalUsers-execute-btn').click();}, 10000)

  });





  $('div#accounts-manageLocalUsers-results form button.enableAccount')
    .on('click', function () {
      $.each($('table#' + $(this)
          .data('table'))
        .find('input:checked'), (i, c) => {
          csts.controllers.Accounts.manageLocalUsers.manageAccount(
            atob($(c)
              .val()),
            csts.controllers.Accounts.manageLocalUsers.ActionEnum.ENABLE,
          );
        })
    });

  $('div#accounts-manageLocalUsers-results form button.disableAccount')
    .on('click', function () {
      $.each($('table#' + $(this)
          .data('table'))
        .find('input:checked'), (i, c) => {
          csts.controllers.Accounts.manageLocalUsers.manageAccount(
            atob($(c)
              .val()),
            csts.controllers.Accounts.manageLocalUsers.ActionEnum.DISABLE,
          );
        })
    });

  $('div#accounts-manageLocalUsers-results form button.exportDOC')
    .on('click', function () {
      $results = $('<table></table>')
      $row = $('<tr></tr>');
      $.each($("table#" + $(this)
          .data('table') + " thead tr th")
        .not('th:first'),
        function (d, el) {
          $row.append($('<th></th>')
            .text($(el)
              .text()));
        });
      $results.append($row);
      $.each($("table#" + $(this)
        .data('table') + " tbody tr"), function (d, el) {
        $row = $('<tr></tr>');
        $.each($(el)
          .find('td')
          .not('td:first'), (dd, e) => {
            $row.append($('<td></td>')
              .text($(e)
                .text()));
          })
        $results.append($row);
      })
      $results.css('width', '100%');
      $results.find('*')
        .removeClass();
      $results.find('*')
        .css('background-color', '#fff')
        .css('color', '#000')
        .css('font-size', '12pt');
      $results.find('td, th')
        .css('text-align', 'left')
        .css('border-collapse', 'collapse')
        .css('border', '1px solid #000')
      csts.libs.export.saveDOC($results.wrap('<table>')
        .parent()
        .html(), $(this)
        .data('name'))
    });

  $('div#accounts-manageLocalUsers-results form button.exportCSV')
    .on('click', function () {
      data = {};
      data.columns = $("th", $("table#" + $(this)
          .data('table') + " thead"))
        .not('th:first')
        .map(function () {
          return (this.innerText || this.textContent)
        })
        .get();
      data.rows = [];
      $.each($("table#" + $(this)
        .data('table') + " tbody tr"), function (d, el) {
        const row = [];
        $.each($(el)
          .find('td')
          .not('td:first'), (dd, e) => {
            row.push($(e)
              .text());
          })
        data.rows.push(row)
      })
      csts.libs.export.saveCSV(data, $(this)
        .data('name'))
    });


  $('div#accounts-manageLocalUsers-results form button.exportPDF')
    .on('click', function () {
      data = {};
      data.styles = {
        columnStyles: {},
        styles: {
          overflow: 'linebreak',
          fontSize: 8,
          lineWidth: 1
        },
      };
      data.columns = $("th", $("table#" + $(this)
          .data('table') + " thead"))
        .not('th:first')
        .map(function () {
          return (this.innerText || this.textContent)
        })
        .get();
      for (let i = 0; i < data.columns.length; i = i += 1) {
        data.styles.columnStyles[i] = {
          columnWidth: (720 / data.columns.length)
        }
      }
      data.rows = [];
      $.each($("table#" + $(this)
        .data('table') + " tbody tr"), function (d, el) {
        const row = [];
        $.each($(el)
          .find('td')
          .not('td:first'), (dd, e) => {
            row.push($(e)
              .text());
          })
        data.rows.push(row)
      })
      csts.libs.export.savePDF(data, $(this)
        .data('name'))
    });

</script>
