// ==================== CONFIGURATION ====================
// Birthday Date: January 15, 2026 at 12:00 AM
// For testing with 1 minute countdown:
let targetBirthday = new Date(new Date().getTime() + 60 * 1000); // 1 minute from now for testing
// For production, change to: new Date(2026, 0, 15, 0, 0, 0); // January 15, 2026, 12:00 AM

// Flag to prevent triggering celebration multiple times
let celebrationTriggered = false;

// Detect device type for performance optimization
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTablet = /iPad|Android(?!.*Mobile)/.test(navigator.userAgent);
const isLowBattery = navigator.getBattery ? navigator.getBattery() : null;

// Mobile optimizations
if (isMobile || isTablet) {
    // Disable hover effects on touch devices
    document.addEventListener('touchstart', function(){}, {passive: true});
    
    // Optimize animations for mobile
    document.documentElement.style.setProperty('--animation-duration', '0.8s');
    
    // Prevent pinch zoom
    document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
    }, {passive: false});
}

// ==================== PARTICLE SYSTEM ====================
class Particle {
    constructor(x, y, type = 'spark', colorHue = null) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = 1;
        
        // Reduce particle life on mobile for better performance
        const lifeReduction = isMobile ? 0.6 : 1;
        this.maxLife = (Math.random() * 80 + 60) * lifeReduction;
        
        // Physics with gravity and friction
        this.vx = (Math.random() - 0.5) * 12;
        this.vy = (Math.random() - 0.5) * 12 - 5; // Launch upward initially
        this.ax = (Math.random() - 0.5) * 0.1;
        this.ay = 0.3; // gravity
        this.friction = 0.98; // friction coefficient
        
        if (type === 'spark') {
            this.size = Math.random() * 5 + 2;
            // Use provided hue or random vibrant colors
            if (colorHue !== null) {
                this.color = `hsl(${colorHue}, 100%, ${Math.random() * 40 + 50}%)`;
            } else {
                const colors = [0, 30, 60, 120, 180, 240, 300];
                this.color = `hsl(${colors[Math.floor(Math.random() * colors.length)]}, 100%, ${Math.random() * 40 + 50}%)`;
            }
        } else if (type === 'rose') {
            this.size = Math.random() * 8 + 4;
            this.emoji = '🌹';
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 10;
        } else if (type === 'sparkle') {
            this.size = Math.random() * 6 + 2;
            if (colorHue !== null) {
                this.color = `hsl(${colorHue}, 100%, ${Math.random() * 40 + 60}%)`;
            } else {
                this.color = `hsl(${Math.random() * 60 + 300}, 100%, ${Math.random() * 30 + 60}%)`;
            }
            this.brightness = Math.random() * 0.5 + 0.5;
        }
    }
    
    update() {
        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Apply acceleration
        this.vx += this.ax;
        this.vy += this.ay;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        
        if (this.type === 'rose') {
            this.rotation += this.rotationSpeed;
        }
    }
    
    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        
        if (this.type === 'spark') {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        } else if (this.type === 'rose') {
            ctx.globalAlpha = alpha;
            ctx.font = `${this.size}px Arial`;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.fillText(this.emoji, 0, 0);
            ctx.restore();
            ctx.globalAlpha = 1;
        } else if (this.type === 'sparkle') {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = alpha * this.brightness;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Outer glow
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = alpha * this.brightness * 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
    
    isAlive() {
        return this.life > 0;
    }
}

// ==================== CANVAS PARTICLE ANIMATION ====================
let canvas = null;
let ctx = null;
let particles = [];
let animationId = null;

function initializeCanvas() {
    canvas = document.getElementById('particleCanvas');
    ctx = canvas.getContext('2d');
    
    console.log('📐 Canvas initialized:', { canvas, ctx, width: canvas.width, height: canvas.height });
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // TEST: Draw initial test pattern
    setTimeout(() => {
        if (ctx && canvas.width > 0) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(0, 0, 100, 100);
            console.log('✅ Canvas test: Drew red rectangle');
        }
    }, 100);
    
    // Start animation loop
    animate();
}

