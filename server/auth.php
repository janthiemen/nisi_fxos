<?php
date_default_timezone_set("GMT");
$timestamp = time();
$self = (isset($_SERVER['HTTPS']) ? "https://" : "http://").$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'];

function cURL($url, $post) {
	$cURL = curl_init();
	curl_setopt($cURL, CURLOPT_URL, $url);
	curl_setopt($cURL, CURLOPT_HEADER, 0);
	curl_setopt($cURL, CURLOPT_HTTPHEADER, array('Content-type: application/x-www-form-urlencoded;charset=UTF-8'));
	curl_setopt($cURL, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($cURL, CURLOPT_TIMEOUT, 5);
	curl_setopt($cURL, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($cURL, CURLOPT_POST, count($post));
	curl_setopt($cURL, CURLOPT_POSTFIELDS, http_build_query($post));
	$output = curl_exec($cURL);
	curl_close($cURL);

	return $output;
}


$consumer_key = 'POCKETCONSUMERKEY';

if (isset ($_GET["token"])) {
	// Numbers in comments represent the steps as described at http://getpocket.com/developer/docs/authentication
	// (4) Receive the callback from Pocket
	// (5) Convert a request token into a Pocket access token

	$oAuthRequest = cURL(
		'https://getpocket.com/v3/oauth/authorize',
		array(
			'consumer_key' => $consumer_key,
			'code' => $_GET["token"]
		)
	);
 
	$access_token = explode('&', $oAuthRequest);
	$access_token = $access_token[0];
	$access_token = explode('=', $access_token);
	$access_token = $access_token[1];
 
	$requestId = $_GET["requestid"];
	file_put_contents(dirname(__FILE__) . "/tokens/".$requestId.".token",$access_token);

	echo '<html><head></head><body><script type="text/javascript">top.opener.postMessage("'.$access_token.'","*");window.close();</script>'.$access_token.'<br />You can now close this window.</body></html>';
} else {
	// (2) Obtain request token
	$oAuthRequestToken = explode('=', cURL(
		'https://getpocket.com/v3/oauth/request',
		array(
			'consumer_key' => $consumer_key,
			'redirect_uri' => $self."?consumer_key=$consumer_key"
		)
	));

	$requestId = $_GET["requestid"];
	// (3) Redirect user to Pocket to continue authorization
	echo '<meta http-equiv="refresh" content="0;url=' . 'https://getpocket.com/auth/authorize?request_token=' . urlencode($oAuthRequestToken[1]) . '&redirect_uri=' . urlencode($self.'?token=' . $oAuthRequestToken[1] .'&requestid='.$requestId) . '&mobile=1" />';
}
 ?>