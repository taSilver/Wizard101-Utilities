<?php
require_once 'dbConnection.php';
require_once 'gearFunctions.php';

function getGearPresets(){
    $minLevel = $_GET['minLevel'];
    $maxLevel = $_GET['maxLevel'];
    $school = $_GET['school'];
    $gearSets = new stdClass();
    getGearStatsFromSet($minLevel, $maxLevel, $school, $gearSets);

    echo json_encode($gearSets);
}

function getGearStatsFromSet($minLevel, $maxLevel, $school, stdClass $gearSets)
{
    $gear = [null, null, null, null, null, null, null, null, null];
    $dbc = createConnection();
    $stmt = $dbc->prepare("SELECT preset_gear_name, preset_gear_level, preset_gear_hat_id, preset_gear_robe_id, preset_gear_boots_id, preset_gear_wand_id, preset_gear_athame_id, preset_gear_amulet_id, preset_gear_ring_id, preset_gear_deck_id, preset_gear_mount_id, preset_pet_id FROM preset_gear WHERE (preset_gear_level BETWEEN ? AND ? OR preset_gear_name = 'None') AND preset_gear_school IN (?, 'Universal')");
    $stmt->bind_param("iis", $minLevel, $maxLevel, $school);
    $stmt->execute();
    $stmt->bind_result($setName, $setLevel, $gear[0], $gear[1], $gear[2], $gear[3], $gear[4], $gear[5], $gear[6], $gear[7], $gear[8], $setPetId);
    while ($stmt->fetch()) {
        $gearSets->{$setName} = new stdClass();
        $gearSets->{$setName}->{"Name"} = $setName;
        $gearSets->{$setName}->{"Level"} = $setLevel;
        $gearSets->{$setName}->{"petPreset"} = ["Name" => getPetStatsFromSet($setPetId)];
        foreach ($gear as $gearPiece) {
            $dbc2 = createConnection();
            $gearStmt = $dbc2->prepare("SELECT gear_meta, gear_category, gear_level, gear_name, gear_school, gear_url, gear_type FROM gear WHERE gear_id = ?");
            $gearStmt->bind_param("i", $gearPiece);
            $gearStmt->execute();
            $gearStmt->bind_result($gearPieceMeta, $gearPieceCat, $gearPieceLevel, $gearPieceName, $gearPieceSchool, $gearPieceUrl, $gearPieceType);
            while ($gearStmt->fetch()) {
                $gearSets->{$setName}->{strtolower($gearPieceType)} = getGearPiece($gearPiece, $gearPieceMeta, $gearPieceCat, $gearPieceLevel, $gearPieceName, $gearPieceSchool, $gearPieceUrl, $school, false);
            }
            $gearStmt->close();
            $dbc2->close();
        }
    }
    $stmt->close();
    $dbc->close();
}

function getPetStatsFromSet($setId){
    $dbc = createConnection();
    $stmt = $dbc->prepare("SELECT preset_pet_name FROM preset_pet WHERE preset_pet_id = ?");
    $stmt->bind_param("i", $setId);
    $stmt->bind_result($name);
    $stmt->execute();
    $stmt->fetch();

    return $name;
}

getGearPresets();
