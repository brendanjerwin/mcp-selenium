#!/usr/bin/env node

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import pkg from 'selenium-webdriver';
const { Builder, By, Key, until, Actions } = pkg;
import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox.js';
import { Options as EdgeOptions } from 'selenium-webdriver/edge.js';


// Create an MCP server
const server = new McpServer({
    name: "MCP Selenium",
    version: "1.0.0"
});

// Server state
const state = {
    drivers: new Map(),
    currentSession: null
};

// Helper functions
const getDriver = () => {
    const driver = state.drivers.get(state.currentSession);
    if (!driver) {
        throw new Error('No active browser session');
    }
    return driver;
};

const getLocator = (by, value) => {
    switch (by.toLowerCase()) {
        case 'id': return By.id(value);
        case 'css': return By.css(value);
        case 'xpath': return By.xpath(value);
        case 'name': return By.name(value);
        case 'tag': return By.css(value);
        case 'class': return By.className(value);
        default: throw new Error(`Unsupported locator strategy: ${by}`);
    }
};

// Common schemas
const browserOptionsSchema = z.object({
    headless: z.boolean().optional().describe("Run browser in headless mode"),
    arguments: z.array(z.string()).optional().describe("Additional browser arguments")
}).optional();

const locatorSchema = {
    by: z.enum(["id", "css", "xpath", "name", "tag", "class"]).describe("Locator strategy to find element"),
    value: z.string().describe("Value for the locator strategy"),
    timeout: z.number().optional().describe("Maximum time to wait for element in milliseconds")
};

