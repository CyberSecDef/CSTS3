/*
	Namespace: csts.libs.utils
	Object that contains utility type functions for the CSTS
*/
csts.libs['utils'] = {
	
	/*
		Method: walkSync
		
		Parameters:
			dir - The path being scanned
			filelist - a file list to pass between recursive calls.  Not needed for initial call
	*/
	walkSync : function(dir, filelist) {
		if( dir[dir.length-1] != '/') dir=dir.concat('/');
		files = csts.plugins.fs.readdirSync(dir);
		filelist = filelist || [];
		files.forEach(function(file) {
			if (csts.plugins.fs.statSync(dir + file).isDirectory()) {
				filelist = csts.libs.utils.walkSync(dir + file + '/', filelist);
			}else {
				filelist.push(dir+file);
			}
		});
		return filelist;
	},
	
	/*
		Method: blob
		This method will allow files to be saved from the CSTS app (file save dialog)
		
		Parameters:
			mime - The mime type of the file to save
			content - The data to be saved
			filename - The name of the file to save asin
	*/
	blob	: function(mime, content, filename){
		var blob = new Blob([content], { type: mime + ';charset=utf-8;' });
		if (navigator.msSaveBlob) {
			navigator.msSaveBlob(blob, filename);
		} else {
			var link = document.createElement("a");
			if (link.download !== undefined) {

				var url = URL.createObjectURL(blob);
				link.setAttribute("href", url);
				link.setAttribute("download", filename);
				link.style.visibility = 'hidden';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		}
	},

	/*
		Method: toggleHosts
		Shows or hides the hosts column of the CSTS application
	*/
	toggleHosts	: function(){
		if(	$('#main-right-col').is(':visible') ){
			$('#main-right-col').hide()
			$('#main-center-col').removeClass('col-10').addClass('col-12')
		}else{
			$('#main-right-col').show()
			$('#main-center-col').removeClass('col-12').addClass('col-10')
		}
	},

	/*
		Method: guid
		Generates a GUID like string
	*/
	guid : function(){
	  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	  );
	},

	/*
		Method: debug
		Will log a message to the console if the application environment is set to developmental
		
		Parameters:
			msg - A String or object to be logged
	*/
	debug : function(msg){
		if(nw.App.manifest.environment == 'developmental'){
			console.log(msg);
		}
	}
}