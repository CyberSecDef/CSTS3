csts.controllers.Policies = ({

  controllerName: 'Policies',
  scap2gpo:{
    name: 'SCAP to GPO',
    default: 'showIndex',
    showIndex() {
      csts.plugins.ejs.renderFile(
        'app/resources/views/pages/policies/scap2gpo.tpl',
        {},
        { rmWhitespace: true },
        (err, str) => {
          if (err) { 
            $('#errors').html(err).show();
            $('#main-center-col').animate({ scrollTop: ($('#errors').offset().top) }, 1000);
          }
          $('#main-center-col').html(str);
        },
      );
    },
    execute() {
      const xccdfFile = $('#xccdf-source').val().trim().replace(/\\/ig, '/');
      const ovalFile = $('#oval-source').val().trim().replace(/\\/ig, '/');

      $('#myModal').modal();
      $('#myModalLabel').text('Please Wait...');
      $('#myModalBody').html('Currently Generating Administrative Templates.');
      $('#myModal')
        .one('shown.bs.modal', () => {
          const timestamp = csts.models.Policies.scap2gpo.execute(xccdfFile, ovalFile);
          const filename = `/storage/results/scap2gpo_${timestamp}`;
          $('div#results').empty();

          const ul = $('<ul></ul>');

          let li = $('<li></li>');
          $(li).append($('<a></a>').attr('href', `${filename}.adm`).attr('download', csts.plugins.path.basename(`${filename}.adm`) ).text('Click here to save .ADM file').css('display', 'block'));
          $(ul).append(li);

          li = $('<li></li>');
          $(li).append($('<a></a>').attr('href', `${filename}.admx`).attr('download', csts.plugins.path.basename(`${filename}.admx`) ).text('Click here to save .ADMX file').css('display', 'block'));
          $(ul).append(li);

          li = $('<li></li>');
          $(li).append($('<a></a>').attr('href', `${filename}.adml`).attr('download', csts.plugins.path.basename(`${filename}.adml`) ).text('Click here to save .ADML file').css('display', 'block'));
          $(ul).append(li);

          $('div#results').append(ul);

          $('div#headingTwo button').click();
          $('#myModal').modal('hide');
        });
    },
  }

});

