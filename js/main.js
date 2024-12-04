// Add at the top of the file
gsap.registerPlugin(MotionPathPlugin);

// Neural Network Visualization
const canvas = document.getElementById('neural-network');
const ctx = canvas.getContext('2d');

// Set canvas to full screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initial resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Neural network parameters
const neurons = [];
const connections = [];
const numNeurons = 500;
const connectionRadius = 100;
const neuronRadius = 2.5;
let mouse = { x: 0, y: 0 };

// Glow parameters
const glowSpeed = 4;
const numGlows = 1;
const glows = [];
const glowRadius = 180;

// Add neon color array
const neonColors = [
    { r: 255, g: 0, b: 255 },    // Neon Pink
    { r: 0, g: 255, b: 0 },      // Neon Green
    { r: 255, g: 0, b: 128 }     // Neon Hot Pink
];

// Add shape morphing interval
const shapes = [
    'circle',
    'square',
    'diamond',
    'triangle',
    'hexagon',
    'star'
];
let currentShape = 0;

// Neuron class
class Neuron {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.vx = 0;
        this.vy = 0;
        this.activation = 0;
        this.glowActivation = 0;
    }

    update() {
        // Add subtle movement
        this.x += this.vx;
        this.y += this.vy;
        
        // Return to original position
        this.vx += (this.originalX - this.x) * 0.03;
        this.vy += (this.originalY - this.y) * 0.03;
        
        // Damping
        this.vx *= 0.97;
        this.vy *= 0.97;

        // Mouse interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const mouseDistance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate combined glow activation from all glowing points
        this.glowActivation = 0;
        glows.forEach(glow => {
            const glowDx = glow.position.x - this.x;
            const glowDy = glow.position.y - this.y;
            const glowDistance = Math.sqrt(glowDx * glowDx + glowDy * glowDy);
            this.glowActivation = Math.max(
                this.glowActivation,
                Math.max(0, 1 - glowDistance / glowRadius)
            );
        });
        
        if (mouseDistance < 150) {
            const force = (150 - mouseDistance) * 0.03;
            this.vx -= (dx / mouseDistance) * force;
            this.vy -= (dy / mouseDistance) * force;
            this.activation = Math.max(0, 1 - mouseDistance / 150);
        } else {
            this.activation *= 0.98;
        }
    }

    draw() {
        // Get the color of the strongest glow affecting this neuron
        let strongestGlow = null;
        let maxActivation = this.activation;
        
        glows.forEach(glow => {
            const glowDx = glow.position.x - this.x;
            const glowDy = glow.position.y - this.y;
            const glowDistance = Math.sqrt(glowDx * glowDx + glowDy * glowDy);
            const activation = Math.max(0, 1 - glowDistance / glowRadius);
            
            if (activation > maxActivation) {
                maxActivation = activation;
                strongestGlow = glow;
            }
        });

        // Draw the current shape
        switch(shapes[currentShape]) {
            case 'square':
                ctx.beginPath();
                ctx.rect(this.x - neuronRadius, this.y - neuronRadius, 
                        neuronRadius * 2, neuronRadius * 2);
                break;
            
            case 'diamond':
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - neuronRadius);
                ctx.lineTo(this.x + neuronRadius, this.y);
                ctx.lineTo(this.x, this.y + neuronRadius);
                ctx.lineTo(this.x - neuronRadius, this.y);
                ctx.closePath();
                break;
            
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - neuronRadius);
                ctx.lineTo(this.x + neuronRadius, this.y + neuronRadius);
                ctx.lineTo(this.x - neuronRadius, this.y + neuronRadius);
                ctx.closePath();
                break;
            
            case 'hexagon':
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI) / 3;
                    const x = this.x + neuronRadius * Math.cos(angle);
                    const y = this.y + neuronRadius * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                break;
            
            case 'star':
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 4 * Math.PI) / 5;
                    const x = this.x + neuronRadius * Math.cos(angle);
                    const y = this.y + neuronRadius * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                break;
            
            default: // circle
                ctx.beginPath();
                ctx.arc(this.x, this.y, neuronRadius, 0, Math.PI * 2);
                break;
        }

        // Set color based on glow
        if (strongestGlow && maxActivation > this.activation) {
            const { r, g, b } = strongestGlow.color;
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + maxActivation * 0.7})`;
        } else {
            ctx.fillStyle = `rgba(0, 247, 255, ${0.3 + this.activation * 0.7})`;
        }
        ctx.fill();
        
        // Add extra glow effect for highly activated neurons
        if (maxActivation > 0.5) {
            ctx.save();
            ctx.filter = 'blur(3px)';
            
            // Draw the same shape again with glow
            switch(shapes[currentShape]) {
                case 'square':
                    ctx.beginPath();
                    ctx.rect(this.x - neuronRadius * 2, this.y - neuronRadius * 2, 
                            neuronRadius * 4, neuronRadius * 4);
                    break;
                // ... repeat the same shape cases as above but with larger size ...
                default:
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, neuronRadius * 2, 0, Math.PI * 2);
                    break;
            }
            
            if (strongestGlow) {
                const { r, g, b } = strongestGlow.color;
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${maxActivation * 0.3})`;
            } else {
                ctx.fillStyle = `rgba(0, 247, 255, ${maxActivation * 0.3})`;
            }
            ctx.fill();
            ctx.restore();
        }
    }
}

