// Add this to script.js or create new logo.js
class HealthGuardLogo {
    constructor() {
        this.createLogo();
    }
    
    createLogo() {
        const logoContainer = document.createElement('div');
        logoContainer.className = 'healthguard-logo';
        logoContainer.innerHTML = `
            <div class="logo-shield">
                <div class="logo-heart">
                    <i class="fas fa-heartbeat"></i>
                </div>
                <div class="logo-ai">AI</div>
                <div class="logo-pulse-ring ring-1"></div>
                <div class="logo-pulse-ring ring-2"></div>
                <div class="logo-pulse-ring ring-3"></div>
            </div>
            <div class="logo-text">
                <h1>Health Guard AI</h1>
                <p>Medical Assistant</p>
            </div>
        `;
        
        return logoContainer;
    }
}

// Add CSS for animated logo
const logoStyles = `
.healthguard-logo {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px;
}

.logo-shield {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #10a37f, #25c2a0);
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 4px 12px rgba(16, 163, 127, 0.3);
}

.logo-heart {
    color: white;
    font-size: 24px;
    z-index: 2;
}

.logo-ai {
    position: absolute;
    bottom: 5px;
    color: white;
    font-size: 10px;
    font-weight: bold;
    background: rgba(0,0,0,0.2);
    padding: 2px 6px;
    border-radius: 10px;
    z-index: 2;
}

.logo-pulse-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 15px;
    border: 2px solid rgba(255,255,255,0.3);
    animation: logoPulse 2s infinite;
}

.ring-1 { animation-delay: 0s; }
.ring-2 { animation-delay: 0.7s; }
.ring-3 { animation-delay: 1.4s; }

@keyframes logoPulse {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(1.5); opacity: 0; }
}

.logo-text h1 {
    margin: 0;
    font-size: 24px;
    background: linear-gradient(135deg, #10a37f, #25c2a0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.logo-text p {
    margin: 0;
    font-size: 12px;
    color: #8e8ea0;
}
`;