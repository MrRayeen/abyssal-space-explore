import './style.css'; // Imports the basic CSS (you can customize or remove)
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import { Vector3, Quaternion } from '@babylonjs/core/Maths/math.vector';
import { Space } from '@babylonjs/core';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { PointerEventTypes, PointerInfo } from '@babylonjs/core/Events/pointerEvents';
import { Animation } from '@babylonjs/core/Animations/animation';
import { EasingFunction, QuinticEase } from '@babylonjs/core/Animations/easing';

// Import side effects from core for mesh building
import "@babylonjs/core/Meshes/meshBuilder";

// Get the canvas element from HTML
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
if (!canvas) {
    console.error("Render canvas not found!");
    throw new Error("Render canvas not found!");
}

// --- UI Elements ---
const freeCamSpeedSlider = document.getElementById('freeCamSpeed') as HTMLInputElement;
const arcCamZoomSlider = document.getElementById('arcCamZoom') as HTMLInputElement;
// Hover Panel
const planetInfoPanel = document.getElementById('planetInfoPanel') as HTMLDivElement;
const planetNameEl = document.getElementById('planetName') as HTMLHeadingElement;
const planetTypeEl = document.getElementById('planetType') as HTMLSpanElement;
const planetTempEl = document.getElementById('planetTemp') as HTMLSpanElement;
const planetSizeEl = document.getElementById('planetSize') as HTMLSpanElement;
const planetMoonsEl = document.getElementById('planetMoons') as HTMLSpanElement;
// Detailed Panel
const detailedPlanetInfoPanel = document.getElementById('detailedPlanetInfoPanel') as HTMLDivElement;
const closeDetailedPanelButton = document.getElementById('closeDetailedPanelButton') as HTMLButtonElement;
const detailedPlanetNameEl = document.getElementById('detailedPlanetName') as HTMLHeadingElement;
const detailedPlanetTypeSpan = document.querySelector('#detailedPlanetType span') as HTMLSpanElement;
const detailedPlanetDescriptionSpan = document.querySelector('#detailedPlanetDescription span') as HTMLSpanElement;
const detailedPlanetDiameterSpan = document.querySelector('#detailedPlanetDiameter span') as HTMLSpanElement;
const detailedPlanetMassSpan = document.querySelector('#detailedPlanetMass span') as HTMLSpanElement;
const detailedPlanetGravitySpan = document.querySelector('#detailedPlanetGravity span') as HTMLSpanElement;
const detailedOrbitalPeriodSpan = document.querySelector('#detailedOrbitalPeriod span') as HTMLSpanElement;
const detailedRotationPeriodSpan = document.querySelector('#detailedRotationPeriod span') as HTMLSpanElement;
const detailedAxialTiltSpan = document.querySelector('#detailedAxialTilt span') as HTMLSpanElement;
const detailedAvgTempSpan = document.querySelector('#detailedAvgTemp span') as HTMLSpanElement;
const detailedAtmosphereSpan = document.querySelector('#detailedAtmosphere span') as HTMLSpanElement;
const detailedWeatherSpan = document.querySelector('#detailedWeather span') as HTMLSpanElement;
const detailedSeasonsSpan = document.querySelector('#detailedSeasons span') as HTMLSpanElement;
const detailedMoonsCountSpan = document.querySelector('#detailedMoonsCount span') as HTMLSpanElement;
const detailedNotableMoonsSpan = document.querySelector('#detailedNotableMoons span') as HTMLSpanElement;
const detailedRingsSpan = document.querySelector('#detailedRings span') as HTMLSpanElement;
const detailedFunFact1Span = document.querySelector('#detailedFunFact1 span') as HTMLSpanElement;
const detailedFunFact2Span = document.querySelector('#detailedFunFact2 span') as HTMLSpanElement;


// 1. Create the Babylon.js Engine
const engine = new Engine(canvas, true, { stencil: true, preserveDrawingBuffer: true }, true);
if (!engine) {
    console.error("Failed to create Babylon engine!");
    throw new Error("Failed to create Babylon engine!");
}

// 2. Create a Scene
const scene = new Scene(engine);
scene.clearColor = new Color4(0,0,0,1);

// --- Constants for our solar system ---
const sunSize = 6;
const mercurySize = 0.7;
const venusSize = 1.9;
const earthSize = 2;
const moonSize = 0.5;
const marsSize = 1.1;
const jupiterSize = 4.5;
const saturnSize = 4;
const saturnRingOuterRadius = saturnSize * 2.2;
const uranusSize = 3;
const neptuneSize = 2.9;
const plutoSize = 0.4;

const cloudSizeRelativeToEarth = 0.04;
const venusAtmosphereOffset = 0.05;

const baseOrbitUnit = 10;
const mercuryOrbitRadius = baseOrbitUnit * 0.8;
const venusOrbitRadius = baseOrbitUnit * 1.2;
const earthOrbitRadius = baseOrbitUnit * 1.7;
const marsOrbitRadius = baseOrbitUnit * 2.5;
const jupiterOrbitRadius = baseOrbitUnit * 4.5;
const saturnOrbitRadius = baseOrbitUnit * 7.0;
const uranusOrbitRadius = baseOrbitUnit * 9.5;
const neptuneOrbitRadius = baseOrbitUnit * 12.0;
const plutoOrbitRadius = baseOrbitUnit * 15.0;
const moonOrbitRadius = 3.0;
const skyboxSize = Math.max(plutoOrbitRadius * 2.5, 800);

const mercuryAxialTiltDegrees = 0.03;
const venusAxialTiltDegrees = 177.4;
const earthAxialTiltDegrees = 23.44;
const marsAxialTiltDegrees = 25.19;
const jupiterAxialTiltDegrees = 3.13;
const saturnAxialTiltDegrees = 26.73;
const uranusAxialTiltDegrees = 97.77;
const neptuneAxialTiltDegrees = 28.32;
const plutoAxialTiltDegrees = 119.59;

const globalSpeedMultiplier = (0.00002 * 0.7) * 4; // User requested speed

