/**
 * Solar System Simulation - Enhanced Edition
 * 
 * Copyright © 2026 by Oscar A. Martinez
 * All Rights Reserved.
 * LinkedIn: https://www.linkedin.com/in/oscaram007/
 * 
 * This software, source code, documentation, and associated materials 
 * (collectively, "the Work") are protected under the copyright laws of 
 * the United States and international copyright treaties.
 * 
 * RESTRICTIONS:
 * No part of this Work may be reproduced, modified, adapted, distributed, 
 * publicly displayed, performed, or transmitted in any form or by any means—
 * including but not limited to electronic, mechanical, digital reproduction, 
 * version control systems, code repositories, or cloud storage—without the 
 * prior written permission of the author, except as expressly permitted below 
 * or under applicable copyright law.
 * 
 * PERMITTED USES:
 * Brief code snippets may be quoted in reviews, tutorials, academic papers, 
 * or other noncommercial commentary for purposes of illustration, critique, 
 * or education, provided proper attribution is given.
 * 
 * PROHIBITED ACTIONS:
 * The following are strictly prohibited without explicit written authorization:
 * - Copying, forking, or cloning this code for redistribution
 * - Incorporating this code into other projects, whether open-source or proprietary
 * - Reverse engineering, decompiling, or disassembling any compiled portions
 * - Removing or altering copyright notices, attribution, or licensing information
 * - Commercial use, sublicensing, or sale of this Work or derivatives thereof
 * 
 * Any unauthorized use, reproduction, or distribution of this Work may result 
 * in civil and criminal liability under applicable law. The moral rights of 
 * the author have been asserted.
 */

// Get canvas and context
const canvas = document.getElementById('solarSystem');
const ctx = canvas.getContext('2d');

let centerX, centerY;
const baseTilt = 0.92;
let currentZoom = 1.0;
let cameraOffsetX = 0;
let cameraOffsetY = 0;

// Settings
let settings = {
  showOrbits: true,
  showTrails: true,
  showLabels: false,
  showGlow: true,
  showDebug: false,
  showPrediction: true,
  showLensFlare: true,
  showMilkyWay: true,
  showDwarfPlanets: false,
  showMoons: false,
  showInclination: false,
  distanceRuler: false,
  realisticScale: false
};

// Bind controls
document.getElementById('showOrbits').addEventListener('change', e => settings.showOrbits = e.target.checked);
document.getElementById('showTrails').addEventListener('change', e => settings.showTrails = e.target.checked);
document.getElementById('showLabels').addEventListener('change', e => settings.showLabels = e.target.checked);
document.getElementById('showGlow').addEventListener('change', e => settings.showGlow = e.target.checked);
document.getElementById('showDebug').addEventListener('change', e => settings.showDebug = e.target.checked);
document.getElementById('showPrediction').addEventListener('change', e => settings.showPrediction = e.target.checked);
document.getElementById('showLensFlare').addEventListener('change', e => settings.showLensFlare = e.target.checked);
document.getElementById('showMilkyWay').addEventListener('change', e => settings.showMilkyWay = e.target.checked);
document.getElementById('showDwarfPlanets').addEventListener('change', e => settings.showDwarfPlanets = e.target.checked);
document.getElementById('showMoons').addEventListener('change', e => settings.showMoons = e.target.checked);
document.getElementById('showInclination').addEventListener('change', e => settings.showInclination = e.target.checked);
document.getElementById('distanceRuler').addEventListener('change', e => {
  settings.distanceRuler = e.target.checked;
  document.getElementById('distanceRulerStats').style.display = e.target.checked ? 'block' : 'none';
  if (!e.target.checked) {
    rulerPoints = [];
  }
});