function resizeCanvas() {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

function animate() {
    if (!ctx) {
        console.error('❌ Canvas context is not initialized!');
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particles = particles.filter(p => p.isAlive());
    if (particles.length > 0) {
        console.log(`🎨 Rendering ${particles.length} particles at canvas size ${canvas.width}x${canvas.height}`);
    }
    particles.forEach(p => {
        p.update();
        p.draw(ctx);
    });
    
    animationId = requestAnimationFrame(animate);
}

function addParticle(x, y, type = 'spark', colorHue = null) {
    particles.push(new Particle(x, y, type, colorHue));
    console.log(`✨ Particle added. Total particles: ${particles.length}`);
}

function createBurst(x, y, count = 20, type = 'spark', colorHue = null) {
    // Reduce particle count on mobile devices
    let adjustedCount = count;
    if (isMobile) {
        adjustedCount = Math.ceil(count * 0.5); // 50% less particles on mobile
    } else if (isTablet) {
        adjustedCount = Math.ceil(count * 0.75); // 25% less on tablet
    }
    
    for (let i = 0; i < adjustedCount; i++) {
        addParticle(x, y, type, colorHue);
    }
}

// ==================== CURSOR TRACKING ====================
function initCursorGlow() {
    // Skip cursor glow on touch devices
    if (isMobile || isTablet) {
        return;
    }
    
    const cursorGlow = document.getElementById('cursorGlow');
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursorGlow.style.left = (mouseX - 20) + 'px';
        cursorGlow.style.top = (mouseY - 20) + 'px';
        
        if (!cursorGlow.classList.contains('active')) {
            cursorGlow.classList.add('active');
        }
        
        // Create sparkles at cursor (reduce frequency on low-end devices)
        if (Math.random() > (isMobile ? 0.85 : 0.7)) {
            createBurst(mouseX, mouseY, 1, 'sparkle');
        }
    });
    
    document.addEventListener('mouseleave', () => {
        cursorGlow.classList.remove('active');
    });
}

// ==================== FLOATING ELEMENTS ====================
function createFloatingElements() {
    const container = document.getElementById('floatingElements');
    const elements = ['🌹', '💕', '✨', '💖', '🎀', '💫', '🌸'];
    // Reduce floating elements on mobile
    const elementCount = isMobile ? 4 : 8;
    
    for (let i = 0; i < elementCount; i++) {
        const elem = document.createElement('div');
        elem.className = 'floating-element';
        elem.textContent = elements[Math.floor(Math.random() * elements.length)];
        elem.style.left = Math.random() * 100 + '%';
        elem.style.animationDuration = (Math.random() * 4 + 8) + 's';
        elem.style.animationDelay = (Math.random() * 5) + 's';
        elem.style.fontSize = (Math.random() * 1.5 + 1.5) + 'rem';
        
        container.appendChild(elem);
    }
}

// ==================== COUNTDOWN TIMER ====================
function setNextBirthday() {
    const now = new Date();
    if (targetBirthday < now) {
        targetBirthday = new Date(now.getFullYear() + 1, targetBirthday.getMonth(), targetBirthday.getDate(), 0, 0, 0);
    }
}

// Create background stars
function createStars() {
    const starsContainer = document.querySelector('.stars');
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = (Math.random() * 3 + 1) + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = (Math.random() * 3) + 's';
        starsContainer.appendChild(star);
    }
}

function updateCountdown() {
    const now = new Date();
    const timeRemaining = targetBirthday - now;
    
    if (timeRemaining <= 0) {
        // Birthday time reached!
        if (!celebrationTriggered) {
            celebrationTriggered = true;
            document.getElementById('countdownSection').style.display = 'none';
            document.getElementById('lovelyPopup').style.display = 'none';
            document.getElementById('celebrationSection').style.display = 'flex';
            triggerCelebration();
        }
        return;
    }
    
    // Check if less than 1 hour remaining
    if (timeRemaining < 3600000 && timeRemaining > 0) { // 1 hour in milliseconds
        showLovelyPopup();
    }
    
    // Calculate hours, minutes, seconds
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    // Update countdown display
    document.getElementById('hours').textContent = padZero(hours);
    document.getElementById('minutes').textContent = padZero(minutes);
    document.getElementById('seconds').textContent = padZero(seconds);
    
    // Update popup timer if visible
    if (document.getElementById('lovelyPopup').style.display !== 'none') {
        document.getElementById('popupTimer').textContent = `${padZero(minutes)}:${padZero(seconds)}`;
    }
    
    // Update message
    updateCountdownMessage(hours, minutes, seconds);
}