const mercuryOrbitalPeriodFactor = 0.24;
const venusOrbitalPeriodFactor = 0.62;
const earthOrbitalPeriodFactor = 1.0;
const marsOrbitalPeriodFactor = 1.88;
const jupiterOrbitalPeriodFactor = 11.86;
const saturnOrbitalPeriodFactor = 29.46;
const uranusOrbitalPeriodFactor = 84.01;
const neptuneOrbitalPeriodFactor = 164.8;
const plutoOrbitalPeriodFactor = 248.0;

const sunRotationFactor = 27.0;
const mercuryRotationFactor = 58.6;
const venusRotationFactor = -243.0;
const earthRotationFactor = 1.0;
const marsRotationFactor = 1.03;
const jupiterRotationFactor = 0.41;
const saturnRotationFactor = 0.44;
const uranusRotationFactor = -0.72;
const neptuneRotationFactor = 0.67;
const plutoRotationFactor = -6.39;

const cloudRotationSpeedRelativeToEarthSurface = 1.2;
const moonOrbitalPeriodFactorEarthRelative = 27.3 / 365.25;

const sunRotationSpeed = globalSpeedMultiplier / sunRotationFactor;
const mercuryOrbitSpeed = globalSpeedMultiplier / mercuryOrbitalPeriodFactor;
const mercuryRotationSpeed = globalSpeedMultiplier / mercuryRotationFactor;
const venusOrbitSpeed = globalSpeedMultiplier / venusOrbitalPeriodFactor;
const venusRotationSpeed = globalSpeedMultiplier / venusRotationFactor;
const earthOrbitSpeed = globalSpeedMultiplier / earthOrbitalPeriodFactor;
const earthRotationSpeed = globalSpeedMultiplier / earthRotationFactor;
const marsOrbitSpeed = globalSpeedMultiplier / marsOrbitalPeriodFactor;
const marsRotationSpeed = globalSpeedMultiplier / marsRotationFactor;
const jupiterOrbitSpeed = globalSpeedMultiplier / jupiterOrbitalPeriodFactor;
const jupiterRotationSpeed = globalSpeedMultiplier / jupiterRotationFactor;
const saturnOrbitSpeed = globalSpeedMultiplier / saturnOrbitalPeriodFactor;
const saturnRotationSpeed = globalSpeedMultiplier / saturnRotationFactor;
const uranusOrbitSpeed = globalSpeedMultiplier / uranusOrbitalPeriodFactor;
const uranusRotationSpeed = globalSpeedMultiplier / uranusRotationFactor;
const neptuneOrbitSpeed = globalSpeedMultiplier / neptuneOrbitalPeriodFactor;
const neptuneRotationSpeed = globalSpeedMultiplier / neptuneRotationFactor;
const plutoOrbitSpeed = globalSpeedMultiplier / plutoOrbitalPeriodFactor;
const plutoRotationSpeed = globalSpeedMultiplier / plutoRotationFactor;

const moonOrbitSpeed = (globalSpeedMultiplier / earthOrbitalPeriodFactor) / moonOrbitalPeriodFactorEarthRelative;
const moonRotationSpeed = moonOrbitSpeed;

// 3. Create Cameras
const arcCamera = new ArcRotateCamera("arcCamera", -Math.PI / 2, Math.PI / 2.5, earthSize * 6, Vector3.Zero(), scene);
arcCamera.attachControl(canvas, false);
arcCamera.minZ = 0.1;
arcCamera.lowerRadiusLimit = earthSize * 0.5;
arcCamera.upperRadiusLimit = skyboxSize / 2 - 50;
arcCamera.wheelPrecision = 50;
arcCamera.pinchPrecision = 50;
arcCamera.lowerBetaLimit = 0.01;
arcCamera.upperBetaLimit = Math.PI - 0.01;
arcCamera.inertia = 0.7;
let defaultArcTarget: Mesh | null = null;


const freeCamera = new FreeCamera("freeCamera", new Vector3(0, 15, -60), scene);
freeCamera.setTarget(Vector3.Zero());
freeCamera.speed = 1.5;
freeCamera.keysUp.push(87);    // W
freeCamera.keysDown.push(83);  // S
freeCamera.keysLeft.push(65);  // A
freeCamera.keysRight.push(68); // D
freeCamera.keysUpward.push(69); // E for up
freeCamera.keysDownward.push(81); // Q for down

scene.activeCamera = arcCamera;
arcCamera.attachControl(canvas, true);

// --- UI Event Listeners ---
if (freeCamSpeedSlider) {
    freeCamSpeedSlider.value = freeCamera.speed.toString();
    freeCamSpeedSlider.addEventListener('input', (event) => {
        if (freeCamera) {
            freeCamera.speed = parseFloat((event.target as HTMLInputElement).value);
        }
    });
}
if (arcCamZoomSlider) {
    const maxPrecision = 100;
    const minPrecision = 1;
    arcCamZoomSlider.min = minPrecision.toString();
    arcCamZoomSlider.max = maxPrecision.toString();
    arcCamZoomSlider.value = arcCamera.wheelPrecision.toString();

    arcCamZoomSlider.addEventListener('input', (event) => {
        if (arcCamera) {
            arcCamera.wheelPrecision = parseFloat((event.target as HTMLInputElement).value);
            arcCamera.pinchPrecision = parseFloat((event.target as HTMLInputElement).value);
        }
    });
}

canvas.addEventListener('wheel', (event) => {
    if (isFreeCameraMode && freeCamera && freeCamSpeedSlider && scene.activeCamera === freeCamera) {
        event.preventDefault();
        const scrollAmount = event.deltaY < 0 ? 0.1 : -0.1;
        let newSpeed = freeCamera.speed + scrollAmount;
        const minSpeed = parseFloat(freeCamSpeedSlider.min);
        const maxSpeed = parseFloat(freeCamSpeedSlider.max);
        newSpeed = Math.max(minSpeed, Math.min(maxSpeed, newSpeed));
        freeCamera.speed = newSpeed;
        freeCamSpeedSlider.value = newSpeed.toString();
    }
}, { passive: false });


