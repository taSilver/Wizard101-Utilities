let selfishTalents = {
    "Astute": [["Intellect"], [50], false],
    "Best of Show": [["Strength", "Intellect"], [40, 25], false],
    "Brilliant": [["Intellect"], [65], false],
    "Careful": [["Will", "Power"], [25, 25], false],
    "Cautious": [["Strength", "Will"], [25, 40], false],
    "Crafty": [["Will"], [50], false],
    "Cunning": [["Intellect", "Agility"], [25, 40], false],
    "Dashing": [["Strength", "Power"], [25, 25], false],
    "Durable": [["Agility"], [50], false],
    "Early Bird": [["Agility", "Will"], [40, 25], false],
    "Gifted": [["Intellect", "Power"], [25, 25], false],
    "Intuitive": [["Intellect", "Will"], [25, 25], false],
    "Mighty": [["Strength"], [65], true],
    "Perceptive": [["Intellect", "Will"], [40, 25], false],
    "Powerful": [["Power"], [65], false],
    "Relentless": [["Agility"], [65], true],
    "Resourceful": [["Intellect"], [40], false],
    "Spirited": [["Power"], [50], false],
    "Stalwart": [["Strength", "Intellect"], [25, 25], false],
    "Tenacious": [["Strength"], [50], false],
    "Thinking Cap": [["Strength"], [65], true],
    "Tireless": [["Strength", "Agility"], [25, 25], true],
    "Unshakeable": [["Strength", "Agility"], [40, 25], true],
    "Vigerous": [["Vigerous", "Power"], [25, 40], false],
    "Vigilant": [["Strength", "Will"], [25, 25], false],
    "Well Trained": [["Agility", "Will"], [25, 25], false]
}

let talentType = {
    "School-Dealer": ["Damage Percent", 0.0075, true],
    "School-Giver": ["Damage Percent", 0.005, true],
    "School-Boon": ["Damage Percent", 0.0025, true],
    "Pain-Giver": ["Damage Percent", 0.005, true],
    "Pain-Bringer": ["Damage Percent", 0.0025, true],
    "Spell-Proof": ["Resist Percent", 0.008, true],
    "Spell-Defying": ["Resist Percent", 0.004, true],
    "School-Away": ["Resist Percent", 0.004, false],
    "School-Ward": ["Resist Percent", 0.012, true],
    "Critical Striker": ["Critical", 0.024, true],
    "Critical Hitter": ["Critical", 0.018, true],
    "School Assailant": ["Critical", 0.025, true],
    "School Striker": ["Critical", 0.02, true],
    "Defender": ["Critical", 0.024, false],
    "Blocker": ["Critical", 0.02, false],
    "School-Sniper": ["Accuracy", 0.0075, false],
    "School-Shot": ["Accuracy", 0.005, false],
    "School-Eye": ["Accuracy", 0.0025, false],
    "Armor Breaker": ["Pierce", 0.0025, false],
    "Armor Piercer": ["Pierce", 0.0015, true],
    "Stun Resistant": ["Stun-Resist", 0.004, false],
    "Stun Recalcitrant": ["Stun-Resist", 0.008, false],
    "Lively": ["Incoming", 0.0065, false],
    "Healthy": ["Incoming", 0.003, false],
    "Healer": ["Outgoing", 0.003, true],
    "Medic": ["Outgoing", 0.0065, true],
};

function addStatTalentsToDB(){
    let talentStat = {
        "Damage Percent" : ["Strength", "Will", "Power"],
        "Resist Percent" : ["Strength", "Agility", "Power"],
        "Critical" : ["Agility", "Will", "Power"],
        "Block" : ["Intellect", "Will", "Power"],
        "Accuracy" : ["Intellect", "Agility", "Power"],
        "Pierce" : ["Strength", "Agility", "Power"],
        "Stun-Resist" : ["Strength", "Intellect", "Power"],
        "Incoming" : ["Intellect", "Agility", "Power"],
        "Outgoing" : ["Strength", "Will", "Power"]
    }

    for (let talent in talentType){
        let schools = ["Universal"];
        let schoolTalent = talent;
        if(talent.includes("School")){
            schools = ["Fire", "Ice", "Storm", "Balance", "Life", "Death", "Myth"];
        }
        for(let school of schools){
            schoolTalent = talent.replace("School", school);
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function(){
                if (this.readyState === 4 && this.status === 200){
                    console.log(this.responseText);
                }
            }
            xhttp.open("GET", `addTalent.php?talent_name=${schoolTalent}&talent_school=${school}&talent_type=${talentType[talent.toString()][0]}&talent_meta=${talentType[talent][2] ? "Y" : "N"}&talent_stat_1=${talentStat[talentType[talent.toString()][0]][0]}&talent_stat_2=${talentStat[talentType[talent.toString()][0]][1]}&talent_stat_3=${talentStat[talentType[talent.toString()][0]][2]}&talent_modifier=${talentType[talent.toString()][1][1]}`);
            xhttp.send();
        }
    }
}

