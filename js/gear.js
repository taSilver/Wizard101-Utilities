let cachedGear = {};
let cachedJewels = {};
let cachedGearPresets = {};
let gearTypes = ["hat", "robe", "boots", "wand", "athame", "amulet", "ring", "deck", "mount"];
let cachedCategories = {};
let requests = [];
let oldLevel = Number.parseInt($('#level').val());

function loadAllJewels(){
    let minLevel = 0;
    let maxLevel = Number.parseInt($("#level").val());
    if(document.getElementById("closeToLevel").checked){
        minLevel = maxLevel - 30;
    }
    if(oldLevel != maxLevel && (Math.floor((oldLevel + 5) / 10) === Math.floor((maxLevel + 5) / 10))){
        return;
    }
    let jewelSchoolOnly = $("#jewelSchoolOnly").is(":checked");
    let school = $("#school").val();
    for(let jewelType of ["Tear", "Triangle", "Circle", "Square"]){
        getJewelsForJewelSelect(jewelType, minLevel, maxLevel, jewelSchoolOnly, school)
    }
}

function getJewelsForJewelSelect(jewelType, minLevel, maxLevel, jewelSchoolOnly, school){
    cachedJewels[jewelType] = {};
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200){
            for(let jewel of JSON.parse(this.responseText)){
                if(!(jewel.Category in cachedJewels[jewelType])){
                    cachedJewels[jewelType][jewel.Category] = {}
                }
                cachedJewels[jewelType][jewel.Category][jewel["Name"]] = jewel;
            }

        }
    }
    xhttp.open("GET", `php/getGear.php?minLevel=${minLevel}&gearType=Jewel - ${jewelType}&maxLevel=${maxLevel}&school=${school}&schoolOnly=${jewelSchoolOnly}`, true)
    xhttp.send()
}

function loadAllGear(){
    loadAllJewels();
    for(let gearType of gearTypes){
        document.getElementById(gearType.toLowerCase()).innerHTML = "";
        getGearForGearSelect(gearType)
    }
    loadGearPresets();
}

function getGearForGearSelect(gearType){
    let maxLevel = document.getElementById("level").value;
    let minLevel = 0;
    let school = document.getElementById("school").value;
    let packSchoolOnly = document.getElementById("noOffSchoolPack").checked;
    if(document.getElementById("closeToLevel").checked){
        minLevel = maxLevel - 30;
    }
    let xhttp = new XMLHttpRequest();
    let gear = null;
    requests.push(gearType)
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200){
            gear = JSON.parse(this.responseText);
            requests.splice(requests.indexOf(gearType), 1)
            updateGearSelect(gear, gearType);
            if(requests.length === 0){
                updateCategories();
            }
        }
    }
    xhttp.open("GET", `php/getGear.php?minLevel=${minLevel}&gearType=${gearType}&maxLevel=${maxLevel}&school=${school}&schoolOnly=${packSchoolOnly}`, true)
    xhttp.send()
}

function updateGearSelect(gear, gearType){
    cachedGear[gearType] = {};
    let categories= {};
    for(let gearItem of gear){
        if(!(gearItem.Category in categories)) categories[gearItem.Category] = [];
        categories[gearItem.Category].push(gearItem);
        cachedGear[gearType][gearItem.Name] = gearItem;
    }
    let ref = $(`#${gearType.toLowerCase()}`)
    let selected = ref.val();
    ref.empty();
    Object.entries(categories).sort((a, b) => sortByKey(a, b)).forEach((entry) => {
        let category = entry[0];
        let obj = entry[1];
        if(!(category in cachedCategories)){
            cachedCategories[category] = !!obj[0].Meta;
        }
        obj.sort(function(a, b){
            if (a.Name < b.Name) return -1;
            if (a.Name > b.Name) return 1;
            return 0;})
        let group = $('<optgroup label="' + category + '" />');
        for(let item of obj){
            if(cachedCategories[category]){
                $('<option />').html(item.Name).appendTo(group)
            }
        }
        group.appendTo(ref);
        ref.val(selected).attr("selected", true)
        ref.trigger("chosen:updated")
    });
}

function updateCategories(){
    let ref = $('#categories');
    let excludedCategories = ["Mount", ".None"];
    ref.empty();
    Object.entries(cachedCategories).sort((a, b) => sortByKey(a, b)).forEach((entry) => {
        let category = entry[0];
        if(excludedCategories.includes(category)){ return;}
        let divElement = $(`<div class="form-check"></div>`);
        let element = $(`<input type='checkbox' class="form-check-input" ${cachedCategories[category] ? "checked" : ""}>`);
        element.change(function(){cachedCategories[category] = !cachedCategories[category]; for(let gearType of gearTypes){updateGearSelect(Object.values(cachedGear[gearType]), gearType)}});
        element.appendTo(divElement);

        $(`<label class="form-check-label"> Show ${category}</label>`).appendTo(divElement);
        divElement.appendTo(ref)
    })
}

function submitGear(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200){
            console.log(this.responseText);
        }
    }
    let gearMeta = $("#newGearMeta").checked ? "Y" : "N";
    $("#newGearMeta").checked = false;
    let gearCategory = $("#newGearCategory").val();
    $("#newGearCategory").val("");
    let gearName = $("#newGear").val();
    $("#newGear").val("");
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
    $("#presetGear").trigger("chosen:updated");
    presetGear();
}

function between(x, min, max){
    return x <= max && x >= min;
}

function sortByKey(a, b) {
    if(a[0] < b[0]){ return -1;}
    if(a[0] > b[0]){ return 1;}
    return 0;
}

function presetGear(){
    let preset = cachedGearPresets[document.getElementById("presetGear").value];
    for(let type in preset){
        if(type === "Name" || type === "Level") continue;

        $(`#${type} option`).each(function (){
            if(this.value === preset[type]["Name"]){
                this.selected = true;
                $(`#${type}`).trigger("chosen:updated")
            } else {
                this.selected = false;
            }
        })
    }
    presetTalents()
    updateStatsFromGear();
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

function addPacks(){
    let packs = {
        "Professor's Hoard Pack - Death" : ["Y", ],
        "Professor's Hoard Pack - Myth" : ["Y", ],
        "Professor's Hoard Pack - Life" : ["Y", ],
        "Professor's Hoard Pack - Balance" : ["Y", ],
        "Professor's Hoard Pack - Storm" : ["Y", ],
        "Professor's Hoard Pack - Ice" : ["Y", ],
        "Professor's Hoard Pack - Fire" : ["Y", ],
        "Duelist Gear" : ["Y", "Duelist's Rakish Mask", "Duelist's Cloaked Doublet", "Duelist's Jaunty Boots", "Duelist's Dancing Blade", "Duelist's Fatal Razor", "Duelist's Virtuoso Talisman", "Duelist's Daredevil Ring", "Duelist's Devil-May-Care Deck"]
    }
}

function addJewels(){

}
