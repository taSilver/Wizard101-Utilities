<?php
require_once 'dbConnection.php';
require_once 'gearFunctions.php';


echo getGear(ucwords($_GET['gearType']), $_GET['maxLevel'], $_GET['minLevel'], $_GET['school'], $_GET['schoolOnly']);
?>
