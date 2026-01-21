// ==========================================
// SLIDES DATA
// ==========================================
const slides = [
    {
        id: 1,
        text: "Hello mommyyy, I've been doing a lot of thinking...",
        gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGFkbXI1cHdhN2I2ZW1ndHFiazV4NG1zY2tvODN1YTd2YXVib29sOCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/uVdJkHxTv0voGJ9wZL/giphy.gif"
    },
    {
        id: 2,
        text: "I hate what I did last night.",
        gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGFkbXI1cHdhN2I2ZW1ndHFiazV4NG1zY2tvODN1YTd2YXVib29sOCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/mi4ec226vjAkehSLk0/giphy.gif"
    },
    {
        id: 3,
        text: "I was wrong, and I really am so sorry.",
        gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGFkbXI1cHdhN2I2ZW1ndHFiazV4NG1zY2tvODN1YTd2YXVib29sOCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1miKtEDuir8wDVWd5F/giphy.gif"
    },
    {
        id: 4,
        text: "You mean everything to me. I love youuuu. Mwuahhh",
        gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDR4dXYwZXphOWw0YTNhOXFmMnFqenZkNGtkcW92ZnhjZW83YXp1MSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/MDJ9IbxxvDUQM/giphy.gif"
    },
    {
        id: 5,
        text: "So I made you this garden so you can smile again.",
        gifUrl: null // Final slide - no GIF
    }
];

// ==========================================
// GLOBAL VARIABLES
// ==========================================
let currentSlideIndex = 0;
let isTransitioning = false;
let flowerCanvas, flowerCtx;
let flowers = [];
let animationId;
let isAudioPlaying = false;
let isMuted = false;

// ==========================================
// DOM ELEMENTS
// ==========================================
const startOverlay = document.getElementById('start-overlay');
const startButton = document.getElementById('start-button');
const audioPlayer = document.getElementById('background-music');
const muteButton = document.getElementById('mute-button');
const unmuteIcon = document.getElementById('unmute-icon');
const muteIcon = document.getElementById('mute-icon');
const slideshowContainer = document.getElementById('slideshow-container');
const tapIndicator = document.getElementById('tap-indicator');
const flowerCanvasEl = document.getElementById('flower-canvas');

// ==========================================
// INITIALIZATION
// ==========================================
function initializeApp() {
    // Setup canvas
    setupCanvas();
    
    // Bind events
    bindEvents();
}

// ==========================================
// START OVERLAY LOGIC
// ==========================================
function handleStart() {
    // Hide start overlay
    startOverlay.classList.add('hidden');
    
    // Show slideshow container
    setTimeout(() => {
        slideshowContainer.classList.add('active');
        startOverlay.style.display = 'none';
        
        // Create and inject slides
        createSlides();
        
        // Show first slide
        const firstSlide = document.querySelector('.slide');
        if (firstSlide) {
            firstSlide.classList.add('active');
        }
        
        // Start audio (this will only work after user interaction)
        playAudio();
    }, 1000);
}

function playAudio() {
    if (!isMuted && !isAudioPlaying) {
        audioPlayer.play().then(() => {
            isAudioPlaying = true;
        }).catch((error) => {
            console.log('Audio autoplay failed:', error);
            // Audio will fail on mobile without user interaction, but we already handled that
        });
    }
}

function toggleMute() {
    isMuted = !isMuted;
    
    if (isMuted) {
        audioPlayer.pause();
        unmuteIcon.classList.add('hidden');
        muteIcon.classList.remove('hidden');
    } else {
        if (isAudioPlaying) {
            audioPlayer.play();
        }
        unmuteIcon.classList.remove('hidden');
        muteIcon.classList.add('hidden');
    }
    
    // Update button state
    muteButton.setAttribute('aria-pressed', isMuted);
}

// ==========================================
// SLIDE CREATION
// ==========================================
function createSlides() {
    slides.forEach((slide, index) => {
        const slideElement = createSlideElement(slide, index);
        slideshowContainer.appendChild(slideElement);
    });
}

function createSlideElement(slide, index) {
    const slideDiv = document.createElement('div');
    slideDiv.className = 'slide';
    slideDiv.dataset.index = index;
    
    const imageHtml = slide.gifUrl 
        ? `<img src="${slide.gifUrl}" alt="Slide ${slide.id}" class="slide-image">`
        : '';
    
    slideDiv.innerHTML = `
        ${imageHtml}
        <p class="slide-text">${slide.text}</p>
    `;
    
    return slideDiv;
}

