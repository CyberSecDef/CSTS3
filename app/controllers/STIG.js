/*
  Namespace: Controllers.Stig

  Description:
    This is the STIG controller for the CSTS

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
csts.controllers.STIG = ({

/*
  Variables: Properties

  controllerName - the name of the controller
*/
  controllerName: 'STIG',
  stigXxls: {
    name: 'CKL <-> XLS',
    default: 'showIndex',
    execute() {
      $('#myModal').modal();
      $('#myModalLabel').text('Please Wait...');
      $('#myModalBody').text('Currently Parsing the Selected Files.  Please wait.');
      $('#myModal')
        .one('shown.bs.modal', () => {
          const filename = csts.models.STIG.stigXxls.execute($('#fileSource').val().trim());

          
          $('#stig-convert-results-card-body').html($('<a></a>').attr('download', 'download').attr('href', filename.replace('./app/', './')).attr('target', '_blank').text(filename.replace('./app/', '/')));

          // show the results link
          $('#stig-convert-results-card').click();

          $('#myModal').modal('hide');
        });
    },
    showIndex() {
      csts.plugins.ejs.renderFile(
        'app/resources/views/pages/stig/stigXxls.tpl', {}, {
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
    parseFiles() {
      $('#myModal').modal();
      $('#myModalLabel').text('Please Wait...');
      $('#myModalBody').text('Currently Parsing the Selected Files.  Please wait.');
      $('#myModal')
        .one('shown.bs.modal', () => {
          $('#tabSelFileInfo tbody')
            .empty();
          const table = $('table#tabSelFileInfo').DataTable({ destroy: true, searching: false, paging: false });
          table.clear();
          const stats = csts.models.STIG.stigXxls.parseFile($('#fileSource').val().trim());

          table.row.add([
            csts.plugins.path.basename($('#fileSource').val().trim()),
            csts.plugins.moment(stats.ctimeMs).format('MM/DD/YYYY HH:mm'),
            csts.plugins.moment(stats.atimeMs).format('MM/DD/YYYY HH:mm'),
            csts.plugins.moment(stats.mtimeMs).format('MM/DD/YYYY HH:mm'),
            stats.size,
            csts.plugins.path.extname($('#fileSource').val().trim()),
          ]);

          table.rows().invalidate().draw();
          $('#myModal').modal('hide');
        });
    },
  },
  updateStig: {
    name: 'Update STIG',
    default: 'showIndex',
    showIndex() {
      csts.plugins.ejs.renderFile(
        'app/resources/views/pages/stig/updateStig.tpl', {}, {
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
    addRow(row) {
      const table = $('table#stigUpdatesResultsTable').DataTable();
      table.row.add(row);
    },
    execute() {
      const caller = this;
      $('#stigUpdatesResultsTable tbody').empty();
      const table = $('table#stigUpdatesResultsTable')
        .DataTable({
          destroy: true,
          searching: false,
          paging: false,
        });
      table.clear();

      $('#myModal').modal();
      $('#myModalLabel').text('Please Wait...');
      $('#myModalBody').html(`Currently Processing the CKL.  Please wait.
      <div class="progress" id="modalProgess">
        <div class="progress-bar progress-bar-striped" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div>
      </div>`);
      $('#myModal')
        .one('shown.bs.modal', () => {
          const results = csts.models.STIG.updateStig.execute($('#fileSource').val().trim(), $('#fileDestination').val().trim());
          const filename = `./app/storage/results/${caller.name}_${csts.plugins.moment().format('YYYYMMDD_HHmmss')}.ckl`;
          const builder = new csts.plugins.xml2js.Builder();
          const xml = builder.buildObject(results);
          csts.plugins.fs.writeFileSync(filename, xml);

          $('div#stig-updates-results-file').html(
            $('<a></a>').attr('href', filename.replace('/app', '')).attr('download', csts.plugins.path.basename(filename) ).text('Click here to save CKL'),
          );

          $('div#headingTwo button').click();

          table.rows()
            .invalidate()
            .draw();


          $('#myModal').modal('hide');
        });
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
          let stats = csts.models.STIG.updateStig.parseFile($('#fileSource').val().trim());

          table.row.add([
            'Source',
            csts.plugins.path.basename($('#fileSource').val().trim()),
            csts.plugins.moment(stats.ctimeMs).format('MM/DD/YYYY HH:mm'),
            csts.plugins.moment(stats.atimeMs).format('MM/DD/YYYY HH:mm'),
            csts.plugins.moment(stats.mtimeMs).format('MM/DD/YYYY HH:mm'),
            stats.size,
            csts.plugins.path.extname($('#fileSource').val().trim()),
          ]);

          stats = csts.models.STIG.updateStig.parseFile($('#fileDestination').val().trim());
          table.row.add([
            'Destination',
            csts.plugins.path.basename($('#fileDestination').val().trim()),
            csts.plugins.moment(stats.ctimeMs).format('MM/DD/YYYY HH:mm'),
            csts.plugins.moment(stats.atimeMs).format('MM/DD/YYYY HH:mm'),
            csts.plugins.moment(stats.mtimeMs).format('MM/DD/YYYY HH:mm'),
            stats.size,
            csts.plugins.path.extname($('#fileDestination')
              .val()
              .trim()),
          ]);

          table.rows()
            .invalidate()
            .draw();

          $('#myModal')
            .modal('hide');
        });
    },
  },

});

