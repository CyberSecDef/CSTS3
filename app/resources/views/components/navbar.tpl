<header>
	<nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
		<a class="navbar-brand" href="/Home">CSTSv3</a>
		<button class="navbar-toggler d-lg-none" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
			<span class="navbar-toggler-icon"></span>
		</button>

		<div class="collapse navbar-collapse" id="navbarsExampleDefault">
			<ul class="navbar-nav mr-auto">
				<li class="nav-item dropdown <$= (url == '/' || url == '/Home' ? 'active' : '') $> ">

					<a class="nav-link dropdown-toggle" href="/Home" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						Home  
					</a>
					<div class="dropdown-menu" aria-labelledby="navbarDropdown">
						<a class="dropdown-item" href="/Home">Home</a>
						<div class="dropdown-divider"></div>
						<a class="dropdown-item" href="#">Reports</a>
						<a class="dropdown-item" href="#">Dashboard</a>
					</div>
				</li>
				
				<li class="nav-item dropdown <$= (url == '/Accounts' ? 'active' : '') $> ">
					<a class="nav-link dropdown-toggle" href="/Accounts" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						Accounts
					</a>
					<div class="dropdown-menu" aria-labelledby="navbarDropdown">
						<a class="dropdown-item" href="/Accounts/AdAttributes">AD Attribute Editor</a>
						<a class="dropdown-item" href="/Accounts/DormantAccounts">Dormant Accounts</a>
						<a class="dropdown-item" href="/Accounts/ManageAdmins">Administrators</a>
					</div>
				</li>
				
				<li class="nav-item dropdown <$= (url == '/Configurations' ? 'active' : '') $> ">
					<a class="nav-link dropdown-toggle" href="/Configurations" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						Configurations
					</a>
					<div class="dropdown-menu" aria-labelledby="navbarDropdown">
					
						<a class="dropdown-item" href="/Configs/wakeOnLan">Wake On Lan</a>
						<a class="dropdown-item" href="/Configs/applyPolicies">Apply Policies</a>
						<a class="dropdown-item" href="/Configs/fixDotNet">Fix Dot Net</a>
						<a class="dropdown-item" href="/Configs/preventSleep">Prevent Sleep</a>
						<a class="dropdown-item" href="/Configs/sslCertificates">SSL Certificates</a>
						<a class="dropdown-item" href="/Configs/serviceQuotes">Service Quotes</a>
						
					</div>
				</li>
				
				<li class="nav-item dropdown <$= (url == '/Packages' ? 'active' : '') $> ">
					<a class="nav-link dropdown-toggle" href="/Packages" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						Policies  
					</a>
					<div class="dropdown-menu" aria-labelledby="navbarDropdown">
						<a class="dropdown-item" href="/Packages/PolicyManager">Policy Manager</a>
						<a class="dropdown-item" href="/Packages/scap2Gpo">Scap To Gpo</a>
						<a class="dropdown-item" href="/Packages/Vram2Acas">Vram to Acas</a>
					</div>
				</li>
				
				<li class="nav-item dropdown <$= (url == '/Resources' ? 'active' : '') $> ">
					<a class="nav-link dropdown-toggle" href="/Resources" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						Resources
					</a>
					<div class="dropdown-menu" aria-labelledby="navbarDropdown">
						<a class="dropdown-item" href="/Resources/systemManager">System Manager</a>
						<a class="dropdown-item" href="/Resources/fileManager">File Manager</a>
						<a class="dropdown-item" href="/Resources/regEdit">Registry Editor</a>
						<a class="dropdown-item" href="/Resources/processes">Processes</a>
						<a class="dropdown-item" href="/Resources/systemInfo">System Info</a>
					</div>
				</li>
				
				<li class="nav-item dropdown <$= (url == '/Scans' ? 'active' : '') $> ">
					<a class="nav-link dropdown-toggle" href="/Scans" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						Scans
					</a>
					<div class="dropdown-menu" aria-labelledby="navbarDropdown">
						<a class="dropdown-item" href="/Scans/CleanScap">Clean Scap Folder</a>
						<a class="dropdown-item" href="/Scans/HwSwList">Hardware/Software List</a>
						<a class="dropdown-item" href="/Scans/software2Stig">Software To Stig</a>
						<a class="dropdown-item" href="/Scans/vramOpenFindings">Vram Open Findings</a>
						<a class="dropdown-item" href="/Scans/resourceComparison">Report Source Comparison</a>
						
						<div class="dropdown-divider"></div>
					</div>
				</li>
				
				<li class="nav-item dropdown <$= (url == '/STIG' ? 'active' : '') $> ">
					<a class="nav-link dropdown-toggle" href="/STIG" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						STIG
					</a>
					<div class="dropdown-menu" aria-labelledby="navbarDropdown">
						<a class="dropdown-item" href="/Stig/diacap">Diacap Controls</a>
						<a class="dropdown-item" href="/Stig/rmf">Rmf Controls</a>
						<a class="dropdown-item" href="/Stig/stig">Stig Requirements</a>
						<a class="dropdown-item" href="/Stig/scap">Scap Requirements</a>
						<div class="dropdown-divider"></div>
					</div>
				</li>
				
				<li class="nav-item dropdown <$= (url == '/Systems' ? 'active' : '') $> ">
					<a class="nav-link dropdown-toggle" href="/Systems" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						Systems
					</a>
					<div class="dropdown-menu" aria-labelledby="navbarDropdown">
						<a class="dropdown-item" href="/Systems/CleanUSB">Clean USB History</a>
						<a class="dropdown-item" href="/Systems/fileVerifications">File Verifications</a>
						<a class="dropdown-item" href="/Systems/scan4Wireless">Scan for Wireless</a>
						<a class="dropdown-item" href="/Systems/portScan">Port Scan</a>
						<a class="dropdown-item" href="/Systems/restart">Restart</a>
						<a class="dropdown-item" href="/Systems/secureWipe">Secure Wipe</a>
						<a class="dropdown-item" href="/Systems/updateHost">Update Host</a>
						<a class="dropdown-item" href="/Systems/windowsUpdates">Windows Updates</a>
						<div class="dropdown-divider"></div>
						<a class="dropdown-item" href="/Systems/parseEventLogs">Parse Event Logs</a>
						<a class="dropdown-item" href="/Systems/archiveEventLogs">Archive Event Logs</a>
						
					</div>
				</li>
				
				<li class="nav-item dropdown <$= (url == '/Help' ? 'active' : '') $> ">
					<a class="nav-link dropdown-toggle" href="/Help" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						Help
					</a>
					<div class="dropdown-menu" aria-labelledby="navbarDropdown">
						<a class="dropdown-item" href="/Help/Help">Help</a>
						<a class="dropdown-item" href="/Help/About">About</a>
						<div class="dropdown-divider"></div>
						<a class="dropdown-item" href="#">Version <span class="badge badge-info"><%= nw.App.manifest.version %></span></a>
						<a class="dropdown-item" href="#">View Count <span class="badge badge-success observable" id="viewCount" data-bind="value: viewCount"></span></a>
					</div>
				</li>
				
			</ul>
			
			<ul class="navbar-nav">
				<li class="nav-item dropdown">
					<a href="#" class="nav-link dropdown-toggle" id="navbarDropdownMenuLink" data-toggle="dropdown"
					   aria-haspopup="true" aria-expanded="false">
						<i class="fas fa-cog"></i> &nbsp;<%= username %>
					</a>
					<div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdownMenuLink">
						
						<div class="dropdown-divider"></div>
						<a href="#" class="dropdown-item" id="exit">Exit</a>
					</div>
				</li>
			</ul>
		</div>
	</nav>
</header>

<script>
$(document).ready(function(){
	$('#exit').on('click',function(){ nw.App.quit(); } );

	
});
</script>