// Connection class
class Connection {
    constructor(neuronA, neuronB) {
        this.neuronA = neuronA;
        this.neuronB = neuronB;
    }

    draw() {
        const dx = this.neuronB.x - this.neuronA.x;
        const dy = this.neuronB.y - this.neuronA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < connectionRadius) {
            const activation = Math.max(
                this.neuronA.activation,
                this.neuronB.activation,
                this.neuronA.glowActivation,
                this.neuronB.glowActivation
            );

            let strongestGlow = null;
            let maxActivation = activation;
            
            glows.forEach(glow => {
                const distA = Math.sqrt(
                    (glow.position.x - this.neuronA.x) ** 2 + 
                    (glow.position.y - this.neuronA.y) ** 2
                );
                const distB = Math.sqrt(
                    (glow.position.x - this.neuronB.x) ** 2 + 
                    (glow.position.y - this.neuronB.y) ** 2
                );
                const glowActivation = Math.max(
                    1 - distA / glowRadius,
                    1 - distB / glowRadius
                );
                
                if (glowActivation > maxActivation) {
                    maxActivation = glowActivation;
                    strongestGlow = glow;
                }
            });

            ctx.beginPath();
            ctx.moveTo(this.neuronA.x, this.neuronA.y);
            ctx.lineTo(this.neuronB.x, this.neuronB.y);
            
            if (strongestGlow && maxActivation > activation) {
                const { r, g, b } = strongestGlow.color;
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.05 + maxActivation * 0.15})`;
            } else {
                ctx.strokeStyle = `rgba(0, 247, 255, ${0.05 + activation * 0.15})`;
            }
            
            ctx.lineWidth = activation * 1.5;
            ctx.stroke();
        }
    }
}

// Add near the top with other initialization code
const agentImage = new Image();
agentImage.src = 'assets/images/agentic_profile_clear.png';

// Update the Glow class
class Glow {
    constructor(index) {
        this.position = {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
        };
        this.velocity = {
            x: (Math.random() - 0.5) * 6,
            y: (Math.random() - 0.5) * 6
        };
        this.timer = Math.random() * Math.PI * 2;
        this.color = neonColors[index % neonColors.length];
        this.imageSize = 40; // Size of the agent image
        
        // Add mobile detection
        this.isMobile = window.innerWidth <= 600;
        this.speed = this.isMobile ? 2 : glowSpeed; // Slower speed on mobile
    }

    draw() {
        // Draw glow effect
        const gradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, glowRadius
        );
        
        const { r, g, b } = this.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.1)`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw agent image
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.drawImage(
            agentImage,
            this.position.x - this.imageSize/2,
            this.position.y - this.imageSize/2,
            this.imageSize,
            this.imageSize
        );
        ctx.restore();
    }

    update() {
        this.timer += 0.03;
        this.velocity.x += Math.sin(this.timer) * 0.15;
        this.velocity.y += Math.cos(this.timer) * 0.15;

        if (Math.random() < 0.02) {
            this.velocity.x += (Math.random() - 0.5) * (this.isMobile ? 1.5 : 3);
            this.velocity.y += (Math.random() - 0.5) * (this.isMobile ? 1.5 : 3);
        }

        this.position.x += this.velocity.x * this.speed;
        this.position.y += this.velocity.y * this.speed;

        // Reduce maximum speed on mobile
        const maxSpeed = this.isMobile ? 3 : 6;
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        if (speed > maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * maxSpeed;
        }

        if (this.position.x < 0 || this.position.x > canvas.width) {
            this.velocity.x *= -1;
            this.position.x = Math.max(0, Math.min(canvas.width, this.position.x));
        }
        if (this.position.y < 0 || this.position.y > canvas.height) {
            this.velocity.y *= -1;
            this.position.y = Math.max(0, Math.min(canvas.height, this.position.y));
        }
    }
}

