<?php
require_once 'dbConnection.php';
require_once 'petFunctions.php';

function getPetPresets(){
    $dbc = createConnection();
    $school = $_GET['school'];
    $talents = [null, null, null, null, null, null];
    $presets = new stdClass();

    $stmt = $dbc->prepare("SELECT preset_pet_name, preset_pet_talent_1, preset_pet_talent_2, preset_pet_talent_3, preset_pet_talent_4, preset_pet_talent_5, preset_pet_talent_6 FROM preset_pet WHERE preset_pet_school IN (?, 'Universal')");
    $stmt->bind_param("s", $school);
    $stmt->bind_result($name, $talents[0], $talents[1], $talents[2], $talents[3], $talents[4], $talents[5]);
    $stmt->execute();
    while($stmt->fetch()){
        $presets->{$name} = new stdClass();
        for($i = 0; $i < 6; $i++){
            $talent = $talents[$i];
            $presets->{$name}->{"talent".($i + 1)} = new stdClass();
            $params = [];
            if($talent == null){
                continue;
            }
            $row = getTalent($talent, $params);
            foreach($row as $key => $val)
            {
                if($val){
                    $presets->{$name}->{"talent".($i + 1)}->{$key} = $val;
                }
            }
        }
    }
    $stmt->close();
    $dbc->close();
    echo json_encode($presets);
}



getPetPresets();