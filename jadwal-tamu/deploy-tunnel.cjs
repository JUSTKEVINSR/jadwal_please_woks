const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
// Try to find cloudflared in common locations or use PATH
const possiblePaths = [
    'cloudflared', // PATH
    'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe',
    'C:\\Program Files\\cloudflared\\cloudflared.exe'
];

let cloudflaredPath = 'cloudflared';

// Function to check if command exists
function getCloudflaredPath() {
    for (const p of possiblePaths) {
        try {
            execSync(`"${p}" --version`, { stdio: 'ignore' });
            return p;
        } catch (e) {
            // content
        }
    }
    console.error("❌ cloudflared not found! Please install it first.");
    process.exit(1);
}

cloudflaredPath = getCloudflaredPath();
console.log(`✅ Using cloudflared at: ${cloudflaredPath}`);

// Regex to capture the URL
const urlRegex = /https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/;

function startTunnel(port, label) {
    return new Promise((resolve, reject) => {
        console.log(`🚀 Starting ${label} tunnel on port ${port}...`);

        const tunnel = spawn(cloudflaredPath, ['tunnel', '--url', `http://127.0.0.1:${port}`]);

        let url = null;

        tunnel.stderr.on('data', (data) => {
            const output = data.toString();
            // console.log(`[${label} Log]: ${output}`); // Uncomment for debug

            const match = output.match(urlRegex);
            if (match && !url) {
                const capturedUrl = match[0];
                // Ignore generic API domains that might appear in logs
                if (!capturedUrl.includes('api.trycloudflare.com')) {
                    url = capturedUrl;
                    console.log(`🎉 ${label} Tunnel Created: ${url}`);
                    resolve({ process: tunnel, url: url });
                }
            }
        });

        tunnel.on('error', (err) => {
            console.error(`❌ Failed to start ${label} tunnel:`, err);
            reject(err);
        });
    });
}

(async () => {
    try {
        // 1. Start Reverb Tunnel (Port 8080) first to get the URL for config
        const reverbTunnel = await startTunnel(8080, 'Reverb (WebSocket)');

        // 2. Start App Tunnel (Port 8000)
        const appTunnel = await startTunnel(8000, 'App (Web)');

        // 3. Update bootstrap.js
        const bootstrapPath = path.join(__dirname, 'resources', 'js', 'bootstrap.js');
        let content = fs.readFileSync(bootstrapPath, 'utf8');

        // Extract just the domain from the URL (remove https://)
        const reverbDomain = reverbTunnel.url.replace('https://', '');

        // Regex to replace the reverbHost line we added earlier
        // It looks for: const reverbHost = isCloudflare ? '...' : ...
        const dbConfigRegex = /const reverbHost = isCloudflare \? '[^']+' : import\.meta\.env\.VITE_REVERB_HOST;/;
        const newConfigLine = `const reverbHost = isCloudflare ? '${reverbDomain}' : import.meta.env.VITE_REVERB_HOST;`;

        if (dbConfigRegex.test(content)) {
            content = content.replace(dbConfigRegex, newConfigLine);
            fs.writeFileSync(bootstrapPath, content);
            console.log(`✅ Updated bootstrap.js with new Reverb URL: ${reverbDomain}`);
        } else {
            console.error("⚠️ Could not find the Reverb configuration line in bootstrap.js. Please check manual guide.");
        }

        // 4. Build Assets
        console.log("🔨 Building production assets (npm run build)...");
        execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
        console.log("✅ Build complete!");

        console.log("\n" + "=".repeat(50));
        console.log("🎉  DEPLOYMENT READY!");
        console.log(`🌍  App URL:      ${appTunnel.url}`);
        console.log(`🔌  Reverb URL:   ${reverbTunnel.url}`);
        console.log("=".repeat(50));
        console.log("\nPress Ctrl+C to stop the tunnels.");

        // Keep processes alive
        process.on('SIGINT', () => {
            console.log("\n🛑 Stopping tunnels...");
            reverbTunnel.process.kill();
            appTunnel.process.kill();
            process.exit();
        });

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
})();