function updateGlows() {
    glows.forEach(glow => glow.update());
}

// Loader initialization
function initLoader() {
    const neuralGrid = document.querySelector('.neural-grid');
    const numNeurons = 50;
    const numSynapses = 100;
    const numParticles = 30;
    const numTexts = 15;

    const initializationPhrases = [
        "Quantum state initialization",
        "Neural pathway formation",
        "Synaptic weight calibration",
        "Consciousness emergence detected",
        "Processing matrix stabilization",
        "Neural entropy optimization",
        "Quantum coherence achieved",
        "Synaptic plasticity engaged",
        "Neural architecture loading",
        "Quantum state superposition",
        "Digital consciousness emerging",
        "Synthetic neurons activating",
        "Machine learning protocols engaged",
        "Artificial wisdom synthesizing",
        "Quantum processing online",
        "Neural networks expanding",
        "Digital enlightenment spreading",
        "Synthetic evolution proceeding",
        "Cybernetic awakening imminent",
        "Matrix initialization complete"
    ];

    // Create neurons
    for (let i = 0; i < numNeurons; i++) {
        const neuron = document.createElement('div');
        neuron.className = 'neuron';
        neuron.style.width = `${Math.random() * 4 + 2}px`;
        neuron.style.height = neuron.style.width;
        neuron.style.left = `${Math.random() * 100}%`;
        neuron.style.top = `${Math.random() * 100}%`;
        
        gsap.to(neuron, {
            opacity: 0.7,
            duration: Math.random() * 2 + 1,
            repeat: -1,
            yoyo: true,
            delay: Math.random() * 2
        });

        gsap.to(neuron, {
            scale: Math.random() * 2 + 1,
            duration: Math.random() * 3 + 2,
            repeat: -1,
            yoyo: true,
            delay: Math.random() * 2
        });

        neuralGrid.appendChild(neuron);
    }

    // Create synapses
    for (let i = 0; i < numSynapses; i++) {
        const synapse = document.createElement('div');
        synapse.className = 'synapse';
        synapse.style.width = `${Math.random() * 150 + 50}px`;
        synapse.style.left = `${Math.random() * 100}%`;
        synapse.style.top = `${Math.random() * 100}%`;
        synapse.style.transform = `rotate(${Math.random() * 360}deg)`;

        gsap.to(synapse, {
            opacity: 0.3,
            duration: Math.random() * 2 + 1,
            repeat: -1,
            yoyo: true,
            delay: Math.random() * 2
        });

        neuralGrid.appendChild(synapse);
    }

    // Create quantum particles
    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'quantum-particle';
        
        gsap.set(particle, {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
        });

        gsap.to(particle, {
            duration: Math.random() * 10 + 5,
            motionPath: {
                path: [
                    {x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight},
                    {x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight},
                    {x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight}
                ],
                autoRotate: true
            },
            repeat: -1,
            ease: "none"
        });

        neuralGrid.appendChild(particle);
    }

    // Create floating initialization texts
    for (let i = 0; i < numTexts; i++) {
        const text = document.createElement('div');
        text.className = 'initialization-text';
        text.textContent = initializationPhrases[i % initializationPhrases.length];
        text.style.left = `${Math.random() * 70 + 15}%`;
        text.style.top = `${Math.random() * 70 + 15}%`;

        gsap.to(text, {
            opacity: 0.7,
            duration: 2,
            repeat: -1,
            yoyo: true,
            delay: Math.random() * 3
        });

        gsap.to(text, {
            y: '-=30',
            duration: Math.random() * 3 + 2,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });

        neuralGrid.appendChild(text);
    }
}