let isFreeCameraMode = false;
let isAnimatingCamera = false;
window.addEventListener("keydown", (event) => {
    if (event.key === "c" || event.key === "C") {
        if (isAnimatingCamera) return;

        isFreeCameraMode = !isFreeCameraMode;
        const uiControlsDiv = document.getElementById('uiControls');
        if (isFreeCameraMode) {
            arcCamera.detachControl();
            arcCamera.lockedTarget = null;
            freeCamera.position = arcCamera.position.clone();
            const currentArcTarget = arcCamera.getTarget();
            if (currentArcTarget) freeCamera.setTarget(currentArcTarget.clone()); else freeCamera.setTarget(Vector3.Zero());

            scene.activeCamera = freeCamera;
            freeCamera.attachControl(canvas, true);
            if (uiControlsDiv) uiControlsDiv.classList.add('free-cam-active');
            if (detailedPlanetInfoPanel) detailedPlanetInfoPanel.classList.remove('visible');
            isDetailedPanelOpen = false;
            console.log("Switched to Free Camera Mode");
        } else {
            freeCamera.detachControl();
            scene.activeCamera = arcCamera;
            arcCamera.attachControl(canvas, true);
            const targetMesh = currentFocusedMesh || defaultArcTarget || planets["earth"]?.sphere;
            if (targetMesh) {
                arcCamera.lockedTarget = targetMesh;
            }
            if (uiControlsDiv) uiControlsDiv.classList.remove('free-cam-active');
            console.log("Switched to Arc Rotate Camera Mode");
        }
    }
});

// 4. Create Lights
const ambientLight = new HemisphericLight("ambientLight", new Vector3(0.3, 1, 0.1), scene);
ambientLight.intensity = 0.25;

const sunLight = new PointLight("sunLight", Vector3.Zero(), scene);
sunLight.intensity = 2.2;
sunLight.diffuse = new Color3(1, 0.98, 0.9);
sunLight.specular = new Color3(1, 0.98, 0.9);
sunLight.range = plutoOrbitRadius * 1.5;
sunLight.shadowMinZ = sunSize / 2 + 0.1;
sunLight.shadowMaxZ = sunLight.range;

// 5. Create Sun
const sunSphere = MeshBuilder.CreateSphere("sunSphere", { diameter: sunSize, segments: 64 }, scene);
const sunMaterial = new StandardMaterial("sunMat", scene);
const sunTextureURL = "/sun.jpg";
const sunTexture = new Texture(sunTextureURL, scene, undefined, true, Texture.BILINEAR_SAMPLINGMODE, () => console.log("Sun texture loaded."), (m,e) => console.error("Sun texture error:", m, e));
sunMaterial.emissiveTexture = sunTexture;
sunMaterial.disableLighting = true;
sunSphere.material = sunMaterial;
sunLight.parent = sunSphere;

// 6. Create Skybox
const skybox = MeshBuilder.CreateBox("skyBox", { size: skyboxSize }, scene);
const skyboxMaterial = new StandardMaterial("skyBoxMat", scene);
skyboxMaterial.backFaceCulling = false;
const skyboxTextureURL = "/stars_milky_way.jpg";
const skyboxEquiTexture = new Texture(skyboxTextureURL, scene, false, true);
skyboxEquiTexture.coordinatesMode = Texture.EQUIRECTANGULAR_MODE;
skyboxMaterial.reflectionTexture = skyboxEquiTexture;
skyboxMaterial.disableLighting = true;
skybox.material = skyboxMaterial;
skybox.infiniteDistance = true;

// --- Planet Creation Function (Helper) ---
interface PlanetSystem {
    sphere: Mesh;
    orbitAnchor: TransformNode;
    atmosphereSphere?: Mesh;
    ringMesh?: Mesh;
    info: PlanetInfoData;
}
interface PlanetInfoData {
    name: string; type: string; tempC: string; sizeKm: string; moonsCount: string;
    description: string; mass: string; gravity: string; orbitalPeriod: string;
    rotationPeriod: string; axialTilt: string; atmosphere: string; weather: string;
    seasons: string; notableMoons: string; rings: string; funFact1: string; funFact2: string;
}

function createCelestialBody(
    name: string, diameter: number, orbitRadius: number, textureUrl: string,
    scene: Scene, axialTiltDegrees: number, info: PlanetInfoData, orbitAnchorParent?: TransformNode
): PlanetSystem {
    const orbitAnchor = new TransformNode(`${name}OrbitAnchor`, scene);
    if (orbitAnchorParent) orbitAnchor.parent = orbitAnchorParent;

    const sphere = MeshBuilder.CreateSphere(name, { diameter, segments: 64 }, scene);
    sphere.position.x = orbitRadius;
    sphere.parent = orbitAnchor;
    (sphere as any).planetInfo = info;

    const material = new StandardMaterial(`${name}Mat`, scene);
    const diffuseTexture = new Texture(textureUrl, scene, undefined, true, Texture.BILINEAR_SAMPLINGMODE,
        () => {
            console.log(`Texture ${textureUrl} for ${name} loaded.`);
            if (diffuseTexture) {
                diffuseTexture.vScale = -1; diffuseTexture.uScale = -1;
                if (name === "sun") { diffuseTexture.vScale = 1; diffuseTexture.uScale = 1; }
            }
        },
        (m,e) => console.error(`Texture ${textureUrl} for ${name} error:`, m, e)
    );
    material.diffuseTexture = diffuseTexture;
    material.specularColor = new Color3(0.05, 0.05, 0.05);
    material.specularPower = 8;
    sphere.material = material;
    sphere.receiveShadows = true;

    if (axialTiltDegrees !== 0) {
        const tiltRad = (axialTiltDegrees * Math.PI) / 180;
        const tiltQuaternion = Quaternion.RotationAxis(Vector3.Right(), tiltRad);
        sphere.rotationQuaternion = tiltQuaternion;
    }
    return { sphere, orbitAnchor, info };
}

