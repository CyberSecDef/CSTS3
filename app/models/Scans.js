/*
  Namespace: csts.models.Scans
  This is the model for handling 'Scan' type functions
*/
csts.models.Scans = {
  /*
    Variables: Properties

    name - the name of the model
    compareFields - fields that can be compared
    rarFields - Mapping between fields and columns in a RAR spreadsheet
    poamFields - Mapping between fields and columns in a POAM spreadsheet
    workbooks - a container for any excel workbooks that are opened
  */
  name: 'Scans',
  compareFields: ['Mitigation', 'Comment', 'Description', 'Raw Risk', 'Residual Risk', 'Security Control', 'Source', 'Status'],
  rarFields: {
    Mitigation: 'J',
    Comment: 'N',
    Description: 'D',
    'Raw Risk': 'F',
    'Residual Risk': 'L',
    'Security Control': 'A',
    Source: 'B',
    Status: 'M',
    'Test Id': 'C',
    Likelihood: 'H',
  },
  poamFields: {
    Mitigation: 'G',
    Comment: 'O',
    Description: 'B',
    'Raw Risk': 'F',
    'Residual Risk': 'H',
    'Security Control': 'C',
    Source: 'M',
    Status: 'N',
  },
  workbooks: {},

  /*
    Namespace: csts.models.Scans.scans2poam
    This is the container for the functions that deal with the scans2poam module

    See Also:
    <csts.controllers.Scans.scans2poam>
  */
  scans2poam: {

  },
  /*
    Namespace: csts.models.scans.compareRarPoam
    This is the container for the functions that deal with the poam/rar comparison module

    See Also:
    <csts.controllers.Scans.compareRarPoam>
  */
  compareRarPoam: {

    /**
     * Section: Helper
     */

    /*
      Method: compareVals
      compares the value in a worksheet to the value submitted

      Parameters:
        workbook - the workbook being checked
        sheet - the sheet in a workbook being checked
        address - the address of the cell being checked
        val - the value being checked
    */
    compareVals(workbook, sheet, address, val) {
      if (!csts.models.Scans.workbooks[workbook].isBlank(sheet, address)) {
        return (
          csts.models.Scans.workbooks[workbook].Sheets[sheet][address].v.replace(/\s/g, '').toUpperCase()
            .indexOf(val.replace(/\s/g, '').toUpperCase()) >= 0
        );
      }
      return false;
    },

    /*
      Method: compareWorkbooks
      This method will compare the data between a rar and a poam and return the differences

      Parameters:
        rarTab - the tab in the rar workbook being checked
        poamTab - the tab in the poam workbook being checked
        fields - the fields being compared
    */
    compareWorkbooks(rarTab, poamTab, fields) {
      let rarRow = 0;
      let $items = [];
      let resRow = 0;

      rarRow = 8;
      while (rarRow < 3000 && (!csts.models.Scans.workbooks.rar.isBlank(rarTab, [`A${rarRow}`, `B${rarRow}`]))) {
        if (!csts.models.Scans.workbooks.rar.isBlank(rarTab, [`F${rarRow}`, `B${rarRow}`]) && csts.models.Scans.workbooks.rar.Sheets[rarTab][`F${rarRow}`].v !== 'IV') {
          const vulnId = csts.models.Scans.compareRarPoam.getVulnId('rar', rarTab, `C${rarRow}`);
          $items.push({
            row: rarRow,
            vulnId,
            control: csts.models.Scans.workbooks.rar.val(rarTab, `A${rarRow}`),
            source: csts.models.Scans.workbooks.rar.val(rarTab, `B${rarRow}`),
            testId: csts.models.Scans.workbooks.rar.val(rarTab, `C${rarRow}`),
            description: csts.models.Scans.workbooks.rar.val(rarTab, `D${rarRow}`),
            riskStatement: csts.models.Scans.workbooks.rar.val(rarTab, `E${rarRow}`),
            rawRisk: csts.models.Scans.workbooks.rar.val(rarTab, `F${rarRow}`),
            impact: csts.models.Scans.workbooks.rar.val(rarTab, `G${rarRow}`),
            likelihood: csts.models.Scans.workbooks.rar.val(rarTab, `H${rarRow}`),
            correctiveAction: csts.models.Scans.workbooks.rar.val(rarTab, `I${rarRow}`),
            mitigation: csts.models.Scans.workbooks.rar.val(rarTab, `J${rarRow}`),
            remediation: csts.models.Scans.workbooks.rar.val(rarTab, `K${rarRow}`),
            residualRisk: csts.models.Scans.workbooks.rar.val(rarTab, `L${rarRow}`),
            status: csts.models.Scans.workbooks.rar.val(rarTab, `M${rarRow}`),
            comment: csts.models.Scans.workbooks.rar.val(rarTab, `N${rarRow}`),
            devices: csts.models.Scans.workbooks.rar.val(rarTab, `O${rarRow}`),
          });
        }
        rarRow += 1;
      }

      // all rar foundings are found, time to search the poam
      $.each($items, (index, element) => {
        let poamRow = 8;
        let found = false;

        // loop through all the poam until blanks are recieved
        while (poamRow < 3000 && (!csts.models.Scans.workbooks.poam.isBlank(poamTab, [`B${poamRow}`, `L${poamRow}`, `N${poamRow}`, `O${poamRow}`]))) {
          if (this.compareVals('poam', poamTab, `B${poamRow}`, element.vulnId) || this.compareVals('poam', poamTab, `M${poamRow}`, element.vulnId)) {
            found = true;
            if (!this.compareVals('poam', poamTab, `N${poamRow}`, element.status) && $.grep(fields, n => n.value === 'Status').length > 0) {
              resRow += 1;
              csts.controllers.Scans.viewModels.compareRarPoam.push({
                rowId: resRow,
                guid: csts.libs.utils.getGuid(),
                vulnId: element.vulnId,
                type: 'Status',
                mismatch: 'STATUS',
                rarRow: element.row,
                rarVal: element.status,
                poamRow,
                poamVal: csts.models.Scans.workbooks.poam.val(poamTab, `N${poamRow}`),
              });
            }

            if (!this.compareVals('poam', poamTab, `C${poamRow}`, element.control) && $.grep(fields, n => n.value === 'Security Controls').length > 0) {
              resRow += 1;
              csts.controllers.Scans.viewModels.compareRarPoam.push({
                rowId: resRow,
                guid: csts.libs.utils.getGuid(),
                vulnId: element.vulnId,
                type: 'Security Controls',
                mismatch: 'CONTROL',
                rarRow: element.row,
                rarVal: element.control,
                poamRow,
                poamVal: csts.models.Scans.workbooks.poam.val(poamTab, `C${poamRow}`),
              });
            }

            if (!this.compareVals('poam', poamTab, `M${poamRow}`, element.source) && $.grep(fields, n => n.value === 'Source').length > 0) {
              resRow += 1;
              csts.controllers.Scans.viewModels.compareRarPoam.push({
                rowId: resRow,
                guid: csts.libs.utils.getGuid(),
                vulnId: element.vulnId,
                type: 'Source',
                mismatch: 'SOURCE',
                rarRow: element.row,
                rarVal: element.source,
                poamRow,
                poamVal: csts.models.Scans.workbooks.poam.val(poamTab, `M${poamRow}`),
              });
            }

            if (!this.compareVals('poam', poamTab, `F${poamRow}`, element.rawRisk) &&
            element.rawRisk.toUpperCase().replace('CAT', '') !== csts.models.Scans.workbooks.poam.val(poamTab, `F${poamRow}`) &&
              $.grep(fields, n => n.value === 'Raw Risk').length > 0
            ) {
              resRow += 1;
              csts.controllers.Scans.viewModels.compareRarPoam.push({
                rowId: resRow,
                guid: csts.libs.utils.getGuid(),
                vulnId: element.vulnId,
                type: 'Raw Risk',
                mismatch: 'RAWRISK',
                rarRow: element.row,
                rarVal: element.rawRisk,
                poamRow,
                poamVal: csts.models.Scans.workbooks.poam.val(poamTab, `F${poamRow}`),
              });
            }

            if (!this.compareVals('poam', poamTab, `H${poamRow}`, element.residualRisk) &&
            element.residualRisk.toUpperCase().replace('CAT', '') !== csts.models.Scans.workbooks.poam.val(poamTab, `H${poamRow}`) &&
              $.grep(fields, n => n.value === 'Residual Risk').length > 0
            ) {
              resRow += 1;
              csts.controllers.Scans.viewModels.compareRarPoam.push({
                rowId: resRow,
                guid: csts.libs.utils.getGuid(),
                vulnId: element.vulnId,
                type: 'Residual Risk',
                mismatch: 'RESIDUALRISK',
                rarRow: element.row,
                rarVal: element.residualRisk,
                poamRow,
                poamVal: csts.models.Scans.workbooks.poam.val(poamTab, `H${poamRow}`),
              });
            }

            if (
              (!this.compareVals('poam', poamTab, `B${poamRow}`, element.description) &&
                ([$.trim(element.vulnId), ' - ', $.trim(element.description)].join()).toUpperCase() !== $.trim(csts.models.Scans.workbooks.poam.val(poamTab, `B${poamRow}`)).toUpperCase() &&
                (['(', $.trim(element.vulnId), ')', ' - ', $.trim(element.description)].join()).toUpperCase() !== $.trim(csts.models.Scans.workbooks.poam.val(poamTab, `B${poamRow}`)).toUpperCase() &&
                $.trim(csts.models.Scans.workbooks.poam.val(poamTab, `B${poamRow}`).toUpperCase()).replace(/\W/g, '').indexOf(element.description.toUpperCase().replace(/\W/g, '')) === -1
              ) &&
              $.grep(fields, n => n.value === 'Residual Risk').length > 0
            ) {
              resRow += 1;
              csts.controllers.Scans.viewModels.compareRarPoam.push({
                rowId: resRow,
                guid: csts.libs.utils.getGuid(),
                vulnId: element.vulnId,
                type: 'Description',
                mismatch: 'DESCRIPTION',
                rarRow: element.row,
                rarVal: element.description,
                poamRow,
                poamVal: csts.models.Scans.workbooks.poam.val(poamTab, `B${poamRow}`),
              });
            }

            if (
              (!this.compareVals('poam', poamTab, `G${poamRow}`, element.mitigation) &&
                (csts.models.Scans.workbooks.poam.val(poamTab, `G${poamRow}`).toUpperCase()).replace(/\W/g, '').indexOf(element.mitigation.toUpperCase().replace(/\W/g, '')) === -1
              ) &&
              $.grep(fields, n => n.value === 'Mitigations').length > 0
            ) {
              resRow += 1;
              csts.controllers.Scans.viewModels.compareRarPoam.push({
                rowId: resRow,
                guid: csts.libs.utils.getGuid(),
                vulnId: element.vulnId,
                type: 'Mitigation',
                mismatch: 'MITIGATION',
                rarRow: element.row,
                rarVal: element.mitigation,
                poamRow,
                poamVal: csts.models.Scans.workbooks.poam.val(poamTab, `G${poamRow}`),
              });
            }

            if (
              (!this.compareVals('poam', poamTab, `O${poamRow}`, element.comment) &&
                (csts.models.Scans.workbooks.poam.val(poamTab, `O${poamRow}`).toUpperCase()).replace(/\W/g, '').indexOf(element.comment.toUpperCase().replace(/\W/g, '')) === -1
              ) &&
              $.grep(fields, n => n.value === 'Comments').length > 0
            ) {
              resRow += 1;
              csts.controllers.Scans.viewModels.compareRarPoam.push({
                rowId: resRow,
                guid: csts.libs.utils.getGuid(),
                vulnId: element.vulnId,
                type: 'Comment',
                mismatch: 'COMMENT',
                rarRow: element.row,
                rarVal: element.comment,
                poamRow,
                poamVal: csts.models.Scans.workbooks.poam.val(poamTab, `O${poamRow}`),
              });
            }
          }
          poamRow += 1;
        }
        if (!found) {
          if (element.status !== 'Completed') {
            resRow += 1;
            csts.controllers.Scans.viewModels.compareRarPoam.push({
              rowId: resRow,
              guid: csts.libs.utils.getGuid(),
              vulnId: element.vulnId,
              type: 'Missing from POAM',
              mismatch: 'POAM',
              rarRow: element.row,
              rarVal: element.description,
              poamRow: '',
              poamVal: '',
            });
          }
        }
      });

      // see if anything is in the POAM, but not in the rar
      $items = [];
      let poamRow = 8;
      while (poamRow < 3000 && !csts.models.Scans.workbooks.poam.isBlank(poamTab, [`B${poamRow}`, `N${poamRow}`])) {
        if (csts.models.Scans.workbooks.poam.val(poamTab, `F${poamRow}`) !== 'IV') {
          const vulnId = csts.models.Scans.compareRarPoam.getVulnId('poam', poamTab, `M${poamRow}`);

          $items.push({
            row: poamRow,
            vulnId,
            description: csts.models.Scans.workbooks.poam.val(poamTab, `B${poamRow}`),
            control: csts.models.Scans.workbooks.poam.val(poamTab, `C${poamRow}`),
            source: csts.models.Scans.workbooks.poam.val(poamTab, `M${poamRow}`),
            testId: csts.models.Scans.workbooks.poam.val(poamTab, `M${poamRow}`),
            rawRisk: csts.models.Scans.workbooks.poam.val(poamTab, `F${poamRow}`),
            mitigation: csts.models.Scans.workbooks.poam.val(poamTab, `H${poamRow}`),
            status: csts.models.Scans.workbooks.poam.val(poamTab, `N${poamRow}`),
            comment: csts.models.Scans.workbooks.poam.val(poamTab, `O${poamRow}`),
          });
        }
        poamRow += 1;
      }

      $.each($items, (index, element) => {
        rarRow = 8;
        let found = false;

        while (rarRow < 3000 && !csts.models.Scans.workbooks.poam.isBlank(poamTab, [`B${rarRow}`, `C${rarRow}`, `F${rarRow}`, `M${rarRow}`, `N${rarRow}`])) {
          if (!this.compareVals('rar', rarTab, `C${rarRow}`, element.vulnId)) {
            found = true;
          }
          rarRow += 1;
        }

        if (!found) {
          if (element.status !== 'Completed') {
            resRow += 1;
            csts.controllers.Scans.viewModels.compareRarPoam.push({
              rowId: resRow,
              guid: csts.libs.utils.getGuid(),
              vulnId: element.vulnId,
              type: 'Missing from RAR',
              mismatch: 'RAR',
              rarRow: '',
              rarVal: '',
              poamRow: element.row,
              poamVal: element.description,
            });
          }
        }
      });
    },

    /*
      Method: getVulnId
      parses a cell and returns the vulnerability id

      Parameters:
        workbook - the workbook being checked
        sheet - the sheet in a workbook being checked
        address - the address of the cell being checked
    */
    getVulnId(workbook, sheet, address) {
      let vulnId = '';
      if (!csts.models.Scans.workbooks[workbook].isBlank(sheet, address)) {
        vulnId = csts.models.Scans.workbooks[workbook].Sheets[sheet][address].v;
        if (vulnId.indexOf('Vuln ID:') >= 0) {
          const temp = vulnId.split('\n');
          $.each(temp, (index, item) => {
            const i = item.split(':');
            if ($.trim(i[0]) === 'Vuln ID' && $.trim(i[1]) !== '') {
              vulnId = $.trim(i[1]);
            }
            if ($.trim(i[0]) === 'Plugin ID' && $.trim(i[1]) !== '') {
              vulnId = $.trim(i[1]);
            }
          });
        }
      }
      return vulnId;
    },

    /*
      Method: parseFile
      gets the filesystem statistics for the submitted file pathname

      Parameters:
        file - The file path being checked
    */
    parseFile(file) {
      return csts.plugins.fs.statSync(file);
    },
  },
};

