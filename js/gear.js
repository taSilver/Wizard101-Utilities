let cachedGear = {};
let cachedGearPresets = {};
let gearTypes = ["hat", "robe", "boots", "wand", "athame", "amulet", "ring", "deck", "mount"];
function loadAllGear(){
    $('#categories').empty();
    let categories = {};
    for(let gearType of gearTypes){
        document.getElementById(gearType.toLowerCase()).innerHTML = "";
        for(let category of getGearForGearSelect(gearType)){
            
        }
    }

    loadGearPresets();
}

function getGearForGearSelect(gearType){
    let maxLevel = document.getElementById("level").value;
    let minLevel = 0;
    let school = document.getElementById("school").value;
    let packSchoolOnly = document.getElementById("noOffSchoolPack").checked;
    if(document.getElementById("closeToLevel")){
        minLevel = maxLevel - 30;
    }
    let xhttp = new XMLHttpRequest();
    let gear = null;
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200){
            gear = JSON.parse(this.responseText);
            updateGearSelect(gear, gearType);
        }
    }
    xhttp.open("GET", `php/getGear.php?minLevel=${minLevel}&gearType=${gearType}&maxLevel=${maxLevel}&school=${school}&schoolOnly=${packSchoolOnly}`, true)
    xhttp.send()
}

function updateGearSelect(gear, gearType){
    let usefulOnly = document.getElementById("onlyShowUsefulGear").checked;
    cachedGear[gearType] = {};
    let categories= {};
    let currCategories = {".None" : true, "Mount": true};
    $('#categories input').each(function(){
        if(!(this.value in currCategories)){
            currCategories[this.value] = this.checked;
        }
    })
    for(let gearItem of gear){
        if(!(gearItem.Category in categories)) categories[gearItem.Category] = [];
        categories[gearItem.Category].push(gearItem);
        cachedGear[gearType][gearItem.Name] = gearItem;
    }
    $('#categories').empty()
    Object.entries(categories).sort(function(a, b){if(a[0] < b[0]){ return -1;} if(a[0] > b[0]){ return 1;} return 0;}).forEach((entry) => {
        let category = entry[0];
        let obj = entry[1];
        if(!(category in currCategories)){
            if(obj[0].Meta){
                currCategories[category] = true;
            } else {
                currCategories[category] = false;
            }
        }
        obj.sort(function(a, b){
            if (a.Name < b.Name) return -1;
            if (a.Name > b.Name) return 1;
            return 0;})
        let group = $('<optgroup label="' + category + '" />');
        for(let item of obj){
            if(!usefulOnly || currCategories[category]){
                $('<option />').html(item.Name).appendTo(group)
            }
        }
        group.appendTo(document.getElementById(gearType.toLowerCase()));
    });
    return currCategories;
}

function submitGear(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200){
            console.log(this.responseText);
        }
    }
    let gearMeta = document.getElementById("newGearMeta").checked ? "Y" : "N";
    document.getElementById("newGearMeta").checked = false;
    let gearCategory = document.getElementById("newGearCategory").value;
    document.getElementById("newGearCategory").value = "";
    let gearName = document.getElementById("newGear").value;
    document.getElementById("newGear").value = "";
    xhttp.open("GET", `php/addGear.php?gearName=${gearName}&gearCategory=${gearCategory}&gearMeta=${gearMeta}`);
    xhttp.send()
}

function loadGearPresets(){
    let maxLevel = document.getElementById("level").value;
    let minLevel = 0;
    let school = document.getElementById("school").value;
    if(document.getElementById("closeToLevel")){
        minLevel = maxLevel - 30;
    }
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200){
            cachedGearPresets = JSON.parse(this.responseText);
            updateGearCombos();
        }
    }
    xhttp.open("GET", `php/getGearPresets.php?minLevel=${minLevel}&maxLevel=${maxLevel}&school=${school}`, true)
    xhttp.send()
}

function updateGearCombos(){
    let level = document.getElementById("level").value;
    let selectedPreset = $("#presetGear").val();
    let select = document.getElementById("presetGear");
    let groups = [$('<optgroup label="Level 0" />'), $('<optgroup label="Level 30" />'), $('<optgroup label="Level 60" />'), $('<optgroup label="Level 100" />'), $('<optgroup label="Level 130" />')];
    $("#presetGear").empty();
    Object.entries(cachedGearPresets).sort(function(a,b){
        if(a[0].Level > b[0].Level){
            return 1;
        }
        if(a[0].Level < b[0].Level) {
            return -1;
        }
        return 0;}).forEach(function (entry){
            if(entry[1].Level <= level){
                let element = $('<option />').html(entry[0]);
                if(between(entry[1].Level, 0, 29)){
                    element.appendTo(groups[0])
                } else if (between(entry[1].Level, 30, 59)){
                    element.appendTo(groups[1])
                } else if (between(entry[1].Level, 60, 99)){
                    element.appendTo(groups[2])
                } else if (between(entry[1].Level, 100, 129)){
                    element.appendTo(groups[3])
                } else {
                    element.appendTo(groups[4])
                }
            }
            })
    groups.forEach(function(group){
        if(group[0].childElementCount > 0){
            group.appendTo(select);
        }
    })
    $("#presetGear option").each(function(){
        if(this.value === selectedPreset){
            this.selected = true;
        } else {
            this.selected = false;
        }
    })
    presetGear();
}

function between(x, min, max){
    return x <= max && x >= min;
}

function presetGear(){
    let preset = cachedGearPresets[document.getElementById("presetGear").value];
    for(let type in preset){
        if(type === "Name" || type === "Level") continue;

        $(`#${type} option`).each(function (){
            if(this.value === preset[type]["Name"]){
                this.selected = true;
            } else {
                this.selected = false;
            }
        })
    }
    presetTalents()
    updateStatsFromGear();
    updateVisualStats();
}

function addPackGear(packName, gearName, gearMeta){
    let levels = ["Any Level", "Level 10%2B", "Level 20%2B", "Level 30%2B", "Level 40%2B", "Level 50%2B", "Level 60%2B", "Level 70%2B", "Level 80%2B", "Level 90%2B", "Level 100%2B", "Level 110%2B", "Level 120%2B", "Level 130%2B"]
    for(let level of levels){
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200){
                console.log(this.responseText);
            }
        }
        xhttp.open("GET", `php/addGear.php?gearName=${gearName} (${level})&gearCategory=${packName}&gearMeta=${gearMeta}`);
        xhttp.send()
    }
}