// --- Create Solar System ---
const planets: { [key: string]: PlanetSystem } = {};
const planetInfoDatabase: { [key: string]: PlanetInfoData } = { // Populated as in previous response
    sun: { name: "Sun", type: "Star (G-type)", tempC: "5,505 °C (Surface)", sizeKm: "1,392,700 km", moonsCount: "N/A", description: "The star at the center of our Solar System, providing light and heat essential for life on Earth.", mass: "1.989 × 10^30 kg (333,000 Earths)", gravity: "274 m/s² (28g)", orbitalPeriod: "N/A (Center of mass)", rotationPeriod: "~25-35 Earth days (Differential)", axialTilt: "7.25° (to Ecliptic)", atmosphere: "Photosphere, Chromosphere, Corona", weather: "Solar flares, Sunspots, Solar wind", seasons: "N/A", notableMoons: "N/A", rings: "None", funFact1: "Accounts for 99.86% of the Solar System's mass.", funFact2: "Core temperature is ~15 million °C." },
    mercury: { name: "Mercury", type: "Rocky, Terrestrial", tempC: "167 °C (Avg)", sizeKm: "4,879 km", moonsCount: "0", description: "The smallest planet and closest to the Sun, with extreme temperature variations.", mass: "0.055 Earths", gravity: "3.7 m/s²", orbitalPeriod: "88 Earth days", rotationPeriod: "58.6 Earth days", axialTilt: "0.03°", atmosphere: "Thin exosphere (Oxygen, Sodium, Hydrogen, Helium, Potassium)", weather: "No significant weather", seasons: "None due to minimal tilt", notableMoons: "None", rings: "None", funFact1: "Has the most eccentric (oval-shaped) orbit.", funFact2: "One Mercury solar day (sunrise to sunrise) is 176 Earth days long!" },
    venus: { name: "Venus", type: "Rocky, Terrestrial", tempC: "464 °C (Surface)", sizeKm: "12,104 km", moonsCount: "0", description: "Earth's 'sister planet' by size, but with a runaway greenhouse effect making it the hottest planet.", mass: "0.815 Earths", gravity: "8.87 m/s²", orbitalPeriod: "224.7 Earth days", rotationPeriod: "-243 Earth days (Retrograde)", axialTilt: "177.4° (Effectively upside down)", atmosphere: "Extremely dense CO2, Sulfuric acid clouds", weather: "Constant acid rain (evaporates before surface), crushing pressure", seasons: "None significant", notableMoons: "None", rings: "None", funFact1: "Rotates clockwise (retrograde), opposite to most planets.", funFact2: "Its surface pressure is over 90 times that of Earth." },
    earth: { name: "Earth", type: "Rocky, Terrestrial", tempC: "15 °C (Avg)", sizeKm: "12,742 km", moonsCount: "1", description: "Our home, the only known planet to harbor life, with liquid water on its surface.", mass: "5.972 × 10^24 kg", gravity: "9.81 m/s²", orbitalPeriod: "365.25 Earth days", rotationPeriod: "23.93 hours", axialTilt: "23.44°", atmosphere: "Nitrogen (78%), Oxygen (21%), Argon, CO2", weather: "Diverse climates, complex weather systems", seasons: "Yes, due to axial tilt", notableMoons: "Moon (Luna)", rings: "None", funFact1: "Has a powerful magnetic field protecting it from solar wind.", funFact2: "Approximately 71% of its surface is covered by water." },
    mars: { name: "Mars", type: "Rocky, Terrestrial", tempC: "-65 °C (Avg)", sizeKm: "6,779 km", moonsCount: "2", description: "The 'Red Planet', known for its iron oxide surface, thin atmosphere, and polar ice caps.", mass: "0.107 Earths", gravity: "3.72 m/s²", orbitalPeriod: "687 Earth days", rotationPeriod: "24.6 hours (A Martian Sol)", axialTilt: "25.19°", atmosphere: "Thin CO2 (95%), Nitrogen, Argon", weather: "Global dust storms, thin clouds, frost", seasons: "Yes, similar to Earth's but longer", notableMoons: "Phobos, Deimos", rings: "None (possibly very faint dust rings)", funFact1: "Home to Olympus Mons, the largest volcano in the Solar System.", funFact2: "Evidence suggests liquid water flowed on Mars in the past." },
    jupiter: { name: "Jupiter", type: "Gas Giant", tempC: "-145 °C (Cloud Tops)", sizeKm: "139,820 km", moonsCount: "95 (Known)", description: "The largest planet, a gas giant with a strong magnetic field and many moons.", mass: "318 Earths", gravity: "24.79 m/s²", orbitalPeriod: "11.86 Earth years", rotationPeriod: "9.93 hours (Fastest rotating)", axialTilt: "3.13°", atmosphere: "Hydrogen (90%), Helium (10%)", weather: "Massive storms (Great Red Spot), strong jet streams, lightning", seasons: "None significant", notableMoons: "Io, Europa, Ganymede, Callisto (Galilean Moons)", rings: "Faint, dusty rings", funFact1: "Its magnetic field is nearly 20,000 times stronger than Earth's.", funFact2: "The Great Red Spot is an ancient storm larger than Earth." },
    saturn: { name: "Saturn", type: "Gas Giant", tempC: "-178 °C (Cloud Tops)", sizeKm: "116,460 km", moonsCount: "146 (Known)", description: "Known for its spectacular and extensive ring system, composed mainly of ice particles.", mass: "95 Earths", gravity: "10.44 m/s²", orbitalPeriod: "29.46 Earth years", rotationPeriod: "10.7 hours", axialTilt: "26.73°", atmosphere: "Hydrogen, Helium", weather: "Strong winds (up to 1,800 km/h), occasional large storms", seasons: "Yes, due to axial tilt", notableMoons: "Titan, Rhea, Enceladus, Mimas", rings: "Yes, prominent and complex (A, B, C, etc.)", funFact1: "Saturn is the least dense planet; it would float in water!", funFact2: "Titan, Saturn's largest moon, has a thick atmosphere and liquid methane lakes." },
    uranus: { name: "Uranus", type: "Ice Giant", tempC: "-214 °C (Cloud Tops)", sizeKm: "50,724 km", moonsCount: "27 (Known)", description: "An ice giant that rotates on its side, giving it extreme seasons.", mass: "14.5 Earths", gravity: "8.69 m/s²", orbitalPeriod: "84.01 Earth years", rotationPeriod: "-17.2 hours (Retrograde)", axialTilt: "97.77°", atmosphere: "Hydrogen, Helium, Methane (gives blue-green color)", weather: "Relatively featureless atmosphere, some cloud bands", seasons: "Extreme; each pole gets 42 years of continuous sunlight, then 42 years of darkness.", notableMoons: "Titania, Oberon, Umbriel, Ariel, Miranda", rings: "Faint, dark rings", funFact1: "First planet discovered using a telescope (by William Herschel in 1781).", funFact2: "Its magnetic field is tilted at nearly 60 degrees from its axis of rotation." },
    neptune: { name: "Neptune", type: "Ice Giant", tempC: "-218 °C (Cloud Tops)", sizeKm: "49,244 km", moonsCount: "14 (Known)", description: "The most distant major planet, known for its deep blue color and the fastest winds in the Solar System.", mass: "17 Earths", gravity: "11.15 m/s²", orbitalPeriod: "164.8 Earth years", rotationPeriod: "16.1 hours", axialTilt: "28.32°", atmosphere: "Hydrogen, Helium, Methane", weather: "Extremely strong winds (over 2,000 km/h), Great Dark Spot (transient storm)", seasons: "Yes, due to axial tilt", notableMoons: "Triton (orbits retrograde), Nereid", rings: "Faint, clumpy rings (arcs)", funFact1: "Its existence was predicted mathematically before it was directly observed.", funFact2: "Triton is one of the coldest known objects in the Solar System, with geysers of nitrogen ice." },
    pluto: { name: "Pluto", type: "Dwarf Planet", tempC: "-229 °C (Avg)", sizeKm: "2,376 km", moonsCount: "5", description: "A dwarf planet in the Kuiper Belt, known for its heart-shaped glacier (Sputnik Planitia).", mass: "0.00218 Earths", gravity: "0.62 m/s²", orbitalPeriod: "248 Earth years", rotationPeriod: "-6.39 Earth days (Retrograde)", axialTilt: "119.59°", atmosphere: "Thin Nitrogen, Methane, Carbon Monoxide (seasonal)", weather: "Extreme cold, thin atmosphere varies with distance from Sun", seasons: "Extreme, due to tilt and highly eccentric orbit", notableMoons: "Charon (largest), Styx, Nix, Kerberos, Hydra", rings: "None known", funFact1: "Charon is so large relative to Pluto (about half its diameter) that they are sometimes considered a binary system.", funFact2: "Its orbit is so eccentric that it sometimes comes closer to the Sun than Neptune." },
    moon: { name: "Moon", type: "Natural Satellite", tempC: "-20 °C (Avg)", sizeKm: "3,474 km", moonsCount: "N/A", description: "Earth's only natural satellite, playing a crucial role in tides and stabilizing Earth's axial tilt.", mass: "0.0123 Earths", gravity: "1.62 m/s²", orbitalPeriod: "27.3 Earth days (around Earth)", rotationPeriod: "27.3 Earth days (Tidally locked)", axialTilt: "1.54° (to its orbit around Earth)", atmosphere: "Very thin exosphere (Helium, Neon, Argon)", weather: "No weather, extreme temperature variations between day and night", seasons: "None", notableMoons: "N/A", rings: "None", funFact1: "The fifth largest moon in the Solar System.", funFact2: "Humans first landed on the Moon in 1969 (Apollo 11 mission)."}
};

