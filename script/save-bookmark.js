//Check if they got here to save a bookmark from another app.
	//If so, fill the form with the transmitted data
if (navigator.mozSetMessageHandler) {
	console.log("activity");
    navigator.mozSetMessageHandler('activity', function onActivity(activity) {
        //switch (activity.source.name) {
            //case 'share':
                var data = activity.source.data;
				//$('#url').val(data.type);
                if (data.type === 'url') {
                    console.log(data);
                    $('#url').val(data.url);
                    $('#title').val(data.name);
                } else {
                    activity.postError('type not supported');
                }
                //break;

            /*default:
				$('#url').val("a");
				console.log('name not supported');*/
                //activity.postError('name not supported');
        //}
    });
}

//Check if a skin was selected, otherwise, just get the light skin
if (localStorage.skin) {
	if(localStorage.skin === 'light') {
		$('#bookmark-entry-sheet').attr("class","");
	} else if (localStorage.skin === 'organic') {
		$('#bookmark-entry-sheet').attr("class","skin-organic");
	} else if (localStorage.skin === 'dark') {
		$('#bookmark-entry-sheet').attr("class","skin-dark");
	}
} else {
	$('#bookmark-entry-sheet').attr("class","");
}
//End of skin stuff

//Send the url to pocket
$('#addUrl').click(function() {
    var url = $('#url').val();
	if(url.toLowerCase().substring(0, 7) != "http://" && url.toLowerCase().substring(0, 8) != "https://") {
		console.log("We have to add http to the url");
		url = "http://"+url;
	}
    var encodedURL = encodeURI(url);
    $.post('https://getpocket.com/v3/add', {"url":encodedURL, "consumer_key":"16297-b6a29ebe92585e0ce5f52ae0", "access_token":localStorage.accesskey}, function (response) {
    window.close();
    });
});

$('#addUrlActivity').click(function() {
    var url = $('#url').val();
	if(url.toLowerCase().substring(0, 7) != "http://" && url.toLowerCase().substring(0, 8) != "https://") {
		console.log("We have to add http to the url");
		url = "http://"+url;
	}
    var encodedURL = encodeURI(url);
    $.post('https://getpocket.com/v3/add', {"url":encodedURL, "consumer_key":"16297-b6a29ebe92585e0ce5f52ae0", "access_token":localStorage.accesskey}, function (response) {
    window.close();
    });
});

$('#back-btnArticle').click(function() {
	location.href='index.html';
});
