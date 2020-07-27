<?php
require_once 'dbConnection.php';

function addPreset(){
    $talentIDList = [];
    $dbc = createConnection();
    for($i = 1; $i < 7; $i++){
        if(isset($_GET["talent$i"])){
            $talent_name = $_GET["talent$i"];
            $stmt = $dbc->prepare("SELECT talent_id FROM pet_talent WHERE talent_name = ?");
            $stmt->bind_param("s", $talent_name);
            $stmt->bind_result($talent_id);
            $stmt->execute();
            $stmt->fetch();
            $stmt->close();
            $talentIDList[] = $talent_id;
        }
    }
    $stmt = $dbc->prepare("INSERT INTO preset_pet (preset_pet_name, preset_pet_school, preset_pet_talent_1, preset_pet_talent_2, preset_pet_talent_3, preset_pet_talent_4, preset_pet_talent_5, preset_pet_talent_6) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssiiiiii", $_GET["name"], $_GET['school'], $talentIDList[0], $talentIDList[1], $talentIDList[2], $talentIDList[3], $talentIDList[4], $talentIDList[5]);
    $stmt->execute();
    $stmt->close();
    $dbc->close();

    echo "Added pet config {$_GET['school']} {$_GET['name']}";
}

addPreset();
