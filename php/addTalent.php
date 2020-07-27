<?php
require_once 'dbConnection.php';

function addTalent(){
    $potentialTypes = ["talent_name", "talent_school", "talent_type", "talent_stat_1_boost", "talent_boost_1_amount", "talent_stat_2_boost", "talent_boost_2_amount", "talent_meta", "talent_stat_1", "talent_stat_2", "talent_stat_3", "talent_modifier", "talent_card"];
    $catList = "";
    $valueList = "";
    foreach ($potentialTypes as $type){
        if(isset($_GET[$type])){
            $catList = $catList.$type.',';
            $valueList = "$valueList'$_GET[$type]',";
        }
    }

    $catList = substr($catList, 0, -1);
    $valueList = substr($valueList, 0, -1);
    $dbc = createConnection();
    $stmt = $dbc->prepare("INSERT INTO pet_talent ($catList) VALUES($valueList)");
    $stmt->execute();
    $stmt->close();
    $dbc->close();
    echo $_GET["talent_name"];
}

addTalent();