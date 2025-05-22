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
import { LinesMesh } from '@babylonjs/core/Meshes/linesMesh';
import { NoiseProceduralTexture } from '@babylonjs/core/Materials/Textures/Procedurals/noiseProceduralTexture'; 

// Import side effects from core for mesh building
import "@babylonjs/core/Meshes/meshBuilder";

// Get the canvas element from HTML
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
if (!canvas) {
    console.error("Render canvas not found!");
    throw new Error("Render canvas not found!");
}

// --- UI Elements ---
const simSpeedSlider = document.getElementById('simSpeed') as HTMLInputElement;
const simSpeedValueEl = document.getElementById('simSpeedValue') as HTMLSpanElement;
const freeCamSpeedSlider = document.getElementById('freeCamSpeed') as HTMLInputElement;
const arcCamZoomSlider = document.getElementById('arcCamZoom') as HTMLInputElement;
const planetInfoPanel = document.getElementById('planetInfoPanel') as HTMLDivElement;
const planetNameEl = document.getElementById('planetName') as HTMLHeadingElement;
const planetTypeEl = document.getElementById('planetType') as HTMLSpanElement;
const planetTempEl = document.getElementById('planetTemp') as HTMLSpanElement;
const planetSizeEl = document.getElementById('planetSize') as HTMLSpanElement;
const planetMoonsEl = document.getElementById('planetMoons') as HTMLSpanElement;
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
const toggleCameraButton = document.getElementById('toggleCameraButton') as HTMLButtonElement;
const toggleOverviewButton = document.getElementById('toggleOverviewButton') as HTMLButtonElement;

// 1. Create the Babylon.js Engine
const engine = new Engine(canvas, true, { stencil: true, preserveDrawingBuffer: true }, true);
if (!engine) {
    console.error("Failed to create Babylon engine!");
    throw new Error("Failed to create Babylon engine!");
}

// 2. Create a Scene
const scene = new Scene(engine);
scene.clearColor = new Color4(0,0,0,1);

// --- User Provided Physics Constants ---
const G = 0.0006; 
let simulationTimeScale = 1.0; 
const physicsTimeStep = 1 / 60; 
let physicsAccumulator = 0;


// --- Constants for our solar system ---
const sunSize = 6;
const mercurySize = 0.7;
const venusSize = 1.9;
const earthSize = 2;
const moonSize = 0.5; // Earth's Moon
const marsSize = 1.1;
const jupiterSize = 4.5;
const saturnSize = 4;
const saturnRingOuterRadius = saturnSize * 2.2;
const saturnRingInnerRadius = saturnSize * 1.1; 
const saturnRingThickness = 0.05; 
const numberOfSaturnRingParticles = 2500; 

const uranusSize = 3;
const neptuneSize = 2.9;
const plutoSize = 0.4;

// Moon Sizes
const ioSize = 0.4; 
const europaSize = 0.35;
const titanSize = 0.6;
const rheaSize = 0.25;
const phobosSize = 0.05; // Mars' moons are tiny
const deimosSize = 0.03;
const ganymedeSize = 0.55; // Jupiter's largest
const callistoSize = 0.5;
const enceladusSize = 0.08; // Saturn's moon
const mimasSize = 0.06;


const cloudSizeRelativeToEarth = 0.04;
const venusAtmosphereOffset = 0.05;

const baseOrbitUnit = 35; 
const mercuryOrbitRadius = baseOrbitUnit * 0.39; 
const venusOrbitRadius = baseOrbitUnit * 0.72;  
const earthOrbitRadius = baseOrbitUnit * 1.0;   
const marsOrbitRadius = baseOrbitUnit * 1.52;   
const jupiterOrbitRadius = baseOrbitUnit * 5.2;  
const saturnOrbitRadius = baseOrbitUnit * 9.58;  
const uranusOrbitRadius = baseOrbitUnit * 19.22; 
const neptuneOrbitRadius = baseOrbitUnit * 30.05;
const plutoOrbitRadius = baseOrbitUnit * 39.48;  

const moonOrbitRadius = 2.5; // Relative to Earth

// New Moon Orbital Radii (relative to their parent planet's center)
const ioOrbitRadius = jupiterSize * 1.5; 
const europaOrbitRadius = jupiterSize * 2.2;
const ganymedeOrbitRadius = jupiterSize * 3.0;
const callistoOrbitRadius = jupiterSize * 4.2;
const titanOrbitRadius = saturnSize * 3.0;
const rheaOrbitRadius = saturnSize * 1.3;
const enceladusOrbitRadius = saturnSize * 0.8;
const mimasOrbitRadius = saturnSize * 0.6;
const phobosOrbitRadius = marsSize * 1.5; // Very close to Mars
const deimosOrbitRadius = marsSize * 2.5;


const asteroidBeltInnerRadius = marsOrbitRadius + 5; 
const asteroidBeltOuterRadius = jupiterOrbitRadius - 8; 
const asteroidBeltHeight = 2.0; 
const numberOfAsteroids = 1000; 


const skyboxSize = Math.max(plutoOrbitRadius * 2.2, 1800); 
// const overviewScaleFactor = 0.5; 

const mercuryAxialTiltDegrees = 0.03;
const venusAxialTiltDegrees = 177.4;
const earthAxialTiltDegrees = 23.44;
const marsAxialTiltDegrees = 25.19;
const jupiterAxialTiltDegrees = 3.13;
const saturnAxialTiltDegrees = 26.73;
const uranusAxialTiltDegrees = 97.77;
const neptuneAxialTiltDegrees = 28.32;
const plutoAxialTiltDegrees = 119.59;
const ioAxialTiltDegrees = 0;
const europaAxialTiltDegrees = 0;
const titanAxialTiltDegrees = 0;
const rheaAxialTiltDegrees = 0;
const phobosAxialTiltDegrees = 0;
const deimosAxialTiltDegrees = 0;
const ganymedeAxialTiltDegrees = 0;
const callistoAxialTiltDegrees = 0;
const enceladusAxialTiltDegrees = 0;
const mimasAxialTiltDegrees = 0;


const visualSpeedBaseMultiplier = (0.00002 * 0.7) * 4; 

