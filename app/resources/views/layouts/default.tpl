<%- include('../components/navbar.tpl'); %>

<main role="main" class="container-fluid h-100">
	<div class="row h-100">
		<div class="col" id="main-left-col"></div>
		<div class="col-8" id="main-center-col"></div>
		<div class="col" id="main-right-col">
			<%- include('../components/hosts.tpl'); %>
		</div>
	</div>
</main>

<%- include('../components/footer.tpl'); %>