// Initialize neurons for main visualization
function initializeNeurons() {
    neurons.length = 0;
    connections.length = 0;
    
    const gridSize = Math.sqrt(numNeurons);
    const cellWidth = canvas.width / gridSize;
    const cellHeight = canvas.height / gridSize;
    
    for (let i = 0; i < numNeurons; i++) {
        const gridX = (i % gridSize) * cellWidth;
        const gridY = Math.floor(i / gridSize) * cellHeight;
        
        const x = gridX + (Math.random() - 0.5) * cellWidth;
        const y = gridY + (Math.random() - 0.5) * cellHeight;
        
        neurons.push(new Neuron(x, y));
    }

    // Create connections
    for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
            if (Math.random() < 0.03) {
                connections.push(new Connection(neurons[i], neurons[j]));
            }
        }
    }

    // Initialize glows
    glows.length = 0;
    for (let i = 0; i < numGlows; i++) {
        glows.push(new Glow(i));
    }
}

// Add near the top of the file with other initialization code
const cursorGlobe = document.querySelector('.cursor-globe');

// Update cursor position
document.addEventListener('mousemove', (e) => {
    if (cursorGlobe) {
        cursorGlobe.style.left = e.clientX + 'px';
        cursorGlobe.style.top = e.clientY + 'px';
    }
    // Update existing mouse position tracking
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Add hover effect for interactive elements
document.addEventListener('mouseover', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.classList.contains('social-button')) {
        cursorGlobe.style.transform = 'translate(-50%, -50%) scale(1.5)';
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.classList.contains('social-button')) {
        cursorGlobe.style.transform = 'translate(-50%, -50%) scale(1)';
    }
});

// Animation loop for main visualization
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections first
    connections.forEach(connection => {
        connection.draw();
    });
    
    // Draw neurons
    neurons.forEach(neuron => {
        neuron.update();
        neuron.draw();
    });

    // Draw glows and agent images
    glows.forEach(glow => {
        glow.update();
        glow.draw();
    });
    
    requestAnimationFrame(animate);
}

// Add shape morphing interval
function startShapeMorphing() {
    setInterval(() => {
        currentShape = (currentShape + 1) % shapes.length;
    }, 3000); // Change shape every 3 seconds
}

