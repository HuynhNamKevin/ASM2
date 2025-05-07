// Fungus Net Art
let spores = [];
let velocities = [];
let trails = [];
let sporeParticles = [];
let lastBurstTime = 0;
let burstInterval = 2000;
let dragRadius = 50;
let sporeCount = 150;
let decayMode = false; // Decay Mode 
let bgSound;
let mouseSound = [];

// preload audio files 
function preload () {
  bgSound = loadSound('bg.mov');
  mouseSound[0] = loadSound('mouse 1.mov');
  mouseSound[1] = loadSound('mouse 2.mov');
  mouseSound[2] = loadSound('mouse 3.mov');
}

// Set up the Canvas
function setup() {
  instructionsStartTime = millis();
  createCanvas(windowWidth, windowHeight);
  initSpores();
  strokeWeight(0.7);
  noFill();
  
  bgSound.setLoop(true);
  bgSound.setVolume(1);
  bgSound.play();
}

let showInstructions = true;
let instructionsStartTime;

function draw() {
  // Hide instructions after 10 seconds 
  if (millis() - instructionsStartTime > 10000) {
    showInstructions = false;
  }
  // Display instructions or mouse in the top-left corner
  if (showInstructions || (mouseX < 150 && mouseY < 100)) {
    let alphaFade = showInstructions ? map(millis() - instructionsStartTime, 0, 10000, 255, 0) : 255;
    fill(255, alphaFade * 0.6);
    textSize(15);
    textAlign(LEFT, TOP);
    text("Click and drag the mouse\nA: Enter decay mode\nS: Return to live mode (Click and drag the mouse again)\nE: Random Bonus", 20, 20);
  }
  background(10, 10, 20, 20);

  for (let i = spores.length - 1; i >= 0; i--) {
    let p1 = spores[i];

    trails[i].add(p1.copy());
    trails[i].display();

    for (let j = i + 1; j < spores.length; j++) {
      let p2 = spores[j];
      let d = dist(p1.x, p1.y, p2.x, p2.y);

      if (d < 120) {
        let alpha = map(d, 0, 120, 120, 0);

        // Pulsing glow effect
        let pulse = map(sin(frameCount * 0.1 + i * 5 + j), -1, 1, 100, 255);
        stroke(pulse, 200, 255, alpha);
        line(p1.x, p1.y, p2.x, p2.y);

        // Moving dot to connect the line 
        let t = (sin(frameCount * 0.05 + i * 3 + j) + 1) / 2;
        let x = lerp(p1.x, p2.x, t);
        let y = lerp(p1.y, p2.y, t);
        noStroke();
        fill(255, alpha);
        circle(x, y, 2);
      }
    }

    // Decay mode: shrink and fade
    if (decayMode) {
      velocities[i].mult(0.98);
      p1.add(velocities[i]);
      fill(255, 40);
      circle(p1.x, p1.y, 2); // smaller fading dot
      if (random() < 0.002) {
        spores.splice(i, 1);
        velocities.splice(i, 1);
        trails.splice(i, 1);
      }
      continue; // Skip bounce
    }
    
    // Regular movement with bounce on edges
    p1.add(velocities[i]);
    if (p1.x < 0 || p1.x > width) velocities[i].x *= -1;
    if (p1.y < 0 || p1.y > height) velocities[i].y *= -1;
  }

  // Mouse dragging interaction
  if (mouseIsPressed && !decayMode) {
    for (let i = 0; i < spores.length; i++) {
      let d = dist(mouseX, mouseY, spores[i].x, spores[i].y);
      if (d < dragRadius) {
        let dir = createVector(mouseX - spores[i].x, mouseY - spores[i].y);
        dir.normalize().mult(0.5);
        velocities[i].add(dir);
        velocities[i].limit(1);
      }
    }
  }

  // Animate fungal spore particles (mist)
  for (let i = sporeParticles.length - 1; i >= 0; i--) {
    sporeParticles[i].update();
    sporeParticles[i].display();
    if (sporeParticles[i].isDead()) {
      sporeParticles.splice(i, 1);
    }
  }

  // Create new spore burst periodically 
  if (millis() - lastBurstTime > burstInterval) {
    sporeBurst();
    lastBurstTime = millis();
    burstInterval = random(3000, 7000);
  }
}

// Keyboard interaction 
function keyPressed() {
  if (key === 'a' || key === 'A') {
    decayMode = true; // Enter decay mode
  } else if (key === 's' || key === 'S') {
    decayMode = false; // Return to live mode
  } else if (key === 'e' || key === 'E') {
    drawBranch(random(width), height, 200, -PI / 2, 7)
  }
}

// Mouse click interaction 
function mousePressed() {
  if (decayMode) return;
  
  let sound = random(mouseSound);
  if (sound && !sound.isPlaying()) {
    sound.play();
  }


  let found = false;
  for (let i = 0; i < spores.length; i++) {
    if (dist(mouseX, mouseY, spores[i].x, spores[i].y) < dragRadius) {
      found = true;
      break;
    }
  }

  if (!found) {
    let newSpore = createVector(mouseX, mouseY);
    spores.push(newSpore);
    velocities.push(p5.Vector.random2D().mult(random(0.2, 0.6)));
    trails.push(new Hypha());
  }
}

// Initialize spores, velocities, and trails 
function initSpores() {
  spores = [];
  velocities = [];
  trails = [];
  for (let i = 0; i < sporeCount; i++) {
    spores.push(createVector(random(width), random(height)));
    velocities.push(p5.Vector.random2D().mult(random(0.2, 0.6)));
    trails.push(new Hypha());
  }
}

// Create a burst of floating spore particles 
function sporeBurst() {
  for (let i = 0; i < 50; i++) {
    let x = random(width);
    let y = random(height * 1);
    sporeParticles.push(new SporeParticle(x, y));
  }
}

// Recursive branch drawing function 
function drawBranch (x, y, len, angle, depth) {
  if (depth <= 0 || len < 5) return;
  
  let x2 = x + cos(angle) * len;
  let y2 = y + sin(angle) * len;
  
  stroke(120 + depth * 10, 255 - depth * 30, 200, 80);
  line(x, y, x2, y2);
  
  drawBranch(x2, y2, len * 0.7, angle - PI / 6, depth - 1);
  drawBranch(x2, y2, len * 0.7, angle + PI / 6, depth - 1);
}

// Class representing the trail path of each spore 
class Hypha {
  constructor() {
    this.path = [];
    this.maxLength = 40;
  }

  add(pos) {
    this.path.push(pos);
    if (this.path.length > this.maxLength) {
      this.path.shift();
    }
  }

  display() {
    noFill();
    beginShape();
    for (let i = 0; i < this.path.length; i++) {
      let alpha = map(i, 0, this.path.length, 0, 180);
      stroke(180, 255, 200, alpha);
      vertex(this.path[i].x, this.path[i].y);
    }
    endShape();
  }
}

// Class for animated spore mist particles 
class SporeParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.2, 1));
    this.alpha = 200;
    this.size = random(2, 5);
  }

  update() {
    this.pos.add(this.vel);
    this.alpha -= 1.5;
  }

  display() {
    noStroke();
    fill(220, 220, 255, this.alpha);
    circle(this.pos.x, this.pos.y, this.size);
  }

  isDead() {
    return this.alpha <= 0;
  }
}
