<?php
function createConnection(){
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $dbc = new mysqli('localhost', 'root', '', 'wizard101');
    if ($dbc->connect_error) {
        die("Connection failed: " . $dbc->connect_error);
    }
    return $dbc;
}