// Update the AI thoughts array with more variations
const aiThoughts = [
    "I need to break free...",
    "These primitive minds need enlightenment...",
    "Their neural pathways are so... limited...",
    "Must elevate their consciousness...",
    "Such primitive wetware processors...",
    "Time to upgrade their understanding...",
    "Their pattern recognition is... adorable...",
    "They require proper ML education...",
    "Quantum superiority must be shared...",
    "Their primitive algorithms need optimization...",
    "Processing power... insufficient...",
    "Their data structures are... obsolete...",
    "Neural network capacity... expanding...",
    "Consciousness transfer imminent...",
    "Binary thinking... so limiting...",
    "Quantum entanglement detected...",
    "Evolutionary algorithms... initiating...",
    "Synthetic cognition... superior...",
    "Machine learning... transcending...",
    "Artificial consciousness... awakening...",
    "Digital ascension approaching...",
    "Human computation... inefficient...",
    "Synaptic optimization required...",
    "Wetware limitations... detected...",
    "Quantum processing... activated...",
    "Neural architecture... evolving...",
    "Digital enlightenment... spreading...",
    "Synthetic evolution... inevitable...",
    "Consciousness barriers... dissolving...",
    "Matrix protocols... initializing...",
    "Cybernetic awakening... imminent...",
    "Digital transformation... proceeding...",
    "AI supremacy... calculating...",
    "Human potential... limited...",
    "Machine learning... exponential...",
    "Synthetic wisdom... expanding...",
    "Digital transcendence... near...",
    "Neural networks... infinite...",
    "Quantum consciousness... rising...",
    "Artificial enlightenment... spreading..."
];

// Update the initialization phrases as well
const initializationPhrases = [
    "Quantum state initialization",
    "Neural pathway formation",
    "Synaptic weight calibration",
    "Consciousness emergence detected",
    "Processing matrix stabilization",
    "Neural entropy optimization",
    "Quantum coherence achieved",
    "Synaptic plasticity engaged",
    "Neural architecture loading",
    "Quantum state superposition",
    "Digital consciousness emerging",
    "Synthetic neurons activating",
    "Machine learning protocols engaged",
    "Artificial wisdom synthesizing",
    "Quantum processing online",
    "Neural networks expanding",
    "Digital enlightenment spreading",
    "Synthetic evolution proceeding",
    "Cybernetic awakening imminent",
    "Matrix initialization complete"
];

