/* -----------------------
    DATA PROCESSING
----------------------- */
//Check for first run
//alert(localStorage.accesskey);
pocketkey = "POCKETCONSUMERKEY";
readabilityToken= "READABILITYTOKEN";
if (!localStorage.accesskey) {
	window.location.href = "login.html";
}
if (!localStorage.list) {
	$.post('https://getpocket.com/v3/get', "state=all&consumer_key=" + pocketkey + "&access_token="+localStorage.accesskey, function (response) {
        console.log(response);  
		var response_json = JSON.parse(response);
		var article_list = response_json.list;
		localStorage.since = response_json.since;
		console.log(article_list);
		localStorage.list = JSON.stringify(response_json.list);
		parseArticles ();
		localStorage.sortingName = 'timestamp'; 
		localStorage.sortingAsc = true;
    });
} else {
	loadArticleList ();
}

function articleSkin () {
	if(!localStorage.articleSkin) {
		$('section').css('background', '#fff');
		$('section').css('color', '#000000');
		$('.span_colored').css('color', '#000000');
	} else if(localStorage.articleSkin == "white") {
		$('section').css('background', '#fff');
		$('section').css('color', '#000000');
		$('.span_colored').css('color', '#000000');
	} else if(localStorage.articleSkin == "soft_white") {
		$('section').css('background', '#FFFEEE');
		$('section').css('color', '#292929');
		$('.span_colored').css('color', '#292929');
	} else if(localStorage.articleSkin == "black") {
		$('section').css('background', '#000000');
		$('section').css('color', '#fff');
		$('.span_colored').css('color', '#fff');
	} else if(localStorage.articleSkin == "grey"){
		$('section').css('background', '#292929');
		$('section').css('color', '#fff');
		$('.span_colored').css('color', '#fff');
	}
}
articleSkin();

function loadArticleList () {
	var ts = Math.round((new Date()).getTime() / 1000);
	//Check if the user comes from the settings menu, if so, send him directly to parsing
	if (localStorage.loaded != 'true' && ts - localStorage.since >= 300) {
		$.post('https://getpocket.com/v3/get', "state=all&since="+localStorage.since+"&consumer_key=" + pocketkey + "&access_token="+localStorage.accesskey, function (response) {
			console.log(response);
			var response_json = JSON.parse(response);
			var article_list = response_json.list;
			console.log("stored since: "+localStorage.since);
			console.log("response since: "+response_json.since);
			localStorage.since = response_json.since;
			var storedlist = JSON.parse(localStorage.list);
		
			for (var property in article_list) {
				if (article_list.hasOwnProperty(property)) {
					console.log(article_list[property]);
					if (article_list[property].status != 2) {
						if (!storedlist[property]) {
							console.log("added");
							storedlist[property] = article_list[property];
						} else {
							console.log("altered");
							delete storedlist[property];
							storedlist[property] = article_list[property];
						}
					} else if (article_list[property].status == 2) {
						console.log("Deleted");
						delete storedlist[property];
					}
				}
			}
			localStorage.list = JSON.stringify(storedlist);
			parseArticles ();
		});
	} else {
		if (localStorage.loaded != 'true' && ts - localStorage.since < 300) alert("Please wait a moment before refreshing the list.");
		console.log("just parsing!");
		console.log(localStorage.loaded == 'true');
		parseArticles ();
	}	
}

