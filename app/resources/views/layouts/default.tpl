<%- include('../components/navbar.tpl'); %>

<main role="main" id="main-content" class="container-fluid h-100">
	<div class="errors" id="errors"></div>
	<div class="row h-100">
		<div class="col-10" id="main-center-col"></div>
		<div class="col-2" id="main-right-col">
			<%- include('../components/hosts.tpl'); %>
		</div>
	</div>
</main>

<%- include('../components/modal.tpl'); %>
<%- include('../components/footer.tpl'); %>