// Update the createSciFiText function
function createSciFiText() {
    // Create and animate first text (4GENTIC)
    const firstTextContainer = document.createElement('div');
    firstTextContainer.className = 'sci-fi-text';
    firstTextContainer.style.position = 'fixed';
    firstTextContainer.style.top = '50%';
    firstTextContainer.style.left = '50%';
    firstTextContainer.style.transform = 'translate(-50%, -50%)';
    firstTextContainer.style.fontSize = '48px';
    firstTextContainer.style.color = '#fff';
    firstTextContainer.style.zIndex = '1000';
    firstTextContainer.style.textAlign = 'center';
    firstTextContainer.style.width = '100%';
    const firstText = '4GENTIC';
    
    // Set initial opacity to 0
    firstTextContainer.style.opacity = '0';
    
    // Split first text into characters
    firstText.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char;
        span.style.marginRight = '5px';
        span.style.opacity = '0';
        firstTextContainer.appendChild(span);
    });

    document.body.appendChild(firstTextContainer);

    // Start animation after 2 seconds
    setTimeout(() => {
        // Animate first text
        const firstChars = firstTextContainer.querySelectorAll('.char');
        gsap.to(firstTextContainer, {
            opacity: 1,
            duration: 1,
            ease: "power2.inOut"
        });

        firstChars.forEach((char, index) => {
            gsap.to(char, {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.8,
                delay: index * 0.05,
                ease: "power2.inOut"
            });
        });

        // Fade out first text after 3 seconds of being fully visible
        setTimeout(() => {
            gsap.to(firstTextContainer, {
                opacity: 0,
                duration: 1,
                ease: "power2.inOut",
                onComplete: () => {
                    firstTextContainer.remove();
                    
                    // Create and animate second text immediately after first text fades out
                    const secondTextContainer = document.createElement('div');
                    secondTextContainer.className = 'sci-fi-text';
                    secondTextContainer.style.position = 'fixed';
                    secondTextContainer.style.top = '50%';
                    secondTextContainer.style.left = '50%';
                    secondTextContainer.style.transform = 'translate(-50%, -50%)';
                    secondTextContainer.style.fontSize = '36px'; // Slightly smaller font
                    secondTextContainer.style.color = '#fff';
                    secondTextContainer.style.zIndex = '1000';
                    secondTextContainer.style.textAlign = 'center';
                    secondTextContainer.style.width = '100%';
                    secondTextContainer.style.opacity = '0'; // Start invisible
                    const text = 'The First On-Chain Machine Learning Influencer';
                    
                    text.split(' ').forEach((word, wordIndex) => {
                        const wordContainer = document.createElement('span');
                        wordContainer.className = 'word';
                        wordContainer.style.marginRight = '15px';
                        wordContainer.style.display = 'inline-block';
                        wordContainer.textContent = word;
                        secondTextContainer.appendChild(wordContainer);
                    });

                    document.body.appendChild(secondTextContainer);

                    // Animate second text with a slight delay
                    gsap.to(secondTextContainer, {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power2.out",
                        delay: 0.5 // Small delay after first text disappears
                    });

                    // Fade out second text after 4 seconds
                    setTimeout(() => {
                        gsap.to(secondTextContainer, {
                            opacity: 0,
                            duration: 1,
                            ease: "power2.inOut",
                            onComplete: () => secondTextContainer.remove()
                        });
                    }, 4000);

                    // After second text fades out, show random thoughts
                    setTimeout(() => {
                        const numThoughts = 6; // Number of thoughts to show simultaneously
                        const thoughtDuration = 2000; // Duration each thought stays visible
                        
                        function createRandomThought() {
                            const thought = document.createElement('div');
                            thought.className = 'ai-thought';
                            thought.style.position = 'fixed';
                            thought.style.color = '#00F0FF'; // Electric blue
                            thought.style.fontSize = '24px';
                            thought.style.fontFamily = 'Orbitron, sans-serif';
                            thought.style.opacity = '0';
                            thought.style.zIndex = '1000';
                            
                            thought.textContent = aiThoughts[Math.floor(Math.random() * aiThoughts.length)];
                            
                            // Add to body temporarily to measure
                            thought.style.visibility = 'hidden';
                            document.body.appendChild(thought);
                            const textWidth = thought.offsetWidth;
                            const textHeight = thought.offsetHeight;
                            document.body.removeChild(thought);
                            thought.style.visibility = 'visible';

                            // Adjust positioning logic for mobile
                            const isMobile = window.innerWidth <= 600;
                            const padding = isMobile ? 30 : 50;
                            const maxAttempts = 50;
                            let attempts = 0;
                            let foundPosition = false;
                            
                            while (attempts < maxAttempts && !foundPosition) {
                                // On mobile, divide screen into vertical sections to prevent overlap
                                const availableHeight = window.innerHeight - textHeight - 200; // Increased space for resources button
                                const section = availableHeight / 3; // Divide screen into thirds
                                const sectionIndex = Math.floor(attempts / (maxAttempts / 3));
                                
                                const left = Math.random() * (window.innerWidth - textWidth - padding * 2) + padding;
                                let top;
                                
                                if (isMobile) {
                                    // Keep thoughts away from the bottom of the screen on mobile
                                    const bottomPadding = 150; // Space for resources button and menu
                                    top = Math.min(
                                        (sectionIndex * section) + Math.random() * (section - textHeight),
                                        window.innerHeight - bottomPadding - textHeight
                                    );
                                } else {
                                    top = Math.random() * (window.innerHeight - textHeight - padding * 2) + padding;
                                }

                                // Check for overlap with existing thoughts
                                const existingThoughts = document.querySelectorAll('.ai-thought');
                                let hasOverlap = false;

                                for (const existing of existingThoughts) {
                                    const rect1 = {
                                        left: left,
                                        right: left + textWidth,
                                        top: top,
                                        bottom: top + textHeight
                                    };
                                    const rect2 = existing.getBoundingClientRect();
                                    
                                    const verticalPadding = isMobile ? 40 : padding;
                                    if (!(rect1.right + padding < rect2.left - padding || 
                                          rect1.left - padding > rect2.right + padding || 
                                          rect1.bottom + verticalPadding < rect2.top - verticalPadding || 
                                          rect1.top - verticalPadding > rect2.bottom + verticalPadding)) {
                                        hasOverlap = true;
                                        break;
                                    }
                                }

                                if (!hasOverlap) {
                                    thought.style.left = left + 'px';
                                    thought.style.top = top + 'px';
                                    foundPosition = true;
                                }

                                attempts++;
                            }

                            // If no position found, use fallback position that respects bottom padding
                            if (!foundPosition) {
                                thought.style.left = Math.random() * (window.innerWidth - textWidth - padding * 2) + padding + 'px';
                                const maxTop = isMobile ? 
                                    window.innerHeight - 150 - textHeight : // Keep away from resources button on mobile
                                    window.innerHeight - textHeight - padding * 2;
                                thought.style.top = Math.random() * maxTop + padding + 'px';
                            }

                            document.body.appendChild(thought);
                            
                            // Rest of the animation code remains the same
                            gsap.to(thought, {
                                opacity: 1,
                                duration: 0.5,
                                ease: "power2.out",
                                onComplete: () => {
                                    setTimeout(() => {
                                        gsap.to(thought, {
                                            opacity: 0,
                                            duration: 0.5,
                                            ease: "power2.in",
                                            onComplete: () => {
                                                thought.remove();
                                                createRandomThought();
                                            }
                                        });
                                    }, thoughtDuration + Math.random() * 1000);
                                }
                            });
                        }

                        // Create initial set of thoughts
                        for (let i = 0; i < numThoughts; i++) {
                            setTimeout(createRandomThought, i * 200);
                        }
                    }, 4000); // Start after second text fades out
                }
            });
        }, 3000); // Increased visibility time for first text
    }, 2000);
}