// ==========================================
// SLIDESHOW LOGIC
// ==========================================
function handleNext() {
    if (isTransitioning) return;
    
    const allSlides = document.querySelectorAll('.slide');
    const totalSlides = allSlides.length;
    
    if (currentSlideIndex < totalSlides - 1) {
        isTransitioning = true;
        
        // Current slide exits
        const currentSlide = allSlides[currentSlideIndex];
        currentSlide.classList.add('exiting');
        
        setTimeout(() => {
            // Remove active and exiting classes
            currentSlide.classList.remove('active', 'exiting');
            
            // Move to next slide
            currentSlideIndex++;
            const nextSlide = allSlides[currentSlideIndex];
            nextSlide.classList.add('active');
            
            // Check if this is the final slide
            if (currentSlideIndex === totalSlides - 1) {
                hideTapIndicator();
                // Start flower animation after a brief pause
                setTimeout(startFlowerAnimation, 1200);
            }
            
            isTransitioning = false;
        }, 800);
    }
}

function hideTapIndicator() {
    tapIndicator.style.opacity = '0';
    setTimeout(() => {
        tapIndicator.style.display = 'none';
    }, 300);
}

// ==========================================
// FLOWER ANIMATION
// ==========================================
class Flower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 0;
        this.maxSize = Math.random() * 35 + 45; // 45-80px
        this.petalCount = Math.floor(Math.random() * 3) + 6; // 6-8 petals
        this.color = this.getRandomPastelColor();
        this.growthSpeed = Math.random() * 0.025 + 0.015;
        this.swayAngle = Math.random() * Math.PI * 2;
        this.swaySpeed = Math.random() * 0.015 + 0.008;
        this.stemHeight = 0;
        this.maxStemHeight = Math.random() * 60 + 40;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
    }
    
    // Get colors from CSS variables to match theme
    getRandomPastelColor() {
        const computedStyle = getComputedStyle(document.documentElement);
        const palette = [
            computedStyle.getPropertyValue('--flower-pink').trim(),
            computedStyle.getPropertyValue('--flower-lavender').trim(),
            computedStyle.getPropertyValue('--flower-peach').trim(),
            computedStyle.getPropertyValue('--flower-white').trim(),
            '#FFE4E1', // Additional soft colors
            '#F0E68C'
        ];
        return palette[Math.floor(Math.random() * palette.length)];
    }
    
    adjustColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
    
    update() {
        // Grow size
        if (this.size < this.maxSize) {
            this.size += this.growthSpeed * this.maxSize;
        }
        
        // Grow stem
        if (this.stemHeight < this.maxStemHeight) {
            this.stemHeight += this.growthSpeed * this.maxStemHeight;
        }
        
        // Apply sway
        this.swayAngle += this.swaySpeed;
    }
    
    draw(ctx) {
        ctx.save();
        
        const swayOffsetX = Math.sin(this.swayAngle) * 8;
        const flowerY = this.y - this.stemHeight;
        
        // Draw stem (natural green)
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.quadraticCurveTo(
            this.x + swayOffsetX * 0.5, 
            flowerY + this.stemHeight * 0.5,
            this.x + swayOffsetX, 
            flowerY
        );
        ctx.stroke();
        
        // Draw leaves (natural green)
        if (this.stemHeight > 20) {
            this.drawLeaf(ctx, this.x + swayOffsetX, flowerY + 20, -1);
            this.drawLeaf(ctx, this.x + swayOffsetX, flowerY + 40, 1);
        }
        
        // Move to flower head position
        ctx.translate(this.x + swayOffsetX, flowerY);
        
        // Apply subtle rotation
        ctx.rotate(Math.sin(this.swayAngle * 0.5) * 0.1);
        
        // Create gradient for petals
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.adjustColor(this.color, -30));
        
        // Draw petals
        for (let i = 0; i < this.petalCount; i++) {
            ctx.save();
            ctx.rotate((Math.PI * 2 / this.petalCount) * i);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            
            // Artistic petal shape using bezier curves
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(
                -this.size * 0.4, -this.size * 0.3,
                -this.size * 0.4, -this.size * 0.8,
                0, -this.size
            );
            ctx.bezierCurveTo(
                this.size * 0.4, -this.size * 0.8,
                this.size * 0.4, -this.size * 0.3,
                0, 0
            );
            
            ctx.fill();
            ctx.restore();
        }
        
        // Draw flower center (golden for contrast)
        const centerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 0.3);
        centerGradient.addColorStop(0, '#FFD700');
        centerGradient.addColorStop(1, '#FFA500');
        ctx.fillStyle = centerGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Add center detail dots
        ctx.fillStyle = '#FF8C00';
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const dotX = Math.cos(angle) * this.size * 0.15;
            const dotY = Math.sin(angle) * this.size * 0.15;
            ctx.beginPath();
            ctx.arc(dotX, dotY, this.size * 0.05, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    drawLeaf(ctx, x, y, side) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(side, 1);
        
        // Natural green for leaves
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(10, -10, 20, -10, 25, 0);
        ctx.bezierCurveTo(20, 10, 10, 10, 0, 0);
        ctx.fill();
        
        ctx.restore();
    }
}

