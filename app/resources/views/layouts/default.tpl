
<body>
	{{> app/resources/views/components/navbar }}
	
	

	<main role="main" class="container">
		{{ test }}
		<div class="mt-3">
			<h1>Cyber Security Tool Suite - Version 3</h1>
		</div>
		<p class="lead">
		The Cyber Security Tool Suite is a suite of PowerShell scripts that will help automate and validate various Cyber Security processes. 
		This version is aiming to be cross-platform from the beginning, thanks to the NWJS framework built on top of the Node.JS suite and the Chromium runtime.
		</p>
		
		<p>
			Navigation:
			<ul>
				<li>The navigation bar at the top of this display breaks the multiple functions down into similar groups.</li>
				<li>The panel on the right hand side of the form allows you to select hosts either by manually entering them (seperated by commas) or by selecting an OU from your domain environment.</li>
				<li>The status bar at the bottom of the window is updated as the various tools are executing.</li>
			</ul>
		</p>
		
		
		
		
	</main>

	<footer class="footer">
		<div class="container">
			<div class="col-3 status-bar-l"></div>
			<div class="col-3 status-bar-m"></div>
			<div class="col-3 status-bar-r"></div>
		</div>
	</footer>

</body>
