/*
  Namespace: csts.libs.workbooks
  Generic functions for working with workbooks
*/
csts.libs.Workbooks = {

  /*
    Method: extend
    Add's the applicable new methods to the submitted workbook
  */
  extend(workbook) {
    /* eslint-disable no-param-reassign */
    workbook.isBlank = this.isBlank;
    workbook.val = this.val;
    /* eslint-enable no-param-reassign */
  },

  /*
  Method: isBlank
  Determines if a cell in a worksheet is blanks

  Parameters:
    sheet - the sheet in a workbook being checked
    address - the address of the cell being checked
*/
  isBlank(sheet, address) {
    if (Array.isArray(address)) {
      let ret = true;
      for (let i = 0; i < address.length; i += 1) {
        ret = ret && this.isBlank(sheet, address[i]);
      }
      return ret;
    }

    return (
      typeof this.Sheets[sheet][address] === 'undefined' ||
      typeof this.Sheets[sheet][address].v === 'undefined' ||
      this.Sheets[sheet][address].v === ''
    );
  },

  /*
    Method: val
    gets or sets the value of a cell

    Parameters:
      sheet - the sheet in a workbook being checked
      address - the address of the cell being checked
      val - the value to set the cell today
  */
  val(sheet, address, val) {
    if (val != null) {
      this.Sheets[sheet][address].v = val;
    }

    return (!this.isBlank(sheet, address) ? this.Sheets[sheet][address].v : '');
  },
};

