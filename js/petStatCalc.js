function calcTalent(talent, petStats){
    if(!["Maycast", "Willcast", "Card"].includes(cachedTalents[talent]["talent_type"])){
        let amount = (2 * (petStats[cachedTalents[talent]["talent_stat_1"]] + petStats[cachedTalents[talent]["talent_stat_2"]]) + petStats["Power"]) * cachedTalents[talent]["talent_modifier"];
        if(!statsFromPet.hasOwnProperty(cachedTalents[talent]["talent_type"])){
            statsFromPet[cachedTalents[talent]["talent_type"]] = JSON.parse(JSON.stringify(blankStats[cachedTalents[talent]["talent_type"]]));
        }
        statsFromPet[cachedTalents[talent]["talent_type"]][cachedTalents[talent]["talent_school"]] += amount;

        return `${talent}: ${Math.round((amount + Number.EPSILON) * 100) / 100}${statsFromPet[cachedTalents[talent]["talent_type"]]["sign"]}`
    } else {
        for(let type of ["Maycast", "Willcast"]){
            for(let altTalent of talentList[type]){
                if(altTalent["name"] === talent){
                    statsFromPet[type]["card"].push(altTalent["card"]);
                    return `${type}: ${altTalent["card"]}`;
                }
            }
        }
    }

}

function populateStats(){
    document.getElementById("petOverallStats").innerHTML = "";
    let schools = ["Fire", "Ice", "Storm", "Balance", "Life", "Death", "Myth", "Universal"];
    for(let statType in statsFromPet){
        let section = document.createElement("span")
        section.id = `pet${statType}`;
        let header = document.createElement("h5")
        header.innerText = statType;
        section.appendChild(header)
        if(["Maycast", "Willcast"].includes(statType)){
            let castTalent = document.createElement("p");
            castTalent.innerHTML = `${statType}: `;
            for(let card of statsFromPet[statType]["card"]){
                castTalent.innerHTML += `${card}, `;
                section.append(castTalent);
            }
            castTalent.innerHTML = castTalent.innerHTML.substr(0, castTalent.innerHTML.length - 2);
        } else {
            for(let school of schools){
                if((school in statsFromPet[statType]) && statsFromPet[statType][school] > 0){
                    let schoolStat = document.createElement("p");
                    schoolStat.innerHTML = `${school}: ${Math.round((statsFromPet[statType][school] + Number.EPSILON) * 100) / 100}${statsFromPet[statType]["sign"]}`;
                    section.append(schoolStat);
                }
            }
        }
        if(section.childElementCount > 1){
            document.getElementById("petOverallStats").appendChild(section)
        }
    }
}

document.getElementById("maxPetStats").addEventListener("click", function(){
    let maxStats = {
        Str: 255,
        Int: 250,
        Agi: 260,
        Will: 260,
        Pow: 250
    }
    for(let stat in maxStats){
        document.getElementById(`pet${stat}`).value = maxStats[stat]
    }
    updateStatsFromPet();
    updateVisualStats();
})
