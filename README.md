[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/angiejones-mcp-selenium-badge.png)](https://mseep.ai/app/angiejones-mcp-selenium)

# MCP Selenium Server

<a href="https://glama.ai/mcp/servers/s2em7b2kwf">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/s2em7b2kwf/badge" />
</a>

[![smithery badge](https://smithery.ai/badge/@angiejones/mcp-selenium)](https://smithery.ai/server/@angiejones/mcp-selenium)

A Model Context Protocol (MCP) server implementation for Selenium WebDriver, enabling browser automation through standardized MCP clients.

## Video Demo (Click to Watch)

[![Watch the video](https://img.youtube.com/vi/mRV0N8hcgYA/sddefault.jpg)](https://youtu.be/mRV0N8hcgYA)


## Features

- Start browser sessions with customizable options
- Navigate to URLs
- Find elements using various locator strategies
- Click, type, and interact with elements
- Perform mouse actions (hover, drag and drop)
- Handle keyboard input
- Take screenshots
- Upload files
- Support for headless mode

## Supported Browsers

- Chrome
- Firefox
- MS Edge

## Use with Goose

### Option 1: One-click install
Copy and paste the link below into a browser address bar to add this extension to goose desktop:

```
goose://extension?cmd=npx&arg=-y&arg=%40angiejones%2Fmcp-selenium&id=selenium-mcp&name=Selenium%20MCP&description=automates%20browser%20interactions
```


### Option 2: Add manually to desktop or CLI

* Name: `Selenium MCP`
* Description: `automates browser interactions`
* Command: `npx -y @angiejones/mcp-selenium`

## Use with other MCP clients (e.g. Claude Desktop, etc)
```json
{
  "mcpServers": {
    "selenium": {
      "command": "npx",
      "args": ["-y", "@angiejones/mcp-selenium"]
    }
  }
}
```

---

## Development

To work on this project:

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the server: `npm start`

### Installation

#### Installing via Smithery

To install MCP Selenium for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@angiejones/mcp-selenium):

```bash
npx -y @smithery/cli install @angiejones/mcp-selenium --client claude
```

#### Manual Installation
```bash
npm install -g @angiejones/mcp-selenium
```


### Usage

Start the server by running:

```bash
mcp-selenium
```

Or use with NPX in your MCP configuration:

```json
{
  "mcpServers": {
    "selenium": {
      "command": "npx",
      "args": [
        "-y",
        "@angiejones/mcp-selenium"
      ]
    }
  }
}
```



## Tools

### start_browser
Launches a browser session.

**Parameters:**
- `browser` (required): Browser to launch
  - Type: string
  - Enum: ["chrome", "firefox"]
- `options`: Browser configuration options
  - Type: object
  - Properties:
    - `headless`: Run browser in headless mode
      - Type: boolean
    - `arguments`: Additional browser arguments
      - Type: array of strings

**Example:**
```json
{
  "tool": "start_browser",
  "parameters": {
    "browser": "chrome",
    "options": {
      "headless": true,
      "arguments": ["--no-sandbox"]
    }
  }
}
```

### navigate
Navigates to a URL.

**Parameters:**
- `url` (required): URL to navigate to
  - Type: string

**Example:**
```json
{
  "tool": "navigate",
  "parameters": {
    "url": "https://www.example.com"
  }
}
```

### find_element
Finds an element on the page.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "find_element",
  "parameters": {
    "by": "id",
    "value": "search-input",
    "timeout": 5000
  }
}
```

### click_element
Clicks an element.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "click_element",
  "parameters": {
    "by": "css",
    "value": ".submit-button"
  }
}
```

### send_keys
Sends keys to an element (typing).

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `text` (required): Text to enter into the element
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "send_keys",
  "parameters": {
    "by": "name",
    "value": "username",
    "text": "testuser"
  }
}
```

### get_element_text
Gets the text() of an element.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "get_element_text",
  "parameters": {
    "by": "css",
    "value": ".message"
  }
}
```

### hover
Moves the mouse to hover over an element.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "hover",
  "parameters": {
    "by": "css",
    "value": ".dropdown-menu"
  }
}
```

### drag_and_drop
Drags an element and drops it onto another element.

**Parameters:**
- `by` (required): Locator strategy for source element
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the source locator strategy
  - Type: string
- `targetBy` (required): Locator strategy for target element
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `targetValue` (required): Value for the target locator strategy
  - Type: string
- `timeout`: Maximum time to wait for elements in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "drag_and_drop",
  "parameters": {
    "by": "id",
    "value": "draggable",
    "targetBy": "id",
    "targetValue": "droppable"
  }
}
```

### double_click
Performs a double click on an element.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "double_click",
  "parameters": {
    "by": "css",
    "value": ".editable-text"
  }
}
```

### right_click
Performs a right click (context click) on an element.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "right_click",
  "parameters": {
    "by": "css",
    "value": ".context-menu-trigger"
  }
}
```