// --- User Provided Relative Masses ---
const sunMass = 9500;
const mercuryMass = 0.055;
const venusMass = 0.815;
const earthMass = 200.0;  
const moonMass = earthMass * 0.0123; 
const marsMass = 50.0;
const jupiterMass = 317.8; 
const saturnMass = 95.2;
const uranusMass = 14.5;
const neptuneMass = 17.1;
const plutoMass = 0.0022;
// New Moon Masses
const ioMass = jupiterMass * 0.000047; 
const europaMass = jupiterMass * 0.000025;
const ganymedeMass = jupiterMass * 0.000078; // Largest moon in solar system
const callistoMass = jupiterMass * 0.000057;
const titanMass = saturnMass * 0.0023;
const rheaMass = saturnMass * 0.000039;
const enceladusMass = saturnMass * 0.0000018; // Tiny but geologically active
const mimasMass = saturnMass * 0.00000063; // "Death Star" moon
const phobosMass = marsMass * 0.0000000017; // Very small
const deimosMass = marsMass * 0.00000000024; // Even smaller


// --- Rotational Period Factors (Relative to Earth's day) ---
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
const ioRotationFactor = 1.77; 
const europaRotationFactor = 3.55; 
const ganymedeRotationFactor = 7.15;
const callistoRotationFactor = 16.69;
const titanRotationFactor = 15.95; 
const rheaRotationFactor = 4.52; 
const enceladusRotationFactor = 1.37;
const mimasRotationFactor = 0.94;
const phobosRotationFactor = 0.319; // Tidally locked
const deimosRotationFactor = 1.26; // Tidally locked


const cloudRotationSpeedRelativeToEarthSurface = 1.2;
const earthOrbitalPeriodFactorForMoon = 1.0; 
const moonOrbitalPeriodFactorEarthRelative = 27.3 / 365.25; 


// --- Calculated Visual Speeds (Axial Rotation) ---
const sunRotationSpeed = visualSpeedBaseMultiplier / sunRotationFactor;
const mercuryRotationSpeed = visualSpeedBaseMultiplier / mercuryRotationFactor;
const venusRotationSpeed = visualSpeedBaseMultiplier / venusRotationFactor;
const earthRotationSpeed = visualSpeedBaseMultiplier / earthRotationFactor;
const marsRotationSpeed = visualSpeedBaseMultiplier / marsRotationFactor;
const jupiterRotationSpeed = visualSpeedBaseMultiplier / jupiterRotationFactor;
const saturnRotationSpeed = visualSpeedBaseMultiplier / saturnRotationFactor;
const uranusRotationSpeed = visualSpeedBaseMultiplier / uranusRotationFactor;
const neptuneRotationSpeed = visualSpeedBaseMultiplier / neptuneRotationFactor;
const plutoRotationSpeed = visualSpeedBaseMultiplier / plutoRotationFactor;
const moonAxialRotationSpeed = visualSpeedBaseMultiplier / earthOrbitalPeriodFactorForMoon / moonOrbitalPeriodFactorEarthRelative;
const ioAxialRotationSpeed = visualSpeedBaseMultiplier / ioRotationFactor;
const europaAxialRotationSpeed = visualSpeedBaseMultiplier / europaRotationFactor;
const ganymedeAxialRotationSpeed = visualSpeedBaseMultiplier / ganymedeRotationFactor;
const callistoAxialRotationSpeed = visualSpeedBaseMultiplier / callistoRotationFactor;
const titanAxialRotationSpeed = visualSpeedBaseMultiplier / titanRotationFactor;
const rheaAxialRotationSpeed = visualSpeedBaseMultiplier / rheaRotationFactor;
const enceladusAxialRotationSpeed = visualSpeedBaseMultiplier / enceladusRotationFactor;
const mimasAxialRotationSpeed = visualSpeedBaseMultiplier / mimasRotationFactor;
const phobosAxialRotationSpeed = visualSpeedBaseMultiplier / phobosRotationFactor;
const deimosAxialRotationSpeed = visualSpeedBaseMultiplier / deimosRotationFactor;


// For asteroid belt kinematic orbit speed
const marsOrbitalPeriodFactor = 1.88; 
const jupiterOrbitalPeriodFactor = 11.86; 
const marsKinematicOrbitSpeed = visualSpeedBaseMultiplier / marsOrbitalPeriodFactor;
const jupiterKinematicOrbitSpeed = visualSpeedBaseMultiplier / jupiterOrbitalPeriodFactor;


// 3. Create Cameras
const arcCamera = new ArcRotateCamera("arcCamera", -Math.PI / 2, Math.PI / 2.5, earthSize * 6, Vector3.Zero(), scene);
arcCamera.attachControl(canvas, false);
arcCamera.minZ = 0.1;
arcCamera.lowerRadiusLimit = earthSize * 0.5;
arcCamera.upperRadiusLimit = skyboxSize * 0.9; 
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
if (simSpeedSlider && simSpeedValueEl) {
    simSpeedSlider.value = simulationTimeScale.toString();
    simSpeedValueEl.textContent = simulationTimeScale.toFixed(1);
    simSpeedSlider.addEventListener('input', (event) => {
        simulationTimeScale = parseFloat((event.target as HTMLInputElement).value);
        if(simSpeedValueEl) simSpeedValueEl.textContent = simulationTimeScale.toFixed(1);
    });
}

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
let isOverviewMode = false;
let previousArcCameraState: { target: Vector3, radius: number, lockedTarget: Mesh | null } | null = null;
const orbitLines: LinesMesh[] = []; 
const originalOrbitRadii: { [planetName: string]: number } = {}; 

// --- Function to Toggle Camera Mode ---
function toggleCamera() {
    if (isAnimatingCamera) return;
    if (isOverviewMode && !isFreeCameraMode) {
         toggleOverviewMode();
    }

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
        if (targetMesh) arcCamera.lockedTarget = targetMesh;
        if (uiControlsDiv) uiControlsDiv.classList.remove('free-cam-active');
        console.log("Switched to Arc Rotate Camera Mode");
    }
}


