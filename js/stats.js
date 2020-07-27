let blankStats = {
    "Damage Percent": {
        "Fire": 0,
        "Ice": 0,
        "Storm": 0,
        "Balance": 0,
        "Life": 0,
        "Death": 0,
        "Myth": 0,
        "Shadow": 0,
        "Universal": 0,
        "sign": '%'
    },
    "Damage Flat": {
        "Fire": 0,
        "Ice": 0,
        "Storm": 0,
        "Balance": 0,
        "Life": 0,
        "Death": 0,
        "Myth": 0,
        "Shadow": 0,
        "Universal": 0,
        "sign": ''
    },
    "Resist Percent": {
        "Fire": 0,
        "Ice": 0,
        "Storm": 0,
        "Balance": 0,
        "Life": 0,
        "Death": 0,
        "Myth": 0,
        "Shadow": 0,
        "Universal": 0,
        "sign": '%'
    },
    "Resist Flat": {
        "Fire": 0,
        "Ice": 0,
        "Storm": 0,
        "Balance": 0,
        "Life": 0,
        "Death": 0,
        "Myth": 0,
        "Shadow": 0,
        "Universal": 0,
        "sign": ''
    },
    "Accuracy": {
        "Fire": 0,
        "Ice": 0,
        "Storm": 0,
        "Balance": 0,
        "Life": 0,
        "Death": 0,
        "Myth": 0,
        "Shadow": 0,
        "Universal": 0,
        "sign": '%'
    },
    "Critical": {
        "Fire": 0,
        "Ice": 0,
        "Storm": 0,
        "Balance": 0,
        "Life": 0,
        "Death": 0,
        "Myth": 0,
        "Shadow": 0,
        "Universal": 0,
        "sign": ''
    },
    "Block": {
        "Fire": 0,
        "Ice": 0,
        "Storm": 0,
        "Balance": 0,
        "Life": 0,
        "Death": 0,
        "Myth": 0,
        "Shadow": 0,
        "Universal": 0,
        "sign": ''
    },
    "Pierce": {
        "Fire": 0,
        "Ice": 0,
        "Storm": 0,
        "Balance": 0,
        "Life": 0,
        "Death": 0,
        "Myth": 0,
        "Shadow": 0,
        "Universal": 0,
        "sign": ''
    },
    "Pip Conversion": {
        "Fire": 0,
        "Ice": 0,
        "Storm": 0,
        "Balance": 0,
        "Life": 0,
        "Death": 0,
        "Myth": 0,
        "Shadow": 0,
        "Universal": 0,
        "sign": ''
    },
    "Stun Resist": {
        "Universal": 0,
        "sign": ''
    },
    "Incoming": {
        "Universal": 0,
        "sign": '%'
    },
    "Outgoing": {
        "Universal": 0,
        "sign": '%'
    },
    "Health": {
        "Universal": 0,
        "sign": ''
    },
    "Mana": {
        "Universal": 0,
        "sign": ''
    },
    "Pip Chance": {
        "Universal": 0,
        "sign": '%'
    },
    "Shadow Rating": {
        "Universal": 0,
        "sign": ''
    }
};
let statsFromGear = {};
let statsFromPet = {};
let baseStats = {};

function updateAll(){
    let enablePet = document.getElementById("enablePet").checked;
    updateBaseStats();
    if(enablePet){
        updateStatsFromPet();
    } else {
        statsFromPet = {};
    }
    updateStatsFromGear();
    updateVisualStats();
}

function flushSchool(){
    getPetTalents();
    getPetPresets();
    loadAllGear();
    loadGearPresets();
    updateAll();
}

function getBaseHealth(school, level){
    let health = {
        "Fire": {
            base: 425,
            increment: 22
        },
        "Ice": {
            base: 500,
            increment: 31
        },
        "Storm": {
            base: 400,
            increment: 16
        },
        "Myth": {
            base: 425,
            increment: 22
        },
        "Life": {
            base: 460,
            increment: 27
        },
        "Death": {
            base: 450,
            increment: 24
        },
        "Balance": {
            base: 480,
            increment: 27
        }
    }
    return health[school]["base"] + (health[school]["increment"] * (level - 1));
}

function getMana(level){
    let mana = [15, 17, 19, 21, 24, 26, 28, 30, 32, 34, 36, 39, 41, 43, 45, 47, 49, 51, 54, 56, 58, 60, 62, 64, 66, 69, 71, 73, 75, 77, 79, 81, 84, 86, 88, 90, 92, 94, 96, 99, 101, 103, 105, 107, 109, 111, 114, 116, 118]
    if(level <= 90 && level >= 50){
        return 120;
    } else if(level > 100){
        return 150
    } else if(level > 90){
        return 130 + ((level-90)*2)
    } else {
        return mana[level-1]
    }
}

function getBasePowerpip(level){
    let powerpip = [10, 11, 11, 12, 12, 13, 14, 15, 15, 16, 17, 18, 18, 19, 20 ,21, 21, 22, 23, 24, 24, 25, 26, 27, 27, 28, 29, 30, 30, 31, 32, 33, 33, 34, 35, 36, 36, 37, 38, 39, 39]
    if(level < 10){
        return 0
    } else if (level >= 50){
        return 40
    } else {
        return powerpip[level-10]
    }
}

function getPipConversion(school, level){
    let pipConversion = {
        "Fire": 187,
        "Ice": 207,
        "Storm": 187,
        "Myth": 212,
        "Life": 207,
        "Death": 217,
        "Balance": 217
    }
    return level > 110 ? pipConversion[school] + (3*(level-110)) : 0;
}

