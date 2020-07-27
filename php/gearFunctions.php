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
        $gearStats = getGearPiece($gearId, $gearMeta, $gearCategory, $gearLevel, $gearName, $gearSchool, $gearUrl, $school, $packSchoolOnly);
        if($gearStats){
            $allGear[] = $gearStats;
        }
    }
    $stmt->close();

    $dbc->close();
    return json_encode($allGear);
}

function getGearPiece($gearId, $gearMeta, $gearCategory, $gearLevel, $gearName, $gearSchool, $gearUrl, $school, $packSchoolOnly)
{
    if($packSchoolOnly){
        if(preg_match('/Pack - ([A-Za-z, ]+)/', $gearCategory, $matches)){
            $schools = explode(", ", $matches[1]);
            if(!in_array($school, $schools)){
                return null;
            }
        }
    }
    $gearStats = new stdClass();
    $dbc = createConnection();
    $gearStats->{"Category"} = $gearCategory;
    $gearStats->{"Level"} = $gearLevel;
    $gearStats->{"Name"} = $gearName;
    $gearStats->{"School"} = $gearSchool;
    $gearStats->{"URL"} = $gearUrl;
    $gearStats->{"Meta"} = $gearMeta === "Y";

    $multiValue = ['Cards', 'Maycast', 'Mastery'];
    $tableTypes = ['accuracy', 'critical', 'block', 'damage_flat', "damage_percent", 'pierce', 'pip_conversion', 'resist_flat', "resist_percent"];
    foreach ($tableTypes as $table) {
        $stmt = $dbc->prepare("SELECT {$table}_school, {$table}_amt FROM {$table} WHERE gear_id = ?");
        $stmt->bind_param("s", $gearId);
        $stmt->execute();
        $stmt->bind_result($statSchool, $amt);
        $table = ucwords(str_replace('_', ' ', $table));

        while ($stmt->fetch()) {
            if(!property_exists($gearStats, $table) && $amt > 0){
                $gearStats->{$table} = new stdClass();
            }
            if($amt > 0){
                $gearStats->{$table}->{$statSchool} = $amt;
            }
        }
        $stmt->close();
    }

    $stmt = $dbc->prepare("SELECT misc_health, misc_mana, misc_incoming, misc_outgoing, misc_shadow_rating, misc_stun_resist, misc_pip_chance FROM misc_stats WHERE gear_id = ?");
    $stmt->bind_param("s", $gearId);
    $stmt->execute();
    $stmt->bind_result($health, $mana, $incoming, $outgoing, $shadRating, $stunResist, $pipChance);
    $stmt->fetch();
    $stmt->close();
    $miscTypes = ["Health" => $health, "Mana" => $mana, "Incoming" => $incoming, "Outgoing" => $outgoing, "Shadow Rating" => $shadRating, "Stun Resist" => $stunResist, "Pip Chance" => $pipChance];

    foreach ($miscTypes as $type => $value) {
        if($value > 0){
            $gearStats->{$type} = $value;
        }
    }
    return $gearStats;
}