// Enhanced solar system data
const solarData = {
  sun: { radius: 50, realRadius: 696340 }, // km
  planets: [
    { 
      name: 'Mercury', radius: 5, realRadius: 2439.7,
      semiMajorAxis: 70, realSMA: 0.387, eccentricity: 0.206, orbitalPeriod: 0.241,
      inclination: 7.0, axialTilt: 0.034, startAngle: 0,
      color: ['#c4c4c4', '#8a8a8a', '#5a5a5a'],
      texture: 'mercury',
      info: 'Smallest planet with highly elliptical orbit. Orbital inclination: 7°'
    },
    { 
      name: 'Venus', radius: 12, realRadius: 6051.8,
      semiMajorAxis: 100, realSMA: 0.723, eccentricity: 0.007, orbitalPeriod: 0.615,
      inclination: 3.4, axialTilt: 177.4, startAngle: Math.PI * 0.3,
      color: ['#fff5e6', '#f4d7a0', '#d4b58c'],
      texture: 'venus',
      info: 'Hottest planet. Rotates backwards! Inclination: 3.4°'
    },
    { 
      name: 'Earth', radius: 13, realRadius: 6371,
      semiMajorAxis: 140, realSMA: 1.0, eccentricity: 0.017, orbitalPeriod: 1.0,
      inclination: 0, axialTilt: 23.5, startAngle: Math.PI * 0.7,
      color: ['#6ec1ff', '#2e86c1', '#0a4a7a', '#133f73'],
      moon: { radius: 4, realRadius: 1737.4, distance: 20, realDistance: 384400, orbitalPeriod: 0.0748, name: 'Moon' },
      texture: 'earth',
      info: 'Our home! Axial tilt: 23.5° (causes seasons). The Moon orbits in 27.3 days.'
    },
    { 
      name: 'Mars', radius: 8, realRadius: 3389.5,
      semiMajorAxis: 180, realSMA: 1.524, eccentricity: 0.093, orbitalPeriod: 1.881,
      inclination: 1.9, axialTilt: 25.2, startAngle: Math.PI * 1.2,
      color: ['#ff9f80', '#ff7f50', '#b03d1d'],
      texture: 'mars',
      info: 'The Red Planet. Similar axial tilt to Earth (25.2°). Inclination: 1.9°'
    },
    { 
      name: 'Jupiter', radius: 25, realRadius: 69911,
      semiMajorAxis: 240, realSMA: 5.203, eccentricity: 0.048, orbitalPeriod: 11.86,
      inclination: 1.3, axialTilt: 3.1, startAngle: Math.PI * 1.8,
      color: ['#ffecd2', '#ffd9a0', '#d4a574', '#b07250'],
      rings: { inner: 1.4, outer: 1.5, opacity: 0.1 },
      moons: [
        { name: 'Io', radius: 2.5, distance: 35, orbitalPeriod: 0.00485, color: '#ffdb58' },
        { name: 'Europa', radius: 2.3, distance: 42, orbitalPeriod: 0.00973, color: '#e8dcc0' },
        { name: 'Ganymede', radius: 3, distance: 50, orbitalPeriod: 0.0196, color: '#9d9d9d' },
        { name: 'Callisto', radius: 2.7, distance: 60, orbitalPeriod: 0.0457, color: '#7a7a7a' }
      ],
      texture: 'jupiter',
      info: 'Largest planet with faint rings. 95 known moons! Axial tilt: only 3.1°'
    },
    { 
      name: 'Saturn', radius: 22, realRadius: 58232,
      semiMajorAxis: 300, realSMA: 9.537, eccentricity: 0.054, orbitalPeriod: 29.46,
      inclination: 2.5, axialTilt: 26.7, startAngle: Math.PI * 0.5,
      color: ['#fff8d4', '#f4e8b0', '#d4c08c'],
      rings: { inner: 1.3, outer: 2.3, opacity: 0.6 },
      moons: [
        { name: 'Titan', radius: 3, distance: 55, orbitalPeriod: 0.0437, color: '#ffa500' },
        { name: 'Rhea', radius: 1.5, distance: 45, orbitalPeriod: 0.0124, color: '#cccccc' }
      ],
      texture: 'saturn',
      info: 'Famous for spectacular rings. Titan is larger than Mercury! Inclination: 2.5°'
    },
    { 
      name: 'Uranus', radius: 18, realRadius: 25362,
      semiMajorAxis: 360, realSMA: 19.191, eccentricity: 0.047, orbitalPeriod: 84.01,
      inclination: 0.8, axialTilt: 97.8, startAngle: Math.PI * 1.4,
      color: ['#d0f0ff', '#b0d8f0', '#4da3cc'],
      rings: { inner: 1.4, outer: 1.9, opacity: 0.15 },
      moons: [
        { name: 'Titania', radius: 1.8, distance: 38, orbitalPeriod: 0.0238, color: '#aaddff' },
        { name: 'Oberon', radius: 1.7, distance: 48, orbitalPeriod: 0.0368, color: '#88bbff' }
      ],
      texture: 'uranus',
      info: 'Ice giant tilted on its side (97.8°)! Has 13 known rings. Inclination: 0.8°'
    },
    { 
      name: 'Neptune', radius: 17, realRadius: 24622,
      semiMajorAxis: 420, realSMA: 30.069, eccentricity: 0.009, orbitalPeriod: 164.8,
      inclination: 1.8, axialTilt: 28.3, startAngle: Math.PI * 0.9,
      color: ['#8cb3ff', '#66a3ff', '#3d6fcc', '#1c3fa0'],
      rings: { inner: 1.4, outer: 1.7, opacity: 0.1 },
      moons: [
        { name: 'Triton', radius: 2, distance: 40, orbitalPeriod: 0.0161, color: '#ff88cc' }
      ],
      texture: 'neptune',
      info: 'Farthest planet. Triton orbits backwards! 164-year orbit. Inclination: 1.8°'
    }
  ],
  dwarfPlanets: [
    {
      name: 'Pluto', radius: 4, realRadius: 1188.3,
      semiMajorAxis: 480, realSMA: 39.48, eccentricity: 0.248, orbitalPeriod: 248,
      inclination: 17.2, axialTilt: 122.5, startAngle: Math.PI * 0.2,
      color: ['#e8d4b0', '#c8b090', '#a89070'],
      moon: { radius: 2, distance: 12, orbitalPeriod: 0.0175, name: 'Charon' },
      info: 'Dwarf planet with extreme 17.2° inclination and 248-year orbit!'
    },
    {
      name: 'Ceres', radius: 3, realRadius: 473,
      semiMajorAxis: 210, realSMA: 2.77, eccentricity: 0.076, orbitalPeriod: 4.6,
      inclination: 10.6, axialTilt: 4, startAngle: Math.PI * 1.5,
      color: ['#b8b8b8', '#989898', '#787878'],
      info: 'Largest asteroid belt object. Dwarf planet in the asteroid belt!'
    }
  ],
  asteroids: { count: 200, minDistance: 200, maxDistance: 215, minRadius: 0.8, maxRadius: 2.5 },
  stars: { count: 400, shootingStars: 3 }
};