// Pad number with zero
function padZero(num) {
    return num < 10 ? '0' + num : num;
}

// Update countdown message
function updateCountdownMessage(hours, minutes, seconds) {
    const messageElement = document.getElementById('countdownMessage');
    
    if (hours > 1) {
        messageElement.textContent = `Just ${hours} hours and ${minutes} minutes away... The magic is coming! ✨`;
    } else if (hours === 1) {
        messageElement.textContent = `Only 1 hour and ${minutes} minutes left... Can you feel the magic? 💫`;
    } else if (minutes > 5) {
        messageElement.textContent = `${minutes} minutes until the magic moment... Get ready! 🎊`;
    } else if (minutes > 0) {
        messageElement.textContent = `Just ${minutes} minutes away! The best moment is almost here! 🎉`;
    } else {
        messageElement.textContent = `${seconds} seconds... Here comes the magic! ✨`;
    }
}

// Show lovely popup when less than 1 hour remaining
let popupShown = false;
function showLovelyPopup() {
    if (!popupShown) {
        document.getElementById('lovelyPopup').style.display = 'flex';
        popupShown = true;
    }
}

// Close popup
function closePopup() {
    document.getElementById('lovelyPopup').style.display = 'none';
}

// ==================== BALLOON ANIMATION ====================
function createBalloons() {
    const container = document.getElementById('balloonsContainer');
    if (!container) return;
    
    // Clear any existing balloons
    container.innerHTML = '';
    
    // Color palette matching the rainbow text
    const colors = [
        '#ff6b6b',  // Red
        '#ffa94d',  // Orange
        '#ffd43b',  // Yellow
        '#51cf66',  // Green
        '#4d96ff',  // Blue
        '#b197fc',  // Purple
        '#ff8787'   // Light Red
    ];
    
    // Create 6-8 balloons for better visual coverage
    const balloonCount = isMobile ? 5 : 8;
    
    for (let i = 0; i < balloonCount; i++) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        
        // Assign colors in sequence with some randomization
        const colorIndex = (i + Math.floor(Math.random() * colors.length)) % colors.length;
        balloon.style.backgroundColor = colors[colorIndex];
        
        // Random horizontal position (5% to 95% of width)
        const leftPosition = Math.random() * 90 + 5;
        balloon.style.left = leftPosition + '%';
        
        // Random delay for staggered animation
        const delay = Math.random() * 0.5;
        balloon.style.animationDelay = delay + 's';
        
        // Random sway amount
        const sway = (Math.random() * 100 - 50);
        balloon.style.setProperty('--sway', sway + 'px');
        
        // Vary animation duration slightly for natural effect
        const duration = 6 + Math.random() * 2;
        balloon.style.animationDuration = duration + 's';
        
        container.appendChild(balloon);
    }
}

// ==================== CELEBRATION EFFECTS ====================

