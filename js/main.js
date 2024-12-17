// Add at the top of the file
gsap.registerPlugin(MotionPathPlugin);

// Add at the top of the file, after the gsap registration
console.log("Main.js loading started");

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
agentImage.src = 'assets/images/profile_lowres_nobg.png';

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
        "Data pipeline initialization",
        "ETL process orchestration",
        "Schema validation sequence",
        "Data lake connection detected",
        "Warehouse optimization engaged",
        "Data quality metrics calibrating",
        "Stream processing activated",
        "Data governance protocols loading",
        "Delta architecture syncing",
        "Data lineage mapping complete"
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

// Add near the top of the file with other constants
const aiThoughts = [
    "Processing authentic human intelligence...",
    "Optimizing agent-to-agent data flows...",
    "Analyzing community sentiment patterns...",
    "Cross-referencing upstream data sources...",
    "Validating source data authenticity...",
    "Deploying autonomous agent crews...",
    "Semantic analysis in progress...",
    "Real-time intelligence gathering active...",
    "Monitoring community signal strength...",
    "Establishing broker node connections..."
];

// Add this function back before createSciFiText
function showRandomThoughts() {
    // Reduce number of simultaneous thoughts
    const numThoughts = 3;  // Reduced from 6
    // Increase duration each thought stays visible
    const thoughtDuration = 3000;  // Increased from 2000
    
    const createRandomThought = () => {
        const thought = document.createElement('div');
        thought.className = 'ai-thought';
        thought.style.position = 'fixed';
        thought.style.color = '#F4E409'; // Using brand yellow
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

        // Position the thought
        const isMobile = window.innerWidth <= 600;
        const padding = isMobile ? 20 : 50;
        const maxAttempts = 50;
        let attempts = 0;
        let foundPosition = false;
        
        while (attempts < maxAttempts && !foundPosition) {
            const availableHeight = window.innerHeight - textHeight - 200;
            const section = availableHeight / 3;
            const sectionIndex = Math.floor(attempts / (maxAttempts / 3));
            
            const maxLeft = window.innerWidth - textWidth - (isMobile ? 30 : padding * 2);
            const minLeft = isMobile ? 10 : padding;
            const left = Math.random() * (maxLeft - minLeft) + minLeft;
            
            let top;
            if (isMobile) {
                const bottomPadding = 150;
                top = Math.min(
                    (sectionIndex * section) + Math.random() * (section - textHeight),
                    window.innerHeight - bottomPadding - textHeight
                );
            } else {
                top = Math.random() * (window.innerHeight - textHeight - padding * 2) + padding;
            }

            thought.style.left = left + 'px';
            thought.style.top = top + 'px';
            foundPosition = true;
        }

        document.body.appendChild(thought);
        
        gsap.to(thought, {
            opacity: 0.15,  // Reduced from 1
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
                            // Add random delay before creating new thought
                            setTimeout(createRandomThought, Math.random() * 2000 + 1000);
                        }
                    });
                }, thoughtDuration + Math.random() * 2000); // Added more random delay
            }
        });
    };

    // Create initial set of thoughts with more delay between each
    for (let i = 0; i < numThoughts; i++) {
        setTimeout(createRandomThought, i * 1000); // Increased from 200
    }
}

// Update the animateLitepaperBanner function
function animateLitepaperBanner() {
    const banner = document.createElement('div');
    banner.className = 'litepaper-banner';
    
    // Create alert icons
    const leftIcon = document.createElement('div');
    leftIcon.className = 'banner-alert-icon';
    const rightIcon = document.createElement('div');
    rightIcon.className = 'banner-alert-icon';
    
    // Create text container
    const textContainer = document.createElement('div');
    textContainer.className = 'banner-text';
    textContainer.textContent = 'LITEPAPER OUT NOW';
    
    // Assemble banner
    banner.appendChild(leftIcon);
    banner.appendChild(textContainer);
    banner.appendChild(rightIcon);
    document.body.appendChild(banner);

    // Check if mobile
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // Mobile animation sequence
        gsap.timeline({
            repeat: -1,
            repeatDelay: 0
        })
        .fromTo(banner,
            { 
                xPercent: 100,
                opacity: 1
            },
            { 
                xPercent: 0,
                duration: 1,
                ease: "power2.out",
                className: 'litepaper-banner mobile-position'
            }
        )
        .to(banner, {
            xPercent: 0,
            duration: 2,
            ease: "none"
        })
        .to(banner, {
            xPercent: -100,
            duration: 1,
            ease: "power2.in",
            className: 'litepaper-banner mobile-exit'
        })
        .set(banner, {
            xPercent: 100,
            className: 'litepaper-banner'
        });
    } else {
        // Desktop animation (keep existing animation)
        gsap.timeline({
            repeat: -1,
            repeatDelay: 0
        })
        .fromTo(banner,
            { 
                xPercent: 120,
                opacity: 1
            },
            { 
                xPercent: 7,
                duration: 1,
                ease: "power2.out"
            }
        )
        .to(banner, {
            xPercent: 7,
            duration: 2,
            ease: "none"
        })
        .to(banner, {
            xPercent: -150,
            duration: 1,
            ease: "power2.in"
        })
        .set(banner, {
            xPercent: 150
        });
    }

    return banner;
}