let planets = [], dwarfPlanets = [], asteroids = [], stars = [], shootingStars = [];
let sun = {};
let timeSpeed = 0.01, simulationTime = 0, focusedPlanetIndex = -1;
let rulerPoints = [];
let allBodies = []; // Combined array for ruler mode

// Zoom control
document.getElementById('zoomSlider').addEventListener('input', e => {
  currentZoom = parseFloat(e.target.value);
  document.getElementById('zoomValue').textContent = currentZoom.toFixed(1) + 'x';
});

// Speed control
document.getElementById('speedSlider').addEventListener('input', e => {
  const value = parseFloat(e.target.value);
  timeSpeed = 0.01 * value;
  document.getElementById('speedValue').textContent = value.toFixed(1) + 'x';
});

// Scale toggle
document.getElementById('toggleScale').addEventListener('click', () => {
  settings.realisticScale = !settings.realisticScale;
  const btn = document.getElementById('toggleScale');
  if (settings.realisticScale) {
    btn.textContent = 'Switch to Visual Scale';
    btn.classList.add('mode-active');
    document.getElementById('scaleMode').textContent = 'Realistic';
  } else {
    btn.textContent = 'Switch to Realistic Scale';
    btn.classList.remove('mode-active');
    document.getElementById('scaleMode').textContent = 'Visual';
  }
  initialize();
});

// Planet focus
document.getElementById('focusPlanet').addEventListener('click', () => {
  const totalBodies = planets.length + (settings.showDwarfPlanets ? dwarfPlanets.length : 0);
  focusedPlanetIndex = (focusedPlanetIndex + 1) % totalBodies;
  
  let body;
  if (focusedPlanetIndex < planets.length) {
    body = planets[focusedPlanetIndex];
  } else {
    body = dwarfPlanets[focusedPlanetIndex - planets.length];
  }
  
  document.getElementById('featureInfo').innerHTML = `<strong>${body.name}</strong>: ${body.info}`;
});

// Reset view
document.getElementById('resetView').addEventListener('click', () => {
  cameraOffsetX = 0;
  cameraOffsetY = 0;
  currentZoom = 1.0;
  document.getElementById('zoomSlider').value = 1.0;
  document.getElementById('zoomValue').textContent = '1.0x';
  focusedPlanetIndex = -1;
  document.getElementById('focusedPlanet').textContent = 'None';
});

// Distance ruler click handler
canvas.addEventListener('click', (e) => {
  if (!settings.distanceRuler) return;
  
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left - centerX - cameraOffsetX) / currentZoom;
  const mouseY = (e.clientY - rect.top - centerY - cameraOffsetY) / currentZoom;
  
  // Find closest body
  let closestBody = null;
  let closestDist = Infinity;
  
  allBodies.forEach(body => {
    const pos = getEllipticalPosition(body, 0, 0);
    const dist = Math.sqrt(Math.pow(mouseX - pos.x, 2) + Math.pow(mouseY - pos.y, 2));
    if (dist < closestDist && dist < 50) {
      closestDist = dist;
      closestBody = body;
    }
  });
  
  if (closestBody) {
    rulerPoints.push(closestBody);
    if (rulerPoints.length > 2) rulerPoints.shift();
    
    if (rulerPoints.length === 2) {
      const p1 = getEllipticalPosition(rulerPoints[0], 0, 0);
      const p2 = getEllipticalPosition(rulerPoints[1], 0, 0);
      const distPx = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      const distAU = (distPx / 140).toFixed(3); // 140px = 1 AU (Earth's orbit)
      const distMKm = (distAU * 149.6).toFixed(1); // AU to million km
      
      document.getElementById('rulerDistance').innerHTML = 
        `${rulerPoints[0].name} ↔ ${rulerPoints[1].name}<br>${distAU} AU (${distMKm}M km)`;
    }
  }
});

