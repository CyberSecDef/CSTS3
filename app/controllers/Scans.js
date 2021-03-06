/*
  Namespace: Controllers.Scans

  Description:
    This is the baseline controller for Scan type functions

  License:
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

  Category:
    Controller

  Package:
    CSTSv3

  Author:
    Robert Weber <wwwdaze2000@gmail.com>

  Copyright:
    2018 - RFW
*/
csts.controllers.Scans = ({
  /*
    Variables: Class Variables
    controllerName - The name of the controller
    viewModels - Middleware VewModels for the scans controller.
    <scans2poam> - The Scans2Poam Applet
    <compareRarPoam> - The compareRarPoam Applet
  */
  controllerName: 'Scans',
  viewModels: {
    compareRarPoam: ko.observableArray()
      .extend({
        notify: 'always',
      }),
  },

  /*
      Class: Controllers.Scans.scans2poam
      This is the scans2poam applet

      See Also:
      <Models.Scans.scans2poam>
  */
  scans2poam: {
    /**
     * Variables: Applet Variables
     * scanFiles - the scan files that are being combined into the scans2poam report
     * name - The name of this module
     * default - the default method to call when this module is executed
    */
    scanFiles: [],
    name: 'Scans2Poam',
    default: 'showIndex',

    /*
      Method: showIndex

      Description:
        This is the function called from the router to load the scans2poam module
    */
    showIndex() {
      csts.plugins.ejs.renderFile(
        'app/resources/views/pages/scans/scans2poam.tpl', {}, {
          rmWhitespace: true,
        },
        (err, str) => {
          if (err) { 
            $('#errors').html(err).show();
            $('#main-center-col').animate({ scrollTop: ($('#errors').offset().top) }, 1000);
          }
          $('#main-center-col').html(str);
        },
      );
    },

    /*
      Method: execute

      Description:
        executes the scans2poam function
        This is magic to update the UI while in the processing loop.
        Verbose comments provided
    */
    execute() {
      const caller = this;
      const table = $('table#tabScanFiles').DataTable();
      const files = [];
      table.rows().every(rowIdx => files.push($(table.row(rowIdx).node()).attr('file-path')));

      $('#myModal').modal();
      $('#myModalLabel').text('Please Wait...');
      $('#myModalBody').html(`Currently Parsing the Scanfiles.  Please wait.
      <div class="progress" id="modalProgess">
        <div class="progress-bar progress-bar-striped" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div>
      </div>`);
      $('#myModal')
        .one('shown.bs.modal', () => {
          // this object is at the execute scope to track whether the process has completed
          // or not.  Used in the generator/iterator next functions
          let processing = {};

          // this is the generator that updates the ui and yields as needed
          function* fileGenerator() {
            const fileLength = files.length;
            for (let i = 0; i < fileLength; i += 1) {
              csts.models.Scans.scans2poam.parseFile(files[i]);

              $('div#modalProgess div.progress-bar')
                .attr('aria-valuenow', Math.round(100 * (i / fileLength)))
                .css('width', `${Math.round(100 * (i / fileLength))}%`)
                .text(`${Math.round(100 * (i / fileLength))}%`);
              $('#statusbar-text').html(`${i} / ${fileLength}: ${csts.plugins.path.basename(files[i])}`);
              yield;
            }
          }

          // create variable link for the generator function
          const myfuncGen = fileGenerator();

          // this named function handles looping the generator without locking up the browser
          function myfunction() {
            processing = myfuncGen.next(); // start it

            // if the iteration/generator is not done (all files are not processed), set a
            // timeout to call this function again
            if (processing.done === false) {
              setTimeout(myfunction, 250);
            } else {
              // if processing is done, do the 'rest' of the syncronous stuff.  This is what
              // gets executed AFTER everything is parsed.  This was originally at the bottom
              // of the Execute function

              // build the results object
              const results = {};
              const cols = {};

              results.Summary = csts.models.Scans.scans2poam.getSummary();
              cols.Summary = [
                { width: 10 }, { width: 20 }, { width: 50 }, { width: 65 }, { width: 10 },
                { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 },
                { width: 15 },
              ];

              results.Issues = csts.models.Scans.scans2poam.getIssues();
              cols.Issues = [
                { width: 75 }, { width: 25 }, { width: 50 }, { width: 25 }, { width: 15 },
                { width: 15 }, { width: 15 }, { width: 25 }, { width: 25 }, { width: 75 },
                { width: 50 }, { width: 50 },
              ];

              results['Test Plan'] = csts.models.Scans.scans2poam.getTestPlan();
              cols['Test Plan'] = [{ width: 65 }, { width: 10 }, { width: 40 }, { width: 40 }, { width: 35 }];

              results.RAR = csts.models.Scans.scans2poam.getRar();
              cols.RAR = [
                { width: 15 }, { width: 15 }, { width: 45 }, { width: 30 }, { width: 30 },
                { width: 45 }, { width: 20 }, { width: 15 }, { width: 30 }, { width: 30 },
                { width: 15 }, { width: 15 }, { width: 30 }, { width: 30 }, { width: 15 },
                { width: 15 }, { width: 15 }, { width: 15 }, { width: 30 }, { width: 30 },
                { width: 15 }, { width: 30 },
              ];

              results.POAM = csts.models.Scans.scans2poam.getPoam();
              cols.POAM = [
                { width: 1 }, { width: 40 }, { width: 15 }, { width: 25 }, { width: 25 },
                { width: 15 }, { width: 30 }, { width: 15 }, { width: 30 }, { width: 15 },
                { width: 30 }, { width: 30 }, { width: 30 }, { width: 20 }, { width: 40 },
              ];

              results.POAM55 = csts.models.Scans.scans2poam.getPoam55();
              cols.POAM55 = [
                { width: 1 }, { width: 40 }, { width: 15 }, { width: 25 }, { width: 25 },
                { width: 15 }, { width: 30 }, { width: 15 }, { width: 30 }, { width: 15 },
                { width: 30 }, { width: 30 }, { width: 30 }, { width: 20 }, { width: 40 },
                { width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 30 },
                { width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }
              ];


              results['Raw Results'] = csts.models.Scans.scans2poam.getRawData();
              cols['Raw Results'] = [
                { width: 15 }, { width: 40 }, { width: 40 }, { width: 15 }, { width: 10 }, // a-e
                { width: 10 }, { width: 10 }, { width: 15 }, { width: 20 }, { width: 10 }, // f-j
                { width: 15 }, { width: 15 }, { width: 20 }, { width: 20 }, { width: 40 }, // k-o
                { width: 10 }, { width: 15 }, { width: 30 }, { width: 30 }, { width: 30 }, // p-t
                { width: 15 }, { width: 20 }, { width: 20 }, { width: 30 }, // u-x
              ];

              // validate data
              // Make sure no cell data is over 32760 characters long
              Object.keys(results).forEach((item) => {
                results[item].forEach((entry) => {
                  Object.keys(entry).forEach((field) => {
                    if (typeof entry[field] !== 'undefined' && entry[field].length > 32760) {
                      entry[field] = entry[field].substr(0, 32760);
                    }
                  });
                });
              });

              // build excel file
              const filename = `./app/storage/results/${caller.name}_${csts.plugins.moment().format('YYYYMMDD_HHmmss')}.xlsx`;
              csts.wb = csts.plugins.xlsx.utils.book_new();

              // add all the results sheets
              Object.keys(results).forEach((k) => {
                const ws = csts.plugins.xlsx.utils.json_to_sheet(results[k]);
                ws['!cols'] = cols[k];
                ws['!autofilter'] = { ref: `A1:${String.fromCharCode(64 + cols[k].length)}1` };
                csts.plugins.xlsx.utils.book_append_sheet(csts.wb, ws, k);
              });

              // save the file
              csts.plugins.xlsx.writeFile(csts.wb, filename);

              // update the UI accordingly
              $('#scans2poamResults').html($('<a></a>').attr('href', filename.replace('./app/', './')).attr('target', '_blank').text(filename.replace('./app/', '/')));

              // show the results link
              $('#select-scan-results-card').click();

              // hide the modal
              $('#myModal').modal('hide');

              // log results and scans for debugging purposes
              console.log(csts.models.Scans.scans2poam.scans);
              console.log(results);
            }
          }

          // start it all off
          myfunction();
        });
    },

    /*
        Method: invokeFileScan

        Description:
          Grabs the files from the submitted path

        Parameters:
          {string} path - the path for the directory being scanned
    */
    invokeFileScan(path) {
      $('#myModal').modal();
      $('#myModalLabel').text('Please Wait...');
      $('#myModalBody').text('Currently Loading the Scanfiles.  Please wait.');
      $('#myModal')
        .one('shown.bs.modal', () => {
          this.scanFiles = csts.models.Scans.scans2poam.getScanFiles(path);

          // load into table
          $('#tabScanFiles tbody')
            .empty();
          const table = $('table#tabScanFiles')
            .DataTable({
              destroy: true,
              searching: true,
              paging: 25,
            });
          table.clear();
          let fileIndex = 0;
          this.scanFiles.forEach((file) => {
            fileIndex += 1;
            const stats = csts.plugins.fs.statSync(file);

            const rowNode = table.row.add($(`<tr>
            <td>${fileIndex}</td>
            <td>${csts.plugins.path.basename(file)}</td>
            <td>${csts.plugins.moment(stats.ctimeMs).format('MM/DD/YYYY HH:mm')}</td>
            <td>${csts.plugins.moment(stats.atimeMs).format('MM/DD/YYYY HH:mm')}</td>
            <td>${csts.plugins.moment(stats.mtimeMs).format('MM/DD/YYYY HH:mm')}</td>
            <td>${csts.plugins.numeral(stats.size).format('0.0 b')}</td>
            <td>${csts.plugins.path.extname(file)}</td>
            </tr>`))
              .draw(false)
              .node();
            $(rowNode)
              .attr('file-path', file);
          });
          table.rows()
            .invalidate()
            .draw();

          $('#select-scan-files-card')
            .click();
          $('#myModal')
            .modal('hide');
        });
    },
  },

  /*
      Class: Controllers.Scans.compareRarPoam
      Methods and variables related to the RAR/POAM comparison applet

      See Also:
      <Models.Scans.compareRarPoam>
  */
  compareRarPoam: {
    name: 'Scan Comparison',
    default: 'showIndex',
    /*
      Method: showIndex

      Description:
        This is the function called from the router to load the compareRAR/POAM functionality
    */
    showIndex() {
      csts.libs.ui.setStatus('Loading RAR/POAM Comparison functions.');

      csts.plugins.ejs.renderFile(
        'app/resources/views/pages/scans/compare.tpl', {
          fields: csts.models.Scans.compareRarPoam.fields,
        }, {
          rmWhitespace: true,
        },
        (err, str) => {
          if (err) { 
            $('#errors').html(err).show();
            $('#main-center-col').animate({ scrollTop: ($('#errors').offset().top) }, 1000);
          }
          $('#main-center-col')
            .html(str);
        },
      );
    },

    /*
      Method: executeComparison

      Description:
        This method executes the comparison between a RAR and a POAM by calling the appropriate
        method in the Scans model.

      Parameters:
        {object[]} fields - the fields that should be compared between the RAR and POAM

      Access:
        Public

      Returns:
        {void}

      See Also:
          <models.Scans.compareRarPoam.compareWorkbooks>
    */
    executeComparison(fields) {
      $('#myModal').modal();
      $('#myModalLabel').text('Please Wait...');
      $('#myModalBody').html('Currently Comparing the Workbooks.  Please wait.');
      $('#myModal')
        .one('shown.bs.modal', () => {
          $('#headingFour button').click();
          csts.models.Scans.compareRarPoam.compareWorkbooks(
            $('#rarTabSel').val(),
            $('#poamTabSel').val(),
            fields,
          );
          $('#myModal').modal('hide');
        });
    },

    /*
      Method: moveField

      Description:
        Handles moving data from the RAR to the POAM or vice versa

      Parameters:
        {DOM Element} el - The calling element
    */
    moveField(el) {
      const guid = $(el).parents('tr').data('guid');

      const fields = {
        guid,
        vulnId: $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(2)`).text(),
        type: $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(3)`).text(),
        mismatch: $(el).parents('tr').data('mismatch'),
        rarRow: $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(4)`).text(),
        rarVal: $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(5)`).text(),
        poamRow: $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(7)`).text(),
        poamVal: $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(8)`).text(),
      };

      switch ($(el)
        .data('action')) {
        case 'left':
          if (fields.mismatch !== 'POAM' && fields.mismatch !== 'RAR') {
            // workbook
            csts.models.Scans.workbooks.rar.val(
              $('#rarTabSel').val(),
              (csts.models.Scans.compareRarPoam.rarFields[fields.type]) + fields.rarRow,
              csts.models.Scans.workbooks.poam.val(
                $('#poamTabSel').val(),
                (csts.models.Scans.compareRarPoam.poamFields[fields.type]) + fields.poamRow,
              ),
            );

            // excel
            csts.plugins.xlsx.writeFile(
              csts.models.Scans.workbooks.rar,
              $('#fileRar').val().trim(), {
                bookSST: true,
                bookType: 'xlsx',
                compression: true,
              },
            );

            // viewmodel
            // eslint-disable-next-line
            const sel = ko.utils.arrayFilter(csts.controllers.Scans.viewModels.compareRarPoam(), (i) => {
              return i.guid === guid;
            })[0];
            sel.rarVal = sel.poamVal;

            // ui
            $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(5)`)
              .text(fields.poamVal);
          } else {
            const r = csts.models.Scans.workbooks.poam.val($('#poamTabSel')
              .val(), (csts.models.Scans.compareRarPoam.poamFields['Raw Risk']) + fields.poamRow);
            let i = '';
            let l = '';

            switch (r) {
              case 'I':
                i = 'High';
                l = 'High';
                break;
              case 'II':
                i = 'Medium';
                l = 'Medium';
                break;
              case 'III':
                i = 'Low';
                l = 'Low';
                break;
              case 'IV':
                i = 'None';
                l = 'Info';
                break;
              default:
            }

            // workbook
            csts.plugins.xlsx.utils.sheet_add_json(
              csts.models.Scans.workbooks.rar.Sheets[$('#rarTabSel').val()],
              [
                {
                  control: csts.models.Scans.workbooks.poam.val(
                    $('#poamTabSel').val(),
                    (csts.models.Scans.compareRarPoam.poamFields['Security Control']) + fields.poamRow,
                  ),
                  source: csts.models.Scans.workbooks.poam.val(
                    $('#poamTabSel').val(),
                    (csts.models.Scans.compareRarPoam.poamFields.Source) + fields.poamRow,
                  ).substring(
                    0,
                    csts.models.Scans.workbooks.poam.val(
                      $('#poamTabSel').val(),
                      (csts.models.Scans.compareRarPoam.poamFields.Source) + fields.poamRow,
                    ).indexOf('Group ID:'),
                  ),
                  threat: csts.models.Scans.workbooks.poam.val(
                    $('#poamTabSel').val(),
                    (csts.models.Scans.compareRarPoam.poamFields.Source) + fields.poamRow,
                  ).substring(csts.models.Scans.workbooks.poam.val(
                    $('#poamTabSel').val(),
                    (csts.models.Scans.compareRarPoam.poamFields.Source) + fields.poamRow,
                  ).indexOf('Group ID:')),
                  description: csts.models.Scans.workbooks.poam.val(
                    $('#poamTabSel').val(),
                    (csts.models.Scans.compareRarPoam.poamFields.Description) + fields.poamRow,
                  ),
                  risk: '',
                  rawrisk: r,
                  impact: i,
                  likelihood: l,
                  correction: '',
                  mitigation: csts.models.Scans.workbooks.poam.val(
                    $('#poamTabSel').val(),
                    (csts.models.Scans.compareRarPoam.poamFields.Mitigation) + fields.poamRow,
                  ),
                  remediation: csts.models.Scans.workbooks.poam.val(
                    $('#poamTabSel').val(),
                    (csts.models.Scans.compareRarPoam.poamFields.Mitigation) + fields.poamRow,
                  ),
                  residualrisk: csts.models.Scans.workbooks.poam.val(
                    $('#poamTabSel').val(),
                    (csts.models.Scans.compareRarPoam.poamFields['Residual Risk']) + fields.poamRow,
                  ),
                  status: csts.models.Scans.workbooks.poam.val(
                    $('#poamTabSel').val(),
                    (csts.models.Scans.compareRarPoam.poamFields.Status) + fields.poamRow,
                  ),
                  comment: csts.models.Scans.workbooks.poam.val(
                    $('#poamTabSel').val(),
                    (csts.models.Scans.compareRarPoam.poamFields.Comment) + fields.poamRow,
                  ),
                  devices: '',
                },
              ], {
                header: ['control', 'source', 'threat', 'description', 'risk', 'rawrisk', 'impact', 'likelihood', 'correction', 'mitigation', 'remediation', 'residualrisk', 'status', 'comment', 'devices'],
                origin: -1,
                skipHeader: true,
              },
            );

            // excel
            csts.plugins.xlsx.writeFile(
              csts.models.Scans.workbooks.rar,
              $('#fileRar').val().trim(), {
                bookSST: true,
                bookType: 'xlsx',
                compression: true,
              },
            );

            // viewmodel
            // eslint-disable-next-line
            const sel = ko.utils.arrayFilter(csts.controllers.Scans.viewModels.compareRarPoam(), (i) => {
              return i.guid === guid;
            })[0];
            sel.rarVal = 'COPIED';

            // ui
            $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(5)`)
              .text('COPIED');
          }
          break;
        case 'merge': {
          const text = [
            $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(8)`).text(),
            '\n',
            $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(5)`).text(),
          ].join().replace(/see rar[.]*/ig, '');

          csts.models.Scans.workbooks.rar.val(
            $('#rarTabSel').val(),
            (csts.models.Scans.compareRarPoam.rarFields[fields.type]) + fields.rarRow,
            text,
          );
          csts.models.Scans.workbooks.poam.val(
            $('#poamTabSel').val(),
            (csts.models.Scans.compareRarPoam.poamFields[fields.type]) + fields.poamRow,
            text,
          );

          csts.plugins.xlsx.writeFile(
            csts.models.Scans.workbooks.rar,
            $('#fileRar').val().trim(),
            {
              bookSST: true,
              bookType: 'xlsx',
              compression: true,
            },
          );
          csts.plugins.xlsx.writeFile(
            csts.models.Scans.workbooks.poam,
            $('#filePoam').val().trim(),
            {
              bookSST: true,
              bookType: 'xlsx',
              compression: true,
            },
          );

          const sel = ko.utils.arrayFilter(
            csts.controllers.Scans.viewModels.compareRarPoam(),
            i => i.guid === guid,
          )[0];
          sel.rarVal = text;
          sel.poamVal = text;

          $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(5)`).text(text);
          $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(8)`).text(text);
          break;
        }
        case 'right':
          if (fields.mismatch !== 'POAM' && fields.mismatch !== 'RAR') {
            csts.models.Scans.workbooks.poam.val(
              $('#poamTabSel').val(),
              (csts.models.Scans.compareRarPoam.poamFields[fields.type]) + fields.poamRow,
              csts.models.Scans.workbooks.rar.val(
                $('#rarTabSel').val(),
                (csts.models.Scans.compareRarPoam.rarFields[fields.type]) + fields.rarRow,
              ),
            );
            csts.plugins.xlsx.writeFile(
              csts.models.Scans.workbooks.poam,
              $('#filePoam').val().trim(),
              {
                bookSST: true,
                bookType: 'xlsx',
                compression: true,
              },
            );
            const sel = ko.utils.arrayFilter(
              csts.controllers.Scans.viewModels.compareRarPoam(),
              i => i.guid === guid,
            )[0];
            sel.poamVal = sel.rar;
            $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(8)`)
              .text(fields.rarVal);
          } else {
            const r = csts.models.Scans.workbooks.rar.val($('#rarTabSel')
              .val(), (csts.models.Scans.compareRarPoam.rarFields['Raw Risk']) + fields.rarRow);

            csts.plugins.xlsx.utils.sheet_add_json(csts.models.Scans.workbooks.rar.Sheets.RAR, [{
              blank: '',
              description: csts.models.Scans.workbooks.rar.val($('#rarTabSel')
                .val(), (csts.models.Scans.compareRarPoam.rarFields.Description) + fields.rarRow),
              control: csts.models.Scans.workbooks.rar.val($('#rarTabSel')
                .val(), (csts.models.Scans.compareRarPoam.rarFields['Security Control']) + fields.rarRow),
              office: '',
              security: '',
              rawrisk: r,
              mitigation: csts.models.Scans.workbooks.poam.val($('#poamTabSel')
                .val(), (csts.models.Scans.compareRarPoam.poamFields.Mitigation) + fields.poamRow),
              residualrisk: csts.models.Scans.workbooks.poam.val($('#poamTabSel')
                .val(), (csts.models.Scans.compareRarPoam.poamFields['Residual Risk']) + fields.poamRow),
              resources: '',
              scd: '',
              milestonesWD: '',
              milestronsWC: '',
              source: [
                csts.models.Scans.workbooks.rar.val($('#rarTabSel')
                  .val(), csts.models.Scans.compareRarPoam.rarFields.Source + fields.rarRow),
                '\n',
                csts.models.Scans.workbooks.rar.val($('#rarTabSel')
                  .val(), (csts.models.Scans.compareRarPoam.rarFields['Test Id']) + fields.rarRow),
              ].join(),
              status: csts.models.Scans.workbooks.rar.val($('#rarTabSel')
                .val(), (csts.models.Scans.compareRarPoam.rarFields.Status) + fields.rarRow),
              comment: csts.models.Scans.workbooks.rar.val($('#rarTabSel')
                .val(), (csts.models.Scans.compareRarPoam.rarFields.Comment) + fields.rarRow),
            }], {
              header: ['blank', 'description', 'control', 'office', 'security', 'rawrisk', 'mitigation', 'residualrisk', 'resources', 'scd', 'milestonesWD', 'milestonesWC', 'source', 'status', 'comment'],
              origin: -1,
              skipHeader: true,
            });

            // excel
            csts.plugins.xlsx.writeFile(
              csts.models.Scans.workbooks.poam,
              $('#filePoam').val().trim(),
              {
                bookSST: true,
                bookType: 'xlsx',
                compression: true,
              },
            );

            // viewmodel
            const sel = ko.utils.arrayFilter(
              csts.controllers.Scans.viewModels.compareRarPoam(),
              j => j.guid === guid,
            )[0];
            sel.poamVal = 'COPIED';

            // ui
            $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(8)`)
              .text('COPIED');
          }
          break;
        default:
      }
    },


    /**
     * Method: parseFiles
     *
     * Description:
     *  This method loads the file information for the selected RAR and POAM for the comparison
     *  functions
     *
     * Returns:
     *  {void}
     */
    parseFiles() {
      $('#myModal').modal();
      $('#myModalLabel').text('Please Wait...');
      $('#myModalBody').text('Currently Parsing the Excel Documents.  Please wait.');
      $('#myModal')
        .one('shown.bs.modal', () => {
          $('#tabSelFileInfo tbody')
            .empty();
          const table = $('table#tabSelFileInfo')
            .DataTable({
              destroy: true,
              searching: false,
              paging: false,
            });
          table.clear();
          let stats = csts.models.Scans.compareRarPoam.parseFile($('#fileRar').val().trim());

          table.row.add([
            'RAR',
            csts.plugins.path.basename($('#fileRar').val().trim()),
            csts.plugins.moment(stats.ctimeMs).format('MM/DD/YYYY HH:mm'),
            csts.plugins.moment(stats.atimeMs).format('MM/DD/YYYY HH:mm'),
            csts.plugins.moment(stats.mtimeMs).format('MM/DD/YYYY HH:mm'),
            stats.size,
            csts.plugins.path.extname($('#fileRar').val().trim()),
          ]);

          stats = csts.models.Scans.compareRarPoam.parseFile($('#filePoam').val().trim());
          table.row.add([
            'POAM',
            csts.plugins.path.basename($('#filePoam').val().trim()),
            csts.plugins.moment(stats.ctimeMs).format('MM/DD/YYYY HH:mm'),
            csts.plugins.moment(stats.atimeMs).format('MM/DD/YYYY HH:mm'),
            csts.plugins.moment(stats.mtimeMs).format('MM/DD/YYYY HH:mm'),
            stats.size,
            csts.plugins.path.extname($('#filePoam')
              .val()
              .trim()),
          ]);

          table.rows()
            .invalidate()
            .draw();

          $('#rarTabSel')
            .find('option')
            .remove();
          csts.models.Scans.workbooks.rar = csts.plugins.xlsx.readFile($('#fileRar')
            .val()
            .trim());
          csts.libs.Workbooks.extend(csts.models.Scans.workbooks.rar);

          $.each(csts.models.Scans.workbooks.rar.SheetNames, (index, item) => {
            $('#rarTabSel')
              .append($('<option></option>')
                .text(item)
                .prop('selected', (item.toLowerCase()
                  .replace(/[^a-zA-Z]/, '')
                  .indexOf('rar') >= 0)));
          });


          $('#poamTabSel')
            .find('option')
            .remove();
          csts.models.Scans.workbooks.poam = csts.plugins.xlsx.readFile($('#filePoam')
            .val()
            .trim());
          csts.libs.Workbooks.extend(csts.models.Scans.workbooks.poam);

          $.each(csts.models.Scans.workbooks.poam.SheetNames, (index, item) => {
            $('#poamTabSel')
              .append($('<option></option>')
                .text(item)
                .prop('selected', (item.toLowerCase()
                  .replace(/[^a-zA-Z]/, '')
                  .indexOf('poam') >= 0)));
          });

          $('#myModal')
            .modal('hide');
        });
    },

  },
});