// ==========================================
// CANVAS & ANIMATION
// ==========================================
function setupCanvas() {
    flowerCanvas = flowerCanvasEl;
    flowerCtx = flowerCanvas.getContext('2d');
}

function startFlowerAnimation() {
    // Hide slideshow
    slideshowContainer.style.opacity = '0';
    
    // Show canvas with fade-in
    flowerCanvasEl.style.display = 'block';
    flowerCanvasEl.style.opacity = '0';
    setTimeout(() => {
        flowerCanvasEl.style.transition = 'opacity 1s ease';
        flowerCanvasEl.style.opacity = '1';
    }, 100);
    
    // Set canvas size
    resizeCanvas();
    
    // Spawn initial bouquet of flowers
    spawnInitialFlowers();
    
    // Start animation loop
    animateFlowers();
}

function resizeCanvas() {
    flowerCanvas.width = window.innerWidth;
    flowerCanvas.height = window.innerHeight;
}

function spawnInitialFlowers() {
    const centerX = flowerCanvas.width / 2;
    const centerY = flowerCanvas.height / 2;
    
    // Create a beautiful arrangement
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const angle = (Math.PI * 2 / 15) * i;
            const radius = Math.random() * 100 + 50;
            const x = centerX + Math.cos(angle) * radius;
            const y = flowerCanvas.height - 50;
            
            flowers.push(new Flower(x, y));
        }, i * 150);
    }
}

function animateFlowers() {
    flowerCtx.clearRect(0, 0, flowerCanvas.width, flowerCanvas.height);
    
    // Draw all flowers
    flowers.forEach(flower => {
        flower.update();
        flower.draw(flowerCtx);
    });
    
    animationId = requestAnimationFrame(animateFlowers);
}

// ==========================================
// EVENT BINDING
// ==========================================
function bindEvents() {
    // Start button click
    startButton.addEventListener('click', handleStart);
    
    // Mute button click
    muteButton.addEventListener('click', toggleMute);
    
    // Advance slideshow on tap/click
    document.addEventListener('click', handleNext);
    document.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleNext();
    });
    
    // Add flowers on canvas interaction
    flowerCanvasEl.addEventListener('click', (e) => {
        if (flowerCanvasEl.style.display === 'block') {
            spawnFlowerAtPosition(e.clientX, e.clientY);
        }
    });
    
    flowerCanvasEl.addEventListener('touchstart', (e) => {
        if (flowerCanvasEl.style.display === 'block') {
            e.preventDefault();
            const touch = e.touches[0];
            spawnFlowerAtPosition(touch.clientX, touch.clientY);
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (flowerCanvasEl.style.display === 'block') {
            resizeCanvas();
        }
    });
}

function spawnFlowerAtPosition(clientX, clientY) {
    const rect = flowerCanvasEl.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = rect.bottom - 50; // Base of the screen
    
    // Add slight randomness for natural feel
    const randomX = x + (Math.random() - 0.5) * 40;
    
    flowers.push(new Flower(randomX, y));
}

// ==========================================
// START APPLICATION
// ==========================================
document.addEventListener('DOMContentLoaded', initializeApp);