<?php
require_once 'dbConnection.php';
require 'gearFunctions.php';

function addGearSet(){
    $dbc = createConnection();
    $gearTypes = ["Hat", "Robe", "Boots", "Wand", "Athame", "Amulet", "Ring", "Deck", "Mount"];
    $gearSet = [];
    $gearSetName = $_GET['preset_name'];
    $gearSetSchool = $_GET['school'];
    $gearSetLevel = 0;
    foreach($gearTypes as $gearType){
        if(!isset($_GET[$gearType])){
            $gearName = "No $gearType";
        } else {
            $gearName = $_GET[$gearType];
        }
        list($gearId, $gearLevel) = getGearIdLevel($gearName);
        if(!$gearId){
            echo $gearName;
            addGear($gearName, $gearSetName, "Y");
            list($gearId, $gearLevel) = getGearIdLevel($gearName);
        }
        $gearSet[] = $gearId;
        $gearSetLevel = max($gearSetLevel, $gearLevel);
    }

    $petSetId = getPetPresetID($gearSetSchool);

    $stmt = $dbc->prepare("INSERT INTO preset_gear(preset_gear_school, preset_gear_name, preset_gear_level, preset_gear_hat_id, preset_gear_robe_id, preset_gear_boots_id, preset_gear_wand_id, preset_gear_athame_id, preset_gear_amulet_id, preset_gear_ring_id, preset_gear_deck_id, preset_gear_mount_id, preset_pet_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssiiiiiiiiiii", $gearSetSchool,$gearSetName, $gearSetLevel,  $gearSet[0], $gearSet[1], $gearSet[2], $gearSet[3], $gearSet[4], $gearSet[5], $gearSet[6], $gearSet[7], $gearSet[8], $petSetId);
    $stmt->execute();
    $stmt->close();
    $dbc->close();

    echo "Added gear set: $gearSetName, $gearSetSchool";
}

function getPetPresetID($gearSetSchool){
    if(!isset($_GET["Pet"])){
        $petPresetName = "None";
    } else {
        $petPresetName = $_GET["Pet"];
    }

    $dbc = createConnection();
    $stmt = $dbc->prepare("SELECT preset_pet_id FROM preset_pet WHERE preset_pet_name = ? AND preset_pet_school IN (?, 'Universal')");
    $stmt->bind_param("ss", $petPresetName, $gearSetSchool);
    $stmt->execute();
    $stmt->bind_result($petSetId);
    $stmt->fetch();
    $stmt->close();
    if(!$petSetId){
        $stmt = $dbc->prepare("SELECT preset_pet_id FROM preset_pet WHERE preset_pet_name = 'None' AND preset_pet_school = 'Universal'");
        $stmt->execute();
        $stmt->bind_result($petSetId);
        $stmt->fetch();
        $stmt->close();
    }
    return $petSetId;
}

function getGearIdLevel($gearName)
{
    $dbc = createConnection();
    $stmt = $dbc->prepare("SELECT gear_id, gear_level FROM gear WHERE gear_name = ?");
    $stmt->bind_param("s", $gearName);
    $stmt->execute();
    $stmt->bind_result($gearId, $gearLevel);
    $stmt->fetch();
    $stmt->close();
    return array($gearId, $gearLevel);
}

function addBlank(){
    $dbc = createConnection();
    $gearTypes = ["Hat", "Robe", "Boots", "Wand", "Athame", "Amulet", "Ring", "Deck", "Mount"];
    $gearIds = "";
    foreach($gearTypes as $gearType){
        $gearName = "No $gearType";
        $stmt = $dbc->prepare("SELECT gear_id FROM gear WHERE gear_name = ? and gear_type = ?");
        $stmt->bind_param("ss", $gearName, $gearType);
        $stmt->execute();
        $stmt->bind_result($gearId);
        $stmt->fetch();
        $gearIds = $gearIds.", ".$gearId;
        $stmt->close();
    }
    $stmt = $dbc->prepare("SELECT preset_pet_id FROM preset_pet WHERE preset_pet_name = 'None' AND preset_pet_school = 'Universal'");
    $stmt->execute();
    $stmt->bind_result($petSetId);
    $stmt->fetch();
    $stmt->close();
    $gearIds = $gearIds.", $petSetId";
    $stmt = $dbc->prepare("INSERT INTO preset_gear(preset_gear_school, preset_gear_name, preset_gear_level, preset_gear_hat_id, preset_gear_robe_id, preset_gear_boots_id, preset_gear_wand_id, preset_gear_athame_id, preset_gear_amulet_id, preset_gear_ring_id, preset_gear_deck_id, preset_gear_mount_id, preset_pet_id) VALUES ('Universal', '.None', 0 $gearIds)");
    $stmt->execute();
    $stmt->close();
}

//addBlank();
addGearSet();