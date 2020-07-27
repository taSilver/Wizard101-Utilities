<?php
require_once 'dbConnection.php';

function getPetTalents(){
    $dbc = createConnection();
    $school = $_GET['school'];
    $extraParams = "";
    $talents = new stdClass();
    $params = [];

    if(isset($_GET['usefulOnly']) && $_GET['usefulOnly'] == 'true'){
        $extraParams = $extraParams."AND talent_meta='Y'";
    }
    if(isset($_GET['schoolOnly']) && $_GET['schoolOnly'] == 'true'){
        $extraParams = $extraParams."AND talent_school IN ('$school', 'Universal')";
    }
    if($extraParams){
        $stmt = $dbc->prepare("SELECT talent_name, talent_school, talent_type, talent_stat_1_boost, talent_stat_2_boost, talent_boost_1_amount, talent_boost_2_amount, talent_meta, talent_stat_1, talent_stat_2, talent_modifier, card_id FROM pet_talent WHERE 1=1 $extraParams");
    } else {
        $stmt = $dbc->prepare("SELECT talent_name, talent_school, talent_type, talent_stat_1_boost, talent_stat_2_boost, talent_boost_1_amount, talent_boost_2_amount, talent_meta, talent_stat_1, talent_stat_2, talent_modifier, card_id FROM pet_talent");
    }

    $stmt->execute();
    $meta = $stmt->result_metadata();
    while ($field = $meta->fetch_field())
    {
        $params[] = &$row[$field->name];
    }

    call_user_func_array(array($stmt, 'bind_result'), $params);
    while($stmt->fetch()){
        $talents->{$row["talent_name"]} = new stdClass();
        $talents->{$row["talent_name"]}->{"selected"} = false;
        foreach($row as $key => $val)
        {
            if($val){
                $talents->{$row["talent_name"]}->{$key} = $val;
            }
        }
    }
    $stmt->close();
    $dbc->close();

    echo json_encode($talents);
}

getPetTalents();