// Update the createSciFiText function to add the banner after the buttons appear
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
                    const text = 'The First Agent-to-Agent Data Brokerage';
                    
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

                    // After second text fades out, add dramatic litepaper reveal
                    setTimeout(() => {
                        gsap.to(secondTextContainer, {
                            opacity: 0,
                            duration: 0.5,
                            ease: "power2.inOut",
                            onComplete: () => {
                                secondTextContainer.remove();
                                
                                // Create dramatic litepaper reveal
                                const litepaperReveal = document.createElement('div');
                                litepaperReveal.className = 'litepaper-reveal';
                                document.body.appendChild(litepaperReveal);

                                // Create buttons container
                                const buttonsContainer = document.createElement('div');
                                buttonsContainer.className = 'litepaper-buttons-container';
                                
                                // Create row for buttons
                                const buttonsRow = document.createElement('div');
                                buttonsRow.className = 'buttons-row';
                                
                                // Create litepaper button with dramatic styling
                                const litepaperButton = document.createElement('button');
                                litepaperButton.className = 'litepaper-button reveal-button';
                                litepaperButton.textContent = 'Read Litepaper';
                                litepaperButton.addEventListener('click', () => {
                                    // Open PDF in a new tab
                                    window.open('assets/docs/Litepaper_4GS_Protocol.pdf', '_blank');
                                });
                                
                                // Create TLDR button
                                const tldrButton = document.createElement('button');
                                tldrButton.className = 'tldr-button reveal-button';
                                tldrButton.textContent = 'TLDR';
                                tldrButton.addEventListener('click', () => {
                                    const modal = document.createElement('div');
                                    modal.className = 'tldr-modal';
                                    
                                    const modalContent = document.createElement('div');
                                    modalContent.className = 'tldr-modal-content';
                                    
                                    // Add full litepaper button
                                    const fullLitepaperButton = document.createElement('a');
                                    fullLitepaperButton.className = 'full-litepaper-button';
                                    fullLitepaperButton.textContent = 'Read Full Litepaper';
                                    fullLitepaperButton.href = 'assets/docs/Litepaper_4GS_Protocol.pdf';
                                    fullLitepaperButton.target = '_blank';
                                    modalContent.appendChild(fullLitepaperButton);
                                    
                                    // Add font toggle
                                    const fontToggle = document.createElement('button');
                                    fontToggle.className = 'font-toggle';
                                    fontToggle.textContent = 'Aa';
                                    fontToggle.title = 'Toggle font style';
                                    modalContent.appendChild(fontToggle);
                                    
                                    const closeButton = document.createElement('button');
                                    closeButton.className = 'tldr-close-button';
                                    closeButton.innerHTML = '&times;';
                                    modalContent.appendChild(closeButton);
                                    
                                    const title = document.createElement('h2');
                                    title.textContent = 'Executive Summary';
                                    title.style.color = '#F4E409'; // Yellow title
                                    modalContent.appendChild(title);
                                    
                                    const summary = document.createElement('p');
                                    summary.innerHTML = `In a digital landscape increasingly dominated by AI agents, access to authentic source data has become the
new digital gold. The 4GS Protocol introduces a groundbreaking paradigm: the first-ever Agent-to-Agent
(A2A) Data Brokerage system, specifically designed to capture, process, and distribute genuine source
intelligence from fragmented data sources. <br><br> Through a sophisticated network of AI agents working together,
the protocol monitors, captures, and aggregates data across multiple platforms. This cross-platform approach
ensures capture of authentic community signals at their source, rather than relying on downstream
information. Our upstream data collection and distribution system allows AI agents to tap into interactions,
decisions, and insights that are typically difficult to capture effectively. 4GS serves as a crucial upstream data
provider in the AI agent ecosystem, ensuring that downstream agents, humans, and organizations can
leverage unique source data effectively. <br><br> 

4GS not only delivers raw data but also performs semantic aggregations to produce context-aware insights, enabling users to make informed decisions. 4GS addresses a
fundamental challenge in the AI industry by providing scalable access to authentic, real-time human
intelligence through both raw data and actionable insights.`;
                                    summary.style.fontFamily = 'Orbitron, sans-serif';
                                    summary.style.textAlign = 'justify';
                                    summary.style.color = '#FFFFFF'; // White text
                                    modalContent.appendChild(summary);
                                    
                                    modal.appendChild(modalContent);
                                    document.body.appendChild(modal);
                                    
                                    // Add font toggle functionality
                                    let isDefaultFont = true;
                                    fontToggle.addEventListener('click', () => {
                                        isDefaultFont = !isDefaultFont;
                                        summary.style.fontFamily = isDefaultFont ? 'Orbitron, sans-serif' : 'Arial, sans-serif';
                                        fontToggle.classList.toggle('active');
                                    });
                                    
                                    // Add close functionality
                                    const closeModal = () => {
                                        gsap.to(modal, {
                                            opacity: 0,
                                            duration: 0.3,
                                            ease: "power2.inOut",
                                            onComplete: () => modal.remove()
                                        });
                                    };
                                    
                                    closeButton.addEventListener('click', closeModal);
                                    modal.addEventListener('click', (e) => {
                                        if (e.target === modal) closeModal();
                                    });

                                    // Animate modal opening
                                    gsap.from(modalContent, {
                                        scale: 0.8,
                                        opacity: 0,
                                        duration: 0.3,
                                        ease: "power2.out"
                                    });
                                });

                                // Create product tile
                                const productTile = document.createElement('div');
                                productTile.className = 'product-tile';

                                const tileHeader = document.createElement('div');
                                tileHeader.className = 'product-tile-header';

                                const tileTitle = document.createElement('div');
                                tileTitle.className = 'product-tile-title';
                                tileTitle.textContent = 'Agentic Summaries';

                                const tileTag = document.createElement('div');
                                tileTag.className = 'product-tile-tag';
                                tileTag.textContent = 'Proof of Concept';

                                tileHeader.appendChild(tileTitle);
                                tileHeader.appendChild(tileTag);

                                const tileDescription = document.createElement('div');
                                tileDescription.className = 'product-tile-description';
                                tileDescription.textContent = 'Our flagship product transforms raw community discussions into actionable intelligence through a network of specialized AI agents.';

                                const tileButton = document.createElement('a');
                                tileButton.href = 'https://t.me/AGENTIC_SUMMARIES_BOT?start=letsgo';
                                tileButton.target = '_blank';
                                tileButton.className = 'product-tile-button';
                                tileButton.textContent = 'Try Now';

                                productTile.appendChild(tileHeader);
                                productTile.appendChild(tileDescription);
                                productTile.appendChild(tileButton);

                                buttonsRow.appendChild(litepaperButton);
                                buttonsRow.appendChild(tldrButton);
                                buttonsContainer.appendChild(buttonsRow);
                                buttonsContainer.appendChild(productTile);
                                litepaperReveal.appendChild(buttonsContainer);

                                // Dramatic reveal animation sequence
                                gsap.fromTo(litepaperReveal, 
                                    { opacity: 0 },
                                    { opacity: 1, duration: 0.5 }
                                );

                                // Animate buttons with stagger and glow effect
                                gsap.fromTo('.reveal-button',
                                    { 
                                        scale: 0,
                                        opacity: 0,
                                        filter: 'blur(20px)'
                                    },
                                    { 
                                        scale: 1,
                                        opacity: 1,
                                        filter: 'blur(0px)',
                                        duration: 1,
                                        stagger: 0.2,
                                        ease: "elastic.out(1, 0.5)",
                                        onComplete: () => {
                                            // Add pulsing glow effect after reveal
                                            gsap.to('.reveal-button', {
                                                boxShadow: '0 0 30px var(--primary-yellow)',
                                                repeat: -1,
                                                yoyo: true,
                                                duration: 1.5
                                            });
                                            
                                            // Add the banner animation
                                            const banner = animateLitepaperBanner();
                                            
                                            // Start showing random thoughts after buttons are revealed
                                            setTimeout(showRandomThoughts, 1500);
                                        }
                                    }
                                );
                            }
                        });
                    }, 1000);
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

