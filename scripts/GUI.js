const toggleMenuButton = document.getElementById("toggleMenu");
toggleMenuButton.onclick = function () {
    const controls = document.getElementById("settings");
    const menu = document.getElementById("settings-menu");
    if (!menu.style.display) {
        menu.style.display = "none";
        controls.style.border = "0px";
        controls.style.width = "0px";
        controls.style.overflowX = "visible";
        controls.style.overflowY = "visible";
        controls.style.background = "rgba(0, 0, 0, 0)";
        toggleMenuButton.style = "top: 8px; left: 8px";
    } else {
        menu.style.display = "";
        toggleMenuButton.style = "";
        controls.style.border = "3px solid rgb(87, 87, 87)";
        controls.style.width = "";
        controls.style.overflowX = "hidden";
        controls.style.overflowY = "auto";
        controls.style.background = "rgba(117, 117, 117, 0.3)";
    }
}

const toggleStatisticsButton = document.getElementById("toggleStatistics");
toggleStatisticsButton.onclick = function () {
    const controls = document.getElementById("statistics");
    const menu = document.getElementById("statistics-menu");
    if (!menu.style.display) {
        menu.style.display = "none";
        controls.style.border = "0px";
        controls.style.width = "0px";
        controls.style.overflowX = "visible";
        controls.style.overflowY = "visible";
        controls.style.background = "rgba(0, 0, 0, 0)";
        toggleStatisticsButton.style = "top: 8px; right: 8px";
    } else {
        menu.style.display = "";
        toggleStatisticsButton.style = "";
        controls.style.border = "3px solid rgb(87, 87, 87)";
        controls.style.width = "";
        controls.style.overflowX = "hidden";
        controls.style.overflowY = "auto";
        controls.style.background = "rgba(117, 117, 117, 0.3)";
    }
}

const restartButton = document.getElementById("restart-button");
restartButton.onclick = function () {
    NUM_BACTERIA = Number(document.getElementById("num-bacteria").value);
    NUM_FOOD = Number(document.getElementById("num-food").value);
    game.restart();
}

const pauseButton = document.getElementById("pause-button");
pauseButton.onclick = function () {
    if (game.pause) {
        game.pause = false;
    } else {
        game.pause = true;
    }
}

const colorCircle = function(color, size) {
    circle = document.createElement("div");
    circle.className = "color-circle-statistics";
    circle.style.background = color;
    circle.style.width = size+"px";
    circle.style.height = size+"px";
    circle.style.marginTop = ((25-size)/2)+"px";
    circle.style.marginLeft = ((70-size)/2)+"px"
    return circle;
}

const updateCounters = function() {
    const bacteria = document.getElementById("all-bacteria");
    const food = document.getElementById("all-food");
    const predators = document.getElementById("predators-p");
    const herbivores = document.getElementById("herbivores-p");

    const predatorsCount = game.getPredatorsCount();
    const herbivoresCount = game.getHerbivoresCount();

    const speciesStatistics = document.getElementById("species-statistics");

    bacteria.innerHTML = game.bacteria.length;
    food.innerHTML = game.food.length;
    predators.innerHTML = Math.round(predatorsCount/(predatorsCount+herbivoresCount)*100) || 0;
    herbivores.innerHTML = Math.round(herbivoresCount/(predatorsCount+herbivoresCount)*100) || 0;

    //обновление статистики видов

    if (game.bacteria.length > 0) {
        //console.log(game.bacteriaColors);
        speciesStatistics.innerHTML = "";

        const speciesGrid = document.createElement("div");
        speciesGrid.className = "species-grid";
        const gridHeaders = ["Species color", "Skills", "Number", "Proportion"];
        let a;
        for (let header of gridHeaders) {
            a = document.createElement("p");
            a.innerHTML = header;
            a.style.fontSize = "15px";
            speciesGrid.append(a);
        }
        speciesStatistics.append(speciesGrid);

        const colors = Object.entries(game.bacteriaColors).sort((a, b) => b[1][0] - a[1][0]).slice(0, 21); // сортировка списка цветов в порядке убывания

        for (specieData of colors) {
            //const specie = document.createElement("p");
            //specie.className = "single-line species-stat";

            speciesGrid.append(colorCircle(`hsl(${specieData[0]} 100% 50%)`, specieData[1][3]/1.5));
            speciesGrid.append(colorCircle(`rgb(${specieData[1][1]} 0 ${specieData[1][2]})`, specieData[1][3]/1.5));

            a = document.createElement("span");
            a.className = "param-text-species";
            a.innerHTML = specieData[1][0];
            speciesGrid.append(a);

            a = document.createElement("span");
            a.className = "param-text-species";
            a.innerHTML = Math.round(specieData[1][0]/game.bacteria.length*100)+"%";
            speciesGrid.append(a);

            //speciesGrid.append(specie);
        }
    } else {
        if (!document.getElementById("no-species")) {
            const noSpecies = document.createElement("p");
            noSpecies.className = "single-line";
            noSpecies.id = "no-species";
            noSpecies.innerHTML = "There are no species of bacteria";
            speciesStatistics.innerHTML = "";
            speciesStatistics.append(noSpecies);
        }
    }
}