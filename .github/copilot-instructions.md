# MCP Selenium Server

MCP Selenium Server is a Node.js Model Context Protocol (MCP) server implementation for Selenium WebDriver, enabling browser automation through standardized MCP clients. The server provides tools for controlling Chrome, Firefox, and Microsoft Edge browsers via WebDriver.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Initial Setup
- Install dependencies: `npm install` -- takes <1 second
- NEVER run `npm audit fix` - the low severity vulnerability in the `tmp` package is a known issue and should not be fixed automatically
- No build step required - this is a pure Node.js ES module project

### Running the Server
- Start the MCP server directly: `node src/lib/server.js`
- OR use the CLI entry point: `node bin/mcp-selenium.js`
- OR if installed globally: `mcp-selenium`
- Server starts immediately and communicates via stdin/stdout using the MCP protocol
- Server runs indefinitely until killed - it does not produce output unless receiving MCP protocol messages

### Browser Requirements
Ensure the following browsers and WebDriver executables are available:
- Chrome/Chromium: Requires `chromedriver` executable in PATH
- Firefox: Requires `geckodriver` executable in PATH
- Microsoft Edge: Requires Edge WebDriver
- For headless operation, add browser arguments: `['--no-sandbox', '--disable-dev-shm-usage']`

### Testing the Server
Test basic MCP protocol communication:
```bash
# Start server and send initialize request
node src/lib/server.js
# Send JSON-RPC initialize message via stdin (manual testing)
```

For automated testing, create a test script that:
1. Spawns the server process with stdio pipes
2. Sends MCP protocol initialize request
3. Sends tools/list request to verify server functionality
4. Tests specific browser tools with headless options

## Validation

### ALWAYS run these validation steps after making changes:
1. **Basic server startup**: `node src/lib/server.js` should start without errors
2. **MCP protocol test**: Send initialize and tools/list requests to verify communication
3. **Browser functionality**: Test start_browser with headless Chrome using these options:
   ```json
   {
     "browser": "chrome",
     "options": {
       "headless": true,
       "arguments": ["--no-sandbox", "--disable-dev-shm-usage"]
     }
   }
   ```
4. **Session management**: Test complete workflow of start_browser → navigate → take_screenshot → close_session

### Manual Validation Requirements
- ALWAYS test browser automation end-to-end after making changes
- Create a simple HTML test page and verify navigation works
- Test element interactions (find_element, click_element, send_keys) when modifying browser tools
- Verify screenshot functionality produces actual image files
- Test session cleanup - ensure browsers are properly closed

### No Build Required
- This is a pure Node.js project with no compilation step
- Changes to JavaScript files take effect immediately
- No transpilation, bundling, or build artifacts

## Available Tools

The server provides these browser automation tools:

### Core Browser Management
- `start_browser` - Launch Chrome, Firefox, or Edge with configurable options
- `close_session` - Close browser and cleanup resources
- `navigate` - Navigate to URLs (supports http/https/file protocols)

### Element Interaction
- `find_element` - Locate elements using id, css, xpath, name, tag, or class selectors
- `click_element` - Click elements
- `double_click` - Double-click elements  
- `right_click` - Right-click (context click) elements
- `send_keys` - Type text into input elements
- `get_element_text` - Extract text content from elements

### Advanced Actions  
- `hover` - Mouse hover over elements
- `drag_and_drop` - Drag element from source to target
- `press_key` - Simulate keyboard key presses
- `upload_file` - Upload files via file input elements
- `take_screenshot` - Capture page screenshots

## Common Tasks

### Repository Structure
```
.
├── README.md           - Documentation with tool examples
├── package.json        - Dependencies and metadata  
├── package-lock.json   - Locked dependency versions
├── Dockerfile         - Container setup with browser deps
├── smithery.yaml      - Smithery MCP client configuration
├── bin/
│   └── mcp-selenium.js - CLI entry point wrapper
└── src/
    └── lib/
        └── server.js   - Main MCP server implementation
```

### Key Source Files
- `src/lib/server.js` - Main server implementation with all MCP tools
- `bin/mcp-selenium.js` - CLI wrapper that spawns the server
- All browser automation logic is in the single server.js file

### Dependencies  
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `selenium-webdriver` - WebDriver browser automation
- `zod` - Schema validation for MCP tool parameters
- No dev dependencies or testing frameworks

### Package Scripts
- `npm test` - Placeholder that exits with error (no tests implemented)
- No other npm scripts defined
- No linting, formatting, or build scripts available

## Installation Methods

The server can be used via:
1. **Global install**: `npm install -g @angiejones/mcp-selenium`
2. **NPX direct**: `npx -y @angiejones/mcp-selenium`  
3. **Local development**: Clone repo and run `node src/lib/server.js`
4. **MCP client config**: Configure with `npx` command in MCP client

## Troubleshooting

### Common Issues
- **Browser not starting**: Ensure WebDriver executables are in PATH
- **Headless mode failures**: Include `--no-sandbox` and `--disable-dev-shm-usage` arguments
- **Navigation timeouts**: Use local file:// URLs for testing without network dependencies
- **Screenshot failures**: Verify output directory exists and is writable

### Security Note
- Known low-severity vulnerability in `tmp` dependency - do not auto-fix with npm audit
- Use headless browsers in production/CI environments
- File upload requires absolute file paths