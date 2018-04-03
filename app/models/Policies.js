csts.models.Policies = {
  name: 'Policies',
  scap2gpo: {
    name: 'scap2gpo',
    execute(xccdfFile, ovalFile) {
      const caller = this;
      const timestamp = csts.plugins.moment().format('YYYYMMDD_HHmmss');

      csts.plugins.fs.writeFileSync(
        `./app/storage/results/${caller.name}_${timestamp}.adm`,
        require('child_process')
          .execSync(`powershell.exe -file "./app/resources/views/xslt/processXslt.ps1" "./app/resources/views/xslt/scap2adm.xml" "./app/resources/views/xslt/scap2adm.xsl" "x" "${xccdfFile}" "o" "${ovalFile}"`)
          .toString()
      );

      csts.plugins.fs.writeFileSync(
        `./app/storage/results/${caller.name}_${timestamp}.admx`,
        require('child_process')
          .execSync(`powershell.exe -file "./app/resources/views/xslt/processXslt.ps1" "./app/resources/views/xslt/scap2admx.xml" "./app/resources/views/xslt/scap2admx.xsl" "x" "${xccdfFile}" "o" "${ovalFile}"`)
          .toString()
      );

      csts.plugins.fs.writeFileSync(
        `./app/storage/results/${caller.name}_${timestamp}.adml`,
        require('child_process')
          .execSync(`powershell.exe -file "./app/resources/views/xslt/processXslt.ps1" "./app/resources/views/xslt/scap2adml.xml" "./app/resources/views/xslt/scap2adml.xsl" "x" "${xccdfFile}" "o" "${ovalFile}"`)
          .toString()
      );      

      return timestamp;
    },
  },
};
