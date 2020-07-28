<?php
require_once 'dbConnection.php';
require_once 'addGear.php';
require_once 'gearFunctions.php';

function verifyGear(){
    $dbc = createConnection();

    $stmt = $dbc->prepare("SELECT gear_id, gear_meta, gear_category, gear_level, gear_name, gear_school, gear_url FROM gear WHERE (gear_category != '.None' AND gear_type != 'Mount') ");
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($gearId, $gearMeta, $gearCategory, $gearLevel, $gearName, $gearSchool, $gearUrl);
    $i = 0;
    while($stmt->fetch()) {
        if($i == 100){
            sleep(30);
            $i = 0;
        }
        $storedGearStats = new stdClass();
        $storedGearStats->{"Category"} = $gearCategory;
        $storedGearStats->{"Level"} = $gearLevel;
        $storedGearStats->{"Name"} = $gearName;
        $storedGearStats->{"School"} = $gearSchool;
        $storedGearStats->{"URL"} = $gearUrl;
        $storedGearStats->{"Meta"} = $gearMeta === "Y";
        $storedGearStats = getGearPiece($gearId, $gearCategory, null, false, $storedGearStats);
        $currGearStats = scrapeGear($gearName);
        $diff = check_diff_multi(obj_to_array_recursive($currGearStats), obj_to_array_recursive($storedGearStats));
        foreach (["Category", "Meta", "Type"] as $type){
            unset($diff[$type]);
        }

        if(count($diff) > 0){
            echo "<pre>"; var_dump($diff); echo "</pre>";
            echo "<p>Replacing $gearName</p>";
            replaceGear($gearId, $gearCategory, $gearMeta, $gearName);
        }
        echo "<p>Verified $gearName</p>";
        $i++;
    }
}

function replaceGear($gearId, $gearCategory, $gearMeta, $gearName){
    $dbc = createConnection();
    $stmt = $dbc->prepare("DELETE FROM gear WHERE gear_id = ?");
    $stmt->bind_param("i", $gearId);
    $stmt->execute();
    $stmt->close();
    addGear($gearName, $gearCategory, $gearMeta);
}

function obj_to_array_recursive(stdClass $obj) {
    foreach ($obj as &$element) {
        if ($element instanceof stdClass) {
            obj_to_array_recursive($element);
            $element = (array)$element;
        }
    }
    $obj = (array)$obj;
    return $obj;
}

function check_diff_multi($array1, $array2){
    $result = array();
    foreach($array1 as $key => $val) {
        if(isset($array2[$key])){
            if(is_array($val) && $array2[$key]){
                $res = check_diff_multi($val, $array2[$key]);
                if($res){
                    $result[$key] = $res;
                }
            }
        } else {
            $result[$key] = $val;
        }
    }

    return $result;
}

set_time_limit(3600);
verifyGear();