(planetInfoDatabase.sun as any).planetInfo = planetInfoDatabase.sun;

const planetDataArray = [
    planetInfoDatabase.sun, planetInfoDatabase.mercury, planetInfoDatabase.venus, planetInfoDatabase.earth, planetInfoDatabase.mars,
    planetInfoDatabase.jupiter, planetInfoDatabase.saturn, planetInfoDatabase.uranus, planetInfoDatabase.neptune,
    planetInfoDatabase.pluto
];

planetDataArray.forEach(pInfo => {
    if (pInfo.name.toLowerCase() === "sun") {
        (sunSphere as any).planetInfo = pInfo;
        return;
    }

    let currentSize = 1, currentOrbit = 10, currentTilt = 0;
    let currentRotSpeed = 0, currentOrbSpeed = 0;
    let currentTexture = `/${pInfo.name.toLowerCase()}.jpg`;

    switch(pInfo.name.toLowerCase()) {
        case "mercury": currentSize = mercurySize; currentOrbit = mercuryOrbitRadius; currentTilt = mercuryAxialTiltDegrees; currentRotSpeed = mercuryRotationSpeed; currentOrbSpeed = mercuryOrbitSpeed; break;
        case "venus": currentSize = venusSize; currentOrbit = venusOrbitRadius; currentTilt = venusAxialTiltDegrees; currentRotSpeed = venusRotationSpeed; currentOrbSpeed = venusOrbitSpeed; currentTexture = "/venus_surface.jpg"; break;
        case "earth": currentSize = earthSize; currentOrbit = earthOrbitRadius; currentTilt = earthAxialTiltDegrees; currentRotSpeed = earthRotationSpeed; currentOrbSpeed = earthOrbitSpeed; break;
        case "mars": currentSize = marsSize; currentOrbit = marsOrbitRadius; currentTilt = marsAxialTiltDegrees; currentRotSpeed = marsRotationSpeed; currentOrbSpeed = marsOrbitSpeed; break;
        case "jupiter": currentSize = jupiterSize; currentOrbit = jupiterOrbitRadius; currentTilt = jupiterAxialTiltDegrees; currentRotSpeed = jupiterRotationSpeed; currentOrbSpeed = jupiterOrbitSpeed; break;
        case "saturn": currentSize = saturnSize; currentOrbit = saturnOrbitRadius; currentTilt = saturnAxialTiltDegrees; currentRotSpeed = saturnRotationSpeed; currentOrbSpeed = saturnOrbitSpeed; break;
        case "uranus": currentSize = uranusSize; currentOrbit = uranusOrbitRadius; currentTilt = uranusAxialTiltDegrees; currentRotSpeed = uranusRotationSpeed; currentOrbSpeed = uranusOrbitSpeed; break;
        case "neptune": currentSize = neptuneSize; currentOrbit = neptuneOrbitRadius; currentTilt = neptuneAxialTiltDegrees; currentRotSpeed = neptuneRotationSpeed; currentOrbSpeed = neptuneOrbitSpeed; break;
        case "pluto": currentSize = plutoSize; currentOrbit = plutoOrbitRadius; currentTilt = plutoAxialTiltDegrees; currentRotSpeed = plutoRotationSpeed; currentOrbSpeed = plutoOrbitSpeed; break;
    }

    planets[pInfo.name.toLowerCase()] = createCelestialBody(pInfo.name.toLowerCase(), currentSize, currentOrbit, currentTexture, scene, currentTilt, pInfo);
    (planets[pInfo.name.toLowerCase()].orbitAnchor as any).orbitSpeed = currentOrbSpeed;
    (planets[pInfo.name.toLowerCase()].sphere as any).rotationSpeed = currentRotSpeed;
});


