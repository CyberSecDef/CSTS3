if($args.count -eq 0){
	$computerName = $(hostname);
} else {
	$computerName = $args[0];
}

$results = @{};
$eventTypes = @(
	@{Id=307;Level=4;Logname='Microsoft-Windows-PrintService/Operational';ProviderName="Microsoft-Windows-PrintService"; },
	@{Id=43;Level=4;Logname='Microsoft-Windows-USBUSBHUB3-Analytic';ProviderName="Microsoft-Windows-USBUSBHUB3"; },
	@{Id=400,410;Level=4;Logname='Microsoft-Windows-Kernel-PnP/Device Configuration'; },
	@{Id=10000,10001;Level=4;Logname='Microsoft-Windows-NetworkProfile/Operational'; },
	@{Id=8000,8011,8001,8003,11000,11001,11002,11004,11005,11010,11006,8002,12011,12012,12013;Level=2,4;Logname='Microsoft-Windows-WLANAutoConfig/Operational';ProviderName="Microsoft-Windows-WLANAutoConfig"; },
	@{Id=1125,1127,1129;Level=2;Logname='System';ProviderName="Microsoft-Windows-GroupPolicy"; },
	@{Id=5038,6281;Level=4;Logname='Security';ProviderName="Microsoft-Windows-Security-Auditing"; },
	@{Id=3001,3002,3003,3004,3010,3023;Logname='Microsoft-Windows-CodeIntegrity/Operational';ProviderName="Microsoft-Windows-CodeIntegrity"; },
	@{Id=219;Level=3;Logname='System';ProviderName="Microsoft-Windows-Kernel-PnP"; },
	@{Id=4740,4728,4732,4756,4735,4624,4625,4648;Level=4;Logname='Security';ProviderName="Microsoft-Windows-Security-Auditing"; },
	@{Id=6;Level=4;Logname='System';ProviderName="Microsoft-Windows-FilterManager"; },
	@{Id=7045;Level=4;Logname='System';ProviderName="Service Control Manager"; },
	@{Id=1022,1033;Level=4;Logname='Application';ProviderName="MsiInstaller"; },
	@{Id=903,904;Level=4;Logname='Microsoft-Windows-Application-Experience/Program-Inventory';ProviderName="Microsoft-Windows-Application-Experience"; },
	@{Id=905,906;Level=4;Logname='Microsoft-Windows-Application-Experience/Program-Inventory';ProviderName="Microsoft-Windows-Application-Experience"; },
	@{Id=907,908;Level=4;Logname='Microsoft-Windows-Application-Experience/Program-Inventory';ProviderName="Microsoft-Windows-Application-Experience"; },
	@{Id=800;Level=4;Logname='Microsoft-Windows-Application-Experience/Program-Inventory';ProviderName="Microsoft-Windows-Application-Experience"; },
	@{Id=2;Level=4;Logname='Setup';ProviderName="Microsoft-Windows-Servicing"; },
	@{Id=19;Level=4;Logname='System';ProviderName="Microsoft-Windows-WindowsUpdateClient"; },
	@{Id=104;Level=4;Logname='System';ProviderName="Microsoft-Windows-Eventlog"; },
	@{Id=1102;Level=4;Logname='Security';ProviderName="Microsoft-Windows-Eventlog"; },
	@{Id=1000;Level=2;Logname='Application';ProviderName="Application Error"; },
	@{Id=1002;Level=2;Logname='Application';ProviderName="Application Hang"; },
	@{Id=1001;Level=2;Logname='System';},
	@{Id=1001;Level=4;Logname='Application';ProviderName="Windows Error Reporting"; },
	@{Id=1,2;Level=2,4;Logname='Application';ProviderName="EMET"; },
	@{Id=7022,7023,7024,7026,7031,7032,7034;Level=2;Logname='System';ProviderName="Service Control Manager"; },
	@{Id=20,24,25,31,34,35;Level=2;Logname='Microsoft-Windows-WindowsUpdateClient/Operational';ProviderName="Microsoft-Windows-WindowsUpdateClient"; },
	@{Id=1009;Level=4;Logname='Setup';ProviderName="Microsoft-Windows-Servicing"; },
	@{Id=2004,2005,2006,2033;Level=4;Logname='Microsoft-Windows-Windows Firewall With Advanced Security/Firewall';ProviderName="Microsoft-Windows-Windows Firewall With Advanced Security"; },
	@{Id=2009;Level=2;Logname='Microsoft-Windows-Windows Firewall With Advanced Security/Firewall';ProviderName="Microsoft-Windows-Windows Firewall With Advanced Security"; },
	@{Id=1074,6008;Logname='System'; }
)

$availLogs =  get-winEvent -computerName $computerName -ListLog  *
foreach($type in $eventTypes){
	if( $availLogs.Logname -contains $type.logname){
		$logs = get-winevent -computerName $computerName -filterHash $type -ErrorAction SilentlyContinue
		if($results[$type.Logname] -eq $null -and $logs.length -gt 0){
			$results[$type.Logname] = @();
		}
		$results[$type.Logname] += $logs;
	}
}

$results | convertTo-json -Depth 10 -Compress | write-host