// --- Function to Toggle Overview Mode ---
function toggleOverviewMode() {
    if (isAnimatingCamera) return;

    if (isFreeCameraMode) {
        toggleCamera();
    }

    isOverviewMode = !isOverviewMode;
    isAnimatingCamera = true;
    const easingFunction = new QuinticEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
    const overviewAnimationFrames = 90;

    const targetSunPosition = sunSphere ? sunSphere.position.clone() : Vector3.Zero();

    // Toggle visibility of static orbit lines
    orbitLines.forEach(line => { if(line) line.isVisible = isOverviewMode; });


    if (isOverviewMode) {
        console.log("Entering Overview Mode");
        previousArcCameraState = {
            target: arcCamera.target.clone(),
            radius: arcCamera.radius,
            lockedTarget: arcCamera.lockedTarget
        };
        arcCamera.lockedTarget = null;

        Animation.CreateAndStartAnimation(
            "overviewTarget", arcCamera, "target", 30, overviewAnimationFrames,
            arcCamera.target, targetSunPosition,
            Animation.ANIMATIONLOOPMODE_CONSTANT, easingFunction
        );
        Animation.CreateAndStartAnimation(
            "overviewRadius", arcCamera, "radius", 30, overviewAnimationFrames,
            arcCamera.radius, plutoOrbitRadius * 2.0, 
            Animation.ANIMATIONLOOPMODE_CONSTANT, easingFunction,
            () => { isAnimatingCamera = false; }
        );
        if (detailedPlanetInfoPanel) detailedPlanetInfoPanel.classList.remove('visible');
        isDetailedPanelOpen = false;

    } else {
        console.log("Exiting Overview Mode");
        if (previousArcCameraState) {
            Animation.CreateAndStartAnimation(
                "restoreTarget", arcCamera, "target", 30, overviewAnimationFrames,
                arcCamera.target, previousArcCameraState.target,
                Animation.ANIMATIONLOOPMODE_CONSTANT, easingFunction
            );
            Animation.CreateAndStartAnimation(
                "restoreRadius", arcCamera, "radius", 30, overviewAnimationFrames,
                arcCamera.radius, previousArcCameraState.radius,
                Animation.ANIMATIONLOOPMODE_CONSTANT, easingFunction,
                () => {
                    isAnimatingCamera = false;
                    if (previousArcCameraState?.lockedTarget) {
                        arcCamera.lockedTarget = previousArcCameraState.lockedTarget;
                    }
                    previousArcCameraState = null;
                }
            );
        } else {
            const targetMesh = defaultArcTarget || planets["earth"]?.sphere;
            if (targetMesh) arcCamera.lockedTarget = targetMesh;
            arcCamera.radius = (targetMesh?.getBoundingInfo().boundingSphere.radiusWorld || earthSize) * 6;
            isAnimatingCamera = false;
        }
    }
}


window.addEventListener("keydown", (event) => {
    if (event.key === "c" || event.key === "C") {
        toggleCamera();
    } else if (event.key === "o" || event.key === "O") {
        toggleOverviewMode();
    }
});

if (toggleCameraButton) {
    toggleCameraButton.addEventListener('click', toggleCamera);
}
if (toggleOverviewButton) {
    toggleOverviewButton.addEventListener('click', toggleOverviewMode);
}


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
(sunSphere as any).mass = sunMass;
(sunSphere as any).velocity = Vector3.Zero();
(sunSphere as any).axialRotationSpeed = sunRotationSpeed; 

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
    atmosphereSphere?: Mesh;
    ringParticlesAnchor?: TransformNode;
    info: PlanetInfoData;
    orbitLine?: LinesMesh; 
    originalOrbitRadius: number;
    mass: number;
    velocity: Vector3;
    axialRotationSpeed: number; 
}
interface PlanetInfoData {
    name: string; type: string; tempC: string; sizeKm: string; moonsCount: string;
    description: string; mass: string; gravity: string; orbitalPeriod: string;
    rotationPeriod: string; axialTilt: string; atmosphere: string; weather: string;
    seasons: string; notableMoons: string; rings: string; funFact1: string; funFact2: string;
}

function createCelestialBody(
    name: string, diameter: number, orbitRadius: number, textureUrlOrColor: string | Color3 | null,
    scene: Scene, axialTiltDegrees: number, info: PlanetInfoData, mass: number,
    axialRotationSpeed: number, 
    isMoon: boolean = false, 
    primaryBody?: Mesh, 
    moonMaterialColor?: Color3 
): PlanetSystem {
    
    const sphere = MeshBuilder.CreateSphere(name, { diameter, segments: 32 }, scene);
    
    (sphere as any).planetInfo = info;
    originalOrbitRadii[name.toLowerCase()] = orbitRadius; 
    (sphere as any).mass = mass;
    (sphere as any).velocity = Vector3.Zero(); 
    (sphere as any).axialRotationSpeed = axialRotationSpeed; 

    if (isMoon && primaryBody) { 
        sphere.position = primaryBody.position.add(new Vector3(orbitRadius, 0, 0));
        const primaryVelocity = (primaryBody as any).velocity as Vector3 || Vector3.Zero();
        const primaryMass = (primaryBody as any).mass as number || earthMass; 
        const moonOrbitalSpeedAroundPrimary = Math.sqrt((G * primaryMass) / orbitRadius);
        (sphere as any).velocity.copyFrom(primaryVelocity).addInPlace(new Vector3(0,0,-moonOrbitalSpeedAroundPrimary));
    } else if (name !== "sun") { 
        sphere.position = new Vector3(orbitRadius, 0, 0);
        const initialOrbitalSpeed = Math.sqrt((G * sunMass) / orbitRadius) * 0.95; 
        (sphere as any).velocity = new Vector3(0, 0, -initialOrbitalSpeed);
    }


    const material = new StandardMaterial(`${name}Mat`, scene);
    if (typeof textureUrlOrColor === 'string') {
        const diffuseTexture = new Texture(textureUrlOrColor, scene, undefined, true, Texture.BILINEAR_SAMPLINGMODE,
            () => {
                console.log(`Texture ${textureUrlOrColor} for ${name} loaded.`);
                if (diffuseTexture) {
                    diffuseTexture.vScale = -1; diffuseTexture.uScale = -1;
                    if (name === "sun") { diffuseTexture.vScale = 1; diffuseTexture.uScale = 1; }
                }
            },
            (m,e) => console.error(`Texture ${textureUrlOrColor} for ${name} error:`, m, e)
        );
        material.diffuseTexture = diffuseTexture;
    } else if (textureUrlOrColor instanceof Color3) { 
        material.diffuseColor = textureUrlOrColor;
        const noiseTexture = new NoiseProceduralTexture(`${name}Noise`, 256, scene);
        noiseTexture.brightness = 0.6; 
        noiseTexture.octaves = 6;      
        noiseTexture.persistence = 0.8; 
        noiseTexture.animationSpeedFactor = 0; 
        material.diffuseTexture = noiseTexture; 
        
        const bumpNoiseTexture = new NoiseProceduralTexture(`${name}BumpNoise`, 256, scene);
        bumpNoiseTexture.octaves = 7;
        bumpNoiseTexture.persistence = 0.7;
        bumpNoiseTexture.brightness = 0.5;
        bumpNoiseTexture.animationSpeedFactor = 0; 
        material.bumpTexture = bumpNoiseTexture;
        if (material.bumpTexture) material.bumpTexture.level = 0.15; 

    } else if (moonMaterialColor) { 
        material.diffuseColor = moonMaterialColor;
        const noiseTexture = new NoiseProceduralTexture(`${name}Noise`, 256, scene);
        noiseTexture.brightness = 0.6;
        noiseTexture.octaves = 6;
        noiseTexture.persistence = 0.8;
        noiseTexture.animationSpeedFactor = 0;
        material.diffuseTexture = noiseTexture;
        
        const bumpNoiseTexture = new NoiseProceduralTexture(`${name}BumpNoise`, 256, scene);
        bumpNoiseTexture.octaves = 7;
        bumpNoiseTexture.persistence = 0.7;
        bumpNoiseTexture.animationSpeedFactor = 0;
        material.bumpTexture = bumpNoiseTexture;
        if (material.bumpTexture) material.bumpTexture.level = 0.15;
    }
    else { 
        material.diffuseColor = new Color3(0.5, 0.5, 0.5); 
    }
    material.specularColor = new Color3(0.05, 0.05, 0.05);
    material.specularPower = 8;
    sphere.material = material;
    sphere.receiveShadows = true;

    if (axialTiltDegrees !== 0) {
        const tiltRad = (axialTiltDegrees * Math.PI) / 180;
        const tiltQuaternion = Quaternion.RotationAxis(Vector3.Right(), tiltRad);
        sphere.rotationQuaternion = tiltQuaternion;
    }

    let orbitLine: LinesMesh | undefined = undefined;
    if (!isMoon && name !== "sun") { 
        const points = [];
        const segments = 100;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new Vector3(Math.cos(angle) * orbitRadius, 0, Math.sin(angle) * orbitRadius));
        }
        orbitLine = MeshBuilder.CreateLines(`${name}OrbitLine`, { points: points }, scene);
        orbitLine.color = new Color3(0.3, 0.3, 0.4);
        orbitLine.alpha = 0.4;
        orbitLine.isVisible = false; 
        orbitLines.push(orbitLine);
    }

    return { sphere, info, orbitLine, originalOrbitRadius: orbitRadius, mass, velocity: (sphere as any).velocity, axialRotationSpeed };
}

