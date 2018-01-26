csts.controllers['Scans'] = ({
	name : 'Scans',
	viewModels : {
		comparison : ko.observableArray(),
		myViewModel : {
			personName : ko.observable('Bob'),
			personAge  : 123,
			getName : function(){
				return this.personName;
			}
		}
	},
	compare : function(){
		console.log('executing Scans@compare');
		
		csts.plugins.ejs.renderFile('app/resources/views/pages/scans/compare.tpl',{
				fields : csts.models['Scans'].compareFields,
			},
			{ rmWhitespace : true},
			function(err,str){
				if(err){ console.log(err); $('#errors').html(err); }
				$('#main-center-col').html(str);
			}
		);
	},
	parseComparisonFiles : function(){
		$('#myModal').modal();
		$('#myModalLabel').text('Please Wait...');
		$('#myModalBody').text('Currently Parsing the Excel Documents.  Please wait.');
		$('#myModal').on('shown.bs.modal', function (e) {
			csts.models['Scans'].parseComparisonFiles();
		});
	},
	executeComparison : function(){
		csts.models['Scans'].executeComparison();
	}
	
});