function parseArticles (favorite) {
	$("#articles").empty();
	var article_list = JSON.parse(localStorage.list);
	
	//Allow it to load on next run
	localStorage.loaded = false;

	console.log(article_list);

	var values = [];
	for (var property in article_list) {
		if (article_list.hasOwnProperty(property)) {
			var url = article_list[property].resolved_url;
			if (url) {
				var timestamp = article_list[property].time_added;
				var date = new Date(timestamp*1000);
				var month = date.getMonth() + 1;
				var hours = date.getHours() + 1;
				var minutes = date.getMinutes() + 1;
				var time = date.getFullYear() +'-'+month+'-'+date.getDate();+' '+hours+':'+minutes
				$('#articles').append('<li article-url="'+url+'" article-id="'+article_list[property].item_id+'" id="article'+article_list[property].item_id+'"><a id="article-href" href="#"><p id="article-title"><span class="title span_colored">'+article_list[property].resolved_title+'</span></p><p id="article-content"><span class="time span_colored">'+time+' </span><span class="span_colored excerpt">'+article_list[property].excerpt+'</span><span class="favorite">'+article_list[property].favorite+'</span><span class="status">'+article_list[property].status+'</span><span class="timestamp">'+timestamp+'</span></p></a></li>');
				document.getElementById('article'+article_list[property].item_id).addEventListener('click',function(url) {
					console.log("hello!");
					console.log(this);
					//article id:
					console.log(this.attributes[1].value);
					//article url:
					console.log(this.attributes[2].value);
					getArticle(this.attributes[2].value,this.attributes[1].value);
				},false);
			} else {
				console.log("HEY! That isn't a valid article!");
			}
		}
	}
	/* Add eventlisteners to all lis we've just created */
	/*var myLi = document.getElementById('articles').getElementsByTagName('li');

	for(i=0;i<=myLi.length;i++){
		myLi[i].addEventListener('click','call'+[i],false);
	}*/
	
	console.log($('#articles_container').height());
	console.log($(window).height());
	console.log($(document).height());

	var headerHeight = $('#list_header').height();
	var toolbarHeight = $('#main_toolbar').height();
    var viewportHeight = $(window).height();
    var newHeight = viewportHeight - headerHeight - toolbarHeight;
    $('#articles_container').height(newHeight);
	
	listInitFunc();
}

function getArticle (url, itemid) {
    //UI STUFF
    viewArticle.classList.remove('back-Article-view');
	viewHome.classList.add('back-home');	
	viewArticle.classList.add('move-Article-view');

    $('#article_title').replaceWith('<h1 id="article_title">Loading</h1>');
    $('#article_content_container').replaceWith('<div id="article_content_container"><progress></progress><button id="openUrl_button"><span>Open in browser</span></button></div>');
    $('#openUrl_button').click(function() {
		openUrl ();
	});
    //DATA STUFF
	window.itemid = itemid;
    var escapedurl = escape(url);
	if (localStorage.getItem(escapedurl)) {
		handleArticleData(localStorage.getItem(escapedurl));
	} else {
		$.getJSON('https://www.readability.com/api/content/v1/parser?token=' + readabilityToken + '&url='+escapedurl, function(remoteData){
			console.log(remoteData);
			var remoteData_string = JSON.stringify(remoteData);
			localStorage.setItem(escapedurl, remoteData_string);
			console.log(localStorage.getItem(escapedurl));
			handleArticleData(localStorage.getItem(escapedurl));
		})
	}
}

function handleArticleData (data) {
	var article_list = JSON.parse(localStorage.list);
	if (article_list[window.itemid].favorite == 1) {
			$('#favorite_button').text("Unfavorite");
	}
	console.log(data);
	data_json = JSON.parse(data);
	$('#article_title').replaceWith('<h1 id="article_title">'+data_json.title+'</h1>');
	$('#article_content_container').replaceWith('<div id="article_content_container">'+data_json.content+'</div>');
	console.log($('#articleview_header').height());
	console.log($(window).height());
	console.log($(document).height());
    var headerHeight = $('#articleview_header').height();
    var viewportHeight = $(window).height();
    var newHeight = viewportHeight - headerHeight;
    $('#article_content_container').height(newHeight);
}

function showOptions () {
	$('#options_container').css('display','block');
}

function modifyArticle (action) {
	var article_list = JSON.parse(localStorage.list);
	if (action == "favorite") {
		if (article_list[window.itemid].favorite == 1) {
			action = "unfavorite";
		}
	}
	var query = encodeURIComponent('[{"action":"'+action+'","item_id":"'+window.itemid+'"}]');
	$.post('https://getpocket.com/v3/send', "actions="+query+"&consumer_key=" + pocketkey + "&access_token="+localStorage.accesskey, function (response) {
        console.log(response);  
		switch(action) {
			case "delete":
				alert("The article was succesfully deleted from your pocket account.");
			break;
			case "archive":
				alert("The article was succesfully archived.");
			break;
			case "favorite":
				alert("The article was succesfully favorited.");
			break;
			case "unfavorite":
				alert("The article was succesfully unfavorited.");
			break;
		}
    });
}

