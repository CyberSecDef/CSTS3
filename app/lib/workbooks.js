/*
	Namespace: csts.libs.workbooks
	Generic functions for working with workbooks
*/
csts.libs['Workbooks'] = {
	
	/*
		Method: extend
		Add's the applicable new methods to the submitted workbook 
	*/
	extend : function(workbook){
		workbook.isBlank = this.isBlank;
		workbook.val = this.val;
	},
		
	/*
	Method: isBlank
	Determines if a cell in a worksheet is blanks
	
	Parameters:
		sheet - the sheet in a workbook being checked
		address - the address of the cell being checked
*/
	isBlank : function(sheet, address){
		if(Array.isArray(address)){
			ret = true;
			for(i = 0; i < address.length; i++){
				ret = ret && this.isBlank(sheet, address[i])
			}
			return ret;
		}else{
			return(
				typeof this.Sheets[sheet][address] == 'undefined' ||
				typeof this.Sheets[sheet][address].v == 'undefined' ||
				typeof this.Sheets[sheet][address].v == ''
			)
		}
	},

	/*
		Method: val
		gets or sets the value of a cell
		
		Parameters:
			sheet - the sheet in a workbook being checked
			address - the address of the cell being checked
			val - the value to set the cell today
	*/	
	val : function(sheet, address, val){
		if(val != null){
			this.Sheets[sheet][address].v = val;
		}
		
		return ( !this.isBlank(sheet, address) ? this.Sheets[sheet][address].v : '' );	
	},
	
}