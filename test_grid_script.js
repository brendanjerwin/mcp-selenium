#!/usr/bin/env node

// Simple test script to verify grid screenshot functionality
import pkg from 'selenium-webdriver';
const { Builder, By } = pkg;
import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';
import { promises as fs } from 'fs';

async function testGridScreenshot() {
    console.log('Starting browser...');
    
    const options = new ChromeOptions();
    options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage', '--window-size=1200,800');
    
    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        // Navigate to our test HTML file
        console.log('Navigating to test page...');
        const testFile = `file://${process.cwd()}/tmp/test_grid.html`;
        await driver.get(testFile);
        
        // Wait a moment for page to load
        await driver.sleep(1000);
        
        console.log('Injecting grid overlay...');
        
        // Inject the same grid overlay script from our server.js
        const grid_spacing = 50;
        const show_coordinates = true;
        const highlight_clickables = true;
        
        const gridOverlayScript = `
            // Remove any existing grid overlay
            const existingOverlay = document.getElementById('mcp-grid-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
            
            // Create main grid overlay container
            const gridOverlay = document.createElement('div');
            gridOverlay.id = 'mcp-grid-overlay';
            gridOverlay.style.cssText = \`
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 2147483647;
                font-family: monospace;
                font-size: 10px;
            \`;
            
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Add vertical grid lines - ensure they fill the entire viewport
            for (let x = 0; x <= viewportWidth; x += ${grid_spacing}) {
                const vLine = document.createElement('div');
                vLine.style.cssText = \`
                    position: absolute;
                    left: \${x}px;
                    top: 0;
                    width: 2px;
                    height: 100vh;
                    background: linear-gradient(to bottom, 
                        rgba(0, 0, 255, 0.6) 0%, 
                        rgba(255, 255, 255, 0.8) 50%, 
                        rgba(0, 0, 0, 0.6) 100%);
                    border-left: 1px solid rgba(255, 255, 255, 0.8);
                    border-right: 1px solid rgba(0, 0, 0, 0.6);
                \`;
                gridOverlay.appendChild(vLine);
                
                // Add coordinate labels for major grid lines
                if (${show_coordinates} && x % (${grid_spacing} * 2) === 0) {
                    const label = document.createElement('div');
                    label.style.cssText = \`
                        position: absolute;
                        left: \${x + 4}px;
                        top: 2px;
                        color: #000;
                        font-weight: bold;
                        background: rgba(255, 255, 255, 0.95);
                        border: 1px solid rgba(0, 0, 0, 0.5);
                        padding: 2px 6px;
                        border-radius: 3px;
                        font-size: 11px;
                        text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.8);
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
                        z-index: 2147483647;
                    \`;
                    label.textContent = 'x:' + x;
                    gridOverlay.appendChild(label);
                }
            }
            
            // Add horizontal grid lines - ensure they fill the entire viewport
            for (let y = 0; y <= viewportHeight; y += ${grid_spacing}) {
                const hLine = document.createElement('div');
                hLine.style.cssText = \`
                    position: absolute;
                    left: 0;
                    top: \${y}px;
                    width: 100vw;
                    height: 2px;
                    background: linear-gradient(to right, 
                        rgba(0, 0, 255, 0.6) 0%, 
                        rgba(255, 255, 255, 0.8) 50%, 
                        rgba(0, 0, 0, 0.6) 100%);
                    border-top: 1px solid rgba(255, 255, 255, 0.8);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.6);
                \`;
                gridOverlay.appendChild(hLine);
                
                // Add coordinate labels for major grid lines (including y:0)
                if (${show_coordinates} && y % (${grid_spacing} * 2) === 0) {
                    const label = document.createElement('div');
                    label.style.cssText = \`
                        position: absolute;
                        left: 2px;
                        top: \${y + 4}px;
                        color: #000;
                        font-weight: bold;
                        background: rgba(255, 255, 255, 0.95);
                        border: 1px solid rgba(0, 0, 0, 0.5);
                        padding: 2px 6px;
                        border-radius: 3px;
                        font-size: 11px;
                        text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.8);
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
                        z-index: 2147483647;
                    \`;
                    label.textContent = 'y:' + y;
                    gridOverlay.appendChild(label);
                }
            }
            
            // Add special origin label at (0,0) showing both coordinates
            if (${show_coordinates}) {
                const originLabel = document.createElement('div');
                originLabel.style.cssText = \`
                    position: absolute;
                    left: 4px;
                    top: 20px;
                    color: #000;
                    font-weight: bold;
                    background: rgba(255, 255, 0, 0.95);
                    border: 2px solid rgba(255, 0, 0, 0.8);
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.8);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
                    z-index: 2147483647;
                \`;
                originLabel.textContent = 'x:0, y:0';
                gridOverlay.appendChild(originLabel);
            }
            
            // Highlight clickable elements if requested
            if (${highlight_clickables}) {
                const clickableSelector = 'a, button, input[type="button"], input[type="submit"], [onclick], [role="button"], [tabindex]:not([tabindex="-1"]), select, textarea, input:not([type="hidden"])';
                const clickables = document.querySelectorAll(clickableSelector);
                
                clickables.forEach((el, index) => {
                    // Only highlight visible elements
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        const originalOutline = el.style.outline;
                        el.style.outline = '2px solid rgba(255, 0, 0, 0.7)';
                        el.setAttribute('data-mcp-original-outline', originalOutline);
                        
                        // Calculate center coordinates
                        const centerX = Math.round(rect.left + rect.width / 2);
                        const centerY = Math.round(rect.top + rect.height / 2);
                        
                        // Add center coordinate label - positioned like a folder tab at upper-left corner
                        const centerLabel = document.createElement('div');
                        centerLabel.className = 'mcp-center-label';
                        centerLabel.style.cssText = \`
                            position: absolute;
                            left: \${rect.left + window.scrollX}px;
                            top: \${rect.top + window.scrollY - 16}px;
                            background: rgba(255, 0, 0, 0.95);
                            color: white;
                            padding: 2px 6px;
                            border-radius: 4px 4px 0 0;
                            font-size: 10px;
                            font-weight: bold;
                            z-index: 2147483646;
                            pointer-events: none;
                            white-space: nowrap;
                            border: 2px solid rgba(255, 0, 0, 1);
                            border-bottom: none;
                            box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.3);
                            transform: translateX(-1px);
                        \`;
                        centerLabel.textContent = \`center: (\${centerX},\${centerY})\`;
                        document.body.appendChild(centerLabel);
                    }
                });
            }
            
            document.body.appendChild(gridOverlay);
            return true;
        `;
        
        await driver.executeScript(gridOverlayScript);
        
        console.log('Taking screenshot...');
        const screenshot = await driver.takeScreenshot();
        
        // Save the screenshot
        const outputPath = '/tmp/test_grid_screenshot.png';
        await fs.writeFile(outputPath, screenshot, 'base64');
        
        console.log(`✅ Screenshot saved to ${outputPath}`);
        
        // Clean up
        await driver.executeScript(`
            document.getElementById('mcp-grid-overlay')?.remove();
            document.querySelectorAll('[data-mcp-original-outline]').forEach(el => {
                el.style.outline = el.getAttribute('data-mcp-original-outline');
                el.removeAttribute('data-mcp-original-outline');
            });
            document.querySelectorAll('.mcp-center-label').forEach(label => label.remove());
        `);
        
    } finally {
        await driver.quit();
    }
}

testGridScreenshot().catch(console.error);