const earthSphereFromSystem = planets["earth"]?.sphere;
if (earthSphereFromSystem) {
    defaultArcTarget = earthSphereFromSystem;
    if (scene.activeCamera === arcCamera) {
        arcCamera.lockedTarget = earthSphereFromSystem; // Lock to Earth initially
    }
}


// Special setup for Venus Atmosphere
const venusSystem = planets["venus"];
if (venusSystem && venusSystem.sphere) {
    const venusAtmosphereSphere = MeshBuilder.CreateSphere("venusAtmosphere", { diameter: venusSize + venusAtmosphereOffset }, scene);
    venusAtmosphereSphere.parent = venusSystem.sphere;
    const venusAtmoMat = new StandardMaterial("venusAtmoMat", scene);
    const venusAtmoTex = new Texture("/venus_atmosphere.jpg", scene, undefined, true, Texture.BILINEAR_SAMPLINGMODE,
        () => { console.log("Venus atmosphere texture loaded."); if(venusAtmoTex) {venusAtmoTex.vScale = -1; venusAtmoTex.uScale = -1;} },
        (m,e) => console.error("Venus atmosphere texture error:", m, e)
    );
    venusAtmoMat.emissiveTexture = venusAtmoTex;
    venusAtmoMat.opacityTexture = venusAtmoTex;
    if (venusAtmoMat.opacityTexture) venusAtmoMat.opacityTexture.getAlphaFromRGB = true;
    venusAtmoMat.alpha = 0.65;
    venusAtmoMat.disableLighting = true;
    venusAtmosphereSphere.material = venusAtmoMat;
    venusSystem.atmosphereSphere = venusAtmosphereSphere;
    (venusAtmosphereSphere as any).isAtmosphere = true;
}

// Special setup for Saturn's Rings
const saturnSystem = planets["saturn"];
if (saturnSystem && saturnSystem.sphere) {
    const ringMesh = MeshBuilder.CreateDisc("saturnRing", {radius: saturnRingOuterRadius, tessellation: 128, sideOrientation: Mesh.DOUBLESIDE }, scene);
    ringMesh.parent = saturnSystem.sphere;
    ringMesh.rotation.x = Math.PI / 2;
    const ringMaterial = new StandardMaterial("saturnRingMat", scene);
    const ringTexture = new Texture("/saturn_ring_alpha.png", scene, undefined, false, Texture.BILINEAR_SAMPLINGMODE,
        () => {
            console.log("Saturn ring texture loaded.");
            if (ringTexture) {
                ringTexture.uScale = 1;
                ringTexture.vScale = 1;
                ringTexture.wAng = -Math.PI / 2;
            }
        },
        (m,e) => console.error("Saturn ring texture error:", m, e)
    );
    ringMaterial.diffuseTexture = ringTexture;
    ringMaterial.opacityTexture = ringTexture;
    ringMaterial.useAlphaFromDiffuseTexture = true;
    ringMaterial.alphaMode = Engine.ALPHA_COMBINE;
    ringMaterial.diffuseColor = new Color3(1, 1, 1);
    ringMaterial.emissiveColor = new Color3(0.6, 0.6, 0.6);
    ringMaterial.specularColor = new Color3(0.35, 0.35, 0.35);
    ringMaterial.specularPower = 24;
    ringMaterial.backFaceCulling = false;
    ringMesh.material = ringMaterial;
    saturnSystem.ringMesh = ringMesh;
    (ringMesh as any).isRing = true;
}

// Earth Cloud Layer
const earthSystemForClouds = planets["earth"];
if (earthSystemForClouds && earthSystemForClouds.sphere) {
    const cloudSphere = MeshBuilder.CreateSphere("cloudSphere", { diameter: earthSize + cloudSizeRelativeToEarth, segments: 64 }, scene);
    cloudSphere.parent = earthSystemForClouds.sphere;
    const cloudMaterial = new StandardMaterial("cloudMat", scene);
    const cloudTextureURL = "/earth_clouds.jpg";
    const cloudOpacityTexture = new Texture(cloudTextureURL, scene, undefined, true, Texture.BILINEAR_SAMPLINGMODE,
        () => { console.log("Earth clouds texture loaded."); if(cloudOpacityTexture){ cloudOpacityTexture.vScale = -1; cloudOpacityTexture.uScale = -1;} },
        (m,e) => console.error("Earth clouds texture error:", m, e)
    );
    cloudMaterial.opacityTexture = cloudOpacityTexture;
    if (cloudMaterial.opacityTexture) cloudMaterial.opacityTexture.getAlphaFromRGB = true;
    cloudMaterial.diffuseColor = new Color3(1, 1, 1);
    cloudMaterial.emissiveColor = new Color3(0.05, 0.05, 0.05);
    cloudMaterial.alpha = 0.55;
    cloudMaterial.specularColor = new Color3(0, 0, 0);
    cloudSphere.material = cloudMaterial;
    (earthSystemForClouds as any).cloudSphere = cloudSphere;
    (cloudSphere as any).isAtmosphere = true;
}