// Browser Management Tools
server.tool(
    "start_browser",
    "launches browser",
    {
        browser: z.enum(["chrome", "firefox", "edge"]).describe("Browser to launch (chrome or firefox or microsoft edge)"),
        options: browserOptionsSchema
    },
    async ({ browser, options = {} }) => {
        try {
            let builder = new Builder();
            let driver;
            switch (browser) {
                case 'chrome': {
                    const chromeOptions = new ChromeOptions();
                    if (options.headless) {
                        chromeOptions.addArguments('--headless=new');
                    }
                    if (options.arguments) {
                        options.arguments.forEach(arg => chromeOptions.addArguments(arg));
                    }
                    driver = await builder
                        .forBrowser('chrome')
                        .setChromeOptions(chromeOptions)
                        .build();
                    break;
                }
                case 'edge': {
                    const edgeOptions = new EdgeOptions();
                    if (options.headless) {
                        edgeOptions.addArguments('--headless=new');
                    }
                    if (options.arguments) {
                        options.arguments.forEach(arg => edgeOptions.addArguments(arg));
                    }
                    driver = await builder
                        .forBrowser('edge')
                        .setEdgeOptions(edgeOptions)
                        .build();
                    break;
                }
                case 'firefox': {
                    const firefoxOptions = new FirefoxOptions();
                    if (options.headless) {
                        firefoxOptions.addArguments('--headless');
                    }
                    if (options.arguments) {
                        options.arguments.forEach(arg => firefoxOptions.addArguments(arg));
                    }
                    driver = await builder
                        .forBrowser('firefox')
                        .setFirefoxOptions(firefoxOptions)
                        .build();
                    break;
                }
                default: {
                    throw new Error(`Unsupported browser: ${browser}`);
                }
            }
            const sessionId = `${browser}_${Date.now()}`;
            state.drivers.set(sessionId, driver);
            state.currentSession = sessionId;

            return {
                content: [{ type: 'text', text: `Browser started with session_id: ${sessionId}` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error starting browser: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "navigate",
    "navigates to a URL",
    {
        url: z.string().describe("URL to navigate to")
    },
    async ({ url }) => {
        try {
            const driver = getDriver();
            await driver.get(url);
            return {
                content: [{ type: 'text', text: `Navigated to ${url}` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error navigating: ${e.message}` }]
            };
        }
    }
);

// Element Interaction Tools
server.tool(
    "find_element",
    "finds an element",
    {
        ...locatorSchema
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            await driver.wait(until.elementLocated(locator), timeout);
            return {
                content: [{ type: 'text', text: 'Element found' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error finding element: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "click_element",
    "clicks an element",
    {
        ...locatorSchema
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            await element.click();
            return {
                content: [{ type: 'text', text: 'Element clicked' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error clicking element: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "send_keys",
    "sends keys to an element, aka typing",
    {
        ...locatorSchema,
        text: z.string().describe("Text to enter into the element")
    },
    async ({ by, value, text, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            await element.clear();
            await element.sendKeys(text);
            return {
                content: [{ type: 'text', text: `Text "${text}" entered into element` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error entering text: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "get_element_text",
    "gets the text() of an element",
    {
        ...locatorSchema
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            const text = await element.getText();
            return {
                content: [{ type: 'text', text }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error getting element text: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "hover",
    "moves the mouse to hover over an element",
    {
        ...locatorSchema
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            const actions = driver.actions({ bridge: true });
            await actions.move({ origin: element }).perform();
            return {
                content: [{ type: 'text', text: 'Hovered over element' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error hovering over element: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "drag_and_drop",
    "drags an element and drops it onto another element",
    {
        ...locatorSchema,
        targetBy: z.enum(["id", "css", "xpath", "name", "tag", "class"]).describe("Locator strategy to find target element"),
        targetValue: z.string().describe("Value for the target locator strategy")
    },
    async ({ by, value, targetBy, targetValue, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const sourceLocator = getLocator(by, value);
            const targetLocator = getLocator(targetBy, targetValue);
            const sourceElement = await driver.wait(until.elementLocated(sourceLocator), timeout);
            const targetElement = await driver.wait(until.elementLocated(targetLocator), timeout);
            const actions = driver.actions({ bridge: true });
            await actions.dragAndDrop(sourceElement, targetElement).perform();
            return {
                content: [{ type: 'text', text: 'Drag and drop completed' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error performing drag and drop: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "double_click",
    "performs a double click on an element",
    {
        ...locatorSchema
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            const actions = driver.actions({ bridge: true });
            await actions.doubleClick(element).perform();
            return {
                content: [{ type: 'text', text: 'Double click performed' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error performing double click: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "right_click",
    "performs a right click (context click) on an element",
    {
        ...locatorSchema
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            const actions = driver.actions({ bridge: true });
            await actions.contextClick(element).perform();
            return {
                content: [{ type: 'text', text: 'Right click performed' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error performing right click: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "press_key",
    "simulates pressing a keyboard key",
    {
        key: z.string().describe("Key to press (e.g., 'Enter', 'Tab', 'a', etc.)")
    },
    async ({ key }) => {
        try {
            const driver = getDriver();
            const actions = driver.actions({ bridge: true });
            await actions.keyDown(key).keyUp(key).perform();
            return {
                content: [{ type: 'text', text: `Key '${key}' pressed` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error pressing key: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "upload_file",
    "uploads a file using a file input element",
    {
        ...locatorSchema,
        filePath: z.string().describe("Absolute path to the file to upload")
    },
    async ({ by, value, filePath, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            await element.sendKeys(filePath);
            return {
                content: [{ type: 'text', text: 'File upload initiated' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error uploading file: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "scroll",
    "universal scrolling method that handles all scroll scenarios",
    {
        action: z.enum(["by_pixels", "to_position", "to_element", "to_top", "to_bottom"]).describe("Type of scroll action to perform"),
        direction: z.enum(["up", "down", "left", "right"]).optional().describe("Direction to scroll (for by_pixels only)"),
        amount: z.number().optional().describe("Number of pixels to scroll (for by_pixels only)"),
        x: z.number().optional().describe("Horizontal position to scroll to (for to_position only)"),
        y: z.number().optional().describe("Vertical position to scroll to (for to_position only)"),
        by: z.enum(["id", "css", "xpath", "name", "tag", "class"]).optional().describe("Locator strategy to find element (for to_element only)"),
        value: z.string().optional().describe("Value for the locator strategy (for to_element only)"),
        behavior: z.enum(["auto", "smooth"]).optional().default("auto").describe("Scrolling behavior (auto or smooth)"),
        block: z.enum(["start", "center", "end", "nearest"]).optional().default("start").describe("Element positioning (for to_element only)"),
        timeout: z.number().optional().describe("Maximum time to wait for element in milliseconds (for to_element only)")
    },
    async ({ action, direction, amount, x, y, by, value, behavior = "auto", block = "start", timeout = 10000 }) => {
        try {
            const driver = getDriver();
            
            switch (action) {
                case 'by_pixels': {
                    if (!direction || amount === undefined) {
                        throw new Error('direction and amount are required for by_pixels action');
                    }
                    const xOffset = direction === 'left' ? -amount : direction === 'right' ? amount : 0;
                    const yOffset = direction === 'up' ? -amount : direction === 'down' ? amount : 0;
                    await driver.executeScript(`window.scrollBy(${xOffset}, ${yOffset})`);
                    return {
                        content: [{ type: 'text', text: `Scrolled ${direction} by ${amount} pixels` }]
                    };
                }
                
                case 'to_position': {
                    if (x === undefined || y === undefined) {
                        throw new Error('x and y coordinates are required for to_position action');
                    }
                    await driver.executeScript(`window.scrollTo({left: ${x}, top: ${y}, behavior: '${behavior}'})`);
                    return {
                        content: [{ type: 'text', text: `Scrolled to position (${x}, ${y}) with ${behavior} behavior` }]
                    };
                }
                
                case 'to_element': {
                    if (!by || !value) {
                        throw new Error('by and value are required for to_element action');
                    }
                    const locator = getLocator(by, value);
                    const element = await driver.wait(until.elementLocated(locator), timeout);
                    await driver.executeScript(
                        "arguments[0].scrollIntoView({behavior: arguments[1], block: arguments[2]});", 
                        element, behavior, block
                    );
                    return {
                        content: [{ type: 'text', text: `Scrolled to element (${by}=${value}) with ${behavior} behavior and ${block} positioning` }]
                    };
                }
                
                case 'to_top': {
                    await driver.executeScript(`window.scrollTo({top: 0, left: 0, behavior: '${behavior}'})`);
                    return {
                        content: [{ type: 'text', text: `Scrolled to top with ${behavior} behavior` }]
                    };
                }
                
                case 'to_bottom': {
                    await driver.executeScript(`
                        window.scrollTo({
                            top: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight), 
                            left: 0, 
                            behavior: '${behavior}'
                        })
                    `);
                    return {
                        content: [{ type: 'text', text: `Scrolled to bottom with ${behavior} behavior` }]
                    };
                }
                
                default: {
                    throw new Error(`Unsupported scroll action: ${action}`);
                }
            }
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error performing scroll: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "click_at_coordinates",
    "clicks at specific x,y coordinates on the viewport with visual feedback",
    {
        x: z.number().describe("X coordinate (horizontal position in pixels)"),
        y: z.number().describe("Y coordinate (vertical position in pixels)"),
        relative_to: z.enum(["viewport", "center"]).optional().default("viewport").describe("Coordinate reference point"),
        scroll_if_needed: z.boolean().optional().default(true).describe("Auto-scroll if coordinates are outside viewport")
    },
    async ({ x, y, relative_to = "viewport", scroll_if_needed = true }) => {
        try {
            const driver = getDriver();
            
            // Validate coordinates are non-negative for viewport mode
            if (relative_to === "viewport" && (x < 0 || y < 0)) {
                throw new Error("Viewport coordinates must be non-negative");
            }
            
            // Get viewport dimensions to validate bounds
            const viewportSize = await driver.executeScript(`
                return {
                    width: window.innerWidth,
                    height: window.innerHeight
                };
            `);
            
            // For viewport mode, check if coordinates are within bounds
            if (relative_to === "viewport") {
                if (x > viewportSize.width || y > viewportSize.height) {
                    if (scroll_if_needed) {
                        // Auto-scroll to bring coordinates into view
                        const scrollX = Math.max(0, x - viewportSize.width / 2);
                        const scrollY = Math.max(0, y - viewportSize.height / 2);
                        await driver.executeScript(`window.scrollTo(${scrollX}, ${scrollY})`);
                    } else {
                        throw new Error(`Coordinates (${x}, ${y}) are outside viewport bounds (${viewportSize.width}x${viewportSize.height})`);
                    }
                }
            }
            
            // Show click target indicator
            await driver.executeScript(`
                // Remove any existing click indicators
                const existingIndicators = document.querySelectorAll('.mcp-click-indicator, .mcp-click-confirmation');
                existingIndicators.forEach(indicator => indicator.remove());
                
                // Create click target indicator
                const indicator = document.createElement('div');
                indicator.className = 'mcp-click-indicator';
                indicator.style.cssText = \`
                    position: fixed;
                    left: \${${x} - 10}px;
                    top: \${${y} - 10}px;
                    width: 20px;
                    height: 20px;
                    border: 2px solid red;
                    border-radius: 50%;
                    z-index: 2147483647;
                    pointer-events: none;
                    background: rgba(255, 0, 0, 0.2);
                    box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
                \`;
                document.body.appendChild(indicator);
            `, x, y);
            
            // Human visibility delay (300ms) to see the click indicator
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const actions = driver.actions({ bridge: true });
            
            if (relative_to === "viewport") {
                // Move mouse to coordinates first to trigger hover states, then click
                await actions
                    .move({ x: x, y: y })
                    .pause(100)  // Small pause to simulate natural movement and trigger hover states
                    .perform();
                
                // Then perform the click
                await actions
                    .click()
                    .perform();
            } else {
                // Move mouse relative to viewport center first to trigger hover states, then click
                await actions
                    .move({ x: x, y: y })
                    .pause(100)  // Small pause to simulate natural movement and trigger hover states
                    .perform();
                    
                // Then perform the click
                await actions
                    .click()
                    .perform();
            }
            
            // Show click confirmation flash
            await driver.executeScript(`
                // Create click confirmation flash
                const confirmation = document.createElement('div');
                confirmation.className = 'mcp-click-confirmation';
                confirmation.style.cssText = \`
                    position: fixed;
                    left: \${${x} - 15}px;
                    top: \${${y} - 15}px;
                    width: 30px;
                    height: 30px;
                    border: 3px solid green;
                    border-radius: 50%;
                    z-index: 2147483647;
                    pointer-events: none;
                    background: rgba(0, 255, 0, 0.3);
                    box-shadow: 0 0 15px rgba(0, 255, 0, 0.7);
                \`;
                document.body.appendChild(confirmation);
            `, x, y);
            
            // Brief flash to confirm click (100ms)
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Clean up all indicators
            await driver.executeScript(`
                const indicators = document.querySelectorAll('.mcp-click-indicator, .mcp-click-confirmation');
                indicators.forEach(indicator => indicator.remove());
            `);
            
            return {
                content: [{ type: 'text', text: `Clicked at coordinates (${x}, ${y}) relative to ${relative_to} with visual feedback` }]
            };
        } catch (e) {
            // Clean up indicators on error
            try {
                await driver.executeScript(`
                    const indicators = document.querySelectorAll('.mcp-click-indicator, .mcp-click-confirmation');
                    indicators.forEach(indicator => indicator.remove());
                `);
            } catch (cleanupError) {
                // Ignore cleanup errors
            }
            
            return {
                content: [{ type: 'text', text: `Error clicking at coordinates: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "take_screenshot",
    "captures a screenshot of the current page",
    {
        outputPath: z.string().optional().describe("Optional path where to save the screenshot. If not provided, returns base64 data."),
        scale: z.number().optional().default(0.5).describe("Scale percentage for resizing the image (default 0.5 = 50%)")
    },
    async ({ outputPath, scale = 0.5 }) => {
        try {
            const driver = getDriver();
            const screenshot = await driver.takeScreenshot();
            
            // Resize the screenshot if scale is not 1.0
            let finalScreenshot = screenshot;
            if (scale !== 1.0) {
                finalScreenshot = await driver.executeScript(`
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.onload = function() {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            
                            const scaledWidth = Math.round(img.width * ${scale});
                            const scaledHeight = Math.round(img.height * ${scale});
                            
                            canvas.width = scaledWidth;
                            canvas.height = scaledHeight;
                            
                            ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
                            
                            // Convert to base64
                            const base64 = canvas.toDataURL('image/png').split(',')[1];
                            resolve(base64);
                        };
                        img.src = 'data:image/png;base64,' + arguments[0];
                    });
                `, screenshot);
            }
            
            if (outputPath) {
                const fs = await import('fs');
                await fs.promises.writeFile(outputPath, finalScreenshot, 'base64');
                return {
                    content: [{ type: 'text', text: `Screenshot saved to ${outputPath} (scale: ${Math.round(scale * 100)}%)` }]
                };
            } else {
                return {
                    content: [
                        { type: 'text', text: `Screenshot captured as base64 (scale: ${Math.round(scale * 100)}%):` },
                        { type: 'text', text: finalScreenshot }
                    ]
                };
            }
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error taking screenshot: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "take_grid_screenshot",
    "captures a screenshot with coordinate grid overlay for visual reference",
    {
        grid_spacing: z.number().optional().default(50).describe("Pixels between grid lines"),
        target_identification_mode: z.enum(["coordinates", "highlights"]).optional().default("coordinates").describe("Mode for target identification: 'coordinates' shows grid with coordinate labels, 'highlights' shows red outlines around clickables"),
        outputPath: z.string().optional().describe("Optional path where to save the screenshot. If not provided, returns base64 data."),
        scale: z.number().optional().default(0.5).describe("Scale percentage for resizing the image (default 0.5 = 50%)")
    },
    async ({ grid_spacing = 50, target_identification_mode = "coordinates", outputPath, scale = 0.5 }) => {
        try {
            const driver = getDriver();
            
            // Inject JavaScript to create grid overlay
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
                
                const showCoordinates = ${target_identification_mode === "coordinates"};
                const highlightClickables = ${target_identification_mode === "highlights"};
                
                // Add vertical grid lines - ensure they fill the entire viewport
                for (let x = 0; x <= viewportWidth; x += ${grid_spacing}) {
                    const vLine = document.createElement('div');
                    vLine.style.cssText = \`
                        position: absolute;
                        left: \${x}px;
                        top: 0;
                        width: 2px;
                        height: 100vh;
                        background: rgba(0, 0, 255, 0.6);
                        border-left: 1px solid rgba(255, 255, 255, 0.8);
                        border-right: 1px solid rgba(0, 0, 0, 0.6);
                    \`;
                    gridOverlay.appendChild(vLine);
                    
                    // Add coordinate labels for major grid lines
                    if (showCoordinates && x % (${grid_spacing} * 2) === 0) {
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
                        background: rgba(0, 0, 255, 0.6);
                        border-top: 1px solid rgba(255, 255, 255, 0.8);
                        border-bottom: 1px solid rgba(0, 0, 0, 0.6);
                    \`;
                    gridOverlay.appendChild(hLine);
                    
                    // Add coordinate labels for major grid lines (including y:0)
                    if (showCoordinates && y % (${grid_spacing} * 2) === 0) {
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
                        // Make origin label exactly like normal case labels, just with different content
                        label.textContent = (y === 0) ? 'x:0, y:0' : 'y:' + y;
                        gridOverlay.appendChild(label);
                    }
                }
                
                // Highlight clickable elements if requested
                if (highlightClickables) {
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
            
            // Inject the grid overlay
            await driver.executeScript(gridOverlayScript);
            
            // Human visibility delay - let user see the grid
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Take screenshot with grid overlay
            const screenshot = await driver.takeScreenshot();
            
            // Resize the screenshot if scale is not 1.0
            let finalScreenshot = screenshot;
            if (scale !== 1.0) {
                finalScreenshot = await driver.executeScript(`
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.onload = function() {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            
                            const scaledWidth = Math.round(img.width * ${scale});
                            const scaledHeight = Math.round(img.height * ${scale});
                            
                            canvas.width = scaledWidth;
                            canvas.height = scaledHeight;
                            
                            ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
                            
                            // Convert to base64
                            const base64 = canvas.toDataURL('image/png').split(',')[1];
                            resolve(base64);
                        };
                        img.src = 'data:image/png;base64,' + arguments[0];
                    });
                `, screenshot);
            }
            
            // Clean up the grid overlay and element highlighting
            const cleanupScript = `
                // Remove grid overlay
                const gridOverlay = document.getElementById('mcp-grid-overlay');
                if (gridOverlay) {
                    gridOverlay.remove();
                }
                
                // Remove element highlighting
                const highlightedElements = document.querySelectorAll('[data-mcp-original-outline]');
                highlightedElements.forEach(el => {
                    el.style.outline = el.getAttribute('data-mcp-original-outline');
                    el.removeAttribute('data-mcp-original-outline');
                });
                
                // Remove center coordinate labels
                const centerLabels = document.querySelectorAll('.mcp-center-label');
                centerLabels.forEach(label => label.remove());
                
                return true;
            `;
            
            await driver.executeScript(cleanupScript);
            
            if (outputPath) {
                const fs = await import('fs');
                await fs.promises.writeFile(outputPath, finalScreenshot, 'base64');
                return {
                    content: [{ 
                        type: 'text', 
                        text: `Grid screenshot saved to ${outputPath} (grid_spacing: ${grid_spacing}px, mode: ${target_identification_mode}, scale: ${Math.round(scale * 100)}%)` 
                    }]
                };
            } else {
                return {
                    content: [
                        { 
                            type: 'text', 
                            text: `Grid screenshot captured (grid_spacing: ${grid_spacing}px, mode: ${target_identification_mode}, scale: ${Math.round(scale * 100)}%):` 
                        },
                        { type: 'text', text: finalScreenshot }
                    ]
                };
            }
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error taking grid screenshot: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "close_session",
    "closes the current browser session",
    {},
    async () => {
        try {
            const driver = getDriver();
            await driver.quit();
            state.drivers.delete(state.currentSession);
            const sessionId = state.currentSession;
            state.currentSession = null;
            return {
                content: [{ type: 'text', text: `Browser session ${sessionId} closed` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error closing session: ${e.message}` }]
            };
        }
    }
);

// Resources
server.resource(
    "browser-status",
    new ResourceTemplate("browser-status://current"),
    async (uri) => ({
        contents: [{
            uri: uri.href,
            text: state.currentSession
                ? `Active browser session: ${state.currentSession}`
                : "No active browser session"
        }]
    })
);

// Cleanup handler
async function cleanup() {
    for (const [sessionId, driver] of state.drivers) {
        try {
            await driver.quit();
        } catch (e) {
            console.error(`Error closing browser session ${sessionId}:`, e);
        }
    }
    state.drivers.clear();
    state.currentSession = null;
    process.exit(0);
}

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);