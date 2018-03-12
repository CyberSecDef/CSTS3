csts.models.STIG = {
  name: 'STIG',
  updateStig: {
    parseFile(file) {
      return csts.plugins.fs.statSync(file);
    },
    execute(source, destination) {
      let s = csts.libs.utils.parseXmlSync(csts.plugins.fs.readFileSync(source, 'utf8'));
      let t = csts.libs.utils.parseXmlSync(csts.plugins.fs.readFileSync(destination, 'utf8'));
      let d = {};

      if (typeof t.Benchmark !== 'undefined') {
        d.CHECKLIST = {};
        d.CHECKLIST.ASSET = [];
        d.CHECKLIST.ASSET.push({ });
        ['ASSET_TYPE','HOST_FQDN','HOST_GUID','HOST_IP','HOST_MAC','HOST_NAME','ROLE','TARGET_KEY','TECH_AREA','WEB_DB_INSTANCE','WEB_DB_SITE','WEB_OR_DATABASE'].forEach( (field) => {
          d.CHECKLIST.ASSET[0][field] = [''];
        });

        d.CHECKLIST.STIGS = [];
        d.CHECKLIST.STIGS.push({ iSTIG: [] });
        d.CHECKLIST.STIGS[0].iSTIG.push({ });
        d.CHECKLIST.STIGS[0].iSTIG[0].STIG_INFO = [];
        d.CHECKLIST.STIGS[0].iSTIG[0].STIG_INFO.push({ });
        d.CHECKLIST.STIGS[0].iSTIG[0].STIG_INFO[0].SI_DATA = [];
        d.CHECKLIST.STIGS[0].iSTIG[0].STIG_INFO[0].SI_DATA.push({ SID_NAME: ['version'], SID_DATA: t.Benchmark.version });
        d.CHECKLIST.STIGS[0].iSTIG[0].STIG_INFO[0].SI_DATA.push({ SID_NAME: ['classification'], SID_DATA: ['UNCLASSIFIED'] });
        d.CHECKLIST.STIGS[0].iSTIG[0].STIG_INFO[0].SI_DATA.push({ SID_NAME: ['customname'], SID_DATA: ['genByCSTSv3'] });
        d.CHECKLIST.STIGS[0].iSTIG[0].STIG_INFO[0].SI_DATA.push({ SID_NAME: ['stigid'], SID_DATA: [String(t.Benchmark.title).replace(/ /g,'_')] });
        d.CHECKLIST.STIGS[0].iSTIG[0].STIG_INFO[0].SI_DATA.push({ SID_NAME: ['description'], SID_DATA: t.Benchmark.description });
        d.CHECKLIST.STIGS[0].iSTIG[0].STIG_INFO[0].SI_DATA.push({ SID_NAME: ['filename'], SID_DATA: [csts.plugins.path.basename(destination)] });
        d.CHECKLIST.STIGS[0].iSTIG[0].STIG_INFO[0].SI_DATA.push({ SID_NAME: ['releaseinfo'], SID_DATA: [t.Benchmark['plain-text'][0]['_']] });
        d.CHECKLIST.STIGS[0].iSTIG[0].STIG_INFO[0].SI_DATA.push({ SID_NAME: ['title'], SID_DATA: t.Benchmark.title });
        d.CHECKLIST.STIGS[0].iSTIG[0].STIG_INFO[0].SI_DATA.push({ SID_NAME: ['uuid'], SID_DATA: [csts.libs.utils.getGuid()] });
        d.CHECKLIST.STIGS[0].iSTIG[0].STIG_INFO[0].SI_DATA.push({ SID_NAME: ['notice'], SID_DATA: [[t.Benchmark.notice][0][0]['$']['id']] });
        d.CHECKLIST.STIGS[0].iSTIG[0].STIG_INFO[0].SI_DATA.push({ SID_NAME: ['source'], SID_DATA: [JSON.stringify(t.Benchmark.reference)] });
        d.CHECKLIST.STIGS[0].iSTIG[0].VULN = [];

        t.Benchmark.Group.forEach( (vuln) => {
          const v = { COMMENTS: [''], FINDING_DETAILS: [''], SEVERITY_JUSTIFICATION: [''], SEVERITY_OVERRIDE: [''], STATUS: [''], STIG_DATA: [], };
          const description = csts.libs.utils.parseXmlSync(`<root>${vuln.Rule[0].description}</root>`.replace(/&lt;/g,'<').replace(/&gt;/g,'>'));  

          v.STIG_DATA.push({VULN_ATTRIBUTE:['Vuln_Num'], ATTRIBUTE_DATA: [vuln['$']['id']]});
          v.STIG_DATA.push({VULN_ATTRIBUTE:['Severity'], ATTRIBUTE_DATA: [vuln.Rule[0]['$']['severity']] });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['Weight'], ATTRIBUTE_DATA: [vuln.Rule[0]['$']['weight']] });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['Group_title'], ATTRIBUTE_DATA: vuln.title });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['Rule_ID'], ATTRIBUTE_DATA: [vuln.Rule[0]['$']['id']] });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['Rule_Ver'], ATTRIBUTE_DATA: vuln.Rule[0].version });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['Rule_Title'], ATTRIBUTE_DATA: vuln.Rule[0].title });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['Vuln_Discuss'], ATTRIBUTE_DATA: description.root.VulnDiscussion });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['IA_Controls'], ATTRIBUTE_DATA: description.root.IAControls });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['Check_Content'], ATTRIBUTE_DATA: vuln.Rule[0].check[0]['check-content'] });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['Fix_Text'], ATTRIBUTE_DATA: [vuln.Rule[0].fixtext[0]['_'] ] });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['False_Positives'], ATTRIBUTE_DATA: description.root.FalsePositives });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['False_Negatives'], ATTRIBUTE_DATA: description.root.FalseNegatives });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['Documentable'], ATTRIBUTE_DATA: description.root.Documentable });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['Mitigations'], ATTRIBUTE_DATA: description.root.Mitigations });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['Potential_Impact'], ATTRIBUTE_DATA: description.root.PotentialImpacts });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['Third_Party_Tools'], ATTRIBUTE_DATA: description.root.ThirdPartyTools });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['Mitigation_Control'], ATTRIBUTE_DATA: description.root.MitigationControl });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['Responsibility'], ATTRIBUTE_DATA: [description.root.Responsibility.join(', ')] });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['Security_Override_Guidance'], ATTRIBUTE_DATA: description.root.SeverityOverrideGuidance });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['Check_Content_Ref'], ATTRIBUTE_DATA: [vuln.Rule[0].check[0]['check-content-ref'][0]['$']['href']]  });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['Class'], ATTRIBUTE_DATA: ['Unclass'] });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['STIGRef'], ATTRIBUTE_DATA: [ `${t.Benchmark.title} :: ${t.Benchmark['plain-text'][0]['_']}`  ]});
          v.STIG_DATA.push({VULN_ATTRIBUTE:['TargetKey'], ATTRIBUTE_DATA: vuln.Rule[0].reference[0]['dc:identifier'] });
          v.STIG_DATA.push({VULN_ATTRIBUTE:['CCI_REF'], ATTRIBUTE_DATA: [vuln.Rule[0].ident[0]['_']] });
          d.CHECKLIST.STIGS[0].iSTIG[0].VULN.push(v);
        });

        // d = {};
      } else {
        d = t;
      }

      console.log(d);
      console.log(s);

      csts.plugins.jsonPath.value(s, '$..VULN').forEach((vuln) => {
        const vulnId = vuln.STIG_DATA.filter(a => a.VULN_ATTRIBUTE[0] === 'Vuln_Num')[0].ATTRIBUTE_DATA[0];
        const ruleId = vuln.STIG_DATA.filter(a => a.VULN_ATTRIBUTE[0] === 'Rule_ID')[0].ATTRIBUTE_DATA[0];
        console.log(ruleId);
        console.log(typeof ruleId);
        console.log(typeof d);
        let path = csts.plugins.jsonPath.paths(d, `$..STIG_DATA`);
        console.log(ruleId);
        if (path.length <= 0) {
          path = csts.plugins.jsonPath.paths(d, `$..STIG_DATA[?(@.ATTRIBUTE_DATA=="${vulnId}")]`);
        }

        if (path.length > 0) {
          path[0].pop();
          path[0].pop();

          ['STATUS', 'FINDING_DETAILS','COMMENTS','SEVERITY_OVERRIDE','SEVERITY_JUSTIFICATION'].forEach( (field) => {
            csts.plugins.jsonPath.value(d, csts.plugins.jsonPath.stringify(path[0].concat([field])), vuln[field] );
          });

          csts.controllers.STIG.updateStig.addRow([
            vuln.STIG_DATA.filter(a => a.VULN_ATTRIBUTE[0] === 'Group_Title')[0].ATTRIBUTE_DATA[0],
            vulnId,
            ruleId,
            vuln.STIG_DATA.filter(a => a.VULN_ATTRIBUTE[0] === 'Rule_Title')[0].ATTRIBUTE_DATA[0],
            csts.plugins.jsonPath.value(s, csts.plugins.jsonPath.stringify(path[0].concat(['STATUS'])) ),
            csts.plugins.jsonPath.value(s, csts.plugins.jsonPath.stringify(path[0].concat(['COMMENTS'])) ),
            'Transferred',
          ]);
        } else {
          csts.controllers.STIG.updateStig.addRow([
            vuln.STIG_DATA.filter(a => a.VULN_ATTRIBUTE[0] === 'Group_Title')[0].ATTRIBUTE_DATA[0],
            vulnId,
            ruleId,
            vuln.STIG_DATA.filter(a => a.VULN_ATTRIBUTE[0] === 'Rule_Title')[0].ATTRIBUTE_DATA[0],
            vuln.STATUS,
            vuln.COMMENTS,
            'Not Found',
          ]);
        }
      });

      ['ASSET_TYPE','HOST_FQDN','HOST_GUID','HOST_IP','HOST_MAC','HOST_NAME','ROLE','TARGET_KEY','TECH_AREA','WEB_DB_INSTANCE','WEB_DB_SITE','WEB_OR_DATABASE'].forEach( (field) => {
        d.CHECKLIST.ASSET[0][field] = typeof s.CHECKLIST.ASSET[0][field] !== 'undefined' ? s.CHECKLIST.ASSET[0][field] : ['']
      });

      return d;
    },
  },
};
