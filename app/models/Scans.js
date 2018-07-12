/*
  Namespace: Models.Scans

  Description:
    This is the model for handling 'Scan' type functions

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
    Model

  Package:
    CSTSv3

  Author:
    Robert Weber <wwwdaze2000@gmail.com>

  Copyright:
    2018 - RFW
*/
csts.models.Scans = {
  /*
    Variables: Properties

    name - the name of the model
    workbooks - a container for any excel workbooks that are opened
  */
  name: 'Scans',
  workbooks: {},

  /*
    Class: Models.Scans.scans2poam
    This is the container for the functions that deal with the scans2poam module

    See Also:
    <Controllers.Scans.scans2poam>
  */
  scans2poam: {
    /**
     * Variables: Applet Variables
     * scans - the findings from the various SCAP, ACAS and CKL scans
    */
    scans: {
      scap: [],
      acas: [],
      ckl: [],
    },
    mitigations: JSON.parse(csts.plugins.fs.readFileSync('app/database/mitigations.db')),
    /*
      Method: getSummary

      Description:
        This method builds the 'summary' export data
    */
    getSummary() {
      const summary = [];
      csts.plugins.jsonQuery('acas[*]', { data: this.scans }).value.forEach((scanItem) => {
        csts.plugins.jsonQuery('hosts[*]', { data: scanItem }).value.forEach((hostItem) => {
          summary.push({
            Type: 'ACAS',
            Hosts: typeof hostItem.hostname === 'object' ? hostItem.hostname[0] : hostItem.hostname,
            'Operating System': hostItem.os,
            'Scan File Name': csts.plugins.path.basename(scanItem.scanFile),
            'Cat 1': hostItem.openFindings.cat1,
            'Cat 2': hostItem.openFindings.cat2,
            'Cat 3': hostItem.openFindings.cat3,
            'Cat 4': hostItem.openFindings.cat4,
            Total: hostItem.openFindings.cat1 +
              hostItem.openFindings.cat2 +
              hostItem.openFindings.cat3 +
              hostItem.openFindings.cat4,
            Score: (10 * hostItem.openFindings.cat1) +
              (3 * hostItem.openFindings.cat2) +
              hostItem.openFindings.cat3,
            'Credentialed Scan': hostItem.credentialed,
          });
        });
      });

      csts.plugins.jsonQuery('scap[*]', { data: this.scans }).value.forEach((scanItem) => {
        summary.push({
          Type: 'SCAP',
          Hosts: typeof scanItem.hostname === 'object' ? scanItem.hostname[0] : scanItem.hostname,
          'Operating System': '',
          'Scan File Name': csts.plugins.path.basename(scanItem.scanFile),
          'Cat 1': scanItem.openFindings.cat1,
          'Cat 2': scanItem.openFindings.cat2,
          'Cat 3': scanItem.openFindings.cat3,
          'Cat 4': 0,
          Total: scanItem.openFindings.cat1 +
          scanItem.openFindings.cat2 +
            scanItem.openFindings.cat3,
          Score: (10 * scanItem.openFindings.cat1) +
            (3 * scanItem.openFindings.cat2) +
            scanItem.openFindings.cat3,
          'Credentialed Scan': scanItem.credentialed,
        });
      });

      csts.plugins.jsonQuery('ckl[*]', { data: this.scans }).value.forEach((scanItem) => {
        summary.push({
          Type: 'CKL',
          Hosts: typeof scanItem.hostname === 'object' ? scanItem.hostname[0] : scanItem.hostname,
          'Operating System': '',
          'Scan File Name': csts.plugins.path.basename(scanItem.scanFile),
          'Cat 1': scanItem.openFindings.cat1,
          'Cat 2': scanItem.openFindings.cat2,
          'Cat 3': scanItem.openFindings.cat3,
          'Cat 4': 0,
          Total: scanItem.openFindings.cat1 +
          scanItem.openFindings.cat2 +
            scanItem.openFindings.cat3,
          Score: (10 * scanItem.openFindings.cat1) +
            (3 * scanItem.openFindings.cat2) +
            scanItem.openFindings.cat3,
          'Credentialed Scan': scanItem.credentialed,
        });
      });
      
      return summary.sort((a, b) => { return (a.Type.toLowerCase() > b.Type.toLowerCase() ? 1 : b.Type.toLowerCase() > a.Type.toLowerCase() ? -1 : ( a.Hosts.toLowerCase() > b.Hosts.toLowerCase() ? 1 : -1 )  )});
    },

    /*
      Method: getTestPlan

      Description:
        returns the testplan data for the export report
    */
    getTestPlan() {
      const testPlan = [];

      csts.plugins.jsonQuery('acas[*]', { data: this.scans }).value.forEach((scanItem) => {
        testPlan.push({
          Title: 'Assured Compliance Assessment Solution (ACAS): Nessus Scanner',
          Version: scanItem.hosts[0].scanEngine,
          Hosts: scanItem.hosts.map(host => host.hostname).sort().join(', '),
          'Scan File Name': csts.plugins.path.basename(scanItem.scanFile),
          Dates: scanItem.hosts[0].scanDate,
        });
      });

      this.scans.scap.map(e => `${e.title} - V${e.version}R${e.release}`).sort().filter((value, index, self) => self.indexOf(value) === index).forEach((scapScan) => {
        const results = {};

        const hosts = [];
        const dates = [];
        this.scans.scap.filter(e => scapScan === `${e.title} - V${e.version}R${e.release}`).forEach((scapResult) => {
          results.Title = `Security Content Automation Protocol (SCAP): ${scapResult.title}`;
          results.Version = `V${scapResult.version}R${scapResult.release}`;
          hosts.push(scapResult.hostname);
          dates.push(csts.plugins.moment(scapResult.scanDate, 'MM/DD/YYYY HH:mm'));
        });

        results.Hosts = hosts.sort().filter((value, index, self) => self.indexOf(value) === index).join(', ');
        results['Scan File Name'] = '';

        const start = csts.plugins.moment((Math.min.apply(null, dates))).format('MM/DD/YYYY HH:mm');
        const end = csts.plugins.moment((Math.max.apply(null, dates))).format('MM/DD/YYYY HH:mm');
        results.Dates = `${start} - ${end}`;

        testPlan.push(results);
      });

      this.scans.ckl.sort((a, b) => a.title > b.title ? 1 : b.title > a.title ? -1 : 0)
        .forEach((cklScan) => {
          const results = {
            Title: `Security Technical Implementation Guideline (STIG): ${cklScan.title}`,
            Version: `V${cklScan.version}R${cklScan.release}`,
            Hosts: cklScan.hostname,
            'Scan File Name': cklScan.scanFile,
            Dates: cklScan.scanDate,
          };
          testPlan.push(results);
        });

      return testPlan;
    },


    /*
      Method: getIssues

      Description:
        returns the Issues tab for the export report
    */
    getIssues() {
      const results = [];

      csts.models.Scans.scans2poam.scans.scap.forEach((scap) => {
        scap.requirements.filter(s => s.status !== 'Completed').forEach((r) => {
          if (csts.models.Scans.scans2poam.scans.ckl.filter(stig => 
            stig.id
              .replace(/ /ig, '_')
              .replace(/STIG/ig, '')
              .replace(/Security_Technical_Implementation_Guide/ig, '')
              .replace(/xccdf_mil\.disa/ig, '')
              .replace(/benchmark/ig, '')
              .replace(/ /ig, '_')
              .replace(/__/ig, '_')
              .replace(/\./ig, '')
              .replace(/_$/ig, '')
              .replace(/^_/ig, '')
              .toLowerCase()
          === scap.id
            .replace(/ /ig, '_')
            .replace(/STIG/ig, '')
            .replace(/Security_Technical_Implementation_Guide/ig, '')
            .replace(/xccdf_mil\.disa/ig, '')
            .replace(/benchmark/ig, '')
            .replace(/ /ig, '_')
            .replace(/__/ig, '_')
            .replace(/\./ig, '')
            .replace(/_$/ig, '')
            .replace(/^_/ig, '')
            .toLowerCase()).length > 0) {
            csts.models.Scans.scans2poam.scans.ckl.filter(stig => stig.id === scap.id).forEach((c) => {
              if (r.status !== c.requirements.filter(cr => cr.vulnId === r.vulnId).map(cr => cr.status).join(', ')) {
                results.push({
                  Title: scap.title,
                  Hosts: csts.models.Scans.scans2poam.scans.scap.filter(s => s.id === scap.id && s.requirements.filter(srf => srf.status !== 'Completed').length > 0)
                    .map(h => h.hostname)
                    .sort()
                    .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                    .join(', '),
                  Vulnerability: r.title,
                  Version: scap.version,
                  Release: scap.release,
                  grpId: r.grpId,
                  vulnId: r.vulnId,
                  ruleId: r.ruleId,
                  'SCAP Status': r.status,
                  'CKL Status': c.requirements
                    .filter(cr => cr.vulnId === r.vulnId)
                    .map(cr => cr.status).join(', '),
                  'Finding Details': r.findingDetails,
                  Comments: c.requirements
                    .filter(cr => cr.vulnId === r.vulnId)
                    .map(cr => cr.comments)
                    .join(', '),
                });
              }
            });
          } else {
            results.push({
              Title: scap.title,
              Hosts: csts.models.Scans.scans2poam.scans.scap.filter(s => s.id === scap.id && s.requirements.filter(srf => srf.status !== 'Completed').length > 0)
                .map(h => h.hostname)
                .sort()
                .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                .join(', '),
              Vulnerability: r.title,
              Version: scap.version,
              Release: scap.release,
              grpId: r.grpId,
              vulnId: r.vulnId,
              ruleId: r.ruleId,
              'SCAP Status': r.status,
              'CKL Status': 'Not Executed',
              'Finding Details': r.findingDetails,
              Comments: '',
            });
          }
        });
      });
      return results;
    },

    /*
      Method: getRawData

      Description:
        Generates the Raw Data tab
    */
    getRawData() {
      const results = [];
      csts.models.Scans.scans2poam.scans.scap.forEach((scap) => {
        scap.requirements.forEach((req) => {
          results.push({
            'Scan Type': scap.scanType.toUpperCase(),
            'Scan Title': scap.title,
            Filename: scap.scanFile,
            'Scan Date': scap.scanDate,
            Version: scap.version,
            Release: scap.release,
            Credentialed: scap.credentialed,
            Hostname: scap.hostname,

            grpId: req.grpId,
            vulnId: req.vulnId,
            ruleId: req.ruleId,
            pluginId: req.pluginId,

            'IA Controls': typeof req.iaControls === 'object' ? req.iaControls.join(', ').trim() : req.iaControls,
            CCI: typeof req.cci === 'object' ? req.cci.join(', ').trim() : req.cci,
            Title: req.title,
            Severity: req.severity,
            Status: req.status,
            'Finding Details': req.findingDetails,

            Description: req.description,
            Solution: req.solution,
            fixId: req.fixId,
            References: req.references,
            Resources: req.resources,

            Comments: req.comments,
          });
        });
      });

      csts.models.Scans.scans2poam.scans.ckl.forEach((ckl) => {
        ckl.requirements.forEach((req) => {
          results.push({
            'Scan Type': ckl.scanType.toUpperCase(),
            'Scan Title': ckl.title,
            Filename: ckl.scanFile,
            'Scan Date': ckl.scanDate,
            Version: ckl.version,
            Release: ckl.release,
            Credentialed: ckl.credentialed,
            Hostname: ckl.hostname,

            grpId: req.grpId,
            vulnId: req.vulnId,
            ruleId: req.ruleId,
            pluginId: req.pluginId,

            'IA Controls': typeof req.iaControls === 'object' ? req.iaControls.join(', ').trim() : req.iaControls,
            CCI: typeof req.cci === 'object' ? req.cci.join(', ').trim() : req.cci,
            Title: req.title,
            Severity: req.severity,
            Status: req.status,
            'Finding Details': req.findingDetails,

            Description: req.description,
            Solution: req.solution,
            fixId: req.fixId,
            References: req.references,
            Resources: req.resources,

            Comments: req.comments,
          });
        });
      });

      csts.models.Scans.scans2poam.scans.acas.forEach((acas) => {
        acas.hosts.forEach((host) => {
          host.requirements.forEach((req) => {
            results.push({
              'Scan Type': acas.scanType.toUpperCase(),
              'Scan Title': 'Assured Compliance Assessment Solution',
              Filename: acas.scanFile,

              Release: '',
              Credentialed: host.credentialed,
              Hostname: host.hostname,
              Version: host.scanEngine,
              'Scan Date': host.scanDate,

              grpId: req.grpId,
              vulnId: req.vulnId,
              ruleId: req.ruleId,
              pluginId: req.pluginId,

              'IA Controls': typeof req.iaControls === 'object' ? req.iaControls.join(', ').trim() : req.iaControls,
              CCI: typeof req.cci === 'object' ? req.cci.join(', ').trim() : req.cci,
              Title: req.title,
              Severity: req.severity,
              Status: req.status,
              'Finding Details': req.findingDetails,

              Description: req.description,
              Solution: req.solution,
              fixId: req.fixId,
              References: req.references,
              Resources: req.resources,
              Comments: req.comments,
            });
          });
        });
      });

      return results;
    },

    /*
      Method: getRar

      Description:
        Generates the RAR tab
    */
    getRar() {
      
      const results = [];
      csts.plugins.jsonQuery('acas[*].hosts[*].requirements[*].pluginId', { data: csts.models.Scans.scans2poam.scans }).value.sort().filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; }).forEach((element) => {
        const acasPlugin = csts.plugins.jsonQuery(`acas[*].hosts[*].requirements[pluginId = ${element}`, { data: csts.models.Scans.scans2poam.scans }).value;

        const m = csts.models.Scans.scans2poam.mitigations.find(i => i.plugin === element);
        const mitigation = typeof m !== 'undefined' ? m.mitigation : '';

        results.push({
          'Non-Compliant Security Controls (16a)': '',
          'Affected CCI (16a.1)': '',
          'Source of Discovery(16a.2)': 'Assured Compliance Assessment Solution (ACAS): Nessus Scanner',
          'Vulnerability ID(16a.3)': `Group ID: ${acasPlugin.grpId}
Vuln ID:
Rule ID:
Plugin ID: ${element}`,
          'Vulnerability Description (16.b)': acasPlugin.title,
          'Devices Affected (16b.1)': csts.plugins.jsonQuery("acas[*].hosts[*hostname!='']", { data: csts.models.Scans.scans2poam.scans }).value
            .filter(host => host.requirements.filter(req => req.pluginId === element).length)
            .map(h => h.hostname).sort().join(', '),
          'Security Objectives (C-I-A) (16c)': '',
          'Raw Test Result (16d)': this.getRiskVal(acasPlugin.severity, 'CAT'),
          'Predisposing Condition(s) (16d.1)': '',
          'Technical Mitigation(s) (16d.2)': mitigation,
          'Severity or Pervasiveness (VL-VH) (16d.3)': this.getRiskVal(acasPlugin.severity, 'VL-VH'),
          'Relevance of Threat (VL-VH) (16e)': this.getRiskVal(acasPlugin.severity, 'VL-VH'),
          'Threat Description (16e.1)': acasPlugin.description,
          'Likelihood (Cells 16d.3 & 16e) (VL-VH) (16f)': this.getRiskVal(acasPlugin.severity, 'VL-VH'),
          'Impact (VL-VH) (16g)': this.getRiskVal(acasPlugin.severity, 'VL-VH'),
          'Impact Description (16h)': '',
          'Risk (Cells 16f & 16g) (VL-VH) (16i)': this.getRiskVal(acasPlugin.severity, 'VL-VH'),
          'Proposed Mitigations (From POA&M) (16j)': '',
          'Residual Risk (After Proposed Mitigations) (16k)': '',
          Status: 'Ongoing',
          'Recommendations (16l)': acasPlugin.solution,
          Comments: acasPlugin.comments,
          // pluginId: element,
        });
      });

      // unique list of requirements for scap and ckl
      const ckls = csts.plugins.jsonQuery('ckl[*].requirements[*status!=Completed & status!=Not_Applicable].vulnId', { data: csts.models.Scans.scans2poam.scans }).value.sort().filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; });
      const scaps = csts.plugins.jsonQuery('scap[*].requirements[*status!=Completed & status!=Not Applicable].vulnId', { data: csts.models.Scans.scans2poam.scans }).value.sort().filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; });
      // ckl and scap
      ckls.filter(e => scaps.includes(e)).concat(scaps.filter(e => ckls.includes(e))).sort()
        .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
        .forEach((element) => {
          const cklReq = csts.plugins.jsonQuery(`ckl[*].requirements[vulnId=${element}]`, { data: csts.models.Scans.scans2poam.scans }).value;

          const m = csts.models.Scans.scans2poam.mitigations.find(i => i.vuln === cklReq.vulnId);
          const mitigation = typeof m !== 'undefined' ? m.mitigation : '';

          
          if (cklReq.cci.length > 1 && $('#split-CCI').prop('checked') ) {
            cklReq.cci.filter(cci => cci.toLowerCase().indexOf('cce') === -1).forEach((cci) => {
              results.push({
                'Non-Compliant Security Controls (16a)': typeof cklReq.iaControls === 'object' ? cklReq.iaControls.join(', ') : cklReq.iaControls,
                'Affected CCI (16a.1)': cci,
                'Source of Discovery(16a.2)': `SCAP/STIG: ${csts.models.Scans.scans2poam.scans.scap
                  .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                  .map(h => h.title)
                  .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.title))
                  .sort()
                  .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                  .join(', ')}`,
                'Vulnerability ID(16a.3)': `Group ID: ${cklReq.grpId}
Vuln ID: ${cklReq.vulnId}
Rule ID: ${cklReq.ruleId}
Plugin ID: `,
                'Vulnerability Description (16.b)': cklReq.description,
                'Devices Affected (16b.1)': csts.models.Scans.scans2poam.scans.scap
                  .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                  .map(h => h.hostname)
                  .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.hostname))
                  .sort()
                  .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                  .filter((el, i, a) => { if (el.trim() !== '') return 1; return 0; })
                  .join(', '),
                'Security Objectives (C-I-A) (16c)': '',
                'Raw Test Result (16d)': this.getRiskVal(cklReq.severity, 'CAT'),
                'Predisposing Condition(s) (16d.1)': '',
                'Technical Mitigation(s) (16d.2)': mitigation,
                'Severity or Pervasiveness (VL-VH) (16d.3)': this.getRiskVal(cklReq.severity, 'VL-VH'),
                'Relevance of Threat (VL-VH) (16e)': this.getRiskVal(cklReq.severity, 'VL-VH'),
                'Threat Description (16e.1)': cklReq.description,
                'Likelihood (Cells 16d.3 & 16e) (VL-VH) (16f)': this.getRiskVal(cklReq.severity, 'VL-VH'),
                'Impact (VL-VH) (16g)': this.getRiskVal(cklReq.severity, 'VL-VH'),
                'Impact Description (16h)': '',
                'Risk (Cells 16f & 16g) (VL-VH) (16i)': this.getRiskVal(cklReq.severity, 'VL-VH'),
                'Proposed Mitigations (From POA&M) (16j)': '',
                'Residual Risk (After Proposed Mitigations) (16k)': '',
                Status: cklReq.status,
                'Recommendations (16l)': cklReq.solution,
                Comments: `${cklReq.comments} ${cklReq.findingDetails}`,
                // pluginId: '',
              });
            });

          } else {
            results.push({
              'Non-Compliant Security Controls (16a)': typeof cklReq.iaControls === 'object' ? cklReq.iaControls.join(', ') : cklReq.iaControls,
              'Affected CCI (16a.1)': cklReq.cci.join(', '),
              'Source of Discovery(16a.2)': `SCAP/STIG: ${csts.models.Scans.scans2poam.scans.scap
                .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                .map(h => h.title)
                .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.title))
                .sort()
                .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                .join(', ')}`,
              'Vulnerability ID(16a.3)': `Group ID: ${cklReq.grpId}
Vuln ID: ${cklReq.vulnId}
Rule ID: ${cklReq.ruleId}
Plugin ID: `,
              'Vulnerability Description (16.b)': cklReq.description,
              'Devices Affected (16b.1)': csts.models.Scans.scans2poam.scans.scap
                .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                .map(h => h.hostname)
                .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.hostname))
                .sort()
                .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                .filter((el, i, a) => { if (el.trim() !== '') return 1; return 0; })
                .join(', '),
              'Security Objectives (C-I-A) (16c)': '',
              'Raw Test Result (16d)': this.getRiskVal(cklReq.severity, 'CAT'),
              'Predisposing Condition(s) (16d.1)': '',
              'Technical Mitigation(s) (16d.2)': mitigation,
              'Severity or Pervasiveness (VL-VH) (16d.3)': this.getRiskVal(cklReq.severity, 'VL-VH'),
              'Relevance of Threat (VL-VH) (16e)': this.getRiskVal(cklReq.severity, 'VL-VH'),
              'Threat Description (16e.1)': cklReq.description,
              'Likelihood (Cells 16d.3 & 16e) (VL-VH) (16f)': this.getRiskVal(cklReq.severity, 'VL-VH'),
              'Impact (VL-VH) (16g)': this.getRiskVal(cklReq.severity, 'VL-VH'),
              'Impact Description (16h)': '',
              'Risk (Cells 16f & 16g) (VL-VH) (16i)': this.getRiskVal(cklReq.severity, 'VL-VH'),
              'Proposed Mitigations (From POA&M) (16j)': '',
              'Residual Risk (After Proposed Mitigations) (16k)': '',
              Status: cklReq.status,
              'Recommendations (16l)': cklReq.solution,
              Comments: `${cklReq.comments} ${cklReq.findingDetails}`,
              // pluginId: '',
            });
          }
        });

      // just ckl
      ckls.filter(e => !scaps.includes(e)).sort()
        .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; }).forEach((element) => {
          const cklReq = csts.plugins.jsonQuery(`ckl[*].requirements[vulnId=${element}]`, { data: csts.models.Scans.scans2poam.scans }).value;

          const m = csts.models.Scans.scans2poam.mitigations.find(i => i.vuln === cklReq.vulnId);
          const mitigation = typeof m !== 'undefined' ? m.mitigation : '';

          if (cklReq.cci.length > 1 && $('#split-CCI').prop('checked')) {
            cklReq.cci.filter(cci => cci.toLowerCase().indexOf('cce') === -1).forEach((cci) => {
              results.push({
                'Non-Compliant Security Controls (16a)': typeof cklReq.iaControls === 'object' ? cklReq.iaControls.join(', ') : cklReq.iaControls,
                'Affected CCI (16a.1)': cci,
                'Source of Discovery(16a.2)': `STIG: ${csts.models.Scans.scans2poam.scans.ckl
                  .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                  .map(h => h.title)
                  .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.title))
                  .sort()
                  .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                  .join(', ')}`,
                'Vulnerability ID(16a.3)': `Group ID: ${cklReq.grpId}
Vuln ID: ${cklReq.vulnId}
Rule ID: ${cklReq.ruleId}
Plugin ID: `,
                'Vulnerability Description (16.b)': cklReq.description,
                'Devices Affected (16b.1)': csts.models.Scans.scans2poam.scans.scap
                  .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                  .map(h => h.hostname)
                  .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.hostname))
                  .sort()
                  .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                  .filter((el, i, a) => { if (el.trim() !== '') return 1; return 0; })
                  .join(', '),
                'Security Objectives (C-I-A) (16c)': '',
                'Raw Test Result (16d)': this.getRiskVal(cklReq.severity, 'CAT'),
                'Predisposing Condition(s) (16d.1)': '',
                'Technical Mitigation(s) (16d.2)': mitigation,
                'Severity or Pervasiveness (VL-VH) (16d.3)': this.getRiskVal(cklReq.severity, 'VL-VH'),
                'Relevance of Threat (VL-VH) (16e)': this.getRiskVal(cklReq.severity, 'VL-VH'),
                'Threat Description (16e.1)': cklReq.description,
                'Likelihood (Cells 16d.3 & 16e) (VL-VH) (16f)': this.getRiskVal(cklReq.severity, 'VL-VH'),
                'Impact (VL-VH) (16g)': this.getRiskVal(cklReq.severity, 'VL-VH'),
                'Impact Description (16h)': '',
                'Risk (Cells 16f & 16g) (VL-VH) (16i)': this.getRiskVal(cklReq.severity, 'VL-VH'),
                'Proposed Mitigations (From POA&M) (16j)': '',
                'Residual Risk (After Proposed Mitigations) (16k)': '',
                Status: cklReq.status,
                'Recommendations (16l)': cklReq.solution,
                Comments: `${cklReq.comments} ${cklReq.findingDetails}`,
                // pluginId: '',
              });
            })
          } else {
            results.push({
              'Non-Compliant Security Controls (16a)': typeof cklReq.iaControls === 'object' ? cklReq.iaControls.join(', ') : cklReq.iaControls,
              'Affected CCI (16a.1)': cklReq.cci.join(', '),
              'Source of Discovery(16a.2)': `STIG: ${csts.models.Scans.scans2poam.scans.ckl
                .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                .map(h => h.title)
                .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.title))
                .sort()
                .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                .join(', ')}`,
              'Vulnerability ID(16a.3)': `Group ID: ${cklReq.grpId}
Vuln ID: ${cklReq.vulnId}
Rule ID: ${cklReq.ruleId}
Plugin ID: `,
              'Vulnerability Description (16.b)': cklReq.description,
              'Devices Affected (16b.1)': csts.models.Scans.scans2poam.scans.scap
                .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                .map(h => h.hostname)
                .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.hostname))
                .sort()
                .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                .filter((el, i, a) => { if (el.trim() !== '') return 1; return 0; })
                .join(', '),
              'Security Objectives (C-I-A) (16c)': '',
              'Raw Test Result (16d)': this.getRiskVal(cklReq.severity, 'CAT'),
              'Predisposing Condition(s) (16d.1)': '',
              'Technical Mitigation(s) (16d.2)': mitigation,
              'Severity or Pervasiveness (VL-VH) (16d.3)': this.getRiskVal(cklReq.severity, 'VL-VH'),
              'Relevance of Threat (VL-VH) (16e)': this.getRiskVal(cklReq.severity, 'VL-VH'),
              'Threat Description (16e.1)': cklReq.description,
              'Likelihood (Cells 16d.3 & 16e) (VL-VH) (16f)': this.getRiskVal(cklReq.severity, 'VL-VH'),
              'Impact (VL-VH) (16g)': this.getRiskVal(cklReq.severity, 'VL-VH'),
              'Impact Description (16h)': '',
              'Risk (Cells 16f & 16g) (VL-VH) (16i)': this.getRiskVal(cklReq.severity, 'VL-VH'),
              'Proposed Mitigations (From POA&M) (16j)': '',
              'Residual Risk (After Proposed Mitigations) (16k)': '',
              Status: cklReq.status,
              'Recommendations (16l)': cklReq.solution,
              Comments: `${cklReq.comments} ${cklReq.findingDetails}`,
              // pluginId: '',
            });
          }
        });

      // just scap (this should be impossible if SCAP and STIG is done properly)
      scaps.filter(e => !ckls.includes(e)).sort()
        .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; }).forEach((element) => {
          const scapReq = csts.plugins.jsonQuery(`scap[*].requirements[vulnId=${element}]`, { data: csts.models.Scans.scans2poam.scans }).value;

          const m = csts.models.Scans.scans2poam.mitigations.find(i => i.vuln === scapReq.vulnId);
          const mitigation = typeof m !== 'undefined' ? m.mitigation : '';
          if (scapReq.cci.length > 1 && $('#split-CCI').prop('checked')) {
            scapReq.cci.filter(cci => cci.toLowerCase().indexOf('cce') === -1).forEach((cci) => {
              results.push({
                'Non-Compliant Security Controls (16a)': typeof scapReq.iaControls === 'object' ? scapReq.iaControls.join(', ') : scapReq.iaControls,
                'Affected CCI (16a.1)': cci,
                'Source of Discovery(16a.2)': `SCAP: ${csts.models.Scans.scans2poam.scans.scap
                  .filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0)
                  .map(h => h.title)
                  .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.title))
                  .sort()
                  .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                  .join(', ')}`,
                'Vulnerability ID(16a.3)': `Group ID: ${scapReq.grpId}
Vuln ID: ${scapReq.vulnId}
Rule ID: ${scapReq.ruleId}
Plugin ID: `,
                'Vulnerability Description (16.b)': scapReq.description,
                'Devices Affected (16b.1)': csts.models.Scans.scans2poam.scans.scap
                  .filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0)
                  .map(h => h.hostname)
                  .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.hostname))
                  .sort()
                  .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                  .filter((el, i, a) => { if (el.trim() !== '') return 1; return 0; })
                  .join(', '),
                'Security Objectives (C-I-A) (16c)': '',
                'Raw Test Result (16d)': this.getRiskVal(scapReq.severity, 'CAT'),
                'Predisposing Condition(s) (16d.1)': '',
                'Technical Mitigation(s) (16d.2)': mitigation,
                'Severity or Pervasiveness (VL-VH) (16d.3)': this.getRiskVal(scapReq.severity, 'VL-VH'),
                'Relevance of Threat (VL-VH) (16e)': this.getRiskVal(scapReq.severity, 'VL-VH'),
                'Threat Description (16e.1)': scapReq.description,
                'Likelihood (Cells 16d.3 & 16e) (VL-VH) (16f)': this.getRiskVal(scapReq.severity, 'VL-VH'),
                'Impact (VL-VH) (16g)': this.getRiskVal(scapReq.severity, 'VL-VH'),
                'Impact Description (16h)': '',
                'Risk (Cells 16f & 16g) (VL-VH) (16i)': this.getRiskVal(scapReq.severity, 'VL-VH'),
                'Proposed Mitigations (From POA&M) (16j)': '',
                'Residual Risk (After Proposed Mitigations) (16k)': '',
                Status: scapReq.status,
                'Recommendations (16l)': scapReq.solution,
                Comments: `${scapReq.comments} ${scapReq.findingDetails}`,
                // pluginId: '',
              });
            })
          } else {
            results.push({
              'Non-Compliant Security Controls (16a)': typeof scapReq.iaControls === 'object' ? scapReq.iaControls.join(', ') : scapReq.iaControls,
              'Affected CCI (16a.1)': scapReq.cci.join(', '),
              'Source of Discovery(16a.2)': `SCAP: ${csts.models.Scans.scans2poam.scans.scap
                .filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0)
                .map(h => h.title)
                .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.title))
                .sort()
                .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                .join(', ')}`,
              'Vulnerability ID(16a.3)': `Group ID: ${scapReq.grpId}
Vuln ID: ${scapReq.vulnId}
Rule ID: ${scapReq.ruleId}
Plugin ID: `,
              'Vulnerability Description (16.b)': scapReq.description,
              'Devices Affected (16b.1)': csts.models.Scans.scans2poam.scans.scap
                .filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0)
                .map(h => h.hostname)
                .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.hostname))
                .sort()
                .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                .filter((el, i, a) => { if (el.trim() !== '') return 1; return 0; })
                .join(', '),
              'Security Objectives (C-I-A) (16c)': '',
              'Raw Test Result (16d)': this.getRiskVal(scapReq.severity, 'CAT'),
              'Predisposing Condition(s) (16d.1)': '',
              'Technical Mitigation(s) (16d.2)': mitigation,
              'Severity or Pervasiveness (VL-VH) (16d.3)': this.getRiskVal(scapReq.severity, 'VL-VH'),
              'Relevance of Threat (VL-VH) (16e)': this.getRiskVal(scapReq.severity, 'VL-VH'),
              'Threat Description (16e.1)': scapReq.description,
              'Likelihood (Cells 16d.3 & 16e) (VL-VH) (16f)': this.getRiskVal(scapReq.severity, 'VL-VH'),
              'Impact (VL-VH) (16g)': this.getRiskVal(scapReq.severity, 'VL-VH'),
              'Impact Description (16h)': '',
              'Risk (Cells 16f & 16g) (VL-VH) (16i)': this.getRiskVal(scapReq.severity, 'VL-VH'),
              'Proposed Mitigations (From POA&M) (16j)': '',
              'Residual Risk (After Proposed Mitigations) (16k)': '',
              Status: scapReq.status,
              'Recommendations (16l)': scapReq.solution,
              Comments: `${scapReq.comments} ${scapReq.findingDetails}`,
              // pluginId: '',
            });
          }
        });

      return results;
    },

    /*
      Method: getRiskVal

      Description:
        formats the submitted 'risk' into the desired format

       Paramters:
        source - the Risk being formatted
        format - the desired format (VL-VH, N-C, CAT)
      */
    getRiskVal(source, format) {
      const crossWalkFrom = {
        VL: 0, L: 1, M: 2, H: 3, VH: 4, 
        NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4, 
        CATIV: 0, CATIII: 1, CATII: 2, CATI: 3, 
        'CAT IV': 0, 'CAT III': 1, 'CAT II': 2, 'CAT I': 3, 
        MODERATE: 2, 0: 0, 1: 1, 2: 2, 3: 3, 4: 4,
      };
      const crossWalkTo = {
        'VL-VH': {
          0: 'VL', 1: 'L', 2: 'M', 3: 'H', 4: 'VH',
        },
        'VL VH': {
          0: 'Very Low', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Very High',
        },
        'N-C': {
          0: 'None', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical',
        },
        CAT: {
          0: 'CAT IV', 1: 'CAT III', 2: 'CAT II', 3: 'CAT I', 4: 'CAT I',
        },
        MIN: {
          0: 'IV', 1: 'III', 2: 'II', 3: 'I', 4: 'I',
        },
      };

      return crossWalkTo[format][crossWalkFrom[`${source}`.toUpperCase().trim()]];
    },

    getPoam55() {
      const results = [];
      csts.plugins.jsonQuery('acas[*].hosts[*].requirements[*].pluginId', { data: csts.models.Scans.scans2poam.scans }).value.sort().filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; }).forEach((element) => {
        const acasPlugin = csts.plugins.jsonQuery(`acas[*].hosts[*].requirements[pluginId = ${element}`, { data: csts.models.Scans.scans2poam.scans }).value;

        const m = csts.models.Scans.scans2poam.mitigations.find(i => i.plugin === element);
        const mitigation = typeof m !== 'undefined' ? m.mitigation : '';

        results.push({
          A: '',
          'Control Vulnerability Description': `Title: ${acasPlugin.title}

Description:
${acasPlugin.description}
`,
          'Security Control Number (NC/NA controls only)': '',
          'Office/Org': '',
          'Security Checks': `${acasPlugin.grpId}
${element}`,
          'Resources Required': '',  
          'Scheduled Completion Date': '',
          'Milestone with Completion Dates': '',
          'Milestone Changes': '',
          'Source Identifying Control Vulnerability': 'Assured Compliance Assessment Solution (ACAS) Nessus Scanner',
          Status: 'Ongoing',
          Comments: `${acasPlugin.comments}`,
          'Raw Severity Value': this.getRiskVal(acasPlugin.severity, 'MIN'),
          'Devices Affected': `
${csts.plugins.jsonQuery(
    "acas[*].hosts[*hostname!='']",
    { data: csts.models.Scans.scans2poam.scans },
  ).value.filter(host => host.requirements.filter(req => req.pluginId === element).length).map(h => h.hostname).sort().join(', ')
}`,
          Mitigations: mitigation,
          'Predisposing Conditions': '',
          Severity: this.getRiskVal(acasPlugin.severity, 'VL VH'),
          'Relevance of Threat': this.getRiskVal(acasPlugin.severity, 'VL VH'),
          'Threat Description': '',
          Likelihood: this.getRiskVal(acasPlugin.severity, 'VL VH'),
          Impact: this.getRiskVal(acasPlugin.severity, 'VL VH'),
          'Impact Description': '',
          'Residual Risk Level': this.getRiskVal(acasPlugin.severity, 'VL VH'),
          Recommendations: acasPlugin.solution,
          'Resulting Residual Risk after Proposed Mitigations': this.getRiskVal(acasPlugin.severity, 'VL VH'),
        });
      });

      // unique list of requirements for scap and ckl
      const ckls = csts.plugins.jsonQuery('ckl[*].requirements[*status!=Completed & status!=Not_Applicable].vulnId', { data: csts.models.Scans.scans2poam.scans }).value.sort().filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; });
      const scaps = csts.plugins.jsonQuery('scap[*].requirements[*status!=Completed & status!=Not Applicable].vulnId', { data: csts.models.Scans.scans2poam.scans }).value.sort().filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; });
      // ckl and scap
      ckls.filter(e => scaps.includes(e)).concat(scaps.filter(e => ckls.includes(e))).sort()
        .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
        .forEach((element) => {
          const cklReq = csts.plugins.jsonQuery(`ckl[*].requirements[vulnId=${element}]`, { data: csts.models.Scans.scans2poam.scans }).value;
          const m = csts.models.Scans.scans2poam.mitigations.find(i => i.plugin === cklReq.vulnId);
          const mitigation = typeof m !== 'undefined' ? m.mitigation : '';

          if (cklReq.cci.length > 1 && $('#split-CCI').prop('checked')) {
            cklReq.cci.filter(cci => cci.toLowerCase().indexOf('cce') === -1).forEach((cci) => {
              results.push({
                A: '',
                'Control Vulnerability Description': `Title: ${cklReq.title}

Description:
  ${cklReq.description}
`,
                'Security Control Number (NC/NA controls only)': typeof cklReq.iaControls === 'object' ? cklReq.iaControls.join(', ') : cklReq.iaControls,
                'Office/Org': '',
                'Security Checks': `${cklReq.grpId}
${cklReq.vulnId}
${cklReq.ruleId}`,
                'Resources Required': cklReq.resources,
                'Scheduled Completion Date': '',
                'Milestone with Completion Dates': '',
                'Milestone Changes': '',
                'Source Identifying Control Vulnerability': `SCAP/STIG: ${csts.models.Scans.scans2poam.scans.scap
.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
.map(h => h.title)
.concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.title))
.sort()
.filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
.join(', ')}`,
                Status: 'Ongoing',
                Comments: `${cklReq.comments}
${cci}`,
                'Raw Severity Value': this.getRiskVal(cklReq.severity, 'MIN'),
                'Devices Affected': `${csts.models.Scans.scans2poam.scans.scap
                  .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                  .map(h => h.hostname)
                  .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.hostname))
                  .sort()
                  .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                  .filter((el, i, a) => { if (el.trim() !== '') return 1; return 0; })
                  .join(', ')
                }`,
                Mitigations: mitigation,
                'Predisposing Conditions': '',
                Severity: this.getRiskVal(cklReq.severity, 'VL VH'),
                'Relevance of Threat': this.getRiskVal(cklReq.severity, 'VL VH'),
                'Threat Description': '',
                Likelihood: this.getRiskVal(cklReq.severity, 'VL VH'),
                Impact: this.getRiskVal(cklReq.severity, 'VL VH'),
                'Impact Description': '',
                'Residual Risk Level': this.getRiskVal(cklReq.severity, 'VL VH'),
                Recommendations: cklReq.solution,
                'Resulting Residual Risk after Proposed Mitigations': this.getRiskVal(cklReq.severity, 'VL VH'),
              });
            });
          } else {
            results.push({
              A: '',
              'Control Vulnerability Description': `Title: ${cklReq.title}

Description:
  ${cklReq.description}
`,
              'Security Control Number (NC/NA controls only)': typeof cklReq.iaControls === 'object' ? cklReq.iaControls.join(', ') : cklReq.iaControls,
              'Office/Org': '',
              'Security Checks': `${cklReq.grpId}
${cklReq.vulnId}
${cklReq.ruleId}`,
              'Resources Required': cklReq.resources,
              'Scheduled Completion Date': '',
              'Milestone with Completion Dates': '',
              'Milestone Changes': '',
              'Source Identifying Control Vulnerability': `SCAP/STIG: ${csts.models.Scans.scans2poam.scans.scap
                .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                .map(h => h.title)
                .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.title))
                .sort()
                .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                .join(', ')}`,
              Status: 'Ongoing',
              Comments: `${cklReq.comments}
${cklReq.cci}`,
              'Raw Severity Value': this.getRiskVal(cklReq.severity, 'MIN'),
              'Devices Affected': `${csts.models.Scans.scans2poam.scans.scap
                .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                .map(h => h.hostname)
                .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.hostname))
                .sort()
                .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                .filter((el, i, a) => { if (el.trim() !== '') return 1; return 0; })
                .join(', ')
              }`,
              Mitigations: mitigation,
              'Predisposing Conditions': '',
              Severity: this.getRiskVal(cklReq.severity, 'VL VH'),
              'Relevance of Threat': this.getRiskVal(cklReq.severity, 'VL VH'),
              'Threat Description': '',
              Likelihood: this.getRiskVal(cklReq.severity, 'VL VH'),
              Impact: this.getRiskVal(cklReq.severity, 'VL VH'),
              'Impact Description': '',
              'Residual Risk Level': this.getRiskVal(cklReq.severity, 'VL VH'),
              Recommendations: cklReq.solution,
              'Resulting Residual Risk after Proposed Mitigations': this.getRiskVal(cklReq.severity, 'VL VH'),
            });
          }
        });

      // just ckl
      ckls.filter(e => !scaps.includes(e)).sort()
        .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; }).forEach((element) => {
          const cklReq = csts.plugins.jsonQuery(`ckl[*].requirements[vulnId=${element}]`, { data: csts.models.Scans.scans2poam.scans }).value;

          const m = csts.models.Scans.scans2poam.mitigations.find(i => i.plugin === cklReq.vulnId);
          const mitigation = typeof m !== 'undefined' ? m.mitigation : '';

          if (cklReq.cci.length > 1 && $('#split-CCI').prop('checked')) {
            cklReq.cci.filter(cci => cci.toLowerCase().indexOf('cce') === -1).forEach((cci) => {
              results.push({
                A: '',
                'Control Vulnerability Description': `Title: ${cklReq.title}

Description:
  ${cklReq.description}
  }`,
                'Security Control Number (NC/NA controls only)': typeof cklReq.iaControls === 'object' ? cklReq.iaControls.join(', ') : cklReq.iaControls,
                'Office/Org': '',
                'Security Checks': `${cklReq.grpId}
${cklReq.vulnId}
${cklReq.ruleId}`,
                'Resources Required': cklReq.resources,
                'Scheduled Completion Date': '',
                'Milestone with Completion Dates': '',
                'Milestone Changes': '',
                'Source Identifying Control Vulnerability': `STIG: ${csts.models.Scans.scans2poam.scans.scap
                  .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                  .map(h => h.title)
                  .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.title))
                  .sort()
                  .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                  .join(', ')}`,
                Status: 'Ongoing',
                Comments: `${cklReq.comments}
${cci}`,
                'Raw Severity Value': this.getRiskVal(cklReq.severity, 'MIN'),
                'Devices Affected': `${csts.models.Scans.scans2poam.scans.scap
                  .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                  .map(h => h.hostname)
                  .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.hostname))
                  .sort()
                  .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                  .filter((el, i, a) => { if (el.trim() !== '') return 1; return 0; })
                  .join(', ')
                }`,
                Mitigations: mitigation,
                'Predisposing Conditions': '',
                Severity: this.getRiskVal(cklReq.severity, 'VL VH'),
                'Relevance of Threat': this.getRiskVal(cklReq.severity, 'VL VH'),
                'Threat Description': '',
                Likelihood: this.getRiskVal(cklReq.severity, 'VL VH'),
                Impact: this.getRiskVal(cklReq.severity, 'VL VH'),
                'Impact Description': '',
                'Residual Risk Level': this.getRiskVal(cklReq.severity, 'VL VH'),
                Recommendations: cklReq.solution,
                'Resulting Residual Risk after Proposed Mitigations': this.getRiskVal(cklReq.severity, 'VL VH'),
              });
            });
          } else {
            results.push({
              A: '',
              'Control Vulnerability Description': `Title: ${cklReq.title}

Description:
  ${cklReq.description}
`,
              'Security Control Number (NC/NA controls only)': typeof cklReq.iaControls === 'object' ? cklReq.iaControls.join(', ') : cklReq.iaControls,
              'Office/Org': '',
              'Security Checks': `${cklReq.grpId}
${cklReq.vulnId}
${cklReq.ruleId}`,
              'Resources Required': cklReq.resources,
              'Scheduled Completion Date': '',
              'Milestone with Completion Dates': '',
              'Milestone Changes': '',
              'Source Identifying Control Vulnerability': `STIG: ${csts.models.Scans.scans2poam.scans.scap
                .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                .map(h => h.title)
                .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.title))
                .sort()
                .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                .join(', ')}`,
              Status: 'Ongoing',
              Comments: `${cklReq.comments}
${cklReq.cci}`,
              'Raw Severity Value': this.getRiskVal(cklReq.severity, 'MIN'),
              'Devices Affected':`${csts.models.Scans.scans2poam.scans.scap
                .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                .map(h => h.hostname)
                .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.hostname))
                .sort()
                .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                .filter((el, i, a) => { if (el.trim() !== '') return 1; return 0; })
                .join(', ')
              }`,
              Mitigations: mitigation,
              'Predisposing Conditions': '',
              Severity: this.getRiskVal(cklReq.severity, 'VL VH'),
              'Relevance of Threat': this.getRiskVal(cklReq.severity, 'VL VH'),
              'Threat Description': '',
              Likelihood: this.getRiskVal(cklReq.severity, 'VL VH'),
              Impact: this.getRiskVal(cklReq.severity, 'VL VH'),
              'Impact Description': '',
              'Residual Risk Level': this.getRiskVal(cklReq.severity, 'VL VH'),
              Recommendations: cklReq.solution,
              'Resulting Residual Risk after Proposed Mitigations': this.getRiskVal(cklReq.severity, 'VL VH'),
            });
          }
        });

      // just scap (this should be impossible if SCAP and STIG is done properly)
      scaps.filter(e => !ckls.includes(e)).sort()
        .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; }).forEach((element) => {
          const scapReq = csts.plugins.jsonQuery(`scap[*].requirements[vulnId=${element}]`, { data: csts.models.Scans.scans2poam.scans }).value;

          const m = csts.models.Scans.scans2poam.mitigations.find(i => i.plugin === scapReq.vulnId);
          const mitigation = typeof m !== 'undefined' ? m.mitigation : '';

          if (scapReq.cci.length > 1 && $('#split-CCI').prop('checked')) {
            scapReq.cci.filter(cci => cci.toLowerCase().indexOf('cce') === -1).forEach((cci) => {
              results.push({
                A: '',
                'Control Vulnerability Description': `Title: ${scapReq.title}

Description:
  ${scapReq.description}
`,
                'Security Control Number (NC/NA controls only)': typeof scapReq.iaControls === 'object' ? scapReq.iaControls.join(', ') : scapReq.iaControls,
                'Office/Org': '',
                'Security Checks': `${scapReq.grpId}
  ${scapReq.vulnId}
  ${scapReq.ruleId}`,
                'Resources Required': scapReq.resources,
                'Scheduled Completion Date': '',
                'Milestone with Completion Dates': '',
                'Milestone Changes': '',
                'Source Identifying Control Vulnerability': `SCAP: ${csts.models.Scans.scans2poam.scans.scap
                  .filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0)
                  .map(h => h.title)
                  .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.title))
                  .sort()
                  .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                  .join(', ')}`,
                Status: 'Ongoing',
                Comments: `${scapReq.findingDetails}
${cci}`,
                'Raw Severity Value': this.getRiskVal(scapReq.severity, 'MIN'),
                'Devices Affected':`${csts.models.Scans.scans2poam.scans.scap
                  .filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0)
                  .map(h => h.hostname)
                  .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.hostname))
                  .sort()
                  .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                  .filter((el, i, a) => { if (el.trim() !== '') return 1; return 0; })
                  .join(', ')
                }`,
                Mitigations: mitigation,
                'Predisposing Conditions': '',
                Severity: this.getRiskVal(scapReq.severity, 'VL VH'),
                'Relevance of Threat': this.getRiskVal(scapReq.severity, 'VL VH'),
                'Threat Description': '',
                Likelihood: this.getRiskVal(scapReq.severity, 'VL VH'),
                Impact: this.getRiskVal(scapReq.severity, 'VL VH'),
                'Impact Description': '',
                'Residual Risk Level': this.getRiskVal(scapReq.severity, 'VL VH'),
                Recommendations: scapReq.solution,
                'Resulting Residual Risk after Proposed Mitigations': this.getRiskVal(scapReq.severity, 'VL VH'),
              });
            });
          } else {
            results.push({
              A: '',
              'Control Vulnerability Description': `Title: ${scapReq.title}

Description:
  ${scapReq.description}
`,
              'Security Control Number (NC/NA controls only)': typeof scapReq.iaControls === 'object' ? scapReq.iaControls.join(', ') : scapReq.iaControls,
              'Office/Org': '',
              'Security Checks': `${scapReq.grpId}
${scapReq.vulnId}
${scapReq.ruleId}`,
              'Resources Required': scapReq.resources,
              'Scheduled Completion Date': '',
              'Milestone with Completion Dates': '',
              'Milestone Changes': '',
              'Source Identifying Control Vulnerability': `SCAP: ${csts.models.Scans.scans2poam.scans.scap
                .filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0)
                .map(h => h.title)
                .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.title))
                .sort()
                .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                .join(', ')}`,
              Status: 'Ongoing',
              Comments: `${scapReq.findingDetails}
${scapReq.cci}`,
              'Raw Severity Value': this.getRiskVal(scapReq.severity, 'MIN'),
              'Devices Affected':`${csts.models.Scans.scans2poam.scans.scap
                .filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0)
                .map(h => h.hostname)
                .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.hostname))
                .sort()
                .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                .filter((el, i, a) => { if (el.trim() !== '') return 1; return 0; })
                .join(', ')
              }`,
              Mitigations: mitigation,
              'Predisposing Conditions': '',
              Severity: this.getRiskVal(scapReq.severity, 'VL VH'),
              'Relevance of Threat': this.getRiskVal(scapReq.severity, 'VL VH'),
              'Threat Description': '',
              Likelihood: this.getRiskVal(scapReq.severity, 'VL VH'),
              Impact: this.getRiskVal(scapReq.severity, 'VL VH'),
              'Impact Description': '',
              'Residual Risk Level': this.getRiskVal(scapReq.severity, 'VL VH'),
              Recommendations: scapReq.solution,
              'Resulting Residual Risk after Proposed Mitigations': this.getRiskVal(scapReq.severity, 'VL VH'),
            });
          }
        });

      return results;
    },

    getPoam() {
      const results = [];
      csts.plugins.jsonQuery('acas[*].hosts[*].requirements[*].pluginId', { data: csts.models.Scans.scans2poam.scans }).value.sort().filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; }).forEach((element) => {
        const acasPlugin = csts.plugins.jsonQuery(`acas[*].hosts[*].requirements[pluginId = ${element}`, { data: csts.models.Scans.scans2poam.scans }).value;

        const m = csts.models.Scans.scans2poam.mitigations.find(i => i.plugin === element);
        const mitigation = typeof m !== 'undefined' ? m.mitigation : '';

        results.push({
          A: '',
          'Control Vulnerability Description': `Title: ${acasPlugin.title}

Description:
  ${acasPlugin.description}

Devices Affected:
  ${csts.plugins.jsonQuery(
    "acas[*].hosts[*hostname!='']",
    { data: csts.models.Scans.scans2poam.scans },
  ).value.filter(host => host.requirements.filter(req => req.pluginId === element).length).map(h => h.hostname).sort().join(', ')
}`,
          'Security Control Number (NC/NA controls only)': '',
          'Office/Org': '',
          'Security Checks': `${acasPlugin.grpId}
${element}`,
          'Raw Severity Value': this.getRiskVal(acasPlugin.severity, 'MIN'),
          Mitigations: mitigation,
          'Severity Value': this.getRiskVal(acasPlugin.severity, 'MIN'),
          'Resources Required': '',
          'Scheduled Completion Date': '',
          'Milestone with Completion Dates': '',
          'Milestone Changes': '',
          'Source Identifying Control Vulnerability': 'Assured Compliance Assessment Solution (ACAS) Nessus Scanner',
          Status: 'Ongoing',
          Comments: `${acasPlugin.comments}`,
        });
      });

      // unique list of requirements for scap and ckl
      const ckls = csts.plugins.jsonQuery('ckl[*].requirements[*status!=Completed & status!=Not_Applicable].vulnId', { data: csts.models.Scans.scans2poam.scans }).value.sort().filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; });
      const scaps = csts.plugins.jsonQuery('scap[*].requirements[*status!=Completed & status!=Not Applicable].vulnId', { data: csts.models.Scans.scans2poam.scans }).value.sort().filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; });
      // ckl and scap
      ckls.filter(e => scaps.includes(e)).concat(scaps.filter(e => ckls.includes(e))).sort()
        .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
        .forEach((element) => {
          const cklReq = csts.plugins.jsonQuery(`ckl[*].requirements[vulnId=${element}]`, { data: csts.models.Scans.scans2poam.scans }).value;
          const m = csts.models.Scans.scans2poam.mitigations.find(i => i.plugin === cklReq.vulnId);
          const mitigation = typeof m !== 'undefined' ? m.mitigation : '';

          if (cklReq.cci.length > 1 && $('#split-CCI').prop('checked')) {
            cklReq.cci.filter(cci => cci.toLowerCase().indexOf('cce') === -1).forEach((cci) => {
              results.push({
                A: '',
                'Control Vulnerability Description': `Title: ${cklReq.title}
  
Description:
  ${cklReq.description}
  
Devices Affected:
  ${csts.models.Scans.scans2poam.scans.scap
    .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
    .map(h => h.hostname)
    .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.hostname))
    .sort()
    .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
    .filter((el, i, a) => { if (el.trim() !== '') return 1; return 0; })
    .join(', ')
}`,
                'Security Control Number (NC/NA controls only)': typeof cklReq.iaControls === 'object' ? cklReq.iaControls.join(', ') : cklReq.iaControls,
                'Office/Org': '',
                'Security Checks': `${cklReq.grpId}
${cklReq.vulnId}
${cklReq.ruleId}`,
                'Raw Severity Value': this.getRiskVal(cklReq.severity, 'MIN'),
                Mitigations: mitigation,
                'Severity Value': this.getRiskVal(cklReq.severity, 'MIN'),
                'Resources Required': cklReq.resources,
                'Scheduled Completion Date': '',
                'Milestone with Completion Dates': '',
                'Milestone Changes': '',
                'Source Identifying Control Vulnerability': `SCAP/STIG: ${csts.models.Scans.scans2poam.scans.scap
                  .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                  .map(h => h.title)
                  .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.title))
                  .sort()
                  .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                  .join(', ')}`,
                Status: 'Ongoing',
                Comments: `${cklReq.comments}
${cci}`,
              });
            });
          } else {
            results.push({
              A: '',
              'Control Vulnerability Description': `Title: ${cklReq.title}

 Description:
    ${cklReq.description}

Devices Affected:
${csts.models.Scans.scans2poam.scans.scap
    .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
    .map(h => h.hostname)
    .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.hostname))
    .sort()
    .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
    .filter((el, i, a) => { if (el.trim() !== '') return 1; return 0; })
    .join(', ')
}`,
              'Security Control Number (NC/NA controls only)': typeof cklReq.iaControls === 'object' ? cklReq.iaControls.join(', ') : cklReq.iaControls,
              'Office/Org': '',
              'Security Checks': `${cklReq.grpId}
${cklReq.vulnId}
${cklReq.ruleId}`,
              'Raw Severity Value': this.getRiskVal(cklReq.severity, 'MIN'),
              Mitigations: mitigation,
              'Severity Value': this.getRiskVal(cklReq.severity, 'MIN'),
              'Resources Required': cklReq.resources,
              'Scheduled Completion Date': '',
              'Milestone with Completion Dates': '',
              'Milestone Changes': '',
              'Source Identifying Control Vulnerability': `SCAP/STIG: ${csts.models.Scans.scans2poam.scans.scap
                .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                .map(h => h.title)
                .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.title))
                .sort()
                .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                .join(', ')}`,
              Status: 'Ongoing',
              Comments: `${cklReq.comments}
${cklReq.cci}`,
            });
          }
        });

      // just ckl
      ckls.filter(e => !scaps.includes(e)).sort()
        .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; }).forEach((element) => {
          const cklReq = csts.plugins.jsonQuery(`ckl[*].requirements[vulnId=${element}]`, { data: csts.models.Scans.scans2poam.scans }).value;

          const m = csts.models.Scans.scans2poam.mitigations.find(i => i.plugin === cklReq.vulnId);
          const mitigation = typeof m !== 'undefined' ? m.mitigation : '';

          if (cklReq.cci.length > 1 && $('#split-CCI').prop('checked')) {
            cklReq.cci.filter(cci => cci.toLowerCase().indexOf('cce') === -1).forEach((cci) => {
              results.push({
                A: '',
                'Control Vulnerability Description': `Title: ${cklReq.title}
  
Description:
${cklReq.description}

Devices Affected:
${csts.models.Scans.scans2poam.scans.scap
    .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
    .map(h => h.hostname)
    .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.hostname))
    .sort()
    .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
    .filter((el, i, a) => { if (el.trim() !== '') return 1; return 0; })
    .join(', ')
}`,
                'Security Control Number (NC/NA controls only)': typeof cklReq.iaControls === 'object' ? cklReq.iaControls.join(', ') : cklReq.iaControls,
                'Office/Org': '',
                'Security Checks': `${cklReq.grpId}
${cklReq.vulnId}
${cklReq.ruleId}`,
                'Raw Severity Value': this.getRiskVal(cklReq.severity, 'MIN'),
                Mitigations: mitigation,
                'Severity Value': this.getRiskVal(cklReq.severity, 'MIN'),
                'Resources Required': cklReq.resources,
                'Scheduled Completion Date': '',
                'Milestone with Completion Dates': '',
                'Milestone Changes': '',
                'Source Identifying Control Vulnerability': `STIG: ${csts.models.Scans.scans2poam.scans.scap
                  .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                  .map(h => h.title)
                  .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.title))
                  .sort()
                  .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                  .join(', ')}`,
                Status: 'Ongoing',
                Comments: `${cklReq.comments}
${cci}`,
              });
            });
          } else {
            results.push({
              A: '',
              'Control Vulnerability Description': `Title: ${cklReq.title}

Description:
${cklReq.description}

Devices Affected:
${csts.models.Scans.scans2poam.scans.scap
    .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
    .map(h => h.hostname)
    .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.hostname))
    .sort()
    .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
    .filter((el, i, a) => { if (el.trim() !== '') return 1; return 0; })
    .join(', ')
}`,
              'Security Control Number (NC/NA controls only)': typeof cklReq.iaControls === 'object' ? cklReq.iaControls.join(', ') : cklReq.iaControls,
              'Office/Org': '',
              'Security Checks': `${cklReq.grpId}
${cklReq.vulnId}
${cklReq.ruleId}`,
              'Raw Severity Value': this.getRiskVal(cklReq.severity, 'MIN'),
              Mitigations: mitigation,
              'Severity Value': this.getRiskVal(cklReq.severity, 'MIN'),
              'Resources Required': cklReq.resources,
              'Scheduled Completion Date': '',
              'Milestone with Completion Dates': '',
              'Milestone Changes': '',
              'Source Identifying Control Vulnerability': `STIG: ${csts.models.Scans.scans2poam.scans.scap
                .filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0)
                .map(h => h.title)
                .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === cklReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.title))
                .sort()
                .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                .join(', ')}`,
              Status: 'Ongoing',
              Comments: `${cklReq.comments}
${cklReq.cci}`,
            });
          }
        });

      // just scap (this should be impossible if SCAP and STIG is done properly)
      scaps.filter(e => !ckls.includes(e)).sort()
        .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; }).forEach((element) => {
          const scapReq = csts.plugins.jsonQuery(`scap[*].requirements[vulnId=${element}]`, { data: csts.models.Scans.scans2poam.scans }).value;

          const m = csts.models.Scans.scans2poam.mitigations.find(i => i.plugin === scapReq.vulnId);
          const mitigation = typeof m !== 'undefined' ? m.mitigation : '';

          if (scapReq.cci.length > 1 && $('#split-CCI').prop('checked')) {
            scapReq.cci.filter(cci => cci.toLowerCase().indexOf('cce') === -1).forEach((cci) => {
              results.push({
                A: '',
                'Control Vulnerability Description': `Title: ${scapReq.title}
  
Description:
${scapReq.description}

Devices Affected:
${csts.models.Scans.scans2poam.scans.scap
    .filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0)
    .map(h => h.hostname)
    .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.hostname))
    .sort()
    .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
    .filter((el, i, a) => { if (el.trim() !== '') return 1; return 0; })
    .join(', ')
}`,
                'Security Control Number (NC/NA controls only)': typeof scapReq.iaControls === 'object' ? scapReq.iaControls.join(', ') : scapReq.iaControls,
                'Office/Org': '',
                'Security Checks': `${scapReq.grpId}
${scapReq.vulnId}
${scapReq.ruleId}`,
                'Raw Severity Value': this.getRiskVal(scapReq.severity, 'MIN'),
                Mitigations: mitigation,
                'Severity Value': this.getRiskVal(scapReq.severity, 'MIN'),
                'Resources Required': scapReq.resources,
                'Scheduled Completion Date': '',
                'Milestone with Completion Dates': '',
                'Milestone Changes': '',
                'Source Identifying Control Vulnerability': `SCAP: ${csts.models.Scans.scans2poam.scans.scap
                  .filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0)
                  .map(h => h.title)
                  .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.title))
                  .sort()
                  .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                  .join(', ')}`,
                Status: 'Ongoing',
                Comments: `${scapReq.findingDetails}
${cci}`,
              });
            });
          } else {
            results.push({
              A: '',
              'Control Vulnerability Description': `Title: ${scapReq.title}

Description:
${scapReq.description}

Devices Affected:
${csts.models.Scans.scans2poam.scans.scap
    .filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0)
    .map(h => h.hostname)
    .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.hostname))
    .sort()
    .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
    .filter((el, i, a) => { if (el.trim() !== '') return 1; return 0; })
    .join(', ')
}`,
              'Security Control Number (NC/NA controls only)': typeof scapReq.iaControls === 'object' ? scapReq.iaControls.join(', ') : scapReq.iaControls,
              'Office/Org': '',
              'Security Checks': `${scapReq.grpId}
${scapReq.vulnId}
${scapReq.ruleId}`,
              'Raw Severity Value': this.getRiskVal(scapReq.severity, 'MIN'),
              Mitigations: mitigation,
              'Severity Value': this.getRiskVal(scapReq.severity, 'MIN'),
              'Resources Required': scapReq.resources,
              'Scheduled Completion Date': '',
              'Milestone with Completion Dates': '',
              'Milestone Changes': '',
              'Source Identifying Control Vulnerability': `SCAP: ${csts.models.Scans.scans2poam.scans.scap
                .filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0)
                .map(h => h.title)
                .concat(csts.models.Scans.scans2poam.scans.ckl.filter(f => f.requirements.filter(g => g.vulnId === scapReq.vulnId && g.status !== 'Completed').length > 0).map(h => h.title))
                .sort()
                .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; })
                .join(', ')}`,
              Status: 'Ongoing',
              Comments: `${scapReq.findingDetails}
${scapReq.cci}`,
            });
          }
        });

      return results;
    },

    /*
      Method: getScanFiles

      Description:
        This method will get file information for submitted files

      Parameters:
        {string} path - the path for the file being analyzed
    */
    getScanFiles(path) {
      // eslint-disable-next-line
      let files = [];
      if ($('#files-recurse')
        .prop('checked')) {
        files = csts.libs.utils.getRecursiveDir(path);
      } else {
        files = csts.plugins.fs.readdirSync(path);
      }
      // filter to just the types of scan files we need
      const scans = files.filter(scan => (
        (scan.toLowerCase().indexOf('.xml') >= 0 && scan.toLowerCase().indexOf('xccdf') >= 0) ||
        scan.toLowerCase().indexOf('.zip') >= 0 ||
        scan.toLowerCase().indexOf('.ckl') >= 0 ||
        scan.toLowerCase().indexOf('.nessus') >= 0
      ));

      return scans;
    },

    /*
      Method: parseXccdf

      Description:
        This method will parse a SCAP XCCDF File

      Parameters:
        {string} file - string to the file being parsed
    */
    parseXccdf(file) {
      const xccdfData = {};
      let fileData = '';
      let fileName = '';
      if (file.indexOf('<') > -1) {
        fileData = file;
        fileName = 'UNKNOWN';
      } else {
        fileData = csts.plugins.fs.readFileSync(file, 'utf8');
        fileName = csts.plugins.path.basename(file);
      }
      
      csts.plugins.xml2js.parseString(fileData, (err, result) => {
        if (typeof csts.plugins.jsonPath.value(result, "$['cdf:Benchmark']['cdf:TestResult']") !== 'undefined') {
          csts.xccdf = result;

          xccdfData.credentialed = true;
          xccdfData.scanFile = fileName;
          xccdfData.hostname = csts.plugins.jsonPath.value(result, "$['cdf:Benchmark']['cdf:TestResult'][0]['cdf:target'][0]");
          xccdfData.title = csts.plugins.jsonPath.flatValue(result, "$['cdf:Benchmark']['cdf:title']");
          xccdfData.id = result['cdf:Benchmark'].$.id;
          xccdfData.version = csts.plugins.jsonPath.flatValue(result, "$['cdf:Benchmark']['cdf:version']");
          xccdfData.release = csts.plugins.jsonPath.flatValue(result, "$['cdf:Benchmark']['cdf:plain-text']")
            ._.match(new RegExp('Release: ([0-9]+)'))[1];
          xccdfData.scanDate = csts.plugins.moment(csts.plugins.jsonPath.value(result, "$['cdf:Benchmark']['cdf:TestResult'][*]['$']['start-time']"))
            .format('MM/DD/YYYY HH:mm');
          xccdfData.scanType = 'scap';
          xccdfData.openFindings = {
            cat1: result['cdf:Benchmark']['cdf:TestResult'][0]['cdf:rule-result'].filter(element => element['cdf:result'].reduce(a => a) !== 'pass')
              .filter(element => element.$.severity === 'high')
              .length,
            cat2: result['cdf:Benchmark']['cdf:TestResult'][0]['cdf:rule-result'].filter(element => element['cdf:result'].reduce(a => a) !== 'pass')
              .filter(element => element.$.severity === 'medium')
              .length,
            cat3: result['cdf:Benchmark']['cdf:TestResult'][0]['cdf:rule-result'].filter(element => element['cdf:result'].reduce(a => a) !== 'pass')
              .filter(element => element.$.severity === 'low')
              .length,
          };
          xccdfData.requirements = [];
          csts.plugins.jsonPath.value(result, "$..['cdf:rule-result']")
            .forEach((element) => {
              const ruleData = csts.plugins.jsonPath.query(result, `$..['cdf:Rule'][?(@.$.id=='${element.$.idref}')]`);
              const vulnerability = {};
              vulnerability.vulnId = result['cdf:Benchmark']['cdf:Group'].filter(e => e['cdf:Rule'][0].$.id === element.$.idref)[0].$.id.replace('xccdf_mil.disa.stig_group_', '');
              vulnerability.comments = '';
              vulnerability.findingDetails = JSON.stringify(element);

              vulnerability.cci = [];
              if (!csts.libs.utils.isBlank(ruleData[0]['cdf:ident'])) {
                ruleData[0]['cdf:ident'].forEach((cci) => {
                  vulnerability.cci.push(cci._);
                });
              }
              vulnerability.iaControls = '';
              csts.plugins.xml2js.parseString(`<root>${ruleData[0]['cdf:description'].reduce(a => a).replace('&gt;', '>').replace('&lt;', '<')}</root>`, (e, r) => { if (typeof r !== 'undefined' && typeof r.root !== 'undefined') vulnerability.iaControls = r.root.IAControls; });

              vulnerability.description = ruleData[0]['cdf:description'].reduce(a => a);
              vulnerability.fixId = ruleData[0]['cdf:fix'][0].$.id;
              vulnerability.grpId = element.$.version;
              vulnerability.pluginId = '';
              vulnerability.resources = '';
              vulnerability.ruleId = element.$.idref;
              vulnerability.solution = ruleData[0]['cdf:fixtext'][0]._;
              vulnerability.references = JSON.stringify(ruleData[0]['cdf:reference']);
              vulnerability.severity = ruleData[0].$.severity;
              vulnerability.title = ruleData[0]['cdf:title'].reduce(a => a);

              switch (element['cdf:result'].reduce(a => a)) {
                case 'pass':
                  vulnerability.status = 'Completed';
                  break;
                case 'fail':
                  vulnerability.status = 'Ongoing';
                  break;
                case 'error':
                  vulnerability.status = 'Error';
                  break;
                case 'notapplicable':
                  vulnerability.status = 'Not Applicable';
                  break;
                default:
                  vulnerability.status = 'Ongoing';
              }

              xccdfData.requirements.push(vulnerability);
            });

          this.scans.scap.push(xccdfData);
        }
      });
    },

    /*
      Method: parseCkl

      Description:
        This method will parse a checklist file

      Paramters:
        {string} file - string to the file being parsed
    */
    parseCkl(file) {
      const cklData = {};
      let fileData = '';
      let fileName = '';
      if (file.indexOf('<') > -1) {
        fileData = file;
        fileName = 'UNKNOWN';
      } else {
        fileData = csts.plugins.fs.readFileSync(file, 'utf8');
        fileName = csts.plugins.path.basename(file);
      }
      csts.plugins.xml2js.parseString(fileData, (err, result) => {
        cklData.scanType = 'ckl';
        cklData.credentialed = true;
        cklData.scanFile = fileName;
        cklData.hostname = [csts.plugins.jsonPath.value(result, '$..HOST_NAME')][0].reduce(a => a);
        cklData.title = csts.plugins.jsonPath.flatValue(result, "$..STIG_INFO[0].SI_DATA[?(@.SID_NAME=='title')].SID_DATA");
        cklData.id = csts.plugins.jsonPath.flatValue(result, "$..STIG_INFO[0].SI_DATA[?(@.SID_NAME=='stigid')].SID_DATA");

        const vrMatch = csts.plugins.path.basename(file)
          .match(new RegExp('V([0-9]+)R([0-9]+)'));
        if (csts.libs.utils.isBlank(vrMatch)) {
          cklData.version = '0';
          cklData.release = '0';
        } else {
          cklData.version = `${vrMatch[1]}`;
          cklData.release = `${vrMatch[2]}`;
        }

        const stats = csts.plugins.fs.statSync(file);
        cklData.scanDate = csts.plugins.moment(stats.mtimeMs)
          .format('MM/DD/YYYY HH:mm');

        cklData.openFindings = {
          cat1: csts.plugins.jsonPath.query(result, "$..VULN[?(@.STATUS!='NotAFinding' && @.STATUS!='Not_Applicable' )].STIG_DATA[?(@.VULN_ATTRIBUTE=='Severity' && @.ATTRIBUTE_DATA=='high')]")
            .length,
          cat2: csts.plugins.jsonPath.query(result, "$..VULN[?(@.STATUS!='NotAFinding' && @.STATUS!='Not_Applicable' )].STIG_DATA[?(@.VULN_ATTRIBUTE=='Severity' && @.ATTRIBUTE_DATA=='medium')]")
            .length,
          cat3: csts.plugins.jsonPath.query(result, "$..VULN[?(@.STATUS!='NotAFinding' && @.STATUS!='Not_Applicable' )].STIG_DATA[?(@.VULN_ATTRIBUTE=='Severity' && @.ATTRIBUTE_DATA=='low')]")
            .length,
        };

        cklData.requirements = [];
        csts.plugins.jsonPath.value(result, '$..VULN')
          .forEach((element) => {
            const vulnerability = {};
            vulnerability.vulnId = csts.plugins.jsonPath.value(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='Vuln_Num')].ATTRIBUTE_DATA")
              .reduce(a => a);
            vulnerability.comments = csts.plugins.jsonPath.value(element, '$..COMMENTS')
              .reduce(a => a);
            vulnerability.findingDetails = csts.plugins.jsonPath.value(element, '$..FINDING_DETAILS')
              .reduce(a => a);

            vulnerability.cci = [];
            csts.plugins.jsonPath.query(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='CCI_REF')].ATTRIBUTE_DATA")
              .forEach(cci => vulnerability.cci.push(cci.reduce(a => a)));

            vulnerability.description = csts.plugins.jsonPath.flatValue(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='Vuln_Discuss')].ATTRIBUTE_DATA");
            vulnerability.fixId = '';
            vulnerability.grpId = csts.plugins.jsonPath.flatValue(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='Group_Title')].ATTRIBUTE_DATA");
            vulnerability.iaControls = csts.plugins.jsonPath.flatValue(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='IA_Controls')].ATTRIBUTE_DATA");
            vulnerability.pluginId = '';
            vulnerability.resources = csts.plugins.jsonPath.flatValue(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='Responsibility')].ATTRIBUTE_DATA");
            vulnerability.ruleId = csts.plugins.jsonPath.flatValue(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='Rule_ID')].ATTRIBUTE_DATA");
            vulnerability.solution = csts.plugins.jsonPath.flatValue(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='Fix_Text')].ATTRIBUTE_DATA");
            vulnerability.references = csts.plugins.jsonPath.flatValue(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='STIGRef')].ATTRIBUTE_DATA");
            vulnerability.severity = csts.plugins.jsonPath.flatValue(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='Severity')].ATTRIBUTE_DATA");
            vulnerability.title = csts.plugins.jsonPath.flatValue(element, "$..STIG_DATA[?(@.VULN_ATTRIBUTE=='Rule_Title')].ATTRIBUTE_DATA");

            const s = csts.plugins.jsonPath.value(element, '$..STATUS')
              .reduce(a => a);
            vulnerability.status = (s === 'NotAFinding' || s === 'Not_Applicable' ? 'Completed' : 'Ongoing');

            cklData.requirements.push(vulnerability);
          });

        this.scans.ckl.push(cklData);
      });
    },

    /**
     * Method: parseNessus
     *
     * Description:
     *  This method will parse a Nessus scan result
     *
     * Parameters:
     *  {string} file - path to the scan file to be parse
     */
    parseNessus(file, filename) {
      const nessusData = {};
      let fileData = '';
      let fileName = '';
      if (file.indexOf('<') > -1) {
        fileData = file;
        fileName = (typeof filename !== 'undefined' ? filename : 'UNKNOWN');
      } else {
        fileData = csts.plugins.fs.readFileSync(file, 'utf8');
        fileName = csts.plugins.path.basename(file);
      }
      csts.plugins.xml2js.parseString(fileData, (err, result) => {
        nessusData.scanType = 'ACAS';
        nessusData.scanFile = fileName;
        nessusData.hosts = [];
        result.NessusClientData_v2.Report[0].ReportHost.forEach((host) => {
          const hostData = {};
          hostData.hostname = typeof host.HostProperties[0].tag.filter(a => a.$.name === 'host-fqdn')[0] !== 'undefined' ? host.HostProperties[0].tag.filter(a => a.$.name === 'host-fqdn')[0]._ : host.$.name;
          if (hostData.hostname.indexOf('.') >= 0 && hostData.hostname.match(/[a-zA-Z]*/)[0].trim() !== '') {
            hostData.hostname = hostData.hostname.substr(0, hostData.hostname.indexOf('.'));
          }
          hostData.scanDate = csts.plugins.moment(host.HostProperties[0].tag.filter(a => a.$.name === 'HOST_START')[0]._)
            .format('MM/DD/YYYY HH:mm');
          hostData.credentialed = host.HostProperties[0].tag.filter(a => a.$.name === 'Credentialed_Scan')[0]._.toUpperCase();

          const os = host.HostProperties[0].tag.filter(a => a.$.name === 'operating-system')[0];
          hostData.os = typeof os !== 'undefined' ? typeof os._ !== 'undefined' ? os._ : os : '';
          hostData.scanEngine = typeof host.ReportItem.filter(a => a.$.pluginID === '19506')[0] !== 'undefined' ? host.ReportItem.filter(a => a.$.pluginID === '19506')[0].plugin_output[0].match(new RegExp('Nessus version : ([0-9.]+)'))[1] : 'UNKNOWN';
          hostData.openFindings = {
            cat1: host.ReportItem.filter(a => a.$.severity >= '3')
              .length,
            cat2: host.ReportItem.filter(a => a.$.severity === '2')
              .length,
            cat3: host.ReportItem.filter(a => a.$.severity === '1')
              .length,
            cat4: host.ReportItem.filter(a => a.$.severity === '0')
              .length,
          };

          hostData.requirements = [];
          host.ReportItem.forEach((report) => {
            const vulnerability = {};
            vulnerability.cci = [];
            vulnerability.comments = typeof report.plugin_output !== 'undefined' ? report.plugin_output[0] : '';
            vulnerability.mitigation = '';
            vulnerability.findingDetails = '';
            vulnerability.description = report.synopsis[0];
            vulnerability.fixId = '';
            vulnerability.grpId = report.$.pluginFamily;
            vulnerability.pluginId = report.$.pluginID;
            vulnerability.resources = '';
            vulnerability.ruleId = '';
            vulnerability.solution = report.solution[0];
            vulnerability.references = '';
            vulnerability.severity = report.$.severity;
            vulnerability.title = report.$.pluginName;
            vulnerability.vulnId = '';
            vulnerability.iaControls = [];
            vulnerability.status = 'Ongoing';

            hostData.requirements.push(vulnerability);
          });
          nessusData.hosts.push(hostData);
        });

        this.scans.acas.push(nessusData);
      });
    },

    /**
     * Method: parseZip
     *
     * Description:
     *  This method will parse the files in a ZIP
     *
     * Parameters:
     *  {string} f - path to the scan file to be parse
     */
    parseZip(f) {
      const unzippedFs = csts.plugins.zip.sync.unzip(f).memory();
      const self = this;
      unzippedFs.contents()
        .forEach((file) => {
          const currentFile = unzippedFs.read(file, 'buffer');
          switch (csts.plugins.path.extname(file)) {
            case '.zip':
              self.parseZip(currentFile);
              break;
            case '.ckl':
              self.parseCkl(currentFile);
              break;
            case '.nessus':
              self.parseNessus(currentFile, file);
              break;
            case '.xml':
              self.parseXccdf(currentFile);
              break;
            default:
          }
        });
    },

    /**
     * Method: parseFile
     *
     * Description:
     *  This method will call the applicable parse method for a file
     *
     * Parameters:
     *  {string} currentFile - path to the scan file to be parse
     */
    parseFile(currentFile) {
      switch (csts.plugins.path.extname(currentFile)) {
        case '.zip':
          this.parseZip(currentFile);
          break;
        case '.ckl':
          this.parseCkl(currentFile);
          break;
        case '.nessus':
          this.parseNessus(currentFile);
          break;
        case '.xml':
          this.parseXccdf(currentFile);
          break;
        default:
      }
    },
  },
  /*
    Class: Models.Scans.compareRarPoam
    This is the container for the functions that deal with the poam/rar comparison module

    See Also:
    <Controllers.Scans.compareRarPoam>
  */
  compareRarPoam: {
    /*
    Variables: Properties

      compareFields - fields that can be compared
      rarFields - Mapping between fields and columns in a RAR spreadsheet
      poamFields - Mapping between fields and columns in a POAM spreadsheet
      workbooks - a container for any excel workbooks that are opened
    */
    fields: ['Mitigation', 'Comment', 'Description', 'Raw Risk', 'Residual Risk', 'Security Control', 'Source', 'Status'],
    rarFields: {
      Mitigation: 'J',
      Comment: '',
      Description: 'E',
      'Raw Risk': 'H',
      'Residual Risk': 'S',
      'Security Control': 'A',
      Source: 'C',
      Status: '',
      'Test Id': 'D',
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
      'Test Id': 'J',
    },

    /*
      Method: getRiskVal

      Description:
        formats the submitted 'risk' into the desired format

       Paramters:
        source - the Risk being formatted
        format - the desired format (VL-VH, N-C, CAT)
    */
    getRiskVal(source, format) {
      const crossWalkFrom = {
        VL: 0, L: 1, M: 2, H: 3, VH: 4, NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4, CATIV: 0, CATIII: 1, CATII: 2, CATI: 3, 'CAT IV': 0, 'CAT III': 1, 'CAT II': 2, 'CAT I': 3, MODERATE: 2, 0: 0, 1: 1, 2: 2, 3: 3, 4: 4,
      };
      const crossWalkTo = {
        'VL-VH': {
          0: 'VL', 1: 'L', 2: 'M', 3: 'H', 4: 'VH',
        },
        'N-C': {
          0: 'None', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical',
        },
        CAT: {
          0: 'CAT IV', 1: 'CAT III', 2: 'CAT II', 3: 'CAT I', 4: 'CAT I',
        },
      };

      return crossWalkTo[format][crossWalkFrom[`${source}`.toUpperCase().trim()]];
    },


    /*
      Method: compareVals

      Description:
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
          String(csts.models.Scans.workbooks[workbook].Sheets[sheet][address].v).replace(/\s/g, '').toUpperCase()
            .indexOf(String(val).replace(/\s/g, '').toUpperCase()) >= 0
        );
      }
      return false;
    },

    /*
      Method: compareWorkbooks

      Description:
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


      // since there is no consistency, try to map which fields are in which columns for the RAR and POAM
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((i) => {
        if (csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('raw') >= 0) { this.rarFields['Raw Risk'] = i; }
        
        if (csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('residual') >   0 && csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('proposed') < 0) { this.rarFields['Residual Risk'] = i; }
        if (csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('risk') === 0     && csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('proposed') < 0) { this.rarFields['Residual Risk'] = i; }
        if (csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('control') >= 0) { this.rarFields['Security Control'] = i; }
        if ( csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('source') >= 0 && csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('resources') < 0) {
          this.rarFields.Source = i; 
        }
        if (csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('status') >= 0) { this.rarFields.Status = i; }

        if (
          csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('technical mitigation') >= 0 ||
          (csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('mitigation') >= 0 && csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('proposed')) === -1
        ) {
          this.rarFields.Mitigation = i;
        }

        if (
          csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('vulnerability description') >= 0 ||
          (
            (csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('description') >= 0 && csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('threat') === -1) &&
            (csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('description') >= 0 && csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('mitigation') === -1) &&
            (csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('description') >= 0 && csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('remediation') === -1) &&
            (csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('description') >= 0 && csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('impact') === -1)
          )
        ) {
          this.rarFields.Description = i;
        }

        if (csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('vulnerability id') >= 0 || csts.models.Scans.workbooks.rar.val(rarTab, `${i}1`).toLowerCase().indexOf('test id') >= 0) {
          this.rarFields['Test Id'] = i;
        }

        if (csts.models.Scans.workbooks.poam.val(poamTab, `${i}1`).toLowerCase().indexOf('raw') >= 0) { this.poamFields['Raw Risk'] = i; }
        if (csts.models.Scans.workbooks.poam.val(poamTab, `${i}1`).toLowerCase().indexOf('residual') >= 0 || csts.models.Scans.workbooks.poam.val(poamTab, `${i}1`).toLowerCase().indexOf('severity value') >= 0) { this.poamFields['Residual Risk'] = i; }
        if (csts.models.Scans.workbooks.poam.val(poamTab, `${i}1`).toLowerCase().indexOf('control') >= 0 && csts.models.Scans.workbooks.poam.val(poamTab, `${i}1`).toLowerCase().indexOf('source') < 0) { this.poamFields['Security Control'] = i; }
        if (csts.models.Scans.workbooks.poam.val(poamTab, `${i}1`).toLowerCase().indexOf('source') >= 0 && csts.models.Scans.workbooks.poam.val(poamTab, `${i}1`).toLowerCase().indexOf('resources') < 0) { this.poamFields.Source = i; }
        if (csts.models.Scans.workbooks.poam.val(poamTab, `${i}1`).toLowerCase().indexOf('comment') >= 0) { this.poamFields.Comment = i; }
        if (csts.models.Scans.workbooks.poam.val(poamTab, `${i}1`).toLowerCase().indexOf('status') >= 0) { this.poamFields.Status = i; }
        if (csts.models.Scans.workbooks.poam.val(poamTab, `${i}1`).toLowerCase().indexOf('mitigations') >= 0) { this.poamFields.Mitigation = i; }
        if (csts.models.Scans.workbooks.poam.val(poamTab, `${i}1`).toLowerCase().indexOf('description') >= 0) { this.poamFields.Description = i; }
        if (csts.models.Scans.workbooks.poam.val(poamTab, `${i}1`).toLowerCase().indexOf('checks') >= 0) { this.poamFields['Test Id'] = i; }
      });



      rarRow = 2;
      while (rarRow < 5000 && (!csts.models.Scans.workbooks.rar.isBlank(rarTab, [`${this.rarFields['Security Control']}${rarRow}`, `${this.rarFields.CCI}${rarRow}`, `${this.rarFields.Source}${rarRow}`]))) {
        if ( String(csts.models.Scans.workbooks.rar.Sheets[rarTab][`${this.rarFields['Raw Risk']}${rarRow}`]).v !== 'IV' && String(csts.models.Scans.workbooks.rar.Sheets[rarTab][`${this.rarFields['Raw Risk']}${rarRow}`]).v !== 'VL' ) {
          const vulnId = csts.models.Scans.compareRarPoam.getVulnId('rar', rarTab, `${this.rarFields['Test Id']}${rarRow}`);
          $items.push({
            row: rarRow,
            vulnId,
            control: this.rarFields['Security Control'] !== '' ? csts.models.Scans.workbooks.rar.val(rarTab, `${this.rarFields['Security Control']}${rarRow}`) : '',
            source: this.rarFields.Source !== '' ? csts.models.Scans.workbooks.rar.val(rarTab, `${this.rarFields.Source}${rarRow}`) : '',
            testId: this.rarFields['Test Id'] !== '' ? csts.models.Scans.workbooks.rar.val(rarTab, `${this.rarFields['Test Id']}${rarRow}`) : '',
            description: this.rarFields.Description !== '' ? csts.models.Scans.workbooks.rar.val(rarTab, `${this.rarFields.Description}${rarRow}`) : '',
            rawRisk: this.rarFields['Raw Risk'] !== '' ? csts.models.Scans.workbooks.rar.val(rarTab, `${this.rarFields['Raw Risk']}${rarRow}`) : '',
            impact: this.rarFields.Impact !== '' ? csts.models.Scans.workbooks.rar.val(rarTab, `${this.rarFields.Impact}${rarRow}`) : '',
            likelihood: this.rarFields.Likelihood !== '' ? csts.models.Scans.workbooks.rar.val(rarTab, `${this.rarFields.Likelihood}${rarRow}`) : '',
            mitigation: this.rarFields.Mitigation !== '' ? csts.models.Scans.workbooks.rar.val(rarTab, `${this.rarFields.Mitigation}${rarRow}`) : '',
            residualRisk: this.rarFields['Residual Risk'] !== '' ? csts.models.Scans.workbooks.rar.val(rarTab, `${this.rarFields['Residual Risk']}${rarRow}`) : '',
            status: this.rarFields.Status !== '' ? csts.models.Scans.workbooks.rar.val(rarTab, `${this.rarFields.Status}${rarRow}`) : '',
            comment: this.rarFields.Comment !== '' ? csts.models.Scans.workbooks.rar.val(rarTab, `${this.rarFields.Comment}${rarRow}`) : '',
          });
        }
        rarRow += 1;
      }

      // all rar foundings are found, time to search the poam
      $.each($items, (index, element) => {
        let poamRow = 2;
        let found = false;

        // loop through all the poam until blanks are recieved
        while (poamRow < 5000) {
          // see if the vuln id from the rar is found anywhere in the poam
          if (this.compareVals('poam', poamTab, `${this.poamFields.Source}${poamRow}`, element.vulnId) || this.compareVals('poam', poamTab, `${this.poamFields['Test Id']}${poamRow}`, element.vulnId)) {
            found = true;
            if (!this.compareVals('poam', poamTab, `${this.poamFields.Status}${poamRow}`, element.status) && $.grep(fields, n => n.value === 'Status').length > 0) {
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
                poamVal: csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields.Status}${poamRow}`),
              });
            }

            if (!this.compareVals('poam', poamTab, `${this.poamFields['Security Control']}${poamRow}`, element.control) && $.grep(fields, n => n.value === 'Security Controls').length > 0) {
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
                poamVal: csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields['Security Control']}${poamRow}`),
              });
            }

            if (!this.compareVals('poam', poamTab, `${this.poamFields.Source}${poamRow}`, element.source) && $.grep(fields, n => n.value === 'Source').length > 0) {
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
                poamVal: csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields.Source}${poamRow}`),
              });
            }

            if (
              this.getRiskVal(element.rawRisk, 'CAT') !== this.getRiskVal(csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields['Raw Risk']}${poamRow}`), 'CAT') &&
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
                poamVal: csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields['Raw Risk']}${poamRow}`),
              });
            }

            if (this.getRiskVal(element.residualRisk, 'CAT') !== this.getRiskVal(csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields['Residual Risk']}${poamRow}`), 'CAT') &&
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
                poamVal: csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields['Residual Risk']}${poamRow}`),
              });
            }

            if (
              (!this.compareVals('poam', poamTab, `${this.poamFields.Description}${poamRow}`, element.description) &&
                ([$.trim(element.vulnId), ' - ', $.trim(element.description)].join()).toUpperCase() !== $.trim(csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields.Description}${poamRow}`)).toUpperCase() &&
                (['(', $.trim(element.vulnId), ')', ' - ', $.trim(element.description)].join()).toUpperCase() !== $.trim(csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields.Description}${poamRow}`)).toUpperCase() &&
                $.trim(csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields.Description}${poamRow}`).toUpperCase())
                  .replace(/\W/g, '').indexOf(element.description.toUpperCase().replace(/\W/g, '')) === -1
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
                poamVal: csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields.Description}${poamRow}`),
              });
            }

            if (
              (!this.compareVals('poam', poamTab, `${this.poamFields.Mitigation}${poamRow}`, element.mitigation) &&
                (csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields.Mitigation}${poamRow}`).toUpperCase()).replace(/\W/g, '').indexOf(element.mitigation.toUpperCase().replace(/\W/g, '')) === -1
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
                poamVal: csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields.Mitigation}${poamRow}`),
              });
            }

            if (
              (!this.compareVals('poam', poamTab, `${this.poamFields.Comment}${poamRow}`, element.comment) &&
                (csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields.Comment}${poamRow}`).toUpperCase()).replace(/\W/g, '').indexOf(element.comment.toUpperCase().replace(/\W/g, '')) === -1
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
                poamVal: csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields.Comment}${poamRow}`),
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
      while (poamRow < 5000) {
        if (csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields['Raw Risk']}${poamRow}`) !== 'IV') {
          const vulnId = csts.models.Scans.compareRarPoam.getVulnId('poam', poamTab, `${this.poamFields['Test Id']}${poamRow}`);

          $items.push({
            row: poamRow,
            vulnId,
            description: csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields.Description}${poamRow}`),
            control: csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields['Security Control']}${poamRow}`),
            source: csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields.Source}${poamRow}`),
            testId: csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields['Test Id']}${poamRow}`),
            rawRisk: csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields['Raw Risk']}${poamRow}`),
            mitigation: csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields.Mitigation}${poamRow}`),
            status: csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields.Status}${poamRow}`),
            comment: csts.models.Scans.workbooks.poam.val(poamTab, `${this.poamFields.Comment}${poamRow}`),
          });
        }
        poamRow += 1;
      }

      $.each($items, (index, element) => {
        rarRow = 8;
        let found = false;

        while (rarRow < 5000) {
          if (!this.compareVals('rar', rarTab, `${this.rarFields['Test Id']}${rarRow}`, element.vulnId)) {
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

      Description:
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
        if (String(vulnId).indexOf('Vuln ID:') >= 0) {
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

      Description:
        gets the filesystem statistics for the submitted file pathname

      Parameters:
        file - The file path being checked
    */
    parseFile(file) {
      return csts.plugins.fs.statSync(file);
    },
  },
};

