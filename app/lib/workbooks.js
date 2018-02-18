/*
  Namespace: Libs.Workbooks

  Description:
    Generic functions for working with workbooks

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
    Library

  Package:
    CSTSv3

  Author:
    Robert Weber <wwwdaze2000@gmail.com>

  Copyright:
    2018 - RFW
*/
csts.libs.Workbooks = {

  /*
    Method: extend

    Description:
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

  Description:
    Determines if a cell in a worksheet is blank

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

    Description:
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