// Generate procedural texture
function generateTexture(type, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Base sphere gradient
  const gradient = ctx.createRadialGradient(
    centerX - size * 0.2, centerY - size * 0.2, size * 0.1,
    centerX, centerY, size * 0.5
  );
  
  switch(type) {
    case 'mercury':
      gradient.addColorStop(0, '#d4d4d4');
      gradient.addColorStop(0.5, '#a0a0a0');
      gradient.addColorStop(1, '#606060');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      // Craters
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(80, 80, 80, ${0.3 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(Math.random() * size, Math.random() * size, Math.random() * size * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
      
    case 'venus':
      gradient.addColorStop(0, '#fff5e6');
      gradient.addColorStop(0.5, '#f4d7a0');
      gradient.addColorStop(1, '#d4b58c');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      // Cloud patterns
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = `rgba(240, 220, 180, ${0.2 + Math.random() * 0.2})`;
        ctx.fillRect(0, i * size / 15, size, size / 20);
      }
      break;
      
    case 'earth':
      // Oceans
      gradient.addColorStop(0, '#6ec1ff');
      gradient.addColorStop(0.5, '#2e86c1');
      gradient.addColorStop(1, '#0a4a7a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      // Continents
      ctx.fillStyle = 'rgba(34, 139, 34, 0.7)';
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.ellipse(
          Math.random() * size, Math.random() * size,
          size * 0.2, size * 0.15,
          Math.random() * Math.PI, 0, Math.PI * 2
        );
        ctx.fill();
      }
      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * size, Math.random() * size, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
      
    case 'mars':
      gradient.addColorStop(0, '#ff9f80');
      gradient.addColorStop(0.5, '#ff7f50');
      gradient.addColorStop(1, '#b03d1d');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      // Polar caps
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(centerX, size * 0.1, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX, size * 0.9, size * 0.12, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'jupiter':
      // Bands
      const bands = ['#ffecd2', '#ffd9a0', '#d4a574', '#b07250', '#ffecd2'];
      for (let i = 0; i < bands.length; i++) {
        ctx.fillStyle = bands[i];
        ctx.fillRect(0, i * size / bands.length, size, size / bands.length);
      }
      // Great Red Spot
      ctx.fillStyle = 'rgba(255, 69, 0, 0.6)';
      ctx.beginPath();
      ctx.ellipse(centerX * 1.2, centerY, size * 0.15, size * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'saturn':
      gradient.addColorStop(0, '#fff8d4');
      gradient.addColorStop(0.5, '#f4e8b0');
      gradient.addColorStop(1, '#d4c08c');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      // Faint bands
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = `rgba(200, 180, 140, ${0.1 + Math.random() * 0.1})`;
        ctx.fillRect(0, i * size / 8, size, size / 16);
      }
      break;
      
    case 'uranus':
      gradient.addColorStop(0, '#d0f0ff');
      gradient.addColorStop(0.5, '#b0d8f0');
      gradient.addColorStop(1, '#4da3cc');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      break;
      
    case 'neptune':
      gradient.addColorStop(0, '#8cb3ff');
      gradient.addColorStop(0.5, '#66a3ff');
      gradient.addColorStop(1, '#1c3fa0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      // Storm spots
      ctx.fillStyle = 'rgba(30, 60, 150, 0.5)';
      ctx.beginPath();
      ctx.arc(centerX * 0.8, centerY * 1.2, size * 0.12, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
  
  return canvas;
}

// Initialize textures
const textures = {};
function initTextures() {
  ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].forEach(type => {
    textures[type] = generateTexture(type, 128);
  });
}

function initialize() {
  centerX = canvas.width / 2;
  centerY = canvas.height / 2;
  sun = solarData.sun;
  
  initTextures();

  const scaleMultiplier = settings.realisticScale ? 0.1 : 1.0;
  
  planets = solarData.planets.map(p => {
    const semiMinorAxis = p.semiMajorAxis * Math.sqrt(1 - p.eccentricity * p.eccentricity);
    const focalDistance = p.semiMajorAxis * p.eccentricity;
    
    const body = {
      ...p,
      semiMinorAxis,
      focalDistance,
      displayRadius: settings.realisticScale ? Math.max(2, p.realRadius / 10000) : p.radius,
      angle: p.startAngle,
      rotation: 0,
      dayNightAngle: Math.random() * Math.PI * 2,
      trail: [],
      angularVelocity: (2 * Math.PI) / p.orbitalPeriod,
      isDwarf: false
    };
    
    if (p.moon) {
      body.moon = {
        ...p.moon,
        angle: Math.random() * Math.PI * 2,
        angularVelocity: (2 * Math.PI) / p.moon.orbitalPeriod
      };
    }
    
    if (p.moons) {
      body.moons = p.moons.map(m => ({
        ...m,
        angle: Math.random() * Math.PI * 2,
        angularVelocity: (2 * Math.PI) / m.orbitalPeriod
      }));
    }
    
    return body;
  });
  
  dwarfPlanets = solarData.dwarfPlanets.map(p => {
    const semiMinorAxis = p.semiMajorAxis * Math.sqrt(1 - p.eccentricity * p.eccentricity);
    const focalDistance = p.semiMajorAxis * p.eccentricity;
    
    const body = {
      ...p,
      semiMinorAxis,
      focalDistance,
      displayRadius: settings.realisticScale ? Math.max(1.5, p.realRadius / 10000) : p.radius,
      angle: p.startAngle,
      rotation: 0,
      trail: [],
      angularVelocity: (2 * Math.PI) / p.orbitalPeriod,
      isDwarf: true
    };
    
    if (p.moon) {
      body.moon = {
        ...p.moon,
        angle: Math.random() * Math.PI * 2,
        angularVelocity: (2 * Math.PI) / p.moon.orbitalPeriod
      };
    }
    
    return body;
  });
  
  allBodies = [...planets, ...dwarfPlanets];

  asteroids = [];
  for (let i = 0; i < solarData.asteroids.count; i++) {
    const distance = solarData.asteroids.minDistance + Math.random() * 
      (solarData.asteroids.maxDistance - solarData.asteroids.minDistance);
    asteroids.push({
      distance,
      angle: Math.random() * Math.PI * 2,
      radius: solarData.asteroids.minRadius + Math.random() * 
        (solarData.asteroids.maxRadius - solarData.asteroids.minRadius),
      angularVelocity: (2 * Math.PI) / Math.sqrt(Math.pow(distance / 140, 3)),
      brightness: 0.3 + Math.random() * 0.4,
      inclination: (Math.random() - 0.5) * 10
    });
  }

  stars = [];
  for (let i = 0; i < solarData.stars.count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random(), // Depth for parallax
      radius: 0.5 + Math.random() * 1.5,
      blinkSpeed: 0.005 + Math.random() * 0.015,
      opacity: Math.random(),
      color: Math.random() > 0.85 ? (Math.random() > 0.5 ? '#bbddff' : '#ffeecc') : '#ffffff'
    });
  }
  
  // Shooting stars
  shootingStars = [];
  for (let i = 0; i < solarData.stars.shootingStars; i++) {
    shootingStars.push(createShootingStar());
  }
}

function createShootingStar() {
  const side = Math.floor(Math.random() * 4);
  let x, y, vx, vy;
  
  switch(side) {
    case 0: x = Math.random() * canvas.width; y = 0; break;
    case 1: x = canvas.width; y = Math.random() * canvas.height; break;
    case 2: x = Math.random() * canvas.width; y = canvas.height; break;
    case 3: x = 0; y = Math.random() * canvas.height; break;
  }
  
  const angle = Math.random() * Math.PI * 2;
  const speed = 3 + Math.random() * 5;
  
  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 60 + Math.random() * 60,
    maxLife: 60 + Math.random() * 60
  };
}

function getEllipticalPosition(body, cx, cy) {
  const a = body.semiMajorAxis * currentZoom;
  const b = body.semiMinorAxis * currentZoom;
  const c = body.focalDistance * currentZoom;
  
  let tilt = baseTilt;
  if (settings.showInclination && body.inclination) {
    tilt = baseTilt * Math.cos(body.inclination * Math.PI / 180);
  }
  
  // Ensure tilt is always positive to avoid negative radius
  tilt = Math.abs(tilt);
  
  const x = cx + a * Math.cos(body.angle) - c;
  const y = cy + b * Math.sin(body.angle) * tilt;
  
  return { x, y };
}

function drawMilkyWay() {
  if (!settings.showMilkyWay) return;
  
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'rgba(50, 30, 80, 0.1)');
  gradient.addColorStop(0.3, 'rgba(80, 60, 120, 0.15)');
  gradient.addColorStop(0.5, 'rgba(120, 100, 180, 0.2)');
  gradient.addColorStop(0.7, 'rgba(80, 60, 120, 0.15)');
  gradient.addColorStop(1, 'rgba(50, 30, 80, 0.1)');
  
  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function drawStars() {
  stars.forEach(star => {
    star.opacity += star.blinkSpeed;
    if (star.opacity > 1 || star.opacity < 0.3) star.blinkSpeed *= -1;
    
    // Parallax effect
    const px = star.x - cameraOffsetX * star.z * 0.5;
    const py = star.y - cameraOffsetY * star.z * 0.5;
    
    ctx.save();
    if (settings.showGlow && star.radius > 1) {
      ctx.shadowBlur = 3;
      ctx.shadowColor = star.color;
    }
    ctx.beginPath();
    ctx.arc(px, py, star.radius * (1 + star.z * 0.5), 0, Math.PI * 2);
    ctx.fillStyle = `${star.color}${Math.floor(star.opacity * 255).toString(16).padStart(2, '0')}`;
    ctx.fill();
    ctx.restore();
  });
  
  // Shooting stars
  shootingStars.forEach((star, idx) => {
    star.x += star.vx;
    star.y += star.vy;
    star.life--;
    
    if (star.life <= 0 || star.x < -100 || star.x > canvas.width + 100 || 
        star.y < -100 || star.y > canvas.height + 100) {
      shootingStars[idx] = createShootingStar();
      return;
    }
    
    const alpha = star.life / star.maxLife;
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    
    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo(star.x - star.vx * 5, star.y - star.vy * 5);
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
    ctx.restore();
  });
}

function drawLensFlare() {
  if (!settings.showLensFlare) return;
  
  const flareX = centerX + cameraOffsetX;
  const flareY = centerY + cameraOffsetY;
  
  // Main flare
  for (let i = 0; i < 3; i++) {
    const grad = ctx.createRadialGradient(flareX, flareY, 0, flareX, flareY, (sun.radius * currentZoom) * (3 + i));
    grad.addColorStop(0, `rgba(255, 255, 200, ${0.05 / (i + 1)})`);
    grad.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(flareX, flareY, (sun.radius * currentZoom) * (3 + i), 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Rays
  ctx.save();
  ctx.translate(flareX, flareY);
  ctx.rotate(simulationTime * 0.001);
  
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const grad = ctx.createLinearGradient(0, 0, Math.cos(angle) * 200, Math.sin(angle) * 200);
    grad.addColorStop(0, 'rgba(255, 230, 150, 0.1)');
    grad.addColorStop(0.5, 'rgba(255, 200, 100, 0.05)');
    grad.addColorStop(1, 'rgba(255, 180, 80, 0)');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle - 0.1) * 200, Math.sin(angle - 0.1) * 200);
    ctx.lineTo(Math.cos(angle + 0.1) * 200, Math.sin(angle + 0.1) * 200);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawOrbits() {
  if (!settings.showOrbits) return;
  
  const bodiesToDraw = settings.showDwarfPlanets ? [...planets, ...dwarfPlanets] : planets;
  
  bodiesToDraw.forEach((body, idx) => {
    const isFocused = idx === focusedPlanetIndex;
    
    let tilt = baseTilt;
    if (settings.showInclination && body.inclination) {
      tilt = baseTilt * Math.cos(body.inclination * Math.PI / 180);
    }
    
    // Ensure tilt never makes the radius negative
    tilt = Math.abs(tilt);
    
    ctx.save();
    ctx.translate(centerX + cameraOffsetX, centerY + cameraOffsetY);
    
    ctx.beginPath();
    ctx.ellipse(
      -body.focalDistance * currentZoom,
      0,
      body.semiMajorAxis * currentZoom,
      Math.abs(body.semiMinorAxis * currentZoom * tilt),
      0, 0, Math.PI * 2
    );
    
    ctx.strokeStyle = isFocused ? 
      (body.isDwarf ? 'rgba(200, 150, 255, 0.5)' : 'rgba(110, 193, 255, 0.5)') : 
      (body.isDwarf ? 'rgba(150, 100, 200, 0.15)' : 'rgba(100, 100, 150, 0.15)');
    ctx.lineWidth = isFocused ? 2 : 1;
    ctx.stroke();
    
    // Orbit prediction
    if (settings.showPrediction && isFocused) {
      const predictTime = Math.PI / 4; // Show 1/8 orbit ahead
      ctx.beginPath();
      for (let t = 0; t < predictTime; t += 0.1) {
        const futureAngle = body.angle + t;
        const px = -body.focalDistance * currentZoom + body.semiMajorAxis * currentZoom * Math.cos(futureAngle);
        const py = body.semiMinorAxis * currentZoom * tilt * Math.sin(futureAngle);
        if (t === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(255, 255, 100, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    ctx.restore();
  });

  // Asteroid belt
  ctx.save();
  ctx.translate(centerX + cameraOffsetX, centerY + cameraOffsetY);
  ctx.beginPath();
  ctx.ellipse(0, 0, 207 * currentZoom, Math.abs(207 * currentZoom * baseTilt), 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(150, 150, 150, 0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawTrails() {
  if (!settings.showTrails) return;
  
  const bodiesToDraw = settings.showDwarfPlanets ? [...planets, ...dwarfPlanets] : planets;
  
  bodiesToDraw.forEach(body => {
    if (body.trail.length < 2) return;
    
    ctx.save();
    ctx.translate(centerX + cameraOffsetX, centerY + cameraOffsetY);
    
    ctx.beginPath();
    ctx.moveTo(body.trail[0].x * currentZoom, body.trail[0].y * currentZoom);
    
    for (let i = 1; i < body.trail.length; i++) {
      ctx.lineTo(body.trail[i].x * currentZoom, body.trail[i].y * currentZoom);
    }
    
    const gradient = ctx.createLinearGradient(
      body.trail[0].x * currentZoom, body.trail[0].y * currentZoom,
      body.trail[body.trail.length - 1].x * currentZoom,
      body.trail[body.trail.length - 1].y * currentZoom
    );
    gradient.addColorStop(0, body.color[0] + '00');
    gradient.addColorStop(1, body.color[1] + (body.isDwarf ? '30' : '40'));
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = body.isDwarf ? 1 : 1.5;
    ctx.stroke();
    ctx.restore();
  });
}

function drawPlanetWithTexture(x, y, radius, body) {
  if (body.texture && textures[body.texture]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(body.rotation);
    
    // Create circular clip
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.clip();
    
    // Draw texture
    ctx.drawImage(textures[body.texture], -radius, -radius, radius * 2, radius * 2);
    
    // Day/night terminator for planets with axial tilt
    if (body.axialTilt && body.name !== 'Venus') {
      const gradient = ctx.createLinearGradient(-radius, 0, radius, 0);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      ctx.fillStyle = gradient;
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    }
    
    ctx.restore();
  } else {
    // Fallback to gradient
    const gradient = ctx.createRadialGradient(
      x - radius * 0.35, y - radius * 0.35, radius * 0.1,
      x, y, radius * 1.1
    );
    body.color.forEach((color, i) => {
      gradient.addColorStop(i / (body.color.length - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGasGiantRings(x, y, radius, body) {
  if (!body.rings) return;
  
  ctx.save();
  ctx.translate(x, y);
  
  const ringTilt = body.axialTilt ? Math.abs(Math.cos(body.axialTilt * Math.PI / 180)) : 0.3;
  
  for (let i = 0; i < 5; i++) {
    const ringRadius = radius * (body.rings.inner + i * (body.rings.outer - body.rings.inner) / 5);
    ctx.beginPath();
    ctx.ellipse(0, 0, ringRadius, Math.abs(ringRadius * ringTilt), 0, 0, Math.PI * 2);
    
    const opacity = body.rings.opacity * (1 - i * 0.1);
    let ringColor;
    if (body.name === 'Saturn') {
      ringColor = `rgba(${220 - i * 10}, ${180 - i * 10}, ${120 - i * 10}, ${opacity})`;
    } else {
      ringColor = `rgba(150, 150, ${200 - i * 20}, ${opacity * 0.5})`;
    }
    
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  ctx.restore();
}

function drawBodies() {
  const bodiesToDraw = settings.showDwarfPlanets ? [...planets, ...dwarfPlanets] : planets;
  
  // Sort by Y position for proper overlap
  const sorted = bodiesToDraw.slice().sort((a, b) => {
    const aPos = getEllipticalPosition(a, 0, 0);
    const bPos = getEllipticalPosition(b, 0, 0);
    return aPos.y - bPos.y;
  });

  sorted.forEach((body) => {
    const actualIdx = bodiesToDraw.indexOf(body);
    const isFocused = actualIdx === focusedPlanetIndex;
    
    const speedMultiplier = body.semiMajorAxis < 200 ? 0.3 : 1.0;
    body.angle += body.angularVelocity * timeSpeed * speedMultiplier;
    body.rotation += 0.01;
    if (body.axialTilt) {
      body.dayNightAngle += 0.02 / body.orbitalPeriod;
    }

    const pos = getEllipticalPosition(body, 0, 0);
    const x = centerX + pos.x + cameraOffsetX;
    const y = centerY + pos.y + cameraOffsetY;

    body.trail.push({ x: pos.x, y: pos.y });
    if (body.trail.length > 100) body.trail.shift();

    const radius = body.displayRadius * currentZoom;

    // Highlight focused body
    if (isFocused) {
      ctx.save();
      ctx.shadowBlur = 30;
      ctx.shadowColor = body.isDwarf ? '#ff88ff' : '#6ec1ff';
      ctx.beginPath();
      ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = body.isDwarf ? 'rgba(255, 136, 255, 0.3)' : 'rgba(110, 193, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Glow
    if (settings.showGlow) {
      ctx.save();
      ctx.shadowBlur = radius * 0.8;
      ctx.shadowColor = body.color[0];
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = body.color[0] + '20';
      ctx.fill();
      ctx.restore();
    }

    // Draw rings behind planet for gas giants
    if (body.rings) {
      drawGasGiantRings(x, y, radius, body);
    }

    // Draw planet
    drawPlanetWithTexture(x, y, radius, body);

    // Draw moons (plural for gas giants)
    if (settings.showMoons && body.moons) {
      body.moons.forEach(moon => {
        moon.angle += moon.angularVelocity * timeSpeed;
        const mx = x + moon.distance * currentZoom * Math.cos(moon.angle);
        const my = y + moon.distance * currentZoom * Math.sin(moon.angle) * baseTilt;
        
        ctx.beginPath();
        ctx.arc(mx, my, Math.max(1.5, moon.radius * currentZoom), 0, Math.PI * 2);
        ctx.fillStyle = moon.color;
        ctx.fill();
        
        if (settings.showLabels) {
          ctx.fillStyle = '#aaa';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(moon.name, mx, my - moon.radius * currentZoom - 5);
        }
      });
    }

    // Draw single moon (like Earth's)
    if (body.moon && !body.moons) {
      body.moon.angle += body.moon.angularVelocity * timeSpeed;
      const mx = x + body.moon.distance * currentZoom * Math.cos(body.moon.angle);
      const my = y + body.moon.distance * currentZoom * Math.sin(body.moon.angle) * baseTilt;
      
      const moonGrad = ctx.createRadialGradient(
        mx - body.moon.radius * 0.3, my - body.moon.radius * 0.3, body.moon.radius * 0.1,
        mx, my, body.moon.radius * currentZoom
      );
      moonGrad.addColorStop(0, '#f0f0f0');
      moonGrad.addColorStop(0.5, '#c0c0c0');
      moonGrad.addColorStop(1, '#808080');
      
      ctx.beginPath();
      ctx.arc(mx, my, Math.max(2, body.moon.radius * currentZoom), 0, Math.PI * 2);
      ctx.fillStyle = moonGrad;
      ctx.fill();
    }

    // Labels
    if (settings.showLabels || isFocused) {
      ctx.save();
      ctx.fillStyle = isFocused ? (body.isDwarf ? '#ff88ff' : '#6ec1ff') : '#ffffff';
      ctx.font = isFocused ? 'bold 14px Arial' : '12px Arial';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText(body.name, x, y + radius + 18);
      ctx.restore();
    }

    // Update stats for focused body
    if (isFocused) {
      const distFromSun = Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.y, 2));
      const distAU = (distFromSun / 140).toFixed(3);
      const progress = ((body.angle % (2 * Math.PI)) / (2 * Math.PI) * 100).toFixed(1);
      const speed = (body.angularVelocity * body.semiMajorAxis * 149.6 / body.orbitalPeriod).toFixed(1);
      
      document.getElementById('focusedPlanet').innerHTML = 
        `<span class="planet-highlight">${body.name}</span>${body.isDwarf ? ' (Dwarf)' : ''}`;
      document.getElementById('planetPos').textContent = `(${Math.round(pos.x)}, ${Math.round(pos.y)})`;
      document.getElementById('distanceSun').textContent = `${distAU} AU`;
      document.getElementById('orbitalSpeed').textContent = `${speed} km/s`;
      document.getElementById('orbitalProgress').textContent = `${progress}%`;
    }
  });
}

function drawAsteroids() {
  asteroids.forEach(a => {
    a.angle += a.angularVelocity * timeSpeed;
    
    let tilt = baseTilt;
    if (settings.showInclination) {
      tilt = baseTilt * Math.cos(a.inclination * Math.PI / 180);
    }
    
    // Ensure tilt is always positive
    tilt = Math.abs(tilt);
    
    const ax = centerX + cameraOffsetX + a.distance * currentZoom * Math.cos(a.angle);
    const ay = centerY + cameraOffsetY + a.distance * currentZoom * Math.sin(a.angle) * tilt;
    
    ctx.beginPath();
    ctx.arc(ax, ay, Math.max(0.5, a.radius * currentZoom), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(170, 170, 170, ${a.brightness})`;
    ctx.fill();
  });
}

function drawSun() {
  const sunX = centerX + cameraOffsetX;
  const sunY = centerY + cameraOffsetY;
  const sunRadius = sun.radius * currentZoom;
  
  if (settings.showGlow) {
    const outerGlow = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.5, sunX, sunY, sunRadius * 2);
    outerGlow.addColorStop(0, 'rgba(255, 200, 50, 0.3)');
    outerGlow.addColorStop(0.5, 'rgba(255, 180, 0, 0.1)');
    outerGlow.addColorStop(1, 'rgba(255, 160, 0, 0)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  const sunGrad = ctx.createRadialGradient(
    sunX - sunRadius * 0.2, sunY - sunRadius * 0.2, sunRadius * 0.1,
    sunX, sunY, sunRadius
  );
  sunGrad.addColorStop(0, '#fffacd');
  sunGrad.addColorStop(0.2, '#fff9a3');
  sunGrad.addColorStop(0.4, '#fff176');
  sunGrad.addColorStop(0.6, '#ffd54f');
  sunGrad.addColorStop(0.8, '#ffb300');
  sunGrad.addColorStop(1, '#ff8f00');
  
  ctx.save();
  if (settings.showGlow) {
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#ffb300';
  }
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.fillStyle = sunGrad;
  ctx.fill();
  ctx.restore();

  // Sun texture
  ctx.fillStyle = 'rgba(255, 140, 0, 0.1)';
  for (let i = 0; i < 8; i++) {
    const angle = (Date.now() * 0.0001 + i) % (Math.PI * 2);
    ctx.beginPath();
    ctx.arc(
      sunX + Math.cos(angle) * sunRadius * 0.3,
      sunY + Math.sin(angle) * sunRadius * 0.3,
      sunRadius * 0.15,
      0, Math.PI * 2
    );
    ctx.fill();
  }
}

function drawDistanceRuler() {
  if (!settings.distanceRuler || rulerPoints.length === 0) return;
  
  rulerPoints.forEach((body, idx) => {
    const pos = getEllipticalPosition(body, 0, 0);
    const x = centerX + pos.x * currentZoom + cameraOffsetX;
    const y = centerY + pos.y * currentZoom + cameraOffsetY;
    
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.strokeStyle = idx === 0 ? '#ff5555' : '#55ff55';
    ctx.lineWidth = 3;
    ctx.stroke();
  });
  
  if (rulerPoints.length === 2) {
    const p1 = getEllipticalPosition(rulerPoints[0], 0, 0);
    const p2 = getEllipticalPosition(rulerPoints[1], 0, 0);
    
    const x1 = centerX + p1.x * currentZoom + cameraOffsetX;
    const y1 = centerY + p1.y * currentZoom + cameraOffsetY;
    const x2 = centerX + p2.x * currentZoom + cameraOffsetX;
    const y2 = centerY + p2.y * currentZoom + cameraOffsetY;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function animate() {
  simulationTime += timeSpeed;
  
  // Background
  const bgGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 
    Math.max(canvas.width, canvas.height));
  bgGrad.addColorStop(0, '#0a0a1a');
  bgGrad.addColorStop(0.5, '#050510');
  bgGrad.addColorStop(1, '#000000');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMilkyWay();
  drawStars();
  drawLensFlare();
  drawOrbits();
  drawTrails();
  drawSun();
  drawBodies();
  drawAsteroids();
  drawDistanceRuler();

  // Update simulation time
  const earthYears = simulationTime / (2 * Math.PI);
  const earthDays = earthYears * 365.25;
  document.getElementById('simTime').textContent = 
    `${earthDays.toFixed(0)} days (${earthYears.toFixed(2)} years)`;

  requestAnimationFrame(animate);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initialize();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animate();
