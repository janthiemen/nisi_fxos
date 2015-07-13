<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST');  
    //header('content-type: application/json; charset=utf-8');
    /*$result = json_encode($_REQUEST["url"]);
    $opslaan = var_dump($_REQUEST);
    file_put_contents("data.txt",$result);*/

   $value = $_POST['url'];
   echo "I got your value! $value";
?>