// --- Asteroid Belt Creation (Kinematic) ---
let asteroidBeltNode: TransformNode | null = null; 

function createAsteroidBelt(scene: Scene): TransformNode {
    const asteroidMaterial = new StandardMaterial("asteroidMat", scene);
    asteroidMaterial.diffuseColor = new Color3(0.5, 0.45, 0.4);
    asteroidMaterial.specularColor = new Color3(0.15, 0.15, 0.15);
    asteroidMaterial.specularPower = 16;

    const baseAsteroidShapes: Mesh[] = [];
    const baseAsteroid1 = MeshBuilder.CreateIcoSphere("baseAsteroid1", { radius: 0.08, subdivisions: 0 }, scene);
    baseAsteroidShapes.push(baseAsteroid1);
    const baseAsteroid2 = MeshBuilder.CreateIcoSphere("baseAsteroid2", { radius: 0.1, subdivisions: 1 }, scene);
    baseAsteroidShapes.push(baseAsteroid2);
    const baseAsteroid3 = MeshBuilder.CreateSphere("baseAsteroid3", { diameter: 0.18, segments: 6 }, scene);
    baseAsteroidShapes.push(baseAsteroid3);

    baseAsteroidShapes.forEach(shape => {
        shape.material = asteroidMaterial;
        shape.isVisible = false; 
    });

    const beltAnchor = new TransformNode("asteroidBeltAnchorNode", scene);
    const asteroidBeltOrbitSpeed = (marsKinematicOrbitSpeed + jupiterKinematicOrbitSpeed) / 2 * 0.6;
    (beltAnchor as any).orbitSpeed = asteroidBeltOrbitSpeed;


    for (let i = 0; i < numberOfAsteroids; i++) {
        const baseShape = baseAsteroidShapes[Math.floor(Math.random() * baseAsteroidShapes.length)];
        const instance = baseShape.createInstance(`asteroid${i}`);
        instance.parent = beltAnchor; 

        const angle = Math.random() * Math.PI * 2;
        let radius = asteroidBeltInnerRadius + Math.random() * (asteroidBeltOuterRadius - asteroidBeltInnerRadius);
        radius = Math.max(asteroidBeltInnerRadius * 0.8, Math.min(radius, asteroidBeltOuterRadius * 1.2));

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (Math.random() - 0.5) * asteroidBeltHeight;
        instance.position = new Vector3(x, y, z); 

        instance.rotationQuaternion = Quaternion.RotationYawPitchRoll(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );

        const scaleVariation = 0.4 + Math.random() * 1.2;
        instance.scaling = new Vector3(scaleVariation, scaleVariation * (0.7 + Math.random() * 0.6), scaleVariation * (0.7 + Math.random() * 0.6));
    }
    console.log(`${numberOfAsteroids} asteroids created (kinematic).`);
    return beltAnchor;
}

// --- Saturn Ring Particle Creation ---
let saturnRingParticlesAnchor: TransformNode | null = null;