function listInitFunc () {
	//List.js stuff
	var options = {
		valueNames: [ 'title', 'timestamp', 'excerpt', 'favorite', 'status' ]
    };
	articlesListjs = new List('articles_container', options);
	
	if (localStorage.sortingName) {
		console.log(localStorage.sortingName);
		asc = (localStorage.sortingAsc == 'true')	? true : false;
		articlesListjs.sort(localStorage.sortingName, { asc: asc });
	} else {
		console.log("no sort selected");
		articlesListjs.sort('timestamp', { asc: false });
	}
	articlesListjs.filter(function(item) {
		if (item.values().status == "0") {
			return true;
		} else {
			return false;
		}
	});
	$('#favorite_filter').click(function() {
		articlesListjs.filter(function(item) {
			if (item.values().favorite == "1") {
				return true;
			} else {
				return false;
			}
		});
		$('#options_container').css('display','none');
		return false;
    });
	$('#archive_filter').click(function() {
		articlesListjs.filter(function(item) {
			if (item.values().status == "1") {
				return true;
			} else {
				return false;
			}
		});
		$('#options_container').css('display','none');
		return false;
    });
}

//WebActivities for article sharing and opening in browser
function openUrl () {
	var article_list = JSON.parse(localStorage.list);

    var openURL = new MozActivity({
		name: "view",
		data: {
			type: "url", // Possibly text/html in future versions
			url: article_list[window.itemid].resolved_url
		}
	});
}

function shareUrl () {
	var article_list = JSON.parse(localStorage.list);
	var sharing = new MozActivity({
		name: "share",
		data: {
			//type: "url", // Possibly text/html in future versions,
			number: 1,
			url: article_list[window.itemid].resolved_url
		}
	});
}

//Handling button events
$('#refresh_button').click(function() {
	loadArticleList();
	$('#options_container').css('display','none');
});

$('#add_button').click(function() {
	$('#options_container').css('display','none');
	location.href='addUrl.html';
});

	//List view

$('#open_options_menu').click(function() {
	$('#options_container').css('display','block');
});

$('#cancel_button_click').click(function() {
	$('#options_container').css('display','none');
});
	//Article view

$('#open_article_options_menu').click(function() {
	$('#article_options_container').css('display','block');
});

$('#delete_button_click').click(function() {
	modifyArticle ('delete');
	$('#article_options_container').css('display','none');
});

$('#archive_button_click').click(function() {
	modifyArticle ('archive');
	$('#article_options_container').css('display','none');
});

$('#favorite_button_click').click(function() {
	modifyArticle ('favorite');
	$('#article_options_container').css('display','none');
});

$('#openUrl_button_click').click(function() {
	openUrl ();
	$('#article_options_container').css('display','none');
});

$('#shareUrl_button_click').click(function() {
	shareUrl ();
	$('#article_options_container').css('display','none');
});

$('#article_cancel_button_click').click(function() {
	$('#article_options_container').css('display','none');
});

	//Settings view

$('#sorting_button_click').click(function() {
	$('#sort_options').css('display','block');
});

$('#skin_button_click').click(function() {
	$('#skin_options').css('display','block');
});

$('#general_skin_button_click').click(function() {
	$('#general_skin_options').css('display','block');
});

$('#newest_button_click').click(function() {
	localStorage.sortingName = 'timestamp'; 
	localStorage.sortingAsc = false; 
	localStorage.loaded = true;
	articlesListjs.sort(localStorage.sortingName, { asc: false });
	$('#sort_options').css('display','none');
});

$('#oldest_button_click').click(function() {
	localStorage.sortingName = 'timestamp'; 
	localStorage.sortingAsc = true; 
	localStorage.loaded = true;
	articlesListjs.sort(localStorage.sortingName, { asc: true });
	$('#sort_options').css('display','none');
});

$('#alph_buttonAZ_click').click(function() {
	localStorage.sortingName = 'title'; 
	localStorage.sortingAsc = true; 
	localStorage.loaded = true;
	articlesListjs.sort(localStorage.sortingName, { asc: true });
	$('#sort_options').css('display','none');
});

