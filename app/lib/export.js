/*
  Namespace: csts.libs.export
  This object is responsible for exporting reports in DOC, PDF and CSV formats
*/
csts.libs.export = {

  /*
    Method: csv
    Exports reports in CSV formats

    Parameters:
      data - JSON Object containing data to export
      filename - The name of the file to save as
  */
  csv(data, filename) {
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
    csts.libs.utils.blob('text/csv', csvFile, filename);
  },

  /*
    Method: doc
    Exports reports in DOC formats

    Parameters:
      content - The html content being exported
      filename - The name of the file to save as
  */
  doc(content, filename) {
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
      $(el).find('body').append(content);

      csts.libs.utils.blob('text/html', el.documentElement.outerHTML, filename);
    });
  },

  /*
    Method: pdf
    Exports reports in PDF formats

    Parameters:
      content - JSON Object containing data to export
      filename - The name of the file to save as
  */
  pdf(data, filename) {
    // eslint-disable-next-line
    const pdf = new jsPDF('l', 'pt', 'letter');
    pdf.autoTable(data.columns, data.rows, data.styles);
    pdf.save(filename);
  },
};