// Moon
const earthSphereForMoon = planets["earth"]?.sphere;
if (earthSphereForMoon) {
    const { sphere: moonSphere, orbitAnchor: moonOrbitAnchor } = createCelestialBody("moon", moonSize, moonOrbitRadius, "/moon.jpg", scene, 0, planetInfoDatabase.moon, earthSphereForMoon);
    planets["moon"] = { sphere: moonSphere, orbitAnchor: moonOrbitAnchor, info: planetInfoDatabase.moon };
    (planets["moon"].orbitAnchor as any).orbitSpeed = moonOrbitSpeed;
    (planets["moon"].sphere as any).rotationSpeed = moonRotationSpeed;
    if (moonSphere.material instanceof StandardMaterial && moonSphere.material.diffuseTexture) {
        (moonSphere.material.diffuseTexture as Texture).vScale = -1;
        (moonSphere.material.diffuseTexture as Texture).uScale = -1;
    }
}

// Shadow Generator
const shadowGenerator = new ShadowGenerator(2048, sunLight);
shadowGenerator.usePercentageCloserFiltering = true;
shadowGenerator.bias = 0.007;
shadowGenerator.normalBias = 0.03;
shadowGenerator.frustumEdgeFalloff = 0.1;
shadowGenerator.darkness = 0.4;

const shadowMap = shadowGenerator.getShadowMap();
if (shadowMap) {
    shadowMap.refreshRate = 1;
}

if (planets["moon"] && planets["moon"].sphere) shadowGenerator.addShadowCaster(planets["moon"].sphere);
if (planets["earth"] && planets["earth"].sphere) shadowGenerator.addShadowCaster(planets["earth"].sphere);

// --- Interaction Logic ---
let lastHoveredMesh: Mesh | null = null;
let isDetailedPanelOpen = false;
let currentFocusedMesh: Mesh | null = null;


// Function to populate and show detailed panel
function showDetailedInfo(planetInfo: PlanetInfoData) {
    if (!detailedPlanetInfoPanel || !planetInfo) return;

    if (detailedPlanetNameEl) detailedPlanetNameEl.textContent = planetInfo.name;
    if (detailedPlanetTypeSpan) detailedPlanetTypeSpan.textContent = planetInfo.type;
    if (detailedPlanetDescriptionSpan) detailedPlanetDescriptionSpan.textContent = planetInfo.description;
    if (detailedPlanetDiameterSpan) detailedPlanetDiameterSpan.textContent = planetInfo.sizeKm;
    if (detailedPlanetMassSpan) detailedPlanetMassSpan.textContent = planetInfo.mass;
    if (detailedPlanetGravitySpan) detailedPlanetGravitySpan.textContent = planetInfo.gravity;
    if (detailedOrbitalPeriodSpan) detailedOrbitalPeriodSpan.textContent = planetInfo.orbitalPeriod;
    if (detailedRotationPeriodSpan) detailedRotationPeriodSpan.textContent = planetInfo.rotationPeriod;
    if (detailedAxialTiltSpan) detailedAxialTiltSpan.textContent = planetInfo.axialTilt;
    if (detailedAvgTempSpan) detailedAvgTempSpan.textContent = planetInfo.tempC;
    if (detailedAtmosphereSpan) detailedAtmosphereSpan.textContent = planetInfo.atmosphere;
    if (detailedWeatherSpan) detailedWeatherSpan.textContent = planetInfo.weather;
    if (detailedSeasonsSpan) detailedSeasonsSpan.textContent = planetInfo.seasons;
    if (detailedMoonsCountSpan) detailedMoonsCountSpan.textContent = planetInfo.moonsCount;
    if (detailedNotableMoonsSpan) detailedNotableMoonsSpan.textContent = planetInfo.notableMoons;
    if (detailedRingsSpan) detailedRingsSpan.textContent = planetInfo.rings;
    if (detailedFunFact1Span) detailedFunFact1Span.textContent = planetInfo.funFact1;
    if (detailedFunFact2Span) detailedFunFact2Span.textContent = planetInfo.funFact2;

    detailedPlanetInfoPanel.classList.add('visible');
    isDetailedPanelOpen = true;
}

// Function to hide detailed panel
function hideDetailedInfo(revertToDefaultTarget: boolean = false) {
    if (detailedPlanetInfoPanel) {
        detailedPlanetInfoPanel.classList.remove('visible');
    }
    isDetailedPanelOpen = false;
    
    if (revertToDefaultTarget && scene.activeCamera === arcCamera) {
        arcCamera.lockedTarget = null; // Unlock from specific planet
        const targetMesh = defaultArcTarget || planets["earth"]?.sphere;
        if (targetMesh) {
            isAnimatingCamera = true;
            const easingFunction = new QuinticEase();
            easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
            // Animate target position - No, just set lockedTarget
            arcCamera.lockedTarget = targetMesh; // Re-lock to default
            // Animate radius
            Animation.CreateAndStartAnimation(
                "cameraReturnRadius", arcCamera, "radius", 30, 75, // 2.5 seconds
                arcCamera.radius, (targetMesh.getBoundingInfo().boundingSphere.radiusWorld * 3) + earthSize * 2.0, // Adjust radius
                Animation.ANIMATIONLOOPMODE_CONSTANT, easingFunction,
                 () => { isAnimatingCamera = false; } // Reset flag on completion
            );
        }
        currentFocusedMesh = null; // Clear specific focus when reverting
    }
    // If not reverting by clicking X, currentFocusedMesh remains, and camera stays locked if it was.
}

if(closeDetailedPanelButton) {
    closeDetailedPanelButton.addEventListener('click', () => hideDetailedInfo(false)); 
}