function updateBaseStats(){
    baseStats = {
        "Health" : {},
        "Mana" : {},
        "Pip Chance": {},
        "Pip Conversion": {}
    }
    let level = document.getElementById("level").value;
    level = level ? level : 1;
    let school = document.getElementById("school").value;

    baseStats["Health"]["Universal"] = getBaseHealth(school, level);
    baseStats["Mana"]["Universal"] = getMana(level);
    baseStats["Pip Chance"]["Universal"] = getBasePowerpip(level);
    baseStats["Pip Conversion"]["Universal"] = getPipConversion(school, level);
}

function updateStatsFromPet(){
    statsFromPet = {};
    let str = Number.parseInt(document.getElementById("petStr").value);
    str = isNaN(str) ? 0 : str;
    let int = Number.parseInt(document.getElementById("petInt").value);
    int = isNaN(int) ? 0 : int;
    let agil = Number.parseInt(document.getElementById("petAgi").value);
    agil = isNaN(agil) ? 0 : agil;
    let will = Number.parseInt(document.getElementById("petWill").value);
    will = isNaN(will) ? 0 : will;
    let pow = Number.parseInt(document.getElementById("petPow").value);
    pow = isNaN(pow) ? 0 : pow;

    let petStats = {"Strength": str, "Intellect": int, "Agility": agil, "Will": will, "Power": pow};
    let talents = [document.getElementById("talent1").value, document.getElementById("talent2").value,
        document.getElementById("talent3").value, document.getElementById("talent4").value,
        document.getElementById("talent5").value, document.getElementById("talent6").value];
    for(let i = 0; i < talents.length; i++){
        let talent = talents[i]
        if(talent === "" || talent === "None") continue;
        if(cachedTalents[talent]["talent_type"] === "Selfish"){
            petStats[cachedTalents[talent]["talent_stat_1_boost"]] += cachedTalents[talent]["talent_boost_1_amount"];
            if(cachedTalents[talent].hasOwnProperty("talent_stat_2_boost")){
                petStats[cachedTalents[talent]["talent_stat_2_boost"]] += cachedTalents[talent]["talent_boost_2_amount"];
            }
            talents.splice(talents.indexOf(talent), 1)
            i--;
        }
    }
    document.getElementById("petTalentStats").innerHTML = "";
    for(let talent of talents){
        if(talent === "" || talent === "None") continue;
        let talentStat = document.createElement("p");
        talentStat.innerHTML = calcTalent(talent, petStats);
        document.getElementById("petTalentStats").appendChild(talentStat);
    }
    populateStats();
}

function extractStatsFromGear(stat, statAmt){
    let usedStats = ["Health", "Mana", "Pip Chance", "Incoming", "Outgoing", "Stun Resist", "Shadow Rating", "Damage Percent",
        "Damage Flat", "Resist Percent", "Resist Flat", "Accuracy", "Critical", "Block", "Pierce", "Pip Conversion"];
    let miscStats = ["Health", "Mana", "Pip Chance", "Incoming", "Outgoing", "Stun Resist", "Shadow Rating"];
    if(!usedStats.includes(stat)) return;
    if(!statsFromGear.hasOwnProperty(stat)){
        statsFromGear[stat] = {
            "Universal": 0,
            "Fire": 0,
            "Ice": 0,
            "Storm": 0,
            "Life": 0,
            "Death": 0,
            "Myth": 0,
            "Balance": 0,
            "Shadow": 0
        };
    }
    if(miscStats.includes(stat)){
        statsFromGear[stat]["Universal"] += statAmt;
    } else {
        Object.entries(statAmt).forEach(schoolStat => statsFromGear[stat][schoolStat[0]] += Math.max(schoolStat[1], 0));
    }

}

function updateStatsFromGear(){
    statsFromGear = {};
    for(let gearType of gearTypes){
        let gearName = document.getElementById(gearType).value;
        if(!(gearType in cachedGear) || !(gearName in cachedGear[gearType])) continue;
        Object.entries(cachedGear[gearType][gearName]).forEach(entry => extractStatsFromGear(entry[0], entry[1]))
        document.getElementById(gearType+"link").href= cachedGear[gearType][gearName]["URL"];
    }
}

function updateVisualStats(){
    stats = JSON.parse(JSON.stringify(blankStats));
    let universalStats = ["Incoming", "Outgoing", "Health", "Mana", "Shadow Rating", "Pip Chance", "Stun Resist"]
    let schools = ["Fire", "Ice", "Storm", "Balance", "Life", "Death", "Myth", "Universal"];
    let statSources = [baseStats, statsFromPet, statsFromGear];

    for(let statSource of statSources){
        for(let statType in statSource){
            if(!["Maycast", "Willcast"].includes(statType)){
                for(let school of schools){
                    if((school in statSource[statType]) && statSource[statType][school] > 0){
                        stats[statType][school] += statSource[statType][school];
                    }
                }
            }
        }
    }

    for(let stat in stats){
        for(let school in stats[stat]){
            if(school === "sign" || (school === "Universal" && !universalStats.includes(stat))) continue;
            let amount = school !== "Universal" ? stats[stat][school] + stats[stat]["Universal"] : stats[stat][school]
            let visualDisplay = amount > 0 ? `${Math.round(amount)}${stats[stat]["sign"]}` : "&nbsp";
            document.getElementById(stat.toLowerCase().replace(' ', '_') + school).innerHTML = visualDisplay;
        }
    }
}

window.onload = function(){
    if(document.getElementById("petPreset").value !== 'None'){
        presetTalents();
    }
    if(document.getElementById("presetGear").value !== 'None'){
        presetGear();
    }
    $(".gearSelector").chosen();
    $(".talentSelector").chosen();
    $(".miscSelector").chosen();


    flushSchool();
}
