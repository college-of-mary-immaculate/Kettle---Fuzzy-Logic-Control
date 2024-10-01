let waterLevel = 5.0; 
let waterTemperature = 10.0; 
let targetTemperature = 90; 


const waterLevelDisplay = document.getElementById('water-level-display');
const waterTemperatureDisplay = document.getElementById('water-temperature-display');
const currentTemperatureDisplay = document.getElementById('current-temperature');
const heaterImage = document.getElementById('heater-image');
const temperatureFill = document.getElementById('temperature-fill');
const heatingPowerDisplay = document.getElementById('heating-power');
const statusDisplay = document.getElementById('status');
const startButton = document.getElementById('start-button');

let heatingInterval;  


function updateLevel(value) {
    waterLevel = parseFloat(value);
    waterLevelDisplay.textContent = `${waterLevel.toFixed(1)} Liters`;
}


function updateTemperature(value) {
    waterTemperature = parseFloat(value);
    waterTemperatureDisplay.textContent = `${waterTemperature.toFixed(1)} °C`;
    currentTemperatureDisplay.textContent = `Current Temperature: ${waterTemperature.toFixed(1)} °C`;
}


function lowTempMembership(temp) {
    if (temp <= 10) return 1;
    else if (temp > 10 && temp < 40) return (40 - temp) / 30;
    return 0;
}

function mediumTempMembership(temp) {
    if (temp >= 30 && temp < 50) return (temp - 30) / 20;
    else if (temp >= 50 && temp < 70) return (70 - temp) / 20;
    return 0;
}

function highTempMembership(temp) {
    if (temp >= 70) return 1;
    else if (temp >= 50 && temp < 70) return (temp - 50) / 20;
    return 0;
}

// my function for water level
function lowLevelMembership(level) {
    if (level <= 2) return 1;
    else if (level > 2 && level < 4) return (4 - level) / 2;
    return 0;
}

function mediumLevelMembership(level) {
    if (level >= 2 && level < 3) return (level - 2);
    else if (level >= 3 && level < 4) return (4 - level);
    return 0;
}

function highLevelMembership(level) {
    if (level >= 4) return 1;
    else if (level >= 3 && level < 4) return (level - 3);
    return 0;
}

// Defuzzification method gamet ang centroid weighted average
function defuzzify(heatingLow, heatingMedium, heatingHigh) {
    return (heatingLow * 20 + heatingMedium * 55 + heatingHigh * 85) / (heatingLow + heatingMedium + heatingHigh);
}

// Fuzzy Logic for the control
function fuzzyLogicControl(temp, level) {
    const lowTemp = lowTempMembership(temp);
    const mediumTemp = mediumTempMembership(temp);
    const highTemp = highTempMembership(temp);

    const lowLevel = lowLevelMembership(level);
    const mediumLevel = mediumLevelMembership(level);
    const highLevel = highLevelMembership(level);

    let heatingLow = 0, heatingMedium = 0, heatingHigh = 0;

    // RULES
    if (lowTemp > 0 && lowLevel > 0) heatingHigh = Math.min(lowTemp, lowLevel);  // High heating power
    if (lowTemp > 0 && mediumLevel > 0) heatingMedium = Math.min(lowTemp, mediumLevel); // Medium heating power
    if (lowTemp > 0 && highLevel > 0) heatingHigh = Math.min(lowTemp, highLevel);  // High heating power
    if (mediumTemp > 0 && lowLevel > 0) heatingLow = Math.min(mediumTemp, lowLevel);  // Low heating power
    if (mediumTemp > 0 && mediumLevel > 0) heatingMedium = Math.min(mediumTemp, mediumLevel);  // Medium heating power
    if (mediumTemp > 0 && highLevel > 0) heatingMedium = Math.min(mediumTemp, highLevel);  // Medium heating power
    if (highTemp > 0 && lowLevel > 0) heatingLow = Math.min(highTemp, lowLevel);  // Low heating power
    if (highTemp > 0 && mediumLevel > 0) heatingLow = Math.min(highTemp, mediumLevel);  // Low heating power
    if (highTemp > 0 && highLevel > 0) heatingLow = Math.min(highTemp, highLevel);  // Low heating power

    // Return final heating power from defuzzification
    return defuzzify(heatingLow, heatingMedium, heatingHigh);
}


function startSimulation() {
    if (heatingInterval) {
        clearInterval(heatingInterval);
    }

    let currentTemperature = waterTemperature; 
    heaterImage.src = 'teapot.gif';

    heatingInterval = setInterval(() => {
        const heatingPower = fuzzyLogicControl(currentTemperature, waterLevel);

        // Water level affectS
        const waterLevelFactor = 1 / waterLevel;  
        currentTemperature += (heatingPower / 100) * waterLevelFactor;

        currentTemperatureDisplay.textContent = `Current Temperature: ${currentTemperature.toFixed(1)} °C`;
        heatingPowerDisplay.textContent = `Heating Power: ${heatingPower.toFixed(0)}%`;

        const temperaturePercent = Math.min(100, (currentTemperature / targetTemperature) * 100);
        temperatureFill.style.height = `${temperaturePercent}%`;

        if (currentTemperature >= targetTemperature) {
            clearInterval(heatingInterval);
            statusDisplay.textContent = "Water has reached the target temperature!";
            temperatureFill.style.height = "100%";
            heaterImage.src = 'teapot.png';
        } else {
            statusDisplay.textContent = "Heating...";
        }
    }, 100);
}

startButton.addEventListener('click', startSimulation);