// REMOVED: canvas.addEventListener('pointerdown', ...) for outside click to close. Panel only closes via 'X' button.


scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
    const pickResult = scene.pick(pointerInfo.event.clientX, pointerInfo.event.clientY, (mesh) => {
        return !!(mesh as any).planetInfo && !(mesh as any).isAtmosphere && !(mesh as any).isRing;
    });

    if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
        if (isDetailedPanelOpen) {
            if (planetInfoPanel) planetInfoPanel.classList.remove('visible');
            lastHoveredMesh = null;
            return;
        }

        if (pickResult && pickResult.hit && pickResult.pickedMesh) {
            const pickedMesh = pickResult.pickedMesh as Mesh;
            const planetInfo = (pickedMesh as any).planetInfo as PlanetInfoData;

            if (planetInfo && planetInfoPanel && planetNameEl && planetTypeEl && planetTempEl && planetSizeEl && planetMoonsEl) {
                if (lastHoveredMesh !== pickedMesh) {
                    planetNameEl.textContent = planetInfo.name;
                    planetTypeEl.textContent = ` Type: ${planetInfo.type}`;
                    planetTempEl.textContent = ` Avg. Temp: ${planetInfo.tempC}`;
                    planetSizeEl.textContent = ` Diameter: ${planetInfo.sizeKm}`;
                    planetMoonsEl.textContent = ` Moons: ${planetInfo.moonsCount}`;
                    planetInfoPanel.classList.add('visible');
                    lastHoveredMesh = pickedMesh;
                }
                planetInfoPanel.style.left = `${pointerInfo.event.clientX + 15}px`;
                planetInfoPanel.style.top = `${pointerInfo.event.clientY + 15}px`;
            }
        } else {
            if (planetInfoPanel && lastHoveredMesh) {
                planetInfoPanel.classList.remove('visible');
                lastHoveredMesh = null;
            }
        }
    }
    else if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
        if (isAnimatingCamera) return;

        if (pickResult && pickResult.hit && pickResult.pickedMesh) {
            const pickedMesh = pickResult.pickedMesh as Mesh;
            const planetInfo = (pickedMesh as any).planetInfo as PlanetInfoData;

            if (planetInfo) {
                isAnimatingCamera = true;
                currentFocusedMesh = pickedMesh; 
                defaultArcTarget = pickedMesh;   // Update default target to this newly clicked planet

                if (scene.activeCamera === freeCamera) {
                    isFreeCameraMode = false;
                    freeCamera.detachControl();
                    scene.activeCamera = arcCamera;
                    arcCamera.attachControl(canvas, true);
                    const uiControlsDiv = document.getElementById('uiControls');
                    if (uiControlsDiv) uiControlsDiv.classList.remove('free-cam-active');
                    console.log("Switched to Arc Rotate Camera Mode for planet focus.");
                }
                
                arcCamera.lockedTarget = pickedMesh;

                const easingFunction = new QuinticEase();
                easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);

                Animation.CreateAndStartAnimation(
                    "cameraRadius", arcCamera, "radius", 30, 75, // 2.5 seconds
                    arcCamera.radius,
                    (pickedMesh.getBoundingInfo().boundingSphere.radiusWorld * 3) + (pickedMesh.name === "sunSphere" ? sunSize : earthSize) * 2.0,
                    Animation.ANIMATIONLOOPMODE_CONSTANT, easingFunction,
                    () => { isAnimatingCamera = false; }
                );

                showDetailedInfo(planetInfo);
                if (planetInfoPanel) planetInfoPanel.classList.remove('visible');
                lastHoveredMesh = null;
            }
        }
    }
});


// Animation
scene.onBeforeRenderObservable.add(() => {
    const deltaTime = engine.getDeltaTime();
    if (deltaTime > 100) return;

    const sunRotationDelta = sunRotationSpeed * deltaTime;
    if(sunSphere) sunSphere.rotate(Vector3.Up(), sunRotationDelta, Space.LOCAL);

    planetDataArray.forEach(pInfo => {
        if (pInfo.name.toLowerCase() === "sun") return;

        const system = planets[pInfo.name.toLowerCase()];
        if (system && system.orbitAnchor && system.sphere) {
            const orbitSpeed = (system.orbitAnchor as any).orbitSpeed || 0;
            system.orbitAnchor.rotation.y += orbitSpeed * deltaTime;

            const rotationSpeed = (system.sphere as any).rotationSpeed || 0;
            const rotationAmount = rotationSpeed * deltaTime;
            system.sphere.rotate(Vector3.Up(), rotationAmount, Space.LOCAL);

            if (pInfo.name.toLowerCase() === "earth" && (system as any).cloudSphere) {
                const cloudRotationDelta = (earthRotationSpeed * cloudRotationSpeedRelativeToEarthSurface) * deltaTime;
                (system as any).cloudSphere.rotate(Vector3.Up(), cloudRotationDelta, Space.LOCAL);
            }
            if (pInfo.name.toLowerCase() === "venus" && system.atmosphereSphere) {
                 system.atmosphereSphere.rotate(Vector3.Up(), venusRotationSpeed * 0.8 * deltaTime, Space.LOCAL);
            }
        }
    });

    const moonSystem = planets["moon"];
    if (moonSystem && moonSystem.orbitAnchor && moonSystem.sphere) {
        const moonOrbitS = (moonSystem.orbitAnchor as any).orbitSpeed || 0;
        moonSystem.orbitAnchor.rotation.y += moonOrbitS * deltaTime;

        const moonRotS = (moonSystem.sphere as any).rotationSpeed || 0;
        moonSystem.sphere.rotate(Vector3.Up(), moonRotS * deltaTime, Space.LOCAL);
    }
});

// Render Loop
engine.runRenderLoop(() => {
    if (!engine.isDisposed) {
         scene.render();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    engine.resize();
});

console.log("Babylon.js with Vite setup complete! Full solar system with UI elements and detailed panel should be rendering. 😊🎉");