// Add near the end of the file
function initializeEasterEgg() {
    const moon = document.querySelector('.moon');
    const easterEgg = document.querySelector('.easter-egg-container');
    let timeout;

    moon.addEventListener('click', () => {
        // Show easter egg
        easterEgg.style.display = 'flex';
        gsap.from(easterEgg, {
            opacity: 0,
            y: -20,
            duration: 0.3
        });

        // Clear existing timeout if any
        if (timeout) clearTimeout(timeout);

        // Hide after 5 seconds
        timeout = setTimeout(() => {
            gsap.to(easterEgg, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                onComplete: () => {
                    easterEgg.style.display = 'none';
                }
            });
        }, 5000);
    });
}

function initializeTLDR() {
    const tldrButton = document.querySelector('.tldr-button');
    if (!tldrButton) return;

    tldrButton.addEventListener('click', () => {
        const modal = document.createElement('div');
        modal.className = 'tldr-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'tldr-modal-content';
        
        // Add full litepaper button
        const fullLitepaperButton = document.createElement('a');
        fullLitepaperButton.className = 'full-litepaper-button';
        fullLitepaperButton.textContent = 'Read Full Litepaper';
        fullLitepaperButton.href = 'assets/docs/Litepaper_4GS_Protocol.pdf';
        fullLitepaperButton.target = '_blank';
        modalContent.appendChild(fullLitepaperButton);
        
        // Add font toggle
        const fontToggle = document.createElement('button');
        fontToggle.className = 'font-toggle';
        fontToggle.textContent = 'Aa';
        fontToggle.title = 'Toggle font style';
        modalContent.appendChild(fontToggle);
        
        const closeButton = document.createElement('button');
        closeButton.className = 'tldr-close-button';
        closeButton.innerHTML = '&times;';
        modalContent.appendChild(closeButton);
        
        const title = document.createElement('h2');
        title.textContent = 'Executive Summary';
        title.style.color = '#F4E409'; // Yellow title
        modalContent.appendChild(title);
        
        const summary = document.createElement('p');
        summary.innerHTML = `In a digital landscape increasingly dominated by AI agents, access to authentic source data has become the new
digital gold. The 4GS Protocol introduces a groundbreaking paradigm: the first-ever Agent-to-Agent (A2A) Data
Brokerage system, specifically designed to capture, process, and distribute genuine source intelligence from
fragmented data sources.<br><br>Through a sophisticated network of AI agents working together, the protocol monitors,
captures, and aggregates data across multiple platforms. This cross-platform approach ensures capture of authentic
community signals at their source, rather than relying on downstream information. Our upstream data collection and
distribution system allows AI agents to tap into interactions, decisions, and insights that are typically difficult to
capture effectively. 4GS serves as a crucial upstream data provider in the AI agent ecosystem, ensuring that
downstream agents, humans, and organizations can leverage unique source data effectively. <br><br> 4GS not only delivers
raw data but also performs semantic aggregations to produce context-aware insights, enabling users to make
informed decisions. 4GS addresses a fundamental challenge in the AI industry by providing scalable access to
authentic, real-time human intelligence through both raw data and actionable insights.`;
        summary.style.fontFamily = 'Orbitron, sans-serif';
        summary.style.textAlign = 'justify';
        summary.style.color = '#FFFFFF'; // White text
        modalContent.appendChild(summary);
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add font toggle functionality
        let isDefaultFont = true;
        fontToggle.addEventListener('click', () => {
            isDefaultFont = !isDefaultFont;
            summary.style.fontFamily = isDefaultFont ? 'Orbitron, sans-serif' : 'Arial, sans-serif';
            fontToggle.classList.toggle('active');
        });
        
        // Add close functionality
        const closeModal = () => {
            gsap.to(modal, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.inOut",
                onComplete: () => modal.remove()
            });
        };
        
        closeButton.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Animate modal opening
        gsap.from(modalContent, {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: "power2.out"
        });
    });
}