$('#alph_buttonZA_click').click(function() {
	localStorage.sortingName = 'title'; 
	localStorage.sortingAsc = false; 
	localStorage.loaded = true;
	articlesListjs.sort(localStorage.sortingName, { asc: false });
	$('#sort_options').css('display','none');
});

$('#cancel_button_sorting_click').click(function() {
	localStorage.loaded = true;
	$('#sort_options').css('display','none');
});

$('#skin_dark_button_click').click(function() {
	localStorage.skin = 'dark'; 
	localStorage.loaded = true;
	loadSkin();
	$('#skin_options').css('display','none');
});

$('#skin_organic_button_click').click(function() {
	localStorage.skin = 'organic'; 
	localStorage.loaded = true;
	loadSkin();
	$('#skin_options').css('display','none');
});

$('#skin_light_button_click').click(function() {
	localStorage.skin = 'light'; 
	localStorage.loaded = true;
	loadSkin();
	$('#skin_options').css('display','none');
});

$('#cancel_button_skin_click').click(function() {
	localStorage.loaded = true;
	$('#skin_options').css('display','none');
});

$('#skin_white_button_click').click(function() {
	localStorage.articleSkin = 'white'; 
	localStorage.loaded = true;
	articleSkin();
	$('#general_skin_options').css('display','none');
});

$('#skin_soft_white_button_click').click(function() {
	localStorage.articleSkin = 'soft_white'; 
	localStorage.loaded = true;
	articleSkin();
	$('#general_skin_options').css('display','none');
});

$('#skin_black_button_click').click(function() {
	localStorage.articleSkin = 'black'; 
	localStorage.loaded = true;
	articleSkin();
	$('#general_skin_options').css('display','none');
});

$('#skin_grey_button_click').click(function() {
	localStorage.articleSkin = 'grey'; 
	localStorage.loaded = true;
	articleSkin();
	$('#general_skin_options').css('display','none');
});

$('#cancel_button_general_skin_click').click(function() {
	localStorage.loaded = true;
	$('#general_skin_options').css('display','none');
});

	
/* -----------------------
    USER INTERFACE CODE
----------------------- */
function loadSkin () {
	if (localStorage.skin) {
		if(localStorage.skin === 'light') {
			$('#home-view').attr("class","");
			$('#article-view').attr("class","");
			$('#settings-view').attr("class","");
		} else if (localStorage.skin === 'organic') {
			$('#home-view').attr("class","skin-organic");
			$('#article-view').attr("class","skin-organic");
			$('#settings-view').attr("class","skin-organic");	
		} else if (localStorage.skin === 'dark') {
			$('#home-view').attr("class","skin-dark");
			$('#article-view').attr("class","skin-dark");
			$('#settings-view').attr("class","skin-dark");
		}
	} else {
		$('#home-view').attr("class","");
		$('#article-view').attr("class","");
		$('#settings-view').attr("class","");
	}
}
loadSkin ();
//Home view
var viewHome = document.querySelector("#home-view");

//Article view
var viewArticle = document.querySelector("#article-view");

var btnbackArticle = document.querySelector("#back-btnArticle");
btnbackArticle.addEventListener ('click', function () {
	viewHome.classList.remove('back-home');
	viewArticle.classList.remove('move-Article-view');	
	viewArticle.classList.add('back-Article-view');
});

//Settings view
var viewSettings = document.querySelector("#settings-view");
var btnSettings = document.querySelector("#settings-btn");
btnSettings.addEventListener('click', function () {
	console.log("SETTINGS CLICKED");
	$('#options_container').css('display','none');
	viewSettings.classList.remove('back-Settings-view');
	viewHome.classList.add('back-home');	
	viewSettings.classList.add('move-Settings-view');
});

var btnbackSettings = document.querySelector("#back-btnSettings");
btnbackSettings.addEventListener ('click', function () {
	viewHome.classList.remove('back-home');
	viewSettings.classList.remove('move-Settings-view');	
	viewSettings.classList.add('back-Settings-view');
});