<?php
function getGear($gearType, $maxLevel, $minLevel, $school, $packSchoolOnly){
    $allGear = [];
    $dbc = createConnection();
    $gearSchool = "'$school', 'Universal'";
    $stmt = $dbc->prepare("SELECT gear_id, gear_meta, gear_category, gear_level, gear_name, gear_school, gear_url FROM gear WHERE (gear_level BETWEEN ? AND ? OR gear_category = '.None' OR gear_type = 'Mount') AND gear_type = ? AND gear_school IN ($gearSchool)");
    $stmt->bind_param("iis",$minLevel, $maxLevel, $gearType);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($gearId, $gearMeta, $gearCategory, $gearLevel, $gearName, $gearSchool, $gearUrl);
    while($stmt->fetch()){
        $gearStats = new stdClass();
        $gearStats->{"Category"} = $gearCategory;
        $gearStats->{"Level"} = $gearLevel;
        $gearStats->{"Name"} = $gearName;
        $gearStats->{"School"} = $gearSchool;
        $gearStats->{"URL"} = $gearUrl;
        $gearStats->{"Meta"} = $gearMeta === "Y";
        $gearStats = getGearPiece($gearId,$gearCategory, $school, $packSchoolOnly, $gearStats);
        if($gearStats){
            $allGear[] = $gearStats;
        }
    }
    $stmt->close();

    $dbc->close();
    return json_encode($allGear);
}

function getGearPiece($gearId, $gearCategory, $school, $packSchoolOnly, $gearStats)
{
    if($packSchoolOnly){
        if(preg_match('/Pack - ([A-Za-z, ]+)/', $gearCategory, $matches)){
            $schools = explode(", ", $matches[1]);
            if(!in_array($school, $schools)){
                return null;
            }
        }
    }
    $gearStats = getSchoolStats($gearId, $gearStats);

    $gearStats = getCards($gearId, $gearStats);

    $gearStats = getMiscDetails($gearId, $gearStats);

    $gearStats = getSockets($gearId, $gearStats);

    return $gearStats;
}

function getSchoolStats($gearId, $gearStats)
{
    $dbc = createConnection();
    $tableTypes = ['accuracy', 'critical', 'block', 'damage_flat', "damage_percent", 'pierce', 'pip_conversion', 'resist_flat', "resist_percent"];
    foreach ($tableTypes as $table) {
        $stmt = $dbc->prepare("SELECT {$table}_school, {$table}_amt FROM {$table} WHERE gear_id = ?");
        $stmt->bind_param("s", $gearId);
        $stmt->execute();
        $stmt->bind_result($statSchool, $amt);
        $table = ucwords(str_replace('_', ' ', $table));

        while ($stmt->fetch()) {
            if (!property_exists($gearStats, $table) && $amt > 0) {
                $gearStats->{$table} = new stdClass();
            }
            if ($amt > 0) {
                $gearStats->{$table}->{$statSchool} = $amt;
            }
        }
        $stmt->close();
    }
    $dbc->close();
    return $gearStats;
}

function getMiscDetails($gearId,$gearStats)
{
    $dbc = createConnection();
    $stmt = $dbc->prepare("SELECT misc_health, misc_mana, misc_incoming, misc_outgoing, misc_shadow_rating, misc_stun_resist, misc_pip_chance, misc_starting_pip, misc_starting_powerpip FROM misc_stats WHERE gear_id = ?");
    $stmt->bind_param("s", $gearId);
    $stmt->execute();
    $stmt->bind_result($health, $mana, $incoming, $outgoing, $shadRating, $stunResist, $pipChance, $startPip, $startPowerPip);
    $stmt->fetch();
    $stmt->close();
    $dbc->close();
    $miscTypes = ["Health" => $health, "Mana" => $mana, "Incoming" => $incoming, "Outgoing" => $outgoing, "Shadow Rating" => $shadRating, "Stun Resist" => $stunResist, "Pip Chance" => $pipChance, "Starting Pip" => $startPip, "Starting PowerPip" => $startPowerPip];

    foreach ($miscTypes as $type => $value) {
        if ($value != 0) {
            $gearStats->{$type} = $value;
        }
    }
    return $gearStats;
}

function getCards($gearId, $gearStats)
{
    $dbc = createConnection();
    $stmt = $dbc->prepare("SELECT card_id, card_maycast, card_amount FROM gear_card WHERE gear_id = ?");
    $stmt->bind_param("i", $gearId);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($cardId, $cardMaycast, $cardAmt);
    while ($stmt->fetch()) {
        if ($cardMaycast === "Y") {
            $type = "May Cast";
        } else {
            $type = "Cards";
        }
        if (!property_exists($gearStats, $type)) {
            $gearStats->{$type} = new stdClass();
        }
        list($cardName, $cardURL) = getCardDetails($cardId);
        $gearStats->{$type}->{$cardName} = new stdClass();
        $gearStats->{$type}->{$cardName}->{"Name"} = $cardName;
        $gearStats->{$type}->{$cardName}->{"URL"} = $cardURL;
        if ($cardMaycast != "Y") {
            $gearStats->{$type}->{$cardName}->{"Amount"} = $cardAmt;
        }
    }
    $stmt->close();
    $dbc->close();
    return $gearStats;
}

function getCardDetails($cardId){
    $dbc = createConnection();
    $stmt = $dbc->prepare("SELECT card_name, card_url FROM card WHERE card_id = ?");
    $stmt->bind_param("i", $cardId);
    $stmt->execute();
    $stmt->bind_result($cardName, $cardURL);
    $stmt->fetch();
    $stmt->close();
    $dbc->close();
    return array($cardName, $cardURL);
}

function getSockets($gearId, $gearStats){
    $dbc = createConnection();
    $sockets = [0, 0, 0, 0];
    $socketNames = ["Tear", "Circle", "Square", "Triangle"];
    $stmt = $dbc->prepare("SELECT socket_tear, socket_circle, socket_square, socket_triangle FROM socket WHERE gear_id = ?");
    $stmt->bind_param("i", $gearId);
    $stmt->execute();
    $stmt->bind_result($sockets[0], $sockets[1], $sockets[2], $sockets[3]);
    if($stmt->fetch()){
        $gearStats->{"Socket"} = new stdClass();
        for ($i = 0; $i < 4; $i++){
            if($sockets[$i] > 0){
                $gearStats->{"Socket"}->{$socketNames[$i]} = $sockets[$i];
            }
        }
    }
    return $gearStats;
}