function createSaturnRingParticles(saturnSphere: Mesh, scene: Scene): TransformNode {
    const ringParticleMaterial = new StandardMaterial("ringParticleMat", scene);
    ringParticleMaterial.diffuseColor = new Color3(0.75, 0.7, 0.65); 
    ringParticleMaterial.emissiveColor = new Color3(0.15, 0.15, 0.15); 
    ringParticleMaterial.specularColor = new Color3(0.2, 0.2, 0.2);
    ringParticleMaterial.alpha = 0.6; 

    const baseParticleShapes: Mesh[] = [];
    baseParticleShapes.push(MeshBuilder.CreateIcoSphere("baseRingParticle1", { radius: 0.015, subdivisions: 0 }, scene));
    baseParticleShapes.push(MeshBuilder.CreateSphere("baseRingParticle2", { diameter: 0.025, segments: 4 }, scene)); 

    baseParticleShapes.forEach(shape => {
        shape.material = ringParticleMaterial;
        shape.isVisible = false; 
    });

    const ringAnchor = new TransformNode("saturnRingParticlesAnchor", scene);
    ringAnchor.parent = saturnSphere; 
    (ringAnchor as any).rotationSpeed = saturnRotationSpeed * 0.3; 

    for (let i = 0; i < numberOfSaturnRingParticles; i++) {
        const baseShape = baseParticleShapes[Math.floor(Math.random() * baseParticleShapes.length)];
        const instance = baseShape.createInstance(`ringParticle${i}`);
        instance.parent = ringAnchor;

        const angle = Math.random() * Math.PI * 2;
        const radius = saturnRingInnerRadius + Math.random() * (saturnRingOuterRadius - saturnRingInnerRadius);
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (Math.random() - 0.5) * saturnRingThickness * (0.5 + Math.random()); 
        instance.position = new Vector3(x, y, z);

        instance.rotationQuaternion = Quaternion.RotationYawPitchRoll(
            Math.random() * Math.PI * 2,
            (Math.random() - 0.5) * Math.PI * 0.1, 
            (Math.random() - 0.5) * Math.PI * 0.1  
        );
        const scale = 0.3 + Math.random() * 0.7;
        instance.scaling = new Vector3(scale, scale * (0.3 + Math.random() * 0.4), scale); 
    }
    console.log(`${numberOfSaturnRingParticles} Saturn ring particles created.`);
    return ringAnchor;
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
    moon: { name: "Moon", type: "Natural Satellite", tempC: "-20 °C (Avg)", sizeKm: "3,474 km", moonsCount: "N/A", description: "Earth's only natural satellite, playing a crucial role in tides and stabilizing Earth's axial tilt.", mass: "0.0123 Earths", gravity: "1.62 m/s²", orbitalPeriod: "27.3 Earth days (around Earth)", rotationPeriod: "27.3 Earth days (Tidally locked)", axialTilt: "1.54° (to its orbit around Earth)", atmosphere: "Very thin exosphere (Helium, Neon, Argon)", weather: "No weather, extreme temperature variations between day and night", seasons: "None", notableMoons: "N/A", rings: "None", funFact1: "The fifth largest moon in the Solar System.", funFact2: "Humans first landed on the Moon in 1969 (Apollo 11 mission)."},
    // New Moons Data
    io: { name: "Io", type: "Volcanic Moon (Jupiter)", tempC: "-143 °C (Avg)", sizeKm: "3,642 km", moonsCount: "N/A", description: "The most volcanically active world in the Solar System, with hundreds of volcanoes.", mass: "0.015 Earths", gravity: "1.796 m/s²", orbitalPeriod: "1.77 Earth days (around Jupiter)", rotationPeriod: "1.77 Earth days (Tidally locked)", axialTilt: "0°", atmosphere: "Thin Sulfur Dioxide", weather: "Constant volcanic plumes", seasons: "None", notableMoons: "N/A", rings: "Contributes to Jupiter's faint rings", funFact1: "Its surface is constantly being repaved by volcanic activity.", funFact2: "Tidal forces from Jupiter cause its intense volcanism." },
    europa: { name: "Europa", type: "Icy Moon (Jupiter)", tempC: "-160 °C (Surface)", sizeKm: "3,121 km", moonsCount: "N/A", description: "A smooth, icy moon with a strong possibility of a subsurface saltwater ocean.", mass: "0.008 Earths", gravity: "1.314 m/s²", orbitalPeriod: "3.55 Earth days (around Jupiter)", rotationPeriod: "3.55 Earth days (Tidally locked)", axialTilt: "0.1°", atmosphere: "Very thin Oxygen exosphere", weather: "None", seasons: "None", notableMoons: "N/A", rings: "None", funFact1: "One of the smoothest surfaces of any known solid object in the Solar System.", funFact2: "A prime candidate for extraterrestrial life due to its potential ocean." },
    ganymede: { name: "Ganymede", type: "Largest Moon (Jupiter)", tempC: "-163 °C (Surface)", sizeKm: "5,268 km", moonsCount: "N/A", description: "The largest moon in the Solar System, bigger than Mercury, with its own magnetic field.", mass: "0.025 Earths", gravity: "1.428 m/s²", orbitalPeriod: "7.15 Earth days (around Jupiter)", rotationPeriod: "7.15 Earth days (Tidally locked)", axialTilt: "0.33°", atmosphere: "Very thin Oxygen exosphere", weather: "None", seasons: "None", notableMoons: "N/A", rings: "None", funFact1: "Larger than the planet Mercury.", funFact2: "The only moon known to have its own magnetosphere." },
    callisto: { name: "Callisto", type: "Cratered Moon (Jupiter)", tempC: "-143 °C (Surface)", sizeKm: "4,821 km", moonsCount: "N/A", description: "A heavily cratered moon, suggesting a geologically inactive surface, may have a subsurface ocean.", mass: "0.018 Earths", gravity: "1.235 m/s²", orbitalPeriod: "16.69 Earth days (around Jupiter)", rotationPeriod: "16.69 Earth days (Tidally locked)", axialTilt: "0°", atmosphere: "Very thin Carbon Dioxide exosphere", weather: "None", seasons: "None", notableMoons: "N/A", rings: "None", funFact1: "One of the most heavily cratered surfaces in the Solar System.", funFact2: "Its ancient surface may hold clues to the early Solar System." },
    titan: { name: "Titan", type: "Large Moon (Saturn)", tempC: "-179 °C (Surface)", sizeKm: "5,150 km", moonsCount: "N/A", description: "Saturn's largest moon, with a thick nitrogen-rich atmosphere and liquid methane/ethane lakes.", mass: "0.0225 Earths", gravity: "1.352 m/s²", orbitalPeriod: "15.95 Earth days (around Saturn)", rotationPeriod: "15.95 Earth days (Tidally locked)", axialTilt: "0.3°", atmosphere: "Dense Nitrogen, Methane", weather: "Methane rain, winds", seasons: "Yes, similar to Saturn's", notableMoons: "N/A", rings: "None", funFact1: "The only moon known to have a dense atmosphere.", funFact2: "The Huygens probe successfully landed on Titan in 2005." },
    rhea: { name: "Rhea", type: "Icy Moon (Saturn)", tempC: "-174 °C (Avg)", sizeKm: "1,528 km", moonsCount: "N/A", description: "Saturn's second-largest moon, heavily cratered and composed mostly of water ice.", mass: "0.00039 Earths", gravity: "0.264 m/s²", orbitalPeriod: "4.52 Earth days (around Saturn)", rotationPeriod: "4.52 Earth days (Tidally locked)", axialTilt: "0.0°", atmosphere: "Very thin exosphere (Oxygen, CO2)", weather: "None", seasons: "None", notableMoons: "N/A", rings: "Possibly a tenuous ring system of its own.", funFact1: "Its density suggests it's about 2/3 ice and 1/3 rock.", funFact2: "First moon of Saturn discovered after Titan." },
    enceladus: { name: "Enceladus", type: "Geologically Active Moon (Saturn)", tempC: "-201 °C (Avg)", sizeKm: "504 km", moonsCount: "N/A", description: "A small icy moon known for its cryovolcanic plumes erupting from its south polar region, suggesting a subsurface ocean.", mass: "0.000018 Earths", gravity: "0.113 m/s²", orbitalPeriod: "1.37 Earth days (around Saturn)", rotationPeriod: "1.37 Earth days (Tidally locked)", axialTilt: "0°", atmosphere: "Water vapor, Nitrogen, CO2, Methane (from plumes)", weather: "Cryovolcanic eruptions", seasons: "None", notableMoons: "N/A", rings: "Contributes material to Saturn's E ring.", funFact1: "One of the most reflective bodies in the Solar System.", funFact2: "Strong evidence for a liquid water ocean under its icy crust." },
    mimas: { name: "Mimas", type: "Cratered Moon (Saturn)", tempC: "-209 °C (Avg)", sizeKm: "396 km", moonsCount: "N/A", description: "Known for its enormous impact crater, Herschel, which gives it a resemblance to the Death Star.", mass: "0.0000063 Earths", gravity: "0.064 m/s²", orbitalPeriod: "0.94 Earth days (around Saturn)", rotationPeriod: "0.94 Earth days (Tidally locked)", axialTilt: "1.51°", atmosphere: "None", weather: "None", seasons: "None", notableMoons: "N/A", rings: "None", funFact1: "The Herschel crater is about one-third the diameter of Mimas itself.", funFact2: "Composed mostly of water ice with a small amount of rock." },
    phobos: { name: "Phobos", type: "Small Moon (Mars)", tempC: "-40 °C (Avg)", sizeKm: "22.2 km (mean diameter)", moonsCount: "N/A", description: "The larger and innermost of Mars's two small, irregularly shaped moons. Likely a captured asteroid.", mass: "1.06 × 10^16 kg", gravity: "~0.0057 m/s²", orbitalPeriod: "0.319 Earth days (around Mars)", rotationPeriod: "0.319 Earth days (Tidally locked)", axialTilt: "1.09°", atmosphere: "None", weather: "None", seasons: "None", notableMoons: "N/A", rings: "Expected to form a ring around Mars in ~50 million years.", funFact1: "Orbits Mars faster than Mars rotates.", funFact2: "Its surface is heavily cratered." },
    deimos: { name: "Deimos", type: "Small Moon (Mars)", tempC: "-40 °C (Avg)", sizeKm: "12.4 km (mean diameter)", moonsCount: "N/A", description: "The smaller and outermost of Mars's two moons. Also likely a captured asteroid.", mass: "1.47 × 10^15 kg", gravity: "~0.003 m/s²", orbitalPeriod: "1.26 Earth days (around Mars)", rotationPeriod: "1.26 Earth days (Tidally locked)", axialTilt: "0.93°", atmosphere: "None", weather: "None", seasons: "None", notableMoons: "N/A", rings: "None", funFact1: "Has a much smoother surface than Phobos due to a layer of regolith.", funFact2: "One of the smallest known moons in the Solar System." },
};