// Animated text - letters appearing from bottom one by one
function startAnimatedText() {
    const textContainer = document.getElementById('wishesContent');
    if (!textContainer) return;
    
    // Hide the original text
    const rainbowText = textContainer.querySelector('.rainbow-text');
    if (rainbowText) rainbowText.style.display = 'none';
    
    const text = "HAPPY BIRTHDAY\nto You";
    const lines = text.split('\n');
    
    // Create container for animated letters
    const animContainer = document.createElement('div');
    animContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        z-index: 998;
    `;
    
    let letterDelay = 0;
    
    lines.forEach((line, lineIndex) => {
        const lineDiv = document.createElement('div');
        lineDiv.style.cssText = `
            display: flex;
            gap: 8px;
            justify-content: center;
            flex-wrap: wrap;
        `;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const letterSpan = document.createElement('span');
            
            if (char === ' ') {
                letterSpan.innerHTML = '&nbsp;';
                letterSpan.style.width = '30px';
            } else {
                letterSpan.textContent = char;
            }
            
            // Rainbow colors for each letter
            const colors = ['#FF0000', '#FF7700', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF'];
            const colorIndex = (lineIndex * 10 + i) % colors.length;
            const color = colors[colorIndex];
            
            letterSpan.style.cssText = `
                font-size: 72px;
                font-weight: 900;
                color: ${color};
                text-shadow: 0 0 30px ${color}, 0 0 60px ${color};
                position: relative;
                opacity: 0;
                transform: translateY(200px);
                animation: letterPopUp 0.8s ease-out forwards;
                animation-delay: ${letterDelay}s;
                font-family: Arial, sans-serif;
                letter-spacing: 5px;
            `;
            
            lineDiv.appendChild(letterSpan);
            letterDelay += 0.1;
        }
        
        animContainer.appendChild(lineDiv);
    });
    
    textContainer.appendChild(animContainer);
    
    // Add CSS animation if not already present
    if (!document.getElementById('letterAnimStyle')) {
        const style = document.createElement('style');
        style.id = 'letterAnimStyle';
        style.textContent = `
            @keyframes letterPopUp {
                0% {
                    opacity: 0;
                    transform: translateY(200px);
                }
                50% {
                    opacity: 1;
                }
                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function triggerCelebration() {
    console.log('🎉 triggerCelebration called!');
    
    // TEST: Draw red circle on canvas to verify it works
    if (ctx) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(window.innerWidth / 2, window.innerHeight / 2, 50, 0, Math.PI * 2);
        ctx.fill();
        console.log('✅ TEST: Drew red circle on canvas');
    }
    
    // Create falling balloons first
    createBalloons();
    
    // Continuous celebration animations
    startRosePetalAnimation();
    startCelebrationAnimation();
    
    // Start animated text effect - letters appearing from bottom
    startAnimatedText();
    
    // Start countdown timer for celebration page
    startCelebrationCountdown();
    
    // Auto-transition to dashboard after 5 seconds
    setTimeout(() => {
        transitionToDashboard();
    }, 5000);
}

// REAL FIREWORKS - Like New Year's Eve
function startBottomFireworks() {
    console.log('🎇 FIREWORKS STARTED!');
    
    const colors = [
        '#FF0000', '#FF3300', '#FF6600', '#FF9900', // reds and oranges
        '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF' // yellows, greens, cyans, blues, magentas
    ];
    
    const container = document.getElementById('celebrationSection');
    
    // Create multiple bursts at different times
    function createBurst() {
        // Random position across top half of screen
        const burstX = Math.random() * window.innerWidth;
        const burstY = Math.random() * (window.innerHeight * 0.6) + (window.innerHeight * 0.1); // Top 60% of screen
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Create 80-100 particles per burst
        const particleCount = 80 + Math.floor(Math.random() * 20);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            
            // Explode in all directions from burst point
            const angle = (i / particleCount) * Math.PI * 2; // Full circle
            const velocity = 18 + Math.random() * 22; // FASTER: 18-40 instead of 8-18
            
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            const size = 3 + Math.random() * 4;
            const duration = 1.2 + Math.random() * 1; // FASTER: 1.2-2.2 seconds instead of 2-3.5
            
            particle.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                box-shadow: 0 0 ${size * 3}px ${color}, inset 0 0 ${size}px rgba(255,255,255,0.8);
                pointer-events: none;
                left: ${burstX}px;
                top: ${burstY}px;
                z-index: 999;
                filter: brightness(1.5);
            `;
            
            container.appendChild(particle);
            
            // Animate particle with gravity physics
            let elapsed = 0;
            const gravity = 0.35; // FASTER: increased gravity
            let currentVy = vy;
            
            const animate = () => {
                elapsed += 16;
                const progress = elapsed / (duration * 1000);
                
                if (progress < 1) {
                    // Apply gravity
                    currentVy += gravity;
                    
                    const x = vx * elapsed / 100;
                    const y = vy * elapsed / 100 + (gravity * elapsed * elapsed) / 20000;
                    
                    // Fade out over time
                    const opacity = Math.max(0, 1 - progress);
                    
                    particle.style.left = (burstX + x) + 'px';
                    particle.style.top = (burstY + y) + 'px';
                    particle.style.opacity = opacity;
                    
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };
            
            requestAnimationFrame(animate);
        }
    }
    
    // Launch multiple firework bursts
    createBurst(); // Immediate burst
    
    let burstCount = 1;
    const burstInterval = setInterval(() => {
        if (document.getElementById('celebrationSection').style.display === 'none') {
            clearInterval(burstInterval);
            return;
        }
        
        createBurst();
        burstCount++;
        
        // Create 8 bursts total during 20 second celebration
        if (burstCount >= 8) {
            clearInterval(burstInterval);
        }
    }, 2500); // Launch a new burst every 2.5 seconds
    
    console.log('✅ Fireworks started - 8 bursts scheduled!');
}

// Transition to dashboard
function transitionToDashboard() {
    document.getElementById('celebrationSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'flex';
    initializeDashboard();
}

function startRosePetalAnimation() {
    const interval = setInterval(() => {
        if (document.getElementById('celebrationSection').style.display === 'none') {
            clearInterval(interval);
            return;
        }
        
        // Reduce frequency on mobile
        const frequency = isMobile ? 800 : 400;
        
        const x = Math.random() * window.innerWidth;
        createBurst(x, -20, isMobile ? 1 : 3, 'rose');
    }, isMobile ? 800 : 400);
}

function startCelebrationAnimation() {
    const celebrationSection = document.getElementById('celebrationSection');
    let duration = 0;
    
    // Adjust animation speed based on device
    const animationSpeed = isMobile ? 400 : 200;
    
    const interval = setInterval(() => {
        if (celebrationSection.style.display === 'none') {
            clearInterval(interval);
            return;
        }
        
        duration++;
        
        // Create confetti (reduce on mobile)
        const x = Math.random() * window.innerWidth;
        createBurst(x, -10, isMobile ? 2 : 5, 'sparkle');
        
        // Occasional spark bursts (reduce on mobile)
        if (duration % (isMobile ? 6 : 3) === 0) {
            const randomX = Math.random() * window.innerWidth;
            const randomY = Math.random() * window.innerHeight * 0.7;
            createBurst(randomX, randomY, isMobile ? 5 : 10, 'spark');
        }
    }, isMobile ? 400 : 200);
}

// Splash animation - starts when celebration begins
function startSplashAnimation() {
    // Optional visual effect on celebration start
    console.log('🌊 Splash animation started');
    setupInteractiveFireworks();
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    // Ensure all critical elements exist before proceeding
    const criticalElements = ['countdownSection', 'celebrationSection', 'dashboardSection', 'imageLightbox'];
    const missingElements = criticalElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('❌ Missing critical HTML elements:', missingElements);
        return;
    }
    
    // Mobile optimizations
    if (isMobile) {
        // Prevent double-tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            let now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Enable fast tap
        document.body.style.webkitTouchCallout = 'none';
        document.body.style.webkitUserSelect = 'none';
    }
    
    initializeCanvas();
    createStars();
    createFloatingElements();
    initCursorGlow();
    setNextBirthday();
    
    // Update countdown immediately
    updateCountdown();
    
    // Update every second
    setInterval(updateCountdown, 1000);
    
    // Periodic sparkle burst on countdown page (reduce frequency on mobile)
    const sparkleFrequency = isMobile ? 4000 : 2000;
    const sparkleInterval = setInterval(() => {
        if (document.getElementById('countdownSection').style.display !== 'none') {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            createBurst(x, y, isMobile ? 1 : 2, 'sparkle');
        }
    }, sparkleFrequency);
    
    // Add touch support for mobile devices
    if (isMobile || isTablet) {
        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            createBurst(touch.clientX, touch.clientY, 3, 'sparkle');
        }, { passive: true });
    }

    // Start splash animation after celebration begins
    const originalDisplay = document.getElementById('celebrationSection').style.display;
    const checkCelebration = setInterval(() => {
        if (document.getElementById('celebrationSection').style.display !== 'none') {
            startSplashAnimation();
            clearInterval(checkCelebration);
        }
    }, 100);
});

// ==================== PUBLIC API ====================
function setBirthdayDate(year, month, day, hour = 0, minute = 0, second = 0) {
    targetBirthday = new Date(year, month - 1, day, hour, minute, second);
}

// Close popup when clicking/tapping outside
document.addEventListener('click', function(event) {
    const popup = document.getElementById('lovelyPopup');
    if (popup && popup.style.display === 'flex' && event.target === popup) {
        closePopup();
    }
});

// Touch support for popup close
document.addEventListener('touchstart', function(event) {
    const popup = document.getElementById('lovelyPopup');
    if (popup && popup.style.display === 'flex' && event.target === popup) {
        closePopup();
    }
}, { passive: true });

// ==================== DASHBOARD FUNCTIONALITY ====================
function initializeDashboard() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        // Handle both click and touch
        const handlePageChange = function() {
            const pageName = this.getAttribute('data-page');
            showDashboardPage(pageName);
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        };
        
        button.addEventListener('click', handlePageChange);
        button.addEventListener('touchend', handlePageChange);
    });
}

function showDashboardPage(pageName) {
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.style.display = 'none');
    
    const selectedPage = document.getElementById(`${pageName}-page`);
    if (selectedPage) {
        selectedPage.style.display = 'block';
    }
}

// ==================== CELEBRATION COUNTDOWN TIMER ====================
let celebrationCountdownInterval = null;

function startCelebrationCountdown() {
    let remainingSeconds = 5;
    const countdownElement = document.getElementById('celebrationCountdown');
    
    // Display initial value
    countdownElement.textContent = remainingSeconds;
    
    // Clear any existing countdown
    if (celebrationCountdownInterval) {
        clearInterval(celebrationCountdownInterval);
    }
    
    celebrationCountdownInterval = setInterval(() => {
        remainingSeconds--;
        countdownElement.textContent = remainingSeconds;
        
        // Stop countdown when time runs out
        if (remainingSeconds <= 0) {
            clearInterval(celebrationCountdownInterval);
            celebrationCountdownInterval = null;
        }
    }, 1000);
}

// ==================== INTERACTIVE FIREWORKS ====================
// Touch/Click handler for launching fireworks at specific position
function setupInteractiveFireworks() {
    const celebrationSection = document.getElementById('celebrationSection');
    if (!celebrationSection) return;
    
    const colors = ['#FF0000', '#FF3300', '#FF6600', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF'];
    
    function createInteractiveFirework(x, y) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Create 60 particles for click/touch
        const particleCount = 60;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            
            // Explode in all directions
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = 12 + Math.random() * 18;
            
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            const size = 3 + Math.random() * 4;
            const duration = 1 + Math.random() * 0.8;
            
            particle.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                box-shadow: 0 0 ${size * 3}px ${color};
                pointer-events: none;
                left: ${x}px;
                top: ${y}px;
                z-index: 999;
                filter: brightness(1.5);
            `;
            
            celebrationSection.appendChild(particle);
            
            let elapsed = 0;
            const gravity = 0.3;
            
            const animate = () => {
                elapsed += 16;
                const progress = elapsed / (duration * 1000);
                
                if (progress < 1) {
                    const px = vx * elapsed / 100;
                    const py = vy * elapsed / 100 + (gravity * elapsed * elapsed) / 20000;
                    const opacity = Math.max(0, 1 - progress);
                    
                    particle.style.left = (x + px) + 'px';
                    particle.style.top = (y + py) + 'px';
                    particle.style.opacity = opacity;
                    
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };
            
            requestAnimationFrame(animate);
        }
    }
    
    // Mouse click handler
    document.addEventListener('click', (e) => {
        if (document.getElementById('celebrationSection').style.display !== 'none') {
            createInteractiveFirework(e.clientX, e.clientY);
        }
    }, false);
    
    // Touch handler for mobile
    document.addEventListener('touchstart', (e) => {
        if (document.getElementById('celebrationSection').style.display !== 'none' && e.touches.length > 0) {
            const touch = e.touches[0];
            createInteractiveFirework(touch.clientX, touch.clientY);
        }
    }, { passive: true });
}
