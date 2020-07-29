<?php
require_once 'simple_html_dom.php';
require_once 'dbConnection.php';

function addGear($gearName, $gearCategory, $gearMeta){
    if(getGearId($gearName)){
        echo "Gear item: '$gearName' already exists";
        return;
    }
    if($gearCategory === "Mount"){
        $gearStats = scrapeMount($gearName);
    } else if($gearCategory === "Jewel"){
        $gearStats = scrapeJewel($gearName);
    } else {
        $gearStats = scrapeGear($gearName);
    }
    if(!$gearStats){
        return;
    }
    $dbc = createConnection();
    $stmt = $dbc->prepare("INSERT INTO gear (gear_name, gear_school, gear_level, gear_type, gear_category, gear_url, gear_meta) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssissss", $gearStats->{"Name"}, $gearStats->{"School"}, $gearStats->{"Level"}, $gearStats->{"Type"}, $gearCategory, $gearStats->{"URL"}, $gearMeta);
    $stmt->execute();
    $stmt->close();

    $gearId = getGearId($gearName);

    $miscTypes = ["health", "mana", "incoming", "outgoing", "shadow_rating", "stun_resist", "pip_chance", "starting_pip", "starting_powerpip"];
    $tableTypes = ['accuracy', 'critical', 'block', 'damage_flat', "damage_percent", 'pierce', 'pip_conversion', 'resist_flat', "resist_percent"];
    $miscStatName = "";
    $miscStatAmt = "";

    foreach($gearStats as $statType => $value){
        $statType = str_replace(' ', '_', strtolower($statType));
        if(in_array($statType, $tableTypes)){
            foreach($value as $school => $amount){
                $stmt = $dbc->prepare("INSERT INTO $statType (gear_id, {$statType}_school, {$statType}_amt) VALUES(?, ?, ?)");
                $stmt->bind_param("isi", $gearId, $school, $amount);
                $stmt->execute();
                $stmt->close();
            }
        } else if(in_array($statType, $miscTypes)){
            $miscStatName = $miscStatName.", misc_".$statType;
            $miscStatAmt = $miscStatAmt.", ".$value;
        }
    }

    if($miscStatName != ""){
        $stmt = $dbc->prepare("INSERT INTO misc_stats (gear_id{$miscStatName}) VALUES (?{$miscStatAmt})");
        $stmt->bind_param("i", $gearId);
        $stmt->execute();
        $stmt->close();
    }

    if(property_exists($gearStats, "Cards")){
        foreach($gearStats->{"Cards"} as $card){
            $cardId = getCardId($card);
            $stmt = $dbc->prepare("INSERT INTO gear_card (gear_id, card_id, card_amount) VALUES (?, ?, ?)");
            $stmt->bind_param("iii", $gearId, $cardId, $card->{"Amount"});
            $stmt->execute();
            $stmt->close();
        }
    }

    if(property_exists($gearStats, "May Cast")){
        foreach ($gearStats["May Cast"] as $card){
            $cardId = getCardId($card);
            $stmt = $dbc->prepare("INSERT INTO gear_card (gear_id, card_id, card_maycast) VALUES (?, ?, 'Y')");
            $stmt->bind_param("ii", $gearId, $cardId);
            $stmt->execute();
            $stmt->close();
        }
    }

    if(property_exists($gearStats, "Socket")){
        $socketNums = [0, 0, 0, 0];
        $socketTypes = ["Circle", "Square", "Tear", "Triangle"];
        for($i = 0; $i < count($socketTypes); $i++){
            if(property_exists($gearStats->{"Socket"}, $socketTypes[$i])){
                $socketNums[$i] = $gearStats->{"Socket"}->{$socketTypes[$i]};
            }
        }

        $stmt = $dbc->prepare("INSERT INTO socket (gear_id, socket_circle, socket_square, socket_tear, socket_triangle) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("iiiii", $gearId, $socketNums[0], $socketNums[1], $socketNums[2], $socketNums[3]);
        $stmt->execute();
        $stmt->close();
    }

    $dbc->close();
    echo "$gearName added";
}

function getCardId($card)
{
    $dbc = createConnection();
    $stmt = $dbc->prepare("SELECT card_id FROM card WHERE card_url = ?");
    $stmt->bind_param("s", $card->{"URL"});
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($cardId);

    $exists = $stmt->fetch();
    $stmt->close();

    if (!$exists) {
        $stmt = $dbc->prepare("INSERT INTO card (card_name, card_url) VALUES (?, ?)");
        $stmt->bind_param("ss", $card->{"Name"}, $card->{"URL"});
        $stmt->execute();
        $stmt->close();
        $dbc->close();
        return getCardId($card);
    }
    $dbc->close();
    return $cardId;
}

function getGearId($gearName)
{
    $dbc = createConnection();
    $gearId = null;
    $stmt = $dbc->prepare("SELECT gear_id FROM gear WHERE gear_name = ?");
    $stmt->bind_param("s", $gearName);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($gearId);
    $stmt->fetch();
    $stmt->close();
    $dbc->close();
    return $gearId;
}

function scrapeGear($gear){
    $url = "http://www.wizard101central.com/wiki/Item:".urlencode((str_replace(' ', '_', $gear)));
    $itemStats = new stdClass();
    $referenceArr = ['Health', 'Mana', 'Energy', 'Pip Chance', 'Shadow Rating',
        'Accuracy', 'Critical', 'Block', 'Damage', 'Resist', 'Stun Resist', 'Pierce', 'Pip Conversion',
        'Fishing Luck', 'Incoming', 'Outgoing', 'Speed Boost', 'Card1', 'Card2', 'Card3', 'Card4', 'Card5', 'Card6',
        'Card7', '', '', '', 'Starting Pip', 'Starting PowerPip', 'Mastery', 'May Cast'];
    $schoolSpecific = ['Accuracy', 'Critical', 'Block', 'Damage', 'Pierce', 'Pip Conversion', 'Resist'];

    $itemStats->{"Name"} = $gear;
    ob_start();
    $html = file_get_html($url);
    ob_end_clean();
    if(!$html || $html->getElementById("mw-content-text")->find(".noarticletext")){
        echo "Name mistyped, or Item missing from wiki.";
        return null;
    }
    $sections = $html->getElementById("mw-content-text")->find("table[cellpadding=10]", 0)->find("table", 0)->find("table", 0)->find("tr");

    preg_match("/\bCategory:\b([a-zA-z]+)/", $sections[0]->find("a",0)->title, $matches);
    $school = str_replace('Any', 'Universal', $matches[1]);
    $itemStats->{"School"} = $school;

    preg_match("/Icon\)_([a-zA-z]+)/", $sections[0]->find("a")[1]->href, $matches);
    $type = $matches[1];
    $itemStats->{"Type"} = $type;
    if(!preg_match("/Level ([0-9]+)/", $sections[1]->plaintext, $matches)){
        $level = 0;
    } else {
        $level = intval($matches[1]);
    }
    $itemStats->{"Level"} = $level;

    $itemStats->{"URL"} = $url;

    $stats = $sections[3]->find("dl", 0)->find("dd");
    if($type === "Deck"){
        $stats = array_slice($stats, 4);
    }
    for($i = 0; $i < count($stats); $i++){
        if($i > 16 && $i < 25 && preg_match_all("/\+([0-9]+)|title=\"ItemCard:([a-zA-z ]+)|href=\"(.+?)\"/", $stats[$i], $matches)){
            if($i == 17){
                $itemStats->{"Cards"} = new stdClass();
            }
            $itemStats->{"Cards"}->{$matches[2][2]} = new stdClass();
            $itemStats->{"Cards"}->{$matches[2][2]}->{"Name"} = $matches[2][2];
            $itemStats->{"Cards"}->{$matches[2][2]}->{"Amount"} = $matches[1][0];
            $itemStats->{"Cards"}->{$matches[2][2]}->{"URL"} = "http://www.wizard101central.com".$matches[3][1];
            continue;
        }
        if($i == 30 && preg_match_all("/title=\"ItemCard:([a-zA-z ]+)|href=\"(.+?)\"/", $stats[$i], $matches)){
            $itemStats->{"May Cast"} = new stdClass();
            for($j = 0; $j < count($matches[1]);$j++){
                $itemStats->{"May Cast"}->{$matches[1][$j]} = new stdClass();
                $itemStats->{"May Cast"}->{$matches[1][$j]}->{"Name"} = $matches[1][$j];
                $itemStats->{"May Cast"}->{$matches[1][$j]}->{"URL"} = "http://www.wizard101central.com".$matches[2][$i + 1];

            }
        }
        if(preg_match_all("/\+([0-9]+)|Icon\)_([a-zA-z]+)/", $stats[$i], $matches)){
            if(in_array($referenceArr[$i], $schoolSpecific)){
                $statType = '';
                if(in_array($referenceArr[$i], ["Damage" ,"Resist"])){
                    if(preg_match("/\+[0-9]+%/", $stats[$i])) {
                        $statType = " Percent";
                    } else {
                        $statType = " Flat";
                    }
                }
                $itemStats->{$referenceArr[$i].$statType} = new stdClass();
                for($j = 0; $j < count($matches[1]) - 1; $j+=2){
                    $schoolStat = str_replace('Global_Alternate', 'Universal', $matches[2][$j + 1]);
                    $itemStats->{$referenceArr[$i].$statType}->{$schoolStat} = $matches[1][$j];
                }
            } else {
                if(!$matches[1][0] && $i === 1){
                    $itemStats->{$referenceArr[$i]} = "-1000";
                } else {
                    $itemStats->{$referenceArr[$i]} = $matches[1][0];
                }
            }
        }
    }

    if(count($sections[3]->find("dl")) > 2 && $sections[3]->find("dl")[2]->plaintext != " "){
        $sockets = $sections[3]->find("dl")[2]->plaintext;
        $itemStats->{"Socket"} = new stdClass();
        $socketTypes = ["Tear", "Circle", "Square", "Triangle"];
        foreach($socketTypes as $socketType){
            $count = substr_count($sockets, $socketType);
            if($count > 0){
                $itemStats->{"Socket"}->{$socketType} = $count;
            }
        }

    }

    return $itemStats;
}

function scrapeMount($mount){
    $url = "http://www.wizard101central.com/wiki/Mount:".urlencode((str_replace(' ', '_', $mount)));
    ob_start();
    $html = file_get_html($url);
    ob_end_clean();
    if(!$html || $html->getElementById("mw-content-text")->find(".noarticletext")){
        echo "Name mistyped, or Mount missing from wiki.";
        return null;
    }
    $mountStats = new stdClass();
    $mountStats->{"Name"} = $mount;
    $mountStats->{"Level"} = 0;
    $mountStats->{"URL"} = $url;
    $mountStats->{"Type"} = "Mount";

    $section = $html->getElementById("mw-content-text")->find("div")[1]->find(".data-table", 0)->find("tr", -1)->find("td", -1);
    if(preg_match("/([0-9]+)/", $section->plaintext, $matches)){
        $amount = $matches[1];
        preg_match_all("/:\(Icon\)_([A-Za-z]+)/", $section->outertext, $matches);
        $refArr = ["Armor" => "Pierce", "Healing" => "Outgoing", "Power" => "Pip Chance", "Damage" => "Damage Percent"];
        $tableTypes = ['Accuracy', "Damage Percent", 'Pierce'];
        $school = 'Universal';
        $type = key_exists($matches[1][0], $refArr) ? $refArr[$matches[1][0]] : $matches[1][0];
        if(in_array($type, $tableTypes) || in_array(key_exists($matches[1][1], $refArr) ? $refArr[$matches[1][1]] : $matches[1][1], $tableTypes)){
            if(in_array($type, ["Fire", "Ice", "Storm", "Balance", "Life", "Death", "Myth"])){
                $school = $type;
                $type = key_exists($matches[1][1], $refArr) ? $refArr[$matches[1][1]] : $matches[1][1];
            }
            $mountStats->{$type} = new stdClass();
            $mountStats->{$type}->{$school} = $amount;
        } else {
            $mountStats->{$type} = $amount;
        }
        $mountStats->{"School"} = $school;
    }

    return $mountStats;
}

function scrapeJewel($jewel){
    $url = $url = "http://www.wizard101central.com/wiki/Jewel:".urlencode((str_replace(' ', '_', $jewel)));
    $jewelStats = new stdClass();
    $jewelStats->{"Name"} = $jewel;
    $jewelStats->{"URL"} = $url;
    $jewelStats->{"School"} = "Universal";

    ob_start();
    $html = file_get_html($url);
    ob_end_clean();
    if(!$html || $html->getElementById("mw-content-text")->find(".noarticletext")){
        echo "Name mistyped, or Jewel missing from wiki.";
        return null;
    }

    $sections = $html->getElementById("mw-content-text")->find("div")[0]->find(".data-table", 0)->find("tr");
    if($sections[3]->find("td", 0)->plaintext === "Level"){;
        array_splice($sections, 3, 1);
    }
    preg_match("/([A-Za-z]+)/", $sections[2]->find("td", -1)->plaintext, $matches);
    $jewelStats->{"Category"} = $matches[0];
    preg_match("/([0-9]+)\+/", $sections[2]->find("td", -1)->plaintext, $matches);
    $jewelStats->{"Level"} = $matches[1];
    $jewelType = $sections[3]->find("td", -1)->plaintext;
    $jewelStats->{"Type"} = "Jewel - ".$jewelType;

    if(preg_match("/([0-9]+)/", $sections[5]->find("td", -1)->plaintext, $matches)){
        $amount = $matches[1];
        preg_match_all("/:\(Icon\)_([A-Za-z_]+)/", $sections[5]->find("td", -1)->outertext, $matches);
        $refArr = ["Armor_Piercing" => "Pierce", "Damage" => "Damage Flat", "Resistance" => "Resist Flat", "Critical_Block" => "Block", "Stun Resistance" => "Stun Resist"];
        $tableTypes = ['Accuracy', "Damage Flat", 'Pierce', 'Resist Flat', 'Block', 'Critical'];
        $school = 'Universal';
        if(count($matches) > 1 && count($matches[1]) > 0){
            if($matches[1][1] === "Healing"){
                if($jewelType === "Square"){
                    $type = "Incoming";
                } else {
                    $type = "Outgoing";
                }
            } else {
                $type = key_exists($matches[1][0], $refArr) ? $refArr[$matches[1][0]] : $matches[1][0];
            }
        } else if(strpos($sections[5]->find("td", -1)->plaintext, "Pip")){
            if(strpos($sections[5]->find("td", -1)->plaintext, "Shadow")){
                $type = "Shadow Rating";
            } else {
                $type = "Pip Chance";
            }
        }
        if(!isset($type)){
            preg_match_all("/([0-9]+)|title=\"ItemCard:([a-zA-z ]+)|href=\"(.+?)\"/", $sections[5]->find("td", -1)->outertext, $matches);
            if(!property_exists($jewelStats, "Cards")){ $jewelStats->{"Cards"} = new stdClass(); }
            $jewelStats->{"Cards"}->{$matches[2][2]} = new stdClass();
            $jewelStats->{"Cards"}->{$matches[2][2]}->{"Name"} = $matches[2][2];
            $jewelStats->{"Cards"}->{$matches[2][2]}->{"Amount"} = $matches[1][0];
            $jewelStats->{"Cards"}->{$matches[2][2]}->{"URL"} = "http://www.wizard101central.com".$matches[3][1];
        } else{
            if(in_array($type, $tableTypes) || (count($matches[1]) > 1 && in_array(key_exists($matches[1][1], $refArr) ? $refArr[$matches[1][1]] : $matches[1][1], $tableTypes))){
                if(in_array($type, ["Fire", "Ice", "Storm", "Balance", "Life", "Death", "Myth", "Shadow"])){
                    $school = $type;
                    $type = key_exists($matches[1][1], $refArr) ? $refArr[$matches[1][1]] : $matches[1][1];
                }
                $jewelStats->{$type} = new stdClass();
                $jewelStats->{$type}->{$school} = $amount;
            } else {
                $jewelStats->{$type} = $amount;
            }
        }
    }

    return $jewelStats;
}

//echo "<pre>"; var_dump(scrapeGear("Duelist's Devil-May-Care Deck (Level 130+)")); echo "</pre>";
//addGear($_GET['gearName'], $_GET['gearCategory'], $_GET['gearMeta']);

