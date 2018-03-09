<div class="footer">

  <div class="row">
    <div class="col-1" style="margin-left:20px;">
      Home
    </div>
    <div class="col">
      Status: <span id="statusbar-text"></span>
    </div>

    <div class="col-1">
      <input type="range" min=".5" max="1.5" step=".1" onchange="$('html #main-center-col').css('font-size', this.value + 'em');" style="width:100%;" />
    </div>
    <div class="col-2 no-gutters">
      <input type="text" onkeyup="csts.plugins.hilitor.apply(this.value);" placeholder="Find in Page" style="font-size:16px;width:100%; line-height: normal; ">
    </div>

    <div class="col-1">
			
			<select id="selTheme">
			</select>
    </div>


    <div class="col-1 systray" style="text-align:right; padding-right:15px;">
      <i class="fas fa-tachometer-alt"></i>
      <i class="fas fa-bell"></i>
    </div>

  </div>
</div>
<script>
 // load the theme selections
 $.each(
	csts.plugins.fs.readdirSync('./app/public/themes/'),
	(index, item) => {
		$('#selTheme').append(
			$('<option></option>').text(item)
		);
	},
);

$('#selTheme').on('change',()=>{

	csts.theme = $('#selTheme option:selected').first().text();
	csts.db.config.count({
      viewCount: {
        $gt: 0,
      },
    }, (err, count) => {
      if (count === 0) {
        csts.db.config.insert({
          viewCount: 1,
          theme: csts.theme,
        });
      } else {
        csts.db.config.findOne({
          viewCount: {
            $gt: 0,
          },
        }, (err2, res) => {
          csts.db.config.update({
            // eslint-disable-next-line
            _id: res._id,
          }, {
            $set: {
              viewCount: (res.viewCount + 1),
              theme: (csts.theme),
            },
          });
          csts.db.config.persistence.compactDatafile();
        });
      }
		});
		

	$('body#app').fadeTo("slow",0, () => {
		$('link[rel=stylesheet][href*="bootstrap.min"]').remove();
		$('head').append(
			$('<link rel="stylesheet" type="text/css" />').attr('href', './public/themes/' + $('#selTheme option:selected').first().text() + '/bootstrap.min.css')
		);

		window.setTimeout( () => {
			$('body > main').css('padding-top', $('header > nav').css('height'))
			$('body#app').fadeTo("slow",1);
		}, 500);
	});
	
});
</script>