(planetInfoDatabase.sun as any).planetInfo = planetInfoDatabase.sun;
(sunSphere as any).mass = sunMass;
(sunSphere as any).velocity = Vector3.Zero();
(sunSphere as any).axialRotationSpeed = sunRotationSpeed; 

const planetDataArray = [
    planetInfoDatabase.mercury, planetInfoDatabase.venus, planetInfoDatabase.earth, planetInfoDatabase.mars,
    planetInfoDatabase.jupiter, planetInfoDatabase.saturn, planetInfoDatabase.uranus, planetInfoDatabase.neptune,
    planetInfoDatabase.pluto
];

planetDataArray.forEach(pInfo => {
    let currentSize = 1, currentOrbit = 10, currentTilt = 0;
    let currentMass = 1, currentAxialRotSpeed = 0;
    let currentTexture: string | null = `/${pInfo.name.toLowerCase()}.jpg`;

    switch(pInfo.name.toLowerCase()) {
        case "mercury": currentSize = mercurySize; currentOrbit = mercuryOrbitRadius; currentTilt = mercuryAxialTiltDegrees; currentMass = mercuryMass; currentAxialRotSpeed = mercuryRotationSpeed; break;
        case "venus": currentSize = venusSize; currentOrbit = venusOrbitRadius; currentTilt = venusAxialTiltDegrees; currentMass = venusMass; currentAxialRotSpeed = venusRotationSpeed; currentTexture = "/venus_surface.jpg"; break;
        case "earth": currentSize = earthSize; currentOrbit = earthOrbitRadius; currentTilt = earthAxialTiltDegrees; currentMass = earthMass; currentAxialRotSpeed = earthRotationSpeed; break;
        case "mars": currentSize = marsSize; currentOrbit = marsOrbitRadius; currentTilt = marsAxialTiltDegrees; currentMass = marsMass; currentAxialRotSpeed = marsRotationSpeed; break;
        case "jupiter": currentSize = jupiterSize; currentOrbit = jupiterOrbitRadius; currentTilt = jupiterAxialTiltDegrees; currentMass = jupiterMass; currentAxialRotSpeed = jupiterRotationSpeed; break;
        case "saturn": currentSize = saturnSize; currentOrbit = saturnOrbitRadius; currentTilt = saturnAxialTiltDegrees; currentMass = saturnMass; currentAxialRotSpeed = saturnRotationSpeed; break;
        case "uranus": currentSize = uranusSize; currentOrbit = uranusOrbitRadius; currentTilt = uranusAxialTiltDegrees; currentMass = uranusMass; currentAxialRotSpeed = uranusRotationSpeed; break;
        case "neptune": currentSize = neptuneSize; currentOrbit = neptuneOrbitRadius; currentTilt = neptuneAxialTiltDegrees; currentMass = neptuneMass; currentAxialRotSpeed = neptuneRotationSpeed; break;
        case "pluto": currentSize = plutoSize; currentOrbit = plutoOrbitRadius; currentTilt = plutoAxialTiltDegrees; currentMass = plutoMass; currentAxialRotSpeed = plutoRotationSpeed; break;
    }

    planets[pInfo.name.toLowerCase()] = createCelestialBody(pInfo.name.toLowerCase(), currentSize, currentOrbit, currentTexture, scene, currentTilt, pInfo, currentMass, currentAxialRotSpeed);
});


