$(document).ready(function() {	

	$("button.fusionButton").click(function(){
		var searchTerm=$("input.fusionInput").val();
		window.location.href = "https://www.bc.edu/bc-web/schools/law/academics-faculty/search.html?key="+searchTerm;
	});
	
	$( "input.fusionInput" ).keypress(function( event ) {
		if ( event.which == 13 ) {
			event.preventDefault();
			var searchTerm=$(this).val();
			window.location.href = "https://www.bc.edu/bc-web/schools/law/academics-faculty/search.html?key="+searchTerm;
		}
	});
});