### press_key
Simulates pressing a keyboard key.

**Parameters:**
- `key` (required): Key to press (e.g., 'Enter', 'Tab', 'a', etc.)
  - Type: string

**Example:**
```json
{
  "tool": "press_key",
  "parameters": {
    "key": "Enter"
  }
}
```

### scroll
Universal scrolling method that handles all scroll scenarios through different parameter combinations.

**Parameters:**
- `action` (required): Type of scroll action to perform
  - Type: string
  - Enum: ["by_pixels", "to_position", "to_element", "to_top", "to_bottom"]
- `direction`: Direction to scroll (for by_pixels only)
  - Type: string
  - Enum: ["up", "down", "left", "right"]
- `amount`: Number of pixels to scroll (for by_pixels only)
  - Type: number
- `x`: Horizontal position to scroll to (for to_position only)
  - Type: number
- `y`: Vertical position to scroll to (for to_position only)
  - Type: number
- `by`: Locator strategy to find element (for to_element only)
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value`: Value for the locator strategy (for to_element only)
  - Type: string
- `behavior`: Scrolling behavior
  - Type: string
  - Enum: ["auto", "smooth"]
  - Default: "auto"
- `block`: Element positioning (for to_element only)
  - Type: string
  - Enum: ["start", "center", "end", "nearest"]
  - Default: "start"
- `timeout`: Maximum time to wait for element in milliseconds (for to_element only)
  - Type: number
  - Default: 10000

**Examples:**
```json
// Scroll down 500 pixels
{
  "tool": "scroll",
  "parameters": {
    "action": "by_pixels",
    "direction": "down",
    "amount": 500
  }
}

// Smooth scroll to coordinates
{
  "tool": "scroll",
  "parameters": {
    "action": "to_position",
    "x": 0,
    "y": 1000,
    "behavior": "smooth"
  }
}

// Scroll to element
{
  "tool": "scroll",
  "parameters": {
    "action": "to_element",
    "by": "id",
    "value": "footer",
    "behavior": "smooth"
  }
}

// Scroll to top
{
  "tool": "scroll",
  "parameters": {
    "action": "to_top",
    "behavior": "smooth"
  }
}

// Scroll to bottom
{
  "tool": "scroll",
  "parameters": {
    "action": "to_bottom"
  }
}
```

### upload_file
Uploads a file using a file input element.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `filePath` (required): Absolute path to the file to upload
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "upload_file",
  "parameters": {
    "by": "id",
    "value": "file-input",
    "filePath": "/path/to/file.pdf"
  }
}
```

### take_screenshot
Captures a screenshot of the current page.

**Parameters:**
- `outputPath` (optional): Path where to save the screenshot. If not provided, returns base64 data.
  - Type: string

**Example:**
```json
{
  "tool": "take_screenshot",
  "parameters": {
    "outputPath": "/path/to/screenshot.png"
  }
}
```

### take_grid_screenshot
Captures a screenshot with coordinate grid overlay for visual reference and element targeting.

**Parameters:**
- `grid_spacing`: Pixels between grid lines
  - Type: number
  - Default: 50
- `target_identification_mode`: Overlay mode for element targeting and grid display
  - Type: string (enum)
  - Enum: ["coordinates", "clickables", "numbered_elements"]
  - Default: "coordinates"
- `outputPath` (optional): Path where to save the screenshot. If not provided, returns base64 data.
  - Type: string

**Example:**
```json
{
  "tool": "take_grid_screenshot",
  "parameters": {
    "grid_spacing": 50,
    "target_identification_mode": "coordinates",
    "outputPath": "/path/to/grid_screenshot.png"
  }
}
```

### click_at_coordinates
Clicks at specific x,y coordinates on the viewport, enabling precise coordinate-based interactions.

**Parameters:**
- `x` (required): X coordinate (horizontal position in pixels)
  - Type: number
- `y` (required): Y coordinate (vertical position in pixels)
  - Type: number
- `relative_to`: Coordinate reference point
  - Type: string
  - Enum: ["viewport", "center"]
  - Default: "viewport"
- `scroll_if_needed`: Auto-scroll if coordinates are outside viewport
  - Type: boolean
  - Default: true

**Examples:**
```json
// Click at absolute viewport coordinates
{
  "tool": "click_at_coordinates",
  "parameters": {
    "x": 250,
    "y": 150,
    "relative_to": "viewport"
  }
}

// Click relative to viewport center
{
  "tool": "click_at_coordinates",
  "parameters": {
    "x": -50,
    "y": 25,
    "relative_to": "center"
  }
}
```

### close_session
Closes the current browser session and cleans up resources.

**Parameters:**
None required

**Example:**
```json
{
  "tool": "close_session",
  "parameters": {}
}
```


## License

MIT
