/*
  Namespace: Libs.Utils

  Description:
    Object that contains utility type functions for the CSTS

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
csts.libs.utils = {
  /*
    Method: isBlank

    Description:
      determines if submitted object exists and is not blank
  */
  isBlank(obj) {
    if (obj === null || obj === '' || typeof obj === 'undefined') {
      return true;
    }
    return false;
  },
  /*
    Method: getBlob

    Description:
      This method will allow files to be saved from the CSTS app (file save dialog)

    Parameters:
      mime - The mime type of the file to save
      content - The data to be saved
      filename - The name of the file to save asin
  */
  getBlob(mime, content, filename) {
    const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  },

  /*
    Method: getGuid

    Description:
      Generates a GUID like string
  */
  getGuid() {
    // eslint-disable-next-line
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>  (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  },

  /*
    Method: getRecursiveDir

    Description:
      Recursively scans for files in a folder

    Parameters:
      dir - The path being scanned
      filelist - a file list to pass between recursive calls.  Not needed for initial call
  */
  getRecursiveDir: (d, f, s) => {
    let dir = d;
    let filelist = f;
    const showStatus = s;
    if (dir[dir.length - 1] !== '/') {
      dir = dir.concat('/');
    }
    const files = csts.plugins.fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach((file) => {
      if (csts.plugins.fs.statSync(dir + file).isDirectory()) {
        filelist = csts.libs.utils.getRecursiveDir(`${dir}${file}/`, filelist, showStatus);
      } else {
        filelist.push(dir + file);
      }
    });
    return filelist;
  },

  /*
    Method: log

    Description:
      Will log a message to the console if the application environment is set to developmental

    Parameters:
      msg - A String or object to be logged
  */
  log(msg) {
    if (nw.App.manifest.environment === 'developmental') {
      // eslint-disable-next-line
      console.log(msg);
    }
  },

  /*
    Method: toggleHosts

    Description:
      Shows or hides the hosts column of the CSTS application
  */
  toggleHosts() {
    if ($('#main-right-col').is(':visible')) {
      $('#main-right-col').hide();
      $('#main-center-col').removeClass('col-10').addClass('col-12');
    } else {
      $('#main-right-col').show();
      $('#main-center-col').removeClass('col-12').addClass('col-10');
    }
  },
};

