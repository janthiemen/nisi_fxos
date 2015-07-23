//Check for first run
if (localStorage.accesskey) {
	//alert("You're logged into pocket! We're now redirecting you to NISI.");
	window.location.href = "index.html";
}

//Set the iframe size to the screen size, minus the header and the input

/*console.log($('#articles_container').height());
console.log($(window).height());
console.log($(document).height());

var headerHeight = $('#header').height();
var inputHeight = $('#input_form').height();
var viewportHeight = $(window).height();
var newHeight = viewportHeight - headerHeight - inputHeight;
$('#token_iframe').height(newHeight);*/

$('#submitForm').click(function() {
	//check if the token is 30 characters
	console.log("start verification");
	var token = document.getElementById('token').value;
	console.log(token);
	if (token.length == 30) {
		console.log("token accepted");
		localStorage.accesskey = token;
		window.location.href = "index.html";
	} else {
		console.log("token rejected");
		alert("the access token needs to be 30 characters long!");
	}
});

window.addEventListener('message', receiveMessage, false);
	  
function receiveMessage(evt) {
	console.log("Got the token!");
	//alert("got message: " + evt.data);
	localStorage.accesskey = evt.data;
	window.location.href = "index.html";
}
window.open("https://sakila-afero.rhcloud.com/nisi/auth.php");