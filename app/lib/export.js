/*
	Namespace: csts.libs.export
	This object is responsible for exporting reports in DOC, PDF and CSV formats
*/
csts.libs['export'] = {
		/*
			Method: doc
			Exports reports in DOC formats
			
			Parameters:
				content - The html content being exported
				filename - The name of the file to save as
		*/
		doc	: function(content, filename){
			var css= [];
			for (var sheeti= 0; sheeti <  document.styleSheets.length; sheeti++) {
				var sheet= document.styleSheets[sheeti];
				var rules= ('cssRules' in sheet)? sheet.cssRules : sheet.rules;
				if(rules){
					for (var rulei= 0; rulei < rules.length; rulei++) {
						var rule= rules[rulei];
						if ('cssText' in rule)
							css.push(rule.cssText);
						else
							css.push(rule.selectorText+' {\n'+rule.style.cssText+'\n}\n');
					}
				}
			}
			styles = css.join('\n');
			csts.plugins.ejs.renderFile('app/resources/views/components/export/doc.tpl',{
				'styles' 	: styles
			},{},function(err,str){
				var parser = new DOMParser()
				el = parser.parseFromString(str, "text/xml");
				$(el).find('body').append( content );
				
				csts.libs.utils.blob('text/html', el.documentElement.outerHTML , filename)
			}) ;
		},

		/*
			Method: csv
			Exports reports in CSV	formats
			
			Parameters:
				data - JSON Object containing data to export
				filename - The name of the file to save as
		*/
		csv : function(data, filename){
			var processRow = function (row) {
				var finalVal = '';
				for (var j = 0; j < row.length; j++) {
					var innerValue = row[j]
					if (row[j] instanceof Date) {
						innerValue = row[j].toLocaleString();
					};
					var result = innerValue.replace(/"/g, '""').replace(/[\u2018\u2019]/g, "").replace(/[\u201C\u201D]/g, '');

					if (result.search(/("|,|\n)/g) >= 0){
						result = '"' + result + '"';
					}
					if (j > 0){
						finalVal += ',';
					}
					finalVal += result;
				}
				return finalVal + '\n';
			};

			var csvFile = processRow( data.columns )
			$.each(data.rows, function(i, r){ 
				csvFile += processRow(  r  ); 
			});
			csts.libs.utils.blob('text/csv', csvFile , filename)
		},

		/*
			Method: pdf
			Exports reports in PDF formats
			
			Parameters:
				content - JSON Object containing data to export
				filename - The name of the file to save as
		*/		
		pdf : function(data, filename){
			var pdf = new jsPDF('l','pt','letter');
			pdf.autoTable(data.columns, data.rows, data.styles);
			pdf.save( filename );
		}


}