function addSelfishTalentsToDB(){
    for(let talent in selfishTalents){
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(){
            if (this.readyState === 4 && this.status === 200){
                console.log(this.responseText);
            }
        }
        let boostStr = "";
        for(let i = 0; i < selfishTalents[talent][0].length; i++){
            boostStr += `&talent_stat_${i+1}_boost=${selfishTalents[talent][0][i]}&talent_boost_${i+1}_amount=${selfishTalents[talent][1][i]}`;
        }
        xhttp.open("GET", `addTalent.php?talent_name=${talent}&talent_school=Universal&talent_type=Selfish&talent_meta=${selfishTalents[talent][2] ? "Y" : "N"}${boostStr}`);
        xhttp.send();
    }
}

function addPetConfigToDB(){
    for(let config in commonConfig){
        let talents = commonConfig[config];
        let schools = ["Universal"];
        if(talents[0].includes("School")){
            schools = ["Fire", "Ice", "Storm", "Balance", "Life", "Death", "Myth"];
        }
        let name = config.replace('D', ' Damage ').replace('R', ' Resist ').replace('S', 'Selfish').replace('C', ' Critical ').trimRight()
        for(let school of schools){
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function(){
                if (this.readyState === 4 && this.status === 200){
                    console.log(this.responseText);
                }
            }
            xhttp.open("GET", `addPetPreset.php?name=${name}&school=${school}&talent1=${talents[0].replace('School', school)}&talent2=${talents[1].replace('School', school)}&talent3=${talents[2].replace('School', school)}&talent4=${talents[3].replace('School', school)}&talent5=${talents[4].replace('School', school)}&talent6=${talents[5].replace('School', school)}`);
            xhttp.send();
        }

    }
}

function fixMistakes(){
    for (let talent in talentType){
        let schools = ["Universal"];
        let schoolTalent = talent;
        if(talent.includes("School")){
            schools = ["Fire", "Ice", "Storm", "Balance", "Life", "Death", "Myth"];
        }
        for(let school of schools){
            schoolTalent = talent.replace("School", school);
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function(){
                if (this.readyState === 4 && this.status === 200){
                    console.log(this.responseText);
                }
            }
            xhttp.open("GET", `addTalent.php?talent_name=${schoolTalent}&talent_mod=${talentType[talent.toString()][1]}`);
            xhttp.send();
        }
    }
}

function submitAllGear(){
    let presets = {
        "Olympus" : {
            "Fire" : {
                "Hat": "Helmet of Heavenly Gaze", "Robe": "Zeus' Blazing Sun Raiment", "Boots" : "Zeus' Boots of Skyfire", "Wand": "Sky Iron Hasta","Deck": "Deck of the Lotus", "Mount": "Fire Ghulture", "Pet" : "3 Damage 2 Resist Selfish"
            },
            "Ice" : {
                "Hat": "Zeus' Veil of Snowfall", "Robe": "Zeus' Raiment of Flurries", "Boots" : "Zeus' Blustering Footwraps", "Wand": "Sky Iron Hasta","Deck": "Deck of the Lotus", "Mount": "Ice Ghulture", "Pet" : "3 Damage 2 Resist Selfish"
            },
            "Storm" : {
                "Hat": "Zeus' Helm of Tumult", "Robe": "Zeus' Thunderclap Drape", "Boots" : "Zeus' Thunderstomp Boots", "Wand": "Sky Iron Hasta","Deck": "Deck of the Lotus", "Mount": "Storm Ghulture", "Pet" : "3 Damage 2 Resist Selfish"
            },
            "Balance" : {
                "Hat": "Zeus' Helm of Authority", "Robe": "Zeus' Robes of Judgment", "Boots" : "Zeus' Cloudstriders", "Wand": "Sky Iron Hasta","Deck": "Deck of the Lotus", "Mount": "Balance Ghulture", "Pet" : "3 Damage 2 Resist Selfish"
            },
            "Myth" : {
                "Hat": "Helmet of Zeus' Will", "Robe": "Zeus' Armor of Supremacy", "Boots" : "Boots of Zeus' Lore", "Wand": "Sky Iron Hasta","Deck": "Deck of the Lotus", "Mount": "Myth Ghulture", "Pet" : "3 Damage 2 Resist Selfish"
            },
            "Life" : {
                "Hat": "Zeus' Galea of Vitality", "Robe": "Vestment of Zeus' Aegis", "Boots" : "Boots of Zeus' Alacrity", "Wand": "Sky Iron Hasta","Deck": "Deck of the Lotus", "Mount": "Life Ghulture", "Pet" : "3 Damage 2 Resist Selfish"
            },
            "Death" : {
                "Hat": "Cowl of Zeus' Ire", "Robe": "Zeus' Cloak of Fate", "Boots" : "Zeus' Boots of Rancor", "Wand": "Sky Iron Hasta","Deck": "Deck of the Lotus", "Mount": "Death Ghulture", "Pet" : "3 Damage 2 Resist Selfish"
            }
        }
    }
    for(let preset in presets){
        for(let school in presets[preset]){
            let rqStr = `preset_name=${preset}&school=${school}`;
            for(let item in presets[preset][school]){
                rqStr += `&${item}=${presets[preset][school][item]}`;
            }
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200){
                    console.log(this.responseText);
                }
            }
            xhttp.open("GET", `php/addGearPreset.php?${rqStr}`);
            xhttp.send()
        }
    }
}