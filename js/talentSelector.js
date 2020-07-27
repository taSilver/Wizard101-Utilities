let cachedTalents = {"None": {"talent_name": ".None", "talent_school": ".None", "talent_type": ".None", "selected": false}};
let cachedPresets = {};

function getPetPresets(){
    let xhttp = new XMLHttpRequest();
    let petPresets = null;
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200){
            petPresets = JSON.parse(this.responseText);
            cachedPresets = petPresets;
            loadPresets();
        }
    }
    xhttp.open("GET", `php/getPetPresets.php?school=${document.getElementById("school").value}`);
    xhttp.send();
}

function getPetTalents(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200){
            cachedTalents = JSON.parse(this.responseText);
            cachedTalents["None"] = {"talent_name": ".None", "talent_school": ".None", "talent_type": ".None", "selected": false};
            loadAllTalents();
            clearFilters();
        }
    }
    xhttp.open("GET", `php/getPetTalents.php?school=${document.getElementById("school").value}&schoolOnly=${document.getElementById("hideOffSchool").checked}&usefulOnly=${document.getElementById("onlyShowUsefulTalents").checked}`);
    xhttp.send();
}

function loadOptions(selectObj){
    let talentOrder = document.getElementById("talentOrder").value;
    let selectedTalent;
    if($(selectObj).val() && $(selectObj).val() in cachedTalents){
        selectedTalent = $(selectObj).val()
        cachedTalents[selectedTalent]["selected"] = false;
    }
    let categories = {};
    for(let talentName in cachedTalents){
        let talent = cachedTalents[talentName]
        if(!categories.hasOwnProperty(talent[talentOrder])){
            categories[talent[talentOrder]] = {};
        }
        categories[talent[talentOrder]][talentName] = talent;
    }

    $(selectObj).empty();
    for(let category of Object.keys(categories).sort()){
        let group = $('<optgroup label="' + category + '" />');
        Object.keys(categories[category]).sort().forEach(function(key){
            if(!categories[category][key]["selected"]){
                $('<option />').html(key).appendTo(group)
            }
        })
        group.appendTo(selectObj);
    }

    if(selectedTalent){
        if(selectedTalent !== "None")  cachedTalents[selectedTalent]["selected"] = true;
        $(selectObj).val(selectedTalent).attr('selected', true);
    }
    $(selectObj).trigger("chosen:updated");
    updateLink(selectObj.id, selectedTalent);
}

function loadAllTalents(){
    getFilters();
    $(".talentSelector").each((index, value) => loadOptions(value));
    updateStatsFromPet();
    updateVisualStats();
}

function loadPresets(){
    let selectedPreset = document.getElementById("petPreset").value;
    let categories = {"Damage & Resist": {}, "Damage & Critical": {}, "Misc": {}, "Custom" : {"Custom": {}}};
    for(let presetName in cachedPresets){
        if(presetName.includes("Damage")){
            if(presetName.includes("Resist")){
                categories["Damage & Resist"][presetName] = cachedPresets[presetName];
            } else if (presetName.includes("Critical")){
                categories["Damage & Critical"][presetName] = cachedPresets[presetName];
            }
        } else {
            categories["Misc"][presetName] = cachedPresets[presetName]
        }
    }
    $("#petPreset").empty();
    for(let category of Object.keys(categories).sort()){
        let group = $('<optgroup label="' + category + '" />');
        Object.keys(categories[category]).sort().forEach(function(key){
            if(!categories[category][key]["selected"]){
                $('<option />').html(key).appendTo(group)
            }
        })
        group.appendTo("#petPreset");
    }
    $(`#petPreset option`).each(function () {
        if(this.value === selectedPreset){
            this.selected = true;
        }
    })
    $("#petPreset").trigger("chosen:updated");
    presetTalents();
}

function presetTalents(){
    clearFilters();
    loadAllTalents();
    let selectedPreset = document.getElementById("petPreset").value;
    for(let talentNum in cachedPresets[selectedPreset]){
        $(`#${talentNum} option`).each(function () {
            if(this.value === cachedPresets[selectedPreset][talentNum]["talent_name"]){
                this.selected = true;
                $(`#${talentNum}`).trigger("chosen:updated")
            }
        })
    }
    getFilters();
    loadAllTalents();
}

function getFilters(){
    $("select.talentSelector").each(function(){
        if(this.value in cachedTalents && this.value !== "None") cachedTalents[this.value]["selected"] = true;
    })
}

function clearFilters(){
    $("select.talentSelector option").each(function(){
        if(this.value === "None"){
            this.selected = true;
        } else {
            this.selected = false;
        }
    })
    for(let talentName in cachedTalents){
        cachedTalents[talentName]["selected"] = false;
    }
}

function updateLink(selectId, ability){
    document.getElementById(`${selectId}link`).href = ability && ability !== "Other" ? `http://www.wizard101central.com/wiki/PetAbility:${ability.replace(' ', '_')}` : "#";
}

getPetTalents();
getPetPresets();