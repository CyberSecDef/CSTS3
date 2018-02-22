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
     * scans - the findings from the various SCAP, ACAS and CKL scans
     * poamArr - The array of findings that will populate the poam and the rar
    */
    scanFiles: [],
    scans: {
      scap: [],
      acas: [],
      ckl: [],
    },
    poamArr: {},
    poamKeys: [],
    scapOpen: [],
    cklOpen: [],

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
            $('#errors').html(err);
          }
          $('#main-center-col').html(str);
        },
      );
    },

    /*
      Method: execute

      Description:
        executes the scans2poam function
    */
    execute() {
      const table = $('table#tabScanFiles').DataTable();
      const files = [];
      table.rows().every(rowIdx => files.push($(table.row(rowIdx).node()).attr('file-path')));
      const me = this;

      $('#myModal').modal();
      $('#myModalLabel').text('Please Wait...');
      $('#myModalBody').text('Currently Loading the Scanfiles.  Please wait.');
      $('#myModal')
        .one('shown.bs.modal', () => {
          for (let i = 0; i < files.length; i += 1) {
            me.parseFile(files[i]);
          }
          $('#myModal').modal('hide');
          console.log(this.scans);

          console.log( csts.plugins.jsonQuery('acas[*].hosts[*].requirements[*].pluginId', {data: csts.controllers.Scans.scans2poam.scans}).value.sort().filter(function(el,i,a){if(i==a.indexOf(el))return 1;return 0}) );
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
      const self = this;
      $('#myModal').modal();
      $('#myModalLabel').text('Please Wait...');
      $('#myModalBody').text('Currently Loading the Scanfiles.  Please wait.');
      $('#myModal')
        .one('shown.bs.modal', () => {
          this.scanFiles = self.getScanFiles(path);

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

    /*
      Method: getScanFiles

      Description:
        This method will get file information for submitted files

      Parameters:
        {string} path - the path for the file being analyzed
    */
    getScanFiles(path) {
      // eslint-disable-next-line
      let files = [];
      if ($('#files-recurse')
        .prop('checked')) {
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
      Method: parseXccdf

      Description:
        This method will parse a SCAP XCCDF File

      Parameters:
        {string} file - string to the file being parsed
    */
    parseXccdf(file) {
      const xccdfData = {};
      let fileData = '';
      let fileName = '';
      if (file.indexOf('<') > -1) {
        fileData = file;
        fileName = 'UNKNOWN';
      } else {
        fileData = csts.plugins.fs.readFileSync(file, 'utf8');
        fileName = file;
      }

      csts.plugins.xml2js.parseString(fileData, (err, result) => {
        xccdfData.credentialed = true;
        xccdfData.fileName = fileName;
        xccdfData.host = csts.plugins.jsonPath.value(result, "$['cdf:Benchmark']['cdf:TestResult'][0]['cdf:target'][0]");
        xccdfData.title = csts.plugins.jsonPath.flatValue(result, "$['cdf:Benchmark']['cdf:title']");
        xccdfData.version = csts.plugins.jsonPath.flatValue(result, "$['cdf:Benchmark']['cdf:version']");
        xccdfData.release = csts.plugins.jsonPath.flatValue(result, "$['cdf:Benchmark']['cdf:plain-text']")
          ._.match(new RegExp('Release: ([0-9]+)'))[1];
        xccdfData.scanDate = csts.plugins.moment(csts.plugins.jsonPath.value(result, "$['cdf:Benchmark']['cdf:TestResult'][*]['$']['start-time']"))
          .format('MM/DD/YYYY HH:mm');
        xccdfData.scanType = 'scap';
        xccdfData.openFindings = {
          cat1: result['cdf:Benchmark']['cdf:TestResult'][0]['cdf:rule-result'].filter(element => element['cdf:result'].reduce(a => a) !== 'pass')
            .filter(element => element.$.severity === 'high')
            .length,
          cat2: result['cdf:Benchmark']['cdf:TestResult'][0]['cdf:rule-result'].filter(element => element['cdf:result'].reduce(a => a) !== 'pass')
            .filter(element => element.$.severity === 'medium')
            .length,
          cat3: result['cdf:Benchmark']['cdf:TestResult'][0]['cdf:rule-result'].filter(element => element['cdf:result'].reduce(a => a) !== 'pass')
            .filter(element => element.$.severity === 'low')
            .length,
        };
        xccdfData.requirements = [];
        csts.plugins.jsonPath.value(result, "$..['cdf:rule-result']")
          .forEach((element) => {
            const ruleData = csts.plugins.jsonPath.query(result, `$..['cdf:Rule'][?(@.$.id=='${element.$.idref}')]`);
            // console.log(ruleData);
            const vulnerability = {};
            vulnerability.comments = '';
            vulnerability.findingDetails = JSON.stringify(element);

            vulnerability.cci = [];
            if (!csts.libs.utils.isBlank(ruleData[0]['cdf:ident'])) {
              ruleData[0]['cdf:ident'].forEach((cci) => {
                vulnerability.cci.push(cci._);
              });
            }

            vulnerability.description = ruleData[0]['cdf:description'].reduce(a => a);
            vulnerability.fixId = ruleData[0]['cdf:fix'][0].$.id;
            vulnerability.grpId = element.$.version;
            vulnerability.pluginId = '';
            vulnerability.resources = '';
            vulnerability.ruleId = element.$.idref;
            vulnerability.solution = ruleData[0]['cdf:fixtext'][0]._;
            vulnerability.references = JSON.stringify(ruleData[0]['cdf:reference']);
            vulnerability.severity = ruleData[0].$.severity;
            vulnerability.title = ruleData[0]['cdf:title'].reduce(a => a);

            switch (element['cdf:result'].reduce(a => a)) {
              case 'pass':
                vulnerability.status = 'Completed';
                break;
              case 'fail':
                vulnerability.status = 'Ongoing';
                break;
              case 'error':
                vulnerability.status = 'error';
                break;
              default:
                vulnerability.status = 'Ongoing';
            }

            xccdfData.requirements.push(vulnerability);
          });

        this.scans.scap.push(xccdfData);
      });
    },

    /*
      Method: parseCkl

      Description:
        This method will parse a checklist file

      Paramters:
        {string} file - string to the file being parsed
    */
    parseCkl(file) {
      const cklData = {};
      let fileData = '';
      let fileName = '';
      if (file.indexOf('<') > -1) {
        fileData = file;
        fileName = 'UNKNOWN';
      } else {
        fileData = csts.plugins.fs.readFileSync(file, 'utf8');
        fileName = file;
      }
      csts.plugins.xml2js.parseString(fileData, (err, result) => {
        cklData.scanType = 'ckl';
        cklData.credentialed = true;
        cklData.scanFile = fileName;
        cklData.host = [csts.plugins.jsonPath.value(result, '$..HOST_NAME')];
        cklData.title = csts.plugins.jsonPath.flatValue(result, "$..STIG_INFO[0].SI_DATA[?(@.SID_NAME=='title')].SID_DATA");

        const vrMatch = csts.plugins.path.basename(file)
          .match(new RegExp('V([0-9]+)R([0-9]+)'));
        if (csts.libs.utils.isBlank(vrMatch)) {
          cklData.version = '0';
          cklData.release = '0';
        } else {
          cklData.version = `${vrMatch[1]}`;
          cklData.release = `${vrMatch[2]}`;
        }

        const stats = csts.plugins.fs.statSync(file);
        cklData.scanDate = csts.plugins.moment(stats.mtimeMs)
          .format('MM/DD/YYYY HH:mm');

        cklData.openFindings = {
          cat1: csts.plugins.jsonPath.query(result, "$..VULN[?(@.STATUS!='NotAFinding' && @.STATUS!='Not_Applicable' )].STIG_DATA[?(@.VULN_ATTRIBUTE=='Severity' && @.ATTRIBUTE_DATA=='high')]")
            .length,
          cat2: csts.plugins.jsonPath.query(result, "$..VULN[?(@.STATUS!='NotAFinding' && @.STATUS!='Not_Applicable' )].STIG_DATA[?(@.VULN_ATTRIBUTE=='Severity' && @.ATTRIBUTE_DATA=='medium')]")
            .length,
          cat3: csts.plugins.jsonPath.query(result, "$..VULN[?(@.STATUS!='NotAFinding' && @.STATUS!='Not_Applicable' )].STIG_DATA[?(@.VULN_ATTRIBUTE=='Severity' && @.ATTRIBUTE_DATA=='low')]")
            .length,
        };

        cklData.requirements = [];
        csts.plugins.jsonPath.value(result, '$..VULN')
          .forEach((element) => {
            const vulnerability = {};
            vulnerability.vulnId = csts.plugins.jsonPath.value(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='Vuln_Num')].ATTRIBUTE_DATA")
              .reduce(a => a);
            vulnerability.comments = csts.plugins.jsonPath.value(element, '$..COMMENTS')
              .reduce(a => a);
            vulnerability.findingDetails = csts.plugins.jsonPath.value(element, '$..FINDING_DETAILS')
              .reduce(a => a);

            vulnerability.cci = [];
            csts.plugins.jsonPath.query(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='CCI_REF')].ATTRIBUTE_DATA")
              .forEach(cci => vulnerability.cci.push(cci.reduce(a => a)));

            vulnerability.description = csts.plugins.jsonPath.flatValue(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='Vuln_Discuss')].ATTRIBUTE_DATA");
            vulnerability.fixId = '';
            vulnerability.grpId = csts.plugins.jsonPath.flatValue(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='Group_Title')].ATTRIBUTE_DATA");
            vulnerability.iaControls = csts.plugins.jsonPath.flatValue(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='IA_Controls')].ATTRIBUTE_DATA");
            vulnerability.pluginId = '';
            vulnerability.resources = csts.plugins.jsonPath.flatValue(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='Responsibility')].ATTRIBUTE_DATA");
            vulnerability.ruleId = csts.plugins.jsonPath.flatValue(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='Rule_ID')].ATTRIBUTE_DATA");
            vulnerability.solution = csts.plugins.jsonPath.flatValue(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='Fix_Text')].ATTRIBUTE_DATA");
            vulnerability.references = csts.plugins.jsonPath.flatValue(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='STIGRef')].ATTRIBUTE_DATA");
            vulnerability.severity = csts.plugins.jsonPath.flatValue(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='Severity')].ATTRIBUTE_DATA");
            vulnerability.title = csts.plugins.jsonPath.flatValue(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='Rule_Title')].ATTRIBUTE_DATA");

            const s = csts.plugins.jsonPath.value(element, '$..STATUS')
              .reduce(a => a);
            vulnerability.status = (s === 'NotAFinding' || s === 'Not_Applicable' ? 'Completed' : 'Ongoing');

            cklData.requirements.push(vulnerability);
          });

        this.scans.ckl.push(cklData);
      });
    },

    /**
     * Method: parseNessus
     *
     * Description:
     *  This method will parse a Nessus scan result
     *
     * Parameters:
     *  {string} file - path to the scan file to be parse
     */
    parseNessus(file) {
      const nessusData = {};
      let fileData = '';
      let fileName = '';
      if (file.indexOf('<') > -1) {
        fileData = file;
        fileName = 'UNKNOWN';
      } else {
        fileData = csts.plugins.fs.readFileSync(file, 'utf8');
        fileName = file;
      }
      csts.plugins.xml2js.parseString(fileData, (err, result) => {
        nessusData.scanType = 'acas';
        nessusData.scanFile = fileName;
        nessusData.hosts = [];
        result.NessusClientData_v2.Report[0].ReportHost.forEach((host) => {
          const hostData = {};
          hostData.hostname = host.HostProperties[0].tag.filter(a => a.$.name === 'host-fqdn')[0]._;
          hostData.scanDate = csts.plugins.moment(host.HostProperties[0].tag.filter(a => a.$.name === 'HOST_START')[0]._)
            .format('MM/DD/YYYY HH:mm');
          hostData.credentialed = host.HostProperties[0].tag.filter(a => a.$.name === 'Credentialed_Scan')[0]._;
          hostData.scanEngine = host.ReportItem.filter(a => a.$.pluginID === '19506')[0].plugin_output[0].match(new RegExp('Nessus version : ([0-9.]+)'))[1];

          hostData.openFindings = {
            cat1: host.ReportItem.filter(a => a.$.severity >= '3')
              .length,
            cat2: host.ReportItem.filter(a => a.$.severity === '2')
              .length,
            cat3: host.ReportItem.filter(a => a.$.severity === '1')
              .length,
          };

          hostData.requirements = [];
          host.ReportItem.forEach((report) => {
            const vulnerability = {};
            vulnerability.cci = [];
            vulnerability.comments = typeof report.plugin_output !== 'undefined' ? report.plugin_output[0] : '';
            vulnerability.mitigation = '';
            vulnerability.findingDetails = '';
            vulnerability.description = report.synopsis[0];
            vulnerability.fixId = '';
            vulnerability.grpId = report.$.pluginFamily;
            vulnerability.pluginId = report.$.pluginID;
            vulnerability.resources = '';
            vulnerability.ruleId = '';
            vulnerability.solution = report.solution[0];
            vulnerability.references = '';
            vulnerability.severity = report.$.severity;
            vulnerability.title = report.$.pluginName;
            vulnerability.vulnId = '';
            vulnerability.iaControls = [];
            vulnerability.status = 'Ongoing';

            hostData.requirements.push(vulnerability);
          });
          nessusData.hosts.push(hostData);
        });

        this.scans.acas.push(nessusData);
      });
    },

    /**
     * Method: parseZip
     *
     * Description:
     *  This method will parse the files in a ZIP
     *
     * Parameters:
     *  {string} f - path to the scan file to be parse
     */
    parseZip(f) {
      const unzippedFs = csts.plugins.zip.sync.unzip(f).memory();
      console.log(unzippedFs.contents());
      const self = this;
      unzippedFs.contents()
        .forEach((file) => {
          const currentFile = unzippedFs.read(file, 'buffer');
          switch (csts.plugins.path.extname(file)) {
            case '.zip':
              self.parseZip(currentFile);
              break;
            case '.ckl':
              self.parseCkl(currentFile);
              break;
            case '.nessus':
              self.parseNessus(currentFile);
              break;
            case '.xml':
              self.parseXccdf(currentFile);
              break;
            default:
          }
        });
    },

    /**
     * Method: parseFile
     *
     * Description:
     *  This method will call the applicable parse method for a file
     *
     * Parameters:
     *  {string} currentFile - path to the scan file to be parse
     */
    parseFile(currentFile) {
      switch (csts.plugins.path.extname(currentFile)) {
        case '.zip':
          this.parseZip(currentFile);
          break;
        case '.ckl':
          this.parseCkl(currentFile);
          break;
        case '.nessus':
          this.parseNessus(currentFile);
          break;
        case '.xml':
          this.parseXccdf(currentFile);
          break;
        default:
      }
    },

  },

  /*
      Class: Controllers.Scans.compareRarPoam
      Methods and variables related to the RAR/POAM comparison applet

      See Also:
      <Models.Scans.compareRarPoam>
  */
  compareRarPoam: {
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
            $('#errors')
              .html(err);
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
          <Models.Scans.compareRarPoam.compareWorkbooks>
    */
    executeComparison(fields) {
      $('#headingFour button').click();
      csts.models.Scans.compareRarPoam.compareWorkbooks(
        $('#rarTabSel').val(),
        $('#poamTabSel').val(),
        fields,
      );
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
              $('#rarTabSel')
                .val(), (csts.models.Scans.compareRarPoam.rarFields[fields.type]) + fields.rarRow,
              csts.models.Scans.workbooks.poam.val($('#poamTabSel')
                .val(), (csts.models.Scans.compareRarPoam.poamFields[fields.type]) + fields.poamRow),
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