const earthSphereFromSystem = planets["earth"]?.sphere;
if (earthSphereFromSystem) {
    defaultArcTarget = earthSphereFromSystem;
    if (scene.activeCamera === arcCamera) {
        arcCamera.lockedTarget = earthSphereFromSystem;
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

// Special setup for Saturn's Rings - Now using particles
const saturnSystem = planets["saturn"];
if (saturnSystem && saturnSystem.sphere) {
    saturnRingParticlesAnchor = createSaturnRingParticles(saturnSystem.sphere, scene);
    saturnSystem.ringParticlesAnchor = saturnRingParticlesAnchor; 
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

// Moon - Physics based
const earthForPhysicsMoon = planets["earth"];
if (earthForPhysicsMoon && earthForPhysicsMoon.sphere) {
    const moonSystem = createCelestialBody("moon", moonSize, moonOrbitRadius, "/moon.jpg", scene, 0, planetInfoDatabase.moon, moonMass, moonAxialRotationSpeed, true, earthForPhysicsMoon.sphere);
    planets["moon"] = moonSystem;
}

// --- Create Moons for other planets ---
const marsForMoons = planets["mars"]?.sphere;
if (marsForMoons) {
    planets["phobos"] = createCelestialBody("phobos", phobosSize, phobosOrbitRadius, null, scene, phobosAxialTiltDegrees, planetInfoDatabase.phobos, phobosMass, phobosAxialRotationSpeed, true, marsForMoons, new Color3(0.45, 0.4, 0.35)); // Darkish gray
    planets["deimos"] = createCelestialBody("deimos", deimosSize, deimosOrbitRadius, null, scene, deimosAxialTiltDegrees, planetInfoDatabase.deimos, deimosMass, deimosAxialRotationSpeed, true, marsForMoons, new Color3(0.55, 0.5, 0.45)); // Lighter gray
}

const jupiterForMoons = planets["jupiter"]?.sphere;
if (jupiterForMoons) {
    planets["io"] = createCelestialBody("io", ioSize, ioOrbitRadius, null, scene, ioAxialTiltDegrees, planetInfoDatabase.io, ioMass, ioAxialRotationSpeed, true, jupiterForMoons, new Color3(0.9, 0.8, 0.3)); 
    planets["europa"] = createCelestialBody("europa", europaSize, europaOrbitRadius, null, scene, europaAxialTiltDegrees, planetInfoDatabase.europa, europaMass, europaAxialRotationSpeed, true, jupiterForMoons, new Color3(0.85, 0.85, 0.9)); 
    planets["ganymede"] = createCelestialBody("ganymede", ganymedeSize, ganymedeOrbitRadius, null, scene, ganymedeAxialTiltDegrees, planetInfoDatabase.ganymede, ganymedeMass, ganymedeAxialRotationSpeed, true, jupiterForMoons, new Color3(0.7, 0.65, 0.6)); 
    planets["callisto"] = createCelestialBody("callisto", callistoSize, callistoOrbitRadius, null, scene, callistoAxialTiltDegrees, planetInfoDatabase.callisto, callistoMass, callistoAxialRotationSpeed, true, jupiterForMoons, new Color3(0.4, 0.35, 0.3)); 
}
// Saturn's Moons
const saturnForMoons = planets["saturn"]?.sphere;
if (saturnForMoons) {
    planets["titan"] = createCelestialBody("titan", titanSize, titanOrbitRadius, null, scene, titanAxialTiltDegrees, planetInfoDatabase.titan, titanMass, titanAxialRotationSpeed, true, saturnForMoons, new Color3(0.9, 0.7, 0.4)); 
    planets["rhea"] = createCelestialBody("rhea", rheaSize, rheaOrbitRadius, null, scene, rheaAxialTiltDegrees, planetInfoDatabase.rhea, rheaMass, rheaAxialRotationSpeed, true, saturnForMoons, new Color3(0.7, 0.7, 0.7)); 
    planets["enceladus"] = createCelestialBody("enceladus", enceladusSize, enceladusOrbitRadius, null, scene, enceladusAxialTiltDegrees, planetInfoDatabase.enceladus, enceladusMass, enceladusAxialRotationSpeed, true, saturnForMoons, new Color3(0.9, 0.9, 0.95)); 
    planets["mimas"] = createCelestialBody("mimas", mimasSize, mimasOrbitRadius, null, scene, mimasAxialTiltDegrees, planetInfoDatabase.mimas, mimasMass, mimasAxialRotationSpeed, true, saturnForMoons, new Color3(0.6, 0.6, 0.65)); 
}


// --- Create Asteroid Belt ---
const asteroidBeltAnchor = createAsteroidBelt(scene); 
asteroidBeltNode = asteroidBeltAnchor;

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
// Add new moons as shadow casters if desired
Object.values(planets).forEach(pSystem => {
    if (pSystem && pSystem.sphere && pSystem.info.name !== "Earth" && pSystem.info.name !== "Moon") { // Avoid re-adding Earth/Moon
        shadowGenerator.addShadowCaster(pSystem.sphere);
    }
});


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
        arcCamera.lockedTarget = null; 
        const targetMesh = defaultArcTarget || planets["earth"]?.sphere;
        if (targetMesh) {
            isAnimatingCamera = true;
            const easingFunction = new QuinticEase();
            easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
            
            arcCamera.lockedTarget = targetMesh; 
            Animation.CreateAndStartAnimation(
                "cameraReturnRadius", arcCamera, "radius", 30, 90, 
                arcCamera.radius, (targetMesh.getBoundingInfo().boundingSphere.radiusWorld * 3) + earthSize * 3.0, 
                Animation.ANIMATIONLOOPMODE_CONSTANT, easingFunction,
                 () => { isAnimatingCamera = false; } 
            );
        }
        currentFocusedMesh = null;
    }
}

if(closeDetailedPanelButton) {
    closeDetailedPanelButton.addEventListener('click', () => hideDetailedInfo(false)); 
}


scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
    const pickResult = scene.pick(pointerInfo.event.clientX, pointerInfo.event.clientY, (mesh) => {
        return !!(mesh as any).planetInfo && !(mesh as any).isAtmosphere && !(mesh as any).isRing && !(mesh.name.startsWith("asteroid")) && !(mesh.name.startsWith("ringParticle"));
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
                defaultArcTarget = pickedMesh;

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
                    "cameraRadius", arcCamera, "radius", 30, 90,
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


// Animation / Physics Loop
scene.onBeforeRenderObservable.add(() => {
    const engineDeltaTime = engine.getDeltaTime(); 
    if (engineDeltaTime > 100) return; 

    const scaledDeltaTimeForPhysics = (engineDeltaTime / 1000.0) * simulationTimeScale; 
    const scaledDeltaTimeForVisuals = engineDeltaTime * simulationTimeScale;


    physicsAccumulator += scaledDeltaTimeForPhysics;

    while (physicsAccumulator >= physicsTimeStep) {
        // Create a list of all bodies that exert and experience gravity
        const allPhysicsBodies: Mesh[] = [];
        if (sunSphere) allPhysicsBodies.push(sunSphere); 
        planetDataArray.forEach(pInfo => { 
            const system = planets[pInfo.name.toLowerCase()];
            if (system && system.sphere && pInfo.name.toLowerCase() !== "sun") { 
                allPhysicsBodies.push(system.sphere);
            }
        });
        // Add all created moons to the physics simulation
        ["moon", "io", "europa", "ganymede", "callisto", "titan", "rhea", "enceladus", "mimas", "phobos", "deimos"].forEach(moonName => {
            if (planets[moonName] && planets[moonName].sphere) {
                allPhysicsBodies.push(planets[moonName].sphere);
            }
        });
        
        // Calculate net forces on each body
        allPhysicsBodies.forEach(bodySphereA => {
            if (!(bodySphereA as any).mass || !(bodySphereA as any).velocity) return;

            const bodyAVelocity = (bodySphereA as any).velocity as Vector3;
            let netForceOnA = Vector3.Zero();

            allPhysicsBodies.forEach(bodySphereB => {
                if (bodySphereA === bodySphereB || !(bodySphereB as any).mass) return; 

                const bodyBMass = (bodySphereB as any).mass;
                const toBodyB = bodySphereB.position.subtract(bodySphereA.position);
                const distSq = toBodyB.lengthSquared();

                if (distSq > 0.0001) { 
                    const forceMag = (G * (bodySphereA as any).mass * bodyBMass) / distSq;
                    netForceOnA.addInPlace(toBodyB.normalize().scale(forceMag));
                }
            });
            
            if (bodySphereA.name !== "sunSphere") { 
                const acceleration = netForceOnA.scale(1 / (bodySphereA as any).mass);
                bodyAVelocity.addInPlace(acceleration.scale(physicsTimeStep)); 
            }
        });

        // Update positions based on new velocities
         allPhysicsBodies.forEach(bodySphere => {
             if (bodySphere.name === "sunSphere") return; 
             if (!(bodySphere as any).velocity) return;

            const bodyVelocity = (bodySphere as any).velocity as Vector3;
            bodySphere.position.addInPlace(bodyVelocity.scale(physicsTimeStep)); 
        });
        
        physicsAccumulator -= physicsTimeStep;
    }


    // Visual Rotations
    if(sunSphere && (sunSphere as any).axialRotationSpeed) { 
        sunSphere.rotate(Vector3.Up(), (sunSphere as any).axialRotationSpeed * scaledDeltaTimeForVisuals, Space.LOCAL);
    }


    if (asteroidBeltNode) { 
        const beltSpeed = (asteroidBeltNode as any).orbitSpeed || 0; 
        asteroidBeltNode.rotation.y += beltSpeed * scaledDeltaTimeForVisuals;
    }
    if (saturnRingParticlesAnchor) { 
        const ringSpeed = (saturnRingParticlesAnchor as any).rotationSpeed || 0;
        saturnRingParticlesAnchor.rotation.y += ringSpeed * scaledDeltaTimeForVisuals;
    }


    planetDataArray.forEach(pInfo => { 
        if (pInfo.name.toLowerCase() === "sun") return; 

        const system = planets[pInfo.name.toLowerCase()];
        if (system && system.sphere) { 
            const axialRotSpeed = (system.sphere as any).axialRotationSpeed || 0; 
            const rotationAmount = axialRotSpeed * scaledDeltaTimeForVisuals;
            system.sphere.rotate(Vector3.Up(), rotationAmount, Space.LOCAL);

            if (pInfo.name.toLowerCase() === "earth" && (system as any).cloudSphere) {
                const cloudRotationDelta = (earthRotationSpeed * cloudRotationSpeedRelativeToEarthSurface) * scaledDeltaTimeForVisuals;
                (system as any).cloudSphere.rotate(Vector3.Up(), cloudRotationDelta, Space.LOCAL);
            }
            if (pInfo.name.toLowerCase() === "venus" && system.atmosphereSphere) {
                 system.atmosphereSphere.rotate(Vector3.Up(), venusRotationSpeed * 0.8 * scaledDeltaTimeForVisuals, Space.LOCAL);
            }
        }
    });

    // Axial rotation for all moons
    ["moon", "io", "europa", "ganymede", "callisto", "titan", "rhea", "enceladus", "mimas", "phobos", "deimos"].forEach(moonName => {
        const moonSystem = planets[moonName];
        if (moonSystem && moonSystem.sphere) {
            const moonRotS = (moonSystem.sphere as any).axialRotationSpeed || 0; 
            moonSystem.sphere.rotate(Vector3.Up(), moonRotS * scaledDeltaTimeForVisuals, Space.LOCAL);
        }
    });
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

console.log("Babylon.js with Vite setup complete! Full N-Body Solar System with more moons should be rendering. 😊🎉");
