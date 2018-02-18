/*
  Namespace: Libs.Export

  Description:
    This object is responsible for exporting reports in DOC, PDF and CSV formats

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
csts.libs.export = {

  /*
    Method: saveCSV

    Description:
    Exports reports in CSV formats

    Parameters:
      data - JSON Object containing data to export
      filename - The name of the file to save as
  */
  saveCSV(data, filename) {
    const processRow = (row) => {
      let finalVal = '';
      for (let j = 0; j < row.length; j += 1) {
        let innerValue = row[j];
        if (row[j] instanceof Date) {
          innerValue = row[j].toLocaleString();
        }
        let result = innerValue.replace(/"/g, '""').replace(/[\u2018\u2019]/g, '').replace(/[\u201C\u201D]/g, '');

        if (result.search(/("|,|\n)/g) >= 0) {
          result = `"${result}"`;
        }
        if (j > 0) {
          finalVal += ',';
        }
        finalVal += result;
      }
      return `${finalVal}\n`;
    };

    let csvFile = processRow(data.columns);
    $.each(data.rows, (i, r) => {
      csvFile += processRow(r);
    });
    csts.libs.utils.getBlob('text/csv', csvFile, filename);
  },

  /*
    Method: saveDOC

    Description:
      Exports reports in DOC formats

    Parameters:
      content - The html content being exported
      filename - The name of the file to save as
  */
  saveDOC(data, filename) {
    const css = [];
    for (let sheeti = 0; sheeti < document.styleSheets.length; sheeti += 1) {
      const sheet = document.styleSheets[sheeti];
      const rules = ('cssRules' in sheet) ? sheet.cssRules : sheet.rules;
      if (rules) {
        for (let rulei = 0; rulei < rules.length; rulei += 1) {
          const rule = rules[rulei];
          if ('cssText' in rule) {
            css.push(rule.cssText);
          } else {
            css.push([rule.selectorText, ' {\n', rule.style.cssText, '\n}\n'].join());
          }
        }
      }
    }
    const styles = css.join('\n');
    csts.plugins.ejs.renderFile('app/resources/views/components/export/doc.tpl', {
      styles,
    }, {}, (err, str) => {
      const parser = new DOMParser();
      const el = parser.parseFromString(str, 'text/xml');
      $(el).find('body').append(data);

      csts.libs.utils.getBlob('text/html', el.documentElement.outerHTML, filename);
    });
  },

  /*
    Method: savePDF

    Description:
      Exports reports in PDF formats

    Parameters:
      content - JSON Object containing data to export
      filename - The name of the file to save as
  */
  savePDF(data, filename) {
    // eslint-disable-next-line
    const pdf = new jsPDF('l', 'pt', 'letter');
    pdf.autoTable(data.columns, data.rows, data.styles);
    pdf.save(filename);
  },
};