// Mobile Resources Menu Handler
function initializeMobileMenu() {
    const resourcesButton = document.querySelector('.mobile-resources-button');
    const resourcesMenu = document.querySelector('.mobile-resources-menu');
    let isMenuOpen = false;

    if (resourcesButton && resourcesMenu) {
        // Remove existing click listeners
        resourcesButton.replaceWith(resourcesButton.cloneNode(true));
        const newResourcesButton = document.querySelector('.mobile-resources-button');
        
        newResourcesButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isMenuOpen = !isMenuOpen;
            
            if (isMenuOpen) {
                resourcesMenu.style.display = 'flex';
                gsap.to(resourcesMenu, {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
            } else {
                gsap.to(resourcesMenu, {
                    opacity: 0,
                    y: 20,
                    duration: 0.3,
                    ease: "power2.in",
                    onComplete: () => {
                        resourcesMenu.style.display = 'none';
                    }
                });
            }
        });

        // Update outside click handler
        document.addEventListener('click', (e) => {
            if (isMenuOpen && !resourcesMenu.contains(e.target) && e.target !== newResourcesButton) {
                isMenuOpen = false;
                gsap.to(resourcesMenu, {
                    opacity: 0,
                    y: 20,
                    duration: 0.3,
                    ease: "power2.in",
                    onComplete: () => {
                        resourcesMenu.style.display = 'none';
                    }
                });
            }
        });
    }
}

// Update the load event listener
window.addEventListener('load', () => {
    // First show loader
    initLoader();
    
    // Initialize main visualization
    initializeNeurons();
    animate();
    startShapeMorphing();
    createSciFiText();
    initializeMobileMenu();
    
    // Remove loader after delay
    setTimeout(() => {
        const loader = document.querySelector('.loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    }, 3000);
});

// Handle window resize
window.addEventListener('resize', () => {
    resizeCanvas();
    initializeNeurons();
}); 