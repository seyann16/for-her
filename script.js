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
    
    // Set initial size
    resizeCanvas();
    
    // Bind events
    bindEvents();
    
    // Preload audio (muted) to avoid delays
    audioPlayer.volume = 0;
    audioPlayer.play().then(() => {
        audioPlayer.pause();
        audioPlayer.volume = 1;
        audioPlayer.currentTime = 0;
    }).catch(() => {
        // Ignore errors on preload
    });
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
        
        // Start audio
        playAudio();
    }, 1000);
}

function playAudio() {
    if (!isMuted && !isAudioPlaying) {
        audioPlayer.play().then(() => {
            isAudioPlaying = true;
        }).catch((error) => {
            console.log('Audio autoplay failed:', error);
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
        this.maxSize = Math.random() * 35 + 45; // 45-80px (CSS pixels)
        this.petalCount = Math.floor(Math.random() * 3) + 6; // 6-8 petals
        
        // FIXED: Dynamic height that reaches ~50% of screen
        // This makes flowers bloom to the middle of the viewport
        this.maxStemHeight = canvasCssHeight * (0.45 + Math.random() * 0.1); // 45-55% of screen height
        
        this.growthSpeed = Math.random() * 0.025 + 0.015;
        this.swayAngle = Math.random() * Math.PI * 2;
        this.swaySpeed = Math.random() * 0.015 + 0.008;
        this.stemHeight = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
        this.color = this.getRandomPastelColor();
    }
    
    // Get colors from CSS variables to match theme
    getRandomPastelColor() {
        const computedStyle = getComputedStyle(document.documentElement);
        const palette = [
            computedStyle.getPropertyValue('--flower-pink').trim(),
            computedStyle.getPropertyValue('--flower-lavender').trim(),
            computedStyle.getPropertyValue('--flower-peach').trim(),
            computedStyle.getPropertyValue('--flower-white').trim(),
            '#FFE4E1',
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
    
    // FIXED: Growth logic using dynamic stem height
    update() {
        // Grow size
        if (this.size < this.maxSize) {
            this.size += this.growthSpeed * this.maxSize;
        }
        
        // Grow stem to dynamic max height
        if (this.stemHeight < this.maxStemHeight) {
            this.stemHeight += this.growthSpeed * this.maxStemHeight;
        }
        
        // Apply sway
        this.swayAngle += this.swaySpeed;
    }
    
    // FIXED: Draw method remains the same but now renders correctly scaled
    draw(ctx) {
        ctx.save();
        
        const swayOffsetX = Math.sin(this.swayAngle) * 8;
        const flowerY = this.y - this.stemHeight;
        
        // Draw stem
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
        
        // Draw leaves
        if (this.stemHeight > 20) {
            this.drawLeaf(ctx, this.x + swayOffsetX, flowerY + 20, -1);
            this.drawLeaf(ctx, this.x + swayOffsetX, flowerY + 40, 1);
        }
        
        // Move to flower head position
        ctx.translate(this.x + swayOffsetX, flowerY);
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
        
        // Draw flower center
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
    
    // Ensure proper sizing before animation starts
    setTimeout(() => {
        resizeCanvas();
        flowerCanvasEl.style.transition = 'opacity 1s ease';
        flowerCanvasEl.style.opacity = '1';
        
        // Spawn initial bouquet of flowers
        spawnInitialFlowers();
        
        // Start animation loop
        animateFlowers();
    }, 100);
}

// Global variable to store CSS pixel dimensions
let canvasCssWidth, canvasCssHeight;

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    
    // Store CSS pixel dimensions for flower calculations
    canvasCssWidth = window.innerWidth;
    canvasCssHeight = window.innerHeight;
    
    // Set actual canvas buffer size for high-DPI screens
    flowerCanvas.width = canvasCssWidth * dpr;
    flowerCanvas.height = canvasCssHeight * dpr;
    
    // CRITICAL: Scale the context to handle DPR
    // Use setTransform instead of scale() to prevent cumulative scaling on multiple resizes
    flowerCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    // Set CSS size (what the browser displays)
    flowerCanvas.style.width = canvasCssWidth + 'px';
    flowerCanvas.style.height = canvasCssHeight + 'px';
}

function spawnInitialFlowers() {
    const centerX = canvasCssWidth / 2;
    
    // ⚓ FIXED: Anchor flowers 20px from bottom edge
    const baseY = canvasCssHeight - 20;
    
    // Create a beautiful arrangement
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const angle = (Math.PI * 2 / 15) * i;
            const radius = Math.random() * 100 + 50;
            const x = centerX + Math.cos(angle) * radius;
            
            flowers.push(new Flower(x, baseY));
        }, i * 150);
    }
}

function spawnFlowerAtPosition(clientX, clientY) {
    // ⚓ FIXED: Use CSS pixel dimensions and 20px padding
    const rect = flowerCanvasEl.getBoundingClientRect();
    const x = clientX - rect.left;
    const baseY = canvasCssHeight - 20;
    
    // Add slight randomness for natural feel
    const randomX = x + (Math.random() - 0.5) * 40;
    
    flowers.push(new Flower(randomX, baseY));
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
    
    // Handle window resize with debouncing
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (flowerCanvasEl.style.display === 'block') {
                resizeCanvas();
            }
        }, 250);
    });
    
    // Handle visualViewport changes (mobile browser UI changes)
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            if (flowerCanvasEl.style.display === 'block') {
                resizeCanvas();
            }
        });
    }
}

function spawnFlowerAtPosition(clientX, clientY) {
    const rect = flowerCanvasEl.getBoundingClientRect();
    const x = clientX - rect.left;
    
    // Spawn from bottom of canvas, not where user clicked
    const y = flowerCanvas.height - 30; // 30px from bottom
    
    // Add slight randomness for natural feel
    const randomX = x + (Math.random() - 0.5) * 40;
    
    // Ensure x is within bounds
    const finalX = Math.max(40, Math.min(flowerCanvas.width - 40, randomX));
    
    flowers.push(new Flower(finalX, y));
}

// ==========================================
// START APPLICATION
// ==========================================
document.addEventListener('DOMContentLoaded', initializeApp);