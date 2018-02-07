/*
    Namespace: csts.controllers.Scans
    This is the baseline controller for Scan type functions
*/
csts.controllers.Scans = ({
  /*
      Variable: controllerName
      The name of the controller
  */
  controllerName: 'Scans',

  /*
      Variable: viewModels
      viewModels for the scans controller.  These are middleware between the views and controllers.
  */
  viewModels: {
    compareRarPoam: ko.observableArray().extend({
      notify: 'always',
    }),
  },

  /*
      Namespace: csts.controllers.Scans.scans2poam
      This is the scans2poam functionality
  */
  scans2poam: {
    scanFiles: [],
    scans: {
      scap: {},
      acas: {},
      ckl: {},
    },
    poamArr: {},
    poamKeys: [],
    scapOpen: [],
    cklOpen: [],

    /*
        Method: invokeFileScan
        Grabs the files from the submitted path

        Parameters:
        path - the path for the directory being scanned
    */
    invokeFileScan(path) {
      const self = this;
      $('#myModal').modal();
      $('#myModalLabel').text('Please Wait...');
      $('#myModalBody').text('Currently Loading the Scanfiles.  Please wait.');
      $('#myModal').on('shown.bs.modal', () => {
        this.scanFiles = self.getScanFiles(path);

        // load into table
        $('#tabScanFiles tbody').empty();
        const table = $('table#tabScanFiles').DataTable({
          destroy: true,
          searching: true,
          paging: 25,
        });
        table.clear();
        this.scanFiles.forEach((file) => {
          const stats = csts.plugins.fs.statSync(file);

          table.row.add([
            `<input type='checkbox' name='scan-file' value='${file}' checked='checked'/>`,
            csts.plugins.path.basename(file),
            csts.plugins.moment(stats.ctimeMs).format('MM/DD/YYYY HH:mm'),
            csts.plugins.moment(stats.atimeMs).format('MM/DD/YYYY HH:mm'),
            csts.plugins.moment(stats.mtimeMs).format('MM/DD/YYYY HH:mm'),
            csts.plugins.numeral(stats.size).format('0.0 b'),
            csts.plugins.path.extname(file),
          ]);
        });

        table.rows().invalidate().draw();


        $('#myModal').modal('hide');
      });
    },

    /*
      Method: getScanFiles
      This method will get file information for submitted files

      Parameters:
       path - the path for the file being analyzed
    */
    getScanFiles(path) {
      // eslint-disable-next-line
      let files = [];
      if ($('#files-recurse').prop('checked')) {
        files = csts.libs.utils.getRecursiveDir(path);
      } else {
        files = csts.plugins.fs.readdirSync(path);
      }
      // filter to just the types of scan files we need
      const scans = files.filter(scan => (
        (scan.toLowerCase().indexOf('.xml') >= 0 && scan.toLowerCase().indexOf('xccdf') >= 0) ||
        scan.toLowerCase().indexOf('.zip') >= 0 ||
        scan.toLowerCase().indexOf('.ckl') >= 0 ||
        scan.toLowerCase().indexOf('.nessus') >= 0
      ));

      return scans;
    },

    /*
        Method: showIndex
        This is the function called from the router to load the scans2poam module
    */
    showIndex() {
      csts.plugins.ejs.renderFile(
        'app/resources/views/pages/scans/scans2poam.tpl',
        {},
        {
          rmWhitespace: true,
        },
        (err, str) => {
          if (err) {
            $('#errors').html(err);
          }
          $('#main-center-col').html(str);
        },
      );
    },
  },
  /*
      Namespace: csts.controllers.Scans.compareRarPoam
      Methods and variables related to the RAR/POAM comparison functionality
  */
  compareRarPoam: {

    /*
      Method: executeComparison
      This method executes the comparison between a RAR and a POAM by calling the appropriate
      method in the Scans model.

      Parameters:
          fields - the fields that should be compared between the RAR and POAM

      See Also:
          <csts.models.scans.compareRarPoam.compareWorkbooks>
    */
    executeComparison(fields) {
      $('#headingFour button').click();
      csts.models.Scans.compareRarPoam.compareWorkbooks($('#rarTabSel').val(), $('#poamTabSel').val(), fields);
    },

    /*
        Method: moveField
        Handles moving data from the RAR to the POAM or vice versa

        Parameters:
            el - The calling element
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

      switch ($(el).data('action')) {
        case 'left':
          if (fields.mismatch !== 'POAM' && fields.mismatch !== 'RAR') {
            // workbook
            csts.models.Scans.workbooks.rar.val(
              $('#rarTabSel').val(), (csts.models.Scans.rarFields[fields.type]) + fields.rarRow,
              csts.models.Scans.workbooks.poam.val($('#poamTabSel').val(), (csts.models.Scans.poamFields[fields.type]) + fields.poamRow),
            );

            // excel
            csts.plugins.xlsx.writeFile(csts.models.Scans.workbooks.rar, $('#fileRar').val().trim(), {
              bookSST: true,
              bookType: 'xlsx',
              compression: true,
            });

            // viewmodel
            // eslint-disable-next-line
            const sel = ko.utils.arrayFilter(csts.controllers.Scans.viewModels.compareRarPoam(), (i) => {
              return i.guid === guid;
            })[0];
            sel.rarVal = sel.poamVal;

            // ui
            $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(5)`).text(fields.poamVal);
          } else {
            const r = csts.models.Scans.workbooks.poam.val($('#poamTabSel').val(), (csts.models.Scans.poamFields['Raw Risk']) + fields.poamRow);
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
              csts.models.Scans.workbooks.rar.Sheets[$('#rarTabSel').val()], [{
                control: csts.models.Scans.workbooks.poam.val($('#poamTabSel').val(), (csts.models.Scans.poamFields['Security Control']) + fields.poamRow),
                source: csts.models.Scans.workbooks.poam.val($('#poamTabSel').val(), (csts.models.Scans.poamFields.Source) + fields.poamRow).substring(
                  0,
                  csts.models.Scans.workbooks.poam.val($('#poamTabSel').val(), (csts.models.Scans.poamFields.Source) + fields.poamRow).indexOf('Group ID:'),
                ),
                threat: csts.models.Scans.workbooks.poam.val(
                  $('#poamTabSel').val(),
                  (csts.models.Scans.poamFields.Source) + fields.poamRow,
                ).substring(csts.models.Scans.workbooks.poam.val(
                  $('#poamTabSel').val(),
                  (csts.models.Scans.poamFields.Source) + fields.poamRow,
                ).indexOf('Group ID:')),
                description: csts.models.Scans.workbooks.poam.val($('#poamTabSel').val(), (csts.models.Scans.poamFields.Description) + fields.poamRow),
                risk: '',
                rawrisk: r,
                impact: i,
                likelihood: l,
                correction: '',
                mitigation: csts.models.Scans.workbooks.poam.val($('#poamTabSel').val(), (csts.models.Scans.poamFields.Mitigation) + fields.poamRow),
                remediation: csts.models.Scans.workbooks.poam.val($('#poamTabSel').val(), (csts.models.Scans.poamFields.Mitigation) + fields.poamRow),
                residualrisk: csts.models.Scans.workbooks.poam.val($('#poamTabSel').val(), (csts.models.Scans.poamFields['Residual Risk']) + fields.poamRow),
                status: csts.models.Scans.workbooks.poam.val($('#poamTabSel').val(), (csts.models.Scans.poamFields.Status) + fields.poamRow),
                comment: csts.models.Scans.workbooks.poam.val($('#poamTabSel').val(), (csts.models.Scans.poamFields.Comment) + fields.poamRow),
                devices: '',
              }],
              {
                header: ['control', 'source', 'threat', 'description', 'risk', 'rawrisk', 'impact', 'likelihood', 'correction', 'mitigation', 'remediation', 'residualrisk', 'status', 'comment', 'devices'],
                origin: -1,
                skipHeader: true,
              },
            );

            // excel
            csts.plugins.xlsx.writeFile(csts.models.Scans.workbooks.rar, $('#fileRar').val().trim(), {
              bookSST: true,
              bookType: 'xlsx',
              compression: true,
            });

            // viewmodel
            // eslint-disable-next-line
            const sel = ko.utils.arrayFilter(csts.controllers.Scans.viewModels.compareRarPoam(), (i) => {
              return i.guid === guid;
            })[0];
            sel.rarVal = 'COPIED';

            // ui
            $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(5)`).text('COPIED');
          }
          break;
        case 'merge': {
          const text = [$(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(8)`).text(),
            '\n',
            $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(5)`).text()].join().replace(/see rar[.]*/ig, '');

          csts.models.Scans.workbooks.rar.val($('#rarTabSel').val(), (csts.models.Scans.rarFields[fields.type]) + fields.rarRow, text);
          csts.models.Scans.workbooks.poam.val($('#poamTabSel').val(), (csts.models.Scans.poamFields[fields.type]) + fields.poamRow, text);

          csts.plugins.xlsx.writeFile(csts.models.Scans.workbooks.rar, $('#fileRar').val().trim(), {
            bookSST: true,
            bookType: 'xlsx',
            compression: true,
          });
          csts.plugins.xlsx.writeFile(csts.models.Scans.workbooks.poam, $('#filePoam').val().trim(), {
            bookSST: true,
            bookType: 'xlsx',
            compression: true,
          });

          const sel = ko.utils.arrayFilter(csts.controllers.Scans.viewModels.compareRarPoam(), i =>
            i.guid === guid)[0];
          sel.rarVal = text;
          sel.poamVal = text;

          $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(5)`).text(text);
          $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(8)`).text(text);

          break;
        }
        case 'right':
          if (fields.mismatch !== 'POAM' && fields.mismatch !== 'RAR') {
            csts.models.Scans.workbooks.poam.val(
              $('#poamTabSel').val(), (csts.models.Scans.poamFields[fields.type]) + fields.poamRow,
              csts.models.Scans.workbooks.rar.val($('#rarTabSel').val(), (csts.models.Scans.rarFields[fields.type]) + fields.rarRow),
            );
            csts.plugins.xlsx.writeFile(csts.models.Scans.workbooks.poam, $('#filePoam').val().trim(), {
              bookSST: true,
              bookType: 'xlsx',
              compression: true,
            });
            const sel = ko.utils.arrayFilter(
              csts.controllers.Scans.viewModels.compareRarPoam(),
              i => i.guid === guid,
            )[0];
            sel.poamVal = sel.rar;
            $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(8)`).text(fields.rarVal);
          } else {
            const r = csts.models.Scans.workbooks.rar.val($('#rarTabSel').val(), (csts.models.Scans.rarFields['Raw Risk']) + fields.rarRow);

            csts.plugins.xlsx.utils.sheet_add_json(csts.models.Scans.workbooks.rar.Sheets.RAR, [{
              blank: '',
              description: csts.models.Scans.workbooks.rar.val($('#rarTabSel').val(), (csts.models.Scans.rarFields.Description) + fields.rarRow),
              control: csts.models.Scans.workbooks.rar.val($('#rarTabSel').val(), (csts.models.Scans.rarFields['Security Control']) + fields.rarRow),
              office: '',
              security: '',
              rawrisk: r,
              mitigation: csts.models.Scans.workbooks.poam.val($('#poamTabSel').val(), (csts.models.Scans.poamFields.Mitigation) + fields.poamRow),
              residualrisk: csts.models.Scans.workbooks.poam.val($('#poamTabSel').val(), (csts.models.Scans.poamFields['Residual Risk']) + fields.poamRow),
              resources: '',
              scd: '',
              milestonesWD: '',
              milestronsWC: '',
              source: [
                csts.models.Scans.workbooks.rar.val($('#rarTabSel').val(), csts.models.Scans.rarFields.Source + fields.rarRow),
                '\n',
                csts.models.Scans.workbooks.rar.val($('#rarTabSel').val(), (csts.models.Scans.rarFields['Test Id']) + fields.rarRow),
              ].join(),
              status: csts.models.Scans.workbooks.rar.val($('#rarTabSel').val(), (csts.models.Scans.rarFields.Status) + fields.rarRow),
              comment: csts.models.Scans.workbooks.rar.val($('#rarTabSel').val(), (csts.models.Scans.rarFields.Comment) + fields.rarRow),
            }], {
              header: ['blank', 'description', 'control', 'office', 'security', 'rawrisk', 'mitigation', 'residualrisk', 'resources', 'scd', 'milestonesWD', 'milestronsWC', 'source', 'status', 'comment'],
              origin: -1,
              skipHeader: true,
            });

            // excel
            csts.plugins.xlsx.writeFile(csts.models.Scans.workbooks.poam, $('#filePoam').val().trim(), {
              bookSST: true,
              bookType: 'xlsx',
              compression: true,
            });

            // viewmodel
            const sel = ko.utils.arrayFilter(
              csts.controllers.Scans.viewModels.compareRarPoam(),
              j => j.guid === guid,
            )[0];
            sel.poamVal = 'COPIED';

            // ui
            $(`table#scans-compare-results tbody tr[data-guid='${guid}'] td:nth-child(8)`).text('COPIED');
          }
          break;
        default:
      }
    },

    /*
      Method: parseFiles
      This method loads the file information for the selected RAR and POAM for the comparison
      functions
    */
    parseFiles() {
      $('#myModal').modal();
      $('#myModalLabel').text('Please Wait...');
      $('#myModalBody').text('Currently Parsing the Excel Documents.  Please wait.');
      $('#myModal').on('shown.bs.modal', () => {
        $('#tabSelFileInfo tbody').empty();
        const table = $('table#tabSelFileInfo').DataTable({
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
          csts.plugins.path.extname($('#filePoam').val().trim()),
        ]);

        table.rows().invalidate().draw();

        $('#rarTabSel').find('option').remove();
        csts.models.Scans.workbooks.rar = csts.plugins.xlsx.readFile($('#fileRar').val().trim());
        csts.libs.Workbooks.extend(csts.models.Scans.workbooks.rar);

        $.each(csts.models.Scans.workbooks.rar.SheetNames, (index, item) => {
          $('#rarTabSel').append($('<option></option>').text(item).prop('selected', (item.toLowerCase().replace(/[^a-zA-Z]/, '').indexOf('rar') >= 0)));
        });


        $('#poamTabSel').find('option').remove();
        csts.models.Scans.workbooks.poam = csts.plugins.xlsx.readFile($('#filePoam').val().trim());
        csts.libs.Workbooks.extend(csts.models.Scans.workbooks.poam);

        $.each(csts.models.Scans.workbooks.poam.SheetNames, (index, item) => {
          $('#poamTabSel').append($('<option></option>').text(item).prop('selected', (item.toLowerCase().replace(/[^a-zA-Z]/, '').indexOf('poam') >= 0)));
        });

        $('#myModal').modal('hide');
      });
    },

    /*
        Method: showIndex
        This is the function called from the router to load the compareRAR/POAM functionality
    */
    showIndex() {
      csts.libs.ui.status('Loading RAR/POAM Comparison functions.');

      csts.plugins.ejs.renderFile(
        'app/resources/views/pages/scans/compare.tpl', {
          fields: csts.models.Scans.compareFields,
        }, {
          rmWhitespace: true,
        },
        (err, str) => {
          if (err) {
            $('#errors').html(err);
          }
          $('#main-center-col').html(str);
        },
      );
    },
  },
});
