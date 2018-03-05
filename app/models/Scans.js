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

      return summary;
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

      this.scans.scap.map((e) => { return `${e.title} - V${e.version}R${e.release}`; }).sort().filter((value, index, self) => self.indexOf(value) === index).forEach((scapScan) => {
        console.log(scapScan);
        const results = {};

        const hosts = [];
        const dates = [];
        this.scans.scap.filter((e) => { return scapScan === `${e.title} - V${e.version}R${e.release}`; }).forEach((scapResult) => {
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

      this.scans.ckl.sort((a, b) =>  a.title > b.title ? 1 : b.title > a.title ? -1 : 0).forEach((cklScan) => {
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

          if (csts.models.Scans.scans2poam.scans.ckl.filter(stig => stig.title === scap.title).length > 0) {
            csts.models.Scans.scans2poam.scans.ckl.filter(stig => stig.title === scap.title).forEach((c) => {
              if (r.status !== c.requirements.filter(cr => cr.vulnId === r.vulnId ).map(cr => cr.status).join(', ')) {
                results.push({
                  Title: scap.title,
                  Hosts: csts.models.Scans.scans2poam.scans.scap.filter(s => s.title === scap.title && s.requirements.filter(srf => srf.status !== 'Completed').length > 0)
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
              Hosts: csts.models.Scans.scans2poam.scans.scap.filter(s => s.title === scap.title && s.requirements.filter(srf => srf.status !== 'Completed').length > 0)
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
      Method: getRar

      Description:
        Generates the RAR tab
    */
    getRar() {
      const results = [];
      csts.plugins.jsonQuery('acas[*].hosts[*].requirements[*].pluginId', { data: csts.models.Scans.scans2poam.scans }).value.sort().filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; }).forEach((element) => {
        const acasPlugin = csts.plugins.jsonQuery(`acas[*].hosts[*].requirements[pluginId = ${element}`, { data: csts.models.Scans.scans2poam.scans }).value;

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
          'Technical Mitigation(s)/Remediation(s) (16d.2)': '',
          'Severity or Pervasiveness (VL-VH) (16d.3)': this.getRiskVal(acasPlugin.severity, 'VL-VH'),
          'Relevance of Threat (VL-VH) (16e)': this.getRiskVal(acasPlugin.severity, 'VL-VH'),
          'Threat Description (16e.1)': acasPlugin.description,
          Resources: '',
          'Likelihood (Cells 16d.3 & 16e) (VL-VH) (16f)': this.getRiskVal(acasPlugin.severity, 'VL-VH'),
          'Impact (VL-VH) (16g)': this.getRiskVal(acasPlugin.severity, 'VL-VH'),
          'Impact Description (16h)': '',
          'Risk (Cells 16f & 16g) (VL-VH) (16i)': this.getRiskVal(acasPlugin.severity, 'VL-VH'),
          'Proposed Mitigations (From POA&M) (16j)': acasPlugin.solution,
          'Residual Risk (After Proposed Mitigations) (16k)': '',
          Status: 'Ongoing',
          'Recommendations (16l)': acasPlugin.comments,
          // pluginId: element,
        });
      });

      // unique list of requirements for scap and ckl
      const ckls = csts.plugins.jsonQuery('ckl[*].requirements[*status!=Completed].vulnId', {data : csts.models.Scans.scans2poam.scans}).value.sort().filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; });
      const scaps = csts.plugins.jsonQuery('scap[*].requirements[*status!=Completed].vulnId', {data : csts.models.Scans.scans2poam.scans}).value.sort().filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; });
      // ckl and scap
      ckls.filter(e => scaps.includes(e)).concat(scaps.filter(e => ckls.includes(e))).sort()
        .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; }).forEach((element) => {
          const cklReq = csts.plugins.jsonQuery(`ckl[*].requirements[vulnId=${element}]`, { data: csts.models.Scans.scans2poam.scans }).value;

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
            'Technical Mitigation(s)/Remediation(s) (16d.2)': cklReq.comments,
            'Severity or Pervasiveness (VL-VH) (16d.3)': this.getRiskVal(cklReq.severity, 'VL-VH'),
            'Relevance of Threat (VL-VH) (16e)': this.getRiskVal(cklReq.severity, 'VL-VH'),
            'Threat Description (16e.1)': cklReq.description,
            Resources: cklReq.resources,
            'Likelihood (Cells 16d.3 & 16e) (VL-VH) (16f)': this.getRiskVal(cklReq.severity, 'VL-VH'),
            'Impact (VL-VH) (16g)': this.getRiskVal(cklReq.severity, 'VL-VH'),
            'Impact Description (16h)': '',
            'Risk (Cells 16f & 16g) (VL-VH) (16i)': this.getRiskVal(cklReq.severity, 'VL-VH'),
            'Proposed Mitigations (From POA&M) (16j)': cklReq.solution,
            'Residual Risk (After Proposed Mitigations) (16k)': '',
            Status: cklReq.status,
            'Recommendations (16l)': '',
            // pluginId: '',
          });
        });

      // just ckl
      ckls.filter(e => !scaps.includes(e)).sort()
        .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; }).forEach((element) => {
          const cklReq = csts.plugins.jsonQuery(`ckl[*].requirements[vulnId=${element}]`, { data: csts.models.Scans.scans2poam.scans }).value;

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
            'Technical Mitigation(s)/Remediation(s) (16d.2)': cklReq.comments,
            'Severity or Pervasiveness (VL-VH) (16d.3)': this.getRiskVal(cklReq.severity, 'VL-VH'),
            'Relevance of Threat (VL-VH) (16e)': this.getRiskVal(cklReq.severity, 'VL-VH'),
            'Threat Description (16e.1)': cklReq.description,
            Resources: cklReq.resources,
            'Likelihood (Cells 16d.3 & 16e) (VL-VH) (16f)': this.getRiskVal(cklReq.severity, 'VL-VH'),
            'Impact (VL-VH) (16g)': this.getRiskVal(cklReq.severity, 'VL-VH'),
            'Impact Description (16h)': '',
            'Risk (Cells 16f & 16g) (VL-VH) (16i)': this.getRiskVal(cklReq.severity, 'VL-VH'),
            'Proposed Mitigations (From POA&M) (16j)': cklReq.solution,
            'Residual Risk (After Proposed Mitigations) (16k)': '',
            Status: cklReq.status,
            Recommendations: '',
            // pluginId: '',
          });
        });

      // just scap (this should be impossible if SCAP and STIG is done properly)
      scaps.filter(e => !ckls.includes(e)).sort()
        .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; }).forEach((element) => {
          const scapReq = csts.plugins.jsonQuery(`scap[*].requirements[vulnId=${element}]`, { data: csts.models.Scans.scans2poam.scans }).value;

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
            'Technical Mitigation(s)/Remediation(s) (16d.2)': scapReq.comments,
            'Severity or Pervasiveness (VL-VH) (16d.3)': this.getRiskVal(scapReq.severity, 'VL-VH'),
            'Relevance of Threat (VL-VH) (16e)': this.getRiskVal(scapReq.severity, 'VL-VH'),
            'Threat Description (16e.1)': scapReq.description,
            Resources: scapReq.resources,
            'Likelihood (Cells 16d.3 & 16e) (VL-VH) (16f)': this.getRiskVal(scapReq.severity, 'VL-VH'),
            'Impact (VL-VH) (16g)': this.getRiskVal(scapReq.severity, 'VL-VH'),
            'Impact Description (16h)': '',
            'Risk (Cells 16f & 16g) (VL-VH) (16i)': this.getRiskVal(scapReq.severity, 'VL-VH'),
            'Proposed Mitigations (From POA&M) (16j)': scapReq.solution,
            'Residual Risk (After Proposed Mitigations) (16k)': '',
            Status: scapReq.status,
            Recommendations: '',
            // pluginId: '',
          });
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
        VL: 0, L: 1, M: 2, H: 3, VH: 4, NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4, CATIV: 0, CATIII: 1, CATII: 2, CATI: 3, 'CAT IV': 0, 'CAT III': 1, 'CAT II': 2, 'CAT I': 3, MODERATE: 2, 0: 0, 1: 1, 2: 2, 3: 3, 4: 4
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

    getPoam() {
      const results = [];
      csts.plugins.jsonQuery('acas[*].hosts[*].requirements[*].pluginId', { data: csts.models.Scans.scans2poam.scans }).value.sort().filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; }).forEach((element) => {
        const acasPlugin = csts.plugins.jsonQuery(`acas[*].hosts[*].requirements[pluginId = ${element}`, { data: csts.models.Scans.scans2poam.scans }).value;

        results.push({
          'Control Vulnerability Description': `Title: ${acasPlugin.title}

Description:
  ${acasPlugin.description}

Devices Affected:
  ${csts.plugins.jsonQuery(
    "acas[*].hosts[*hostname!='']",
    { data: csts.controllers.Scans.scans2poam.scans },
  ).value.filter(host => host.requirements.filter(req => req.pluginId === element).length).map(h => h.hostname).sort().join(', ')
}`,
          'Security Control Number (NC/NA controls only)': '',
          'Office/Org': '',
          'Security Checks': `Group ID: ${acasPlugin.grpId}
Vuln ID: 
Rule ID: 
Plugin ID: ${element}`,
          'Raw Severity Value': this.getRiskVal(acasPlugin.severity, 'CAT'),
          Mitigations: '',
          'Severity Value': this.getRiskVal(acasPlugin.severity, 'CAT'),
          'Resources Required': '',
          'Scheduled Completion Date': '',
          'Milestone with Completion Dates': '',
          'Milestone Changes': '',
          'Source Identifying Control Vulnerability': 'Assured Compliance Assessment Solution (ACAS) Nessus Scanner',
          Status: 'Ongoing',
          Comments: acasPlugin.comments,
        });
      });

      // unique list of requirements for scap and ckl
      const ckls = csts.plugins.jsonQuery('ckl[*].requirements[*status!=Completed].vulnId', {data : csts.models.Scans.scans2poam.scans }).value.sort().filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; });
      const scaps = csts.plugins.jsonQuery('scap[*].requirements[*status!=Completed].vulnId', {data : csts.models.Scans.scans2poam.scans }).value.sort().filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; });

      // ckl and scap
      ckls.filter(e => scaps.includes(e)).concat(scaps.filter(e => ckls.includes(e))).sort()
        .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; }).forEach((element) => {
          const cklReq = csts.plugins.jsonQuery(`ckl[*].requirements[vulnId=${element}]`, { data: csts.models.Scans.scans2poam.scans }).value;

          results.push({
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
            'Security Checks': `Group ID: ${cklReq.grpId}
Vuln ID: ${cklReq.vulnId}
Rule ID: ${cklReq.ruleId}
Plugin ID:`,
            'Raw Severity Value': this.getRiskVal(cklReq.severity, 'CAT'), 
            Mitigations: '',
            'Severity Value': this.getRiskVal(cklReq.severity, 'CAT'), 
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
            Comments: cklReq.comments,
          });
        });

      // just ckl
      ckls.filter(e => !scaps.includes(e)).sort()
        .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; }).forEach((element) => {
          const cklReq = csts.plugins.jsonQuery(`ckl[*].requirements[vulnId=${element}]`, { data: csts.models.Scans.scans2poam.scans }).value;
          results.push({
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
            'Security Checks': `Group ID: ${cklReq.grpId}
Vuln ID: ${cklReq.vulnId}
Rule ID: ${cklReq.ruleId}
Plugin ID:`,
            'Raw Severity Value': this.getRiskVal(cklReq.severity, 'CAT'),
            Mitigations: '',
            'Severity Value': this.getRiskVal(cklReq.severity, 'CAT'),
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
            Comments: cklReq.comments,
          });
        });

      // just scap (this should be impossible if SCAP and STIG is done properly)
      scaps.filter(e => !ckls.includes(e)).sort()
        .filter((el, i, a) => { if (i === a.indexOf(el)) return 1; return 0; }).forEach((element) => {
          const scapReq = csts.plugins.jsonQuery(`scap[*].requirements[vulnId=${element}]`, { data: csts.models.Scans.scans2poam.scans }).value;

          results.push({
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
            'Security Checks': `Group ID: ${scapReq.grpId}
Vuln ID: ${scapReq.vulnId}
Rule ID: ${scapReq.ruleId}
Plugin ID:`,
            'Raw Severity Value': this.getRiskVal(scapReq.severity, 'CAT'), 
            Mitigations: '',
            'Severity Value': this.getRiskVal(scapReq.severity, 'CAT'), 
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
            Comments: scapReq.findingDetails,
          });
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
        

        xccdfData.credentialed = true;
        xccdfData.scanFile = fileName;
        xccdfData.hostname = csts.plugins.jsonPath.value(result, "$['cdf:Benchmark']['cdf:TestResult'][0]['cdf:target'][0]");
        xccdfData.title = csts.plugins.jsonPath.flatValue(result, "$['cdf:Benchmark']['cdf:title']");
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
            vulnerability.vulnId = result['cdf:Benchmark']['cdf:Group'].filter( e => e['cdf:Rule'][0]['$'].id ===  element.$.idref )[0]['$'].id;
            vulnerability.comments = '';
            vulnerability.findingDetails = JSON.stringify(element);

            vulnerability.cci = [];
            if (!csts.libs.utils.isBlank(ruleData[0]['cdf:ident'])) {
              ruleData[0]['cdf:ident'].forEach((cci) => {
                vulnerability.cci.push(cci._);
              });
            }
            vulnerability.iaControls = '';
            csts.plugins.xml2js.parseString(`<root>${ruleData[0]['cdf:description'].reduce(a => a).replace('&gt;', '>').replace('&lt;', '<')}</root>`,  (e, r) => { if(typeof r !== 'undefined' && typeof r.root !== 'undefined') vulnerability.iaControls = r.root.IAControls; });

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
              default:
                vulnerability.status = 'Ongoing';
            }

            xccdfData.requirements.push(vulnerability);
          });

        this.scans.scap.push(xccdfData);
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
        cklData.hostname = [csts.plugins.jsonPath.value(result, '$..HOST_NAME')][0].reduce( a => a );
        cklData.title = csts.plugins.jsonPath.flatValue(result, "$..STIG_INFO[0].SI_DATA[?(@.SID_NAME=='title')].SID_DATA");

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
        nessusData.scanType = 'acas';
        nessusData.scanFile = fileName;
        nessusData.hosts = [];
        result.NessusClientData_v2.Report[0].ReportHost.forEach((host) => {
          const hostData = {};
          hostData.hostname = host.HostProperties[0].tag.filter(a => a.$.name === 'host-fqdn')[0]._;
          if (hostData.hostname.indexOf('.') >= 0) {
            hostData.hostname = hostData.hostname.substr(0, hostData.hostname.indexOf('.'));
          }
          hostData.scanDate = csts.plugins.moment(host.HostProperties[0].tag.filter(a => a.$.name === 'HOST_START')[0]._)
            .format('MM/DD/YYYY HH:mm');
          hostData.credentialed = host.HostProperties[0].tag.filter(a => a.$.name === 'Credentialed_Scan')[0]._;

          const os = host.HostProperties[0].tag.filter(a => a.$.name === 'operating-system')[0];
          hostData.os = typeof os !== 'undefined' ? typeof os._ !== 'undefined' ? os._ : os : '';
          hostData.scanEngine = host.ReportItem.filter(a => a.$.pluginID === '19506')[0].plugin_output[0].match(new RegExp('Nessus version : ([0-9.]+)'))[1];
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
      console.log(unzippedFs.contents());
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
          csts.models.Scans.workbooks[workbook].Sheets[sheet][address].v.replace(/\s/g, '').toUpperCase()
            .indexOf(val.replace(/\s/g, '').toUpperCase()) >= 0
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

