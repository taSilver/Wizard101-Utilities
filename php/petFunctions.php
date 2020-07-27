<?php
require_once 'dbConnection.php';

function getTalent($talent, array $params)
{
    $row = [];
    $dbc2 = createConnection();
    $talentStmt = $dbc2->prepare("SELECT talent_name, talent_school, talent_stat_1_boost, talent_stat_2_boost, talent_boost_1_amount, talent_boost_2_amount, talent_meta, talent_stat_1, talent_stat_2, talent_modifier, card_id FROM pet_talent WHERE talent_id = ?");
    $talentStmt->bind_param("i", $talent);
    $talentStmt->execute();
    $meta = $talentStmt->result_metadata();
    while ($field = $meta->fetch_field()) {
        $params[] = &$row[$field->name];
    }

    call_user_func_array(array($talentStmt, 'bind_result'), $params);
    $talentStmt->fetch();
    $talentStmt->close();
    $dbc2->close();
    return $row;
}