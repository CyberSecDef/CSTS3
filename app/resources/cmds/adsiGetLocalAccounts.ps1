[CmdletBinding()]param(
	$computer = "localhost",
	$age = 30
)
([ADSI]"WinNT://$($computer)").Children | 
	? { $_.SchemaClassName -eq 'user'} | 
	? { $_.properties.lastlogin -lt ( ( ([System.DateTime]::Now).ToUniversalTime() ).AddDays(-1 * $age) ) -or $_.properties.lastlogin -eq $null } | 
	select @{e={$_.name};n='DisplayName'},
		@{e={$_.name};n='Username'},
		@{e={$_.properties.lastlogin};n='LastLogon'},
		@{e={if($_.properties.userFlags.ToString() -band 2){$true}else{$false} };n='Disabled'},
		@{e={'Local'};n='AccountType'} | 
	convertTo-json 