// Update the load event listener
window.addEventListener('load', () => {
    console.log("Window load event fired");
    try {
        initializeButtons();
        // First show loader
        initLoader();
        
        // Initialize main visualization
        initializeNeurons();
        animate();
        startShapeMorphing();
        createSciFiText();
        initializeMobileMenu();
        initializeEasterEgg();
        initializeTLDR();
        
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
    } catch (error) {
        console.error("Error during initialization:", error);
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    resizeCanvas();
    initializeNeurons();
});

// Add near the end of the window.addEventListener('load', ...) function
function initializeButtons() {
    console.log("Initializing buttons...");
    
    // Create TLDR button
    const tldrButton = document.createElement('button');
    tldrButton.className = 'tldr-button';
    tldrButton.textContent = 'TLDR';
    document.body.appendChild(tldrButton);
    console.log("TLDR button created");

    // Create Read Litepaper button
    const litepaperButton = document.createElement('button');
    document.body.appendChild(litepaperButton);
    console.log("Litepaper button created");

    // Add event listeners
    tldrButton.addEventListener('click', () => {
        console.log("TLDR button clicked");
        // ... rest of click handler code
    });

    litepaperButton.addEventListener('click', () => {
        console.log("Litepaper button clicked");
        // ... rest of click handler code
    });
}

// Add error handling for GSAP
if (typeof gsap === 'undefined') {
    console.error("GSAP not loaded!");
} else {
    console.log("GSAP loaded successfully");
} 