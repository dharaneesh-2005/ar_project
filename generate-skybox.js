// Generate a tactical shooter environment skybox
function generateTacticalSkybox() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Dark base
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f1419');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw buildings/walls
    ctx.fillStyle = '#1e2a3a';
    for (let i = 0; i < 8; i++) {
        const x = (canvas.width / 8) * i;
        const height = 300 + Math.random() * 200;
        ctx.fillRect(x, canvas.height - height, canvas.width / 8 - 20, height);
        
        // Windows
        ctx.fillStyle = '#3a4a5a';
        for (let j = 0; j < 5; j++) {
            for (let k = 0; k < 3; k++) {
                ctx.fillRect(x + 20 + k * 50, canvas.height - height + 50 + j * 60, 30, 40);
            }
        }
        ctx.fillStyle = '#1e2a3a';
    }
    
    // Accent lights
    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
    for (let i = 0; i < 20; i++) {
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 3, 3);
    }
    
    return canvas.toDataURL();
}

// Apply on scene load
AFRAME.registerComponent('tactical-skybox', {
    init: function() {
        const skyboxData = generateTacticalSkybox();
        this.el.setAttribute('src', skyboxData);
    }
});
