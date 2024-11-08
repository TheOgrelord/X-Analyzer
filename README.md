
# X Analyzer

**Version:** 1.0  
**Description:** Analyze X.com (formerly Twitter) profiles, trends, feeds, and replies using AI-powered insights.

---

## Overview

X Analyzer is a browser extension designed to extract and analyze text data from X.com (Twitter). It uses the OpenAI API to perform a variety of analyses on user profiles, timelines, tweets, replies, and trends. This extension can offer insights ranging from marketing opportunities to sentiment analysis.

---

## Key Features

- **Profile, Feed, and Trends Analysis**: Extracts text content from profiles, timelines, replies, and trending topics for in-depth analysis.
- **AI-Powered Insights**: Leverages the OpenAI API to analyze text based on selected analysis types.
- **Multiple Analysis Types**: Includes options for marketing analysis, competitor research, audience analysis, reputation audits, sentiment analysis, and more.
- **Customizable Prompts**: Allows users to input custom prompts for more tailored analyses.
- **Feed Optimization**: Optimizes content extraction by hiding images and shrinking text size, reducing clutter and improving performance.
- **Advanced Settings**: Provides toggles to fine-tune the analysis process, including loading all tweets for comprehensive analysis.
- **Content Extraction**: Extracts and prepares text content based on the current page context.

---

## How It Works

### Content Extraction
The extension uses a content script (`content.js`) to extract various types of text data from the active X.com page. Depending on the current URL, it identifies whether to extract the main feed, profile content, replies, or trending topics.

### AI Analysis
The extracted text is sent to the background script (`background.js`), which processes the analysis request using the OpenAI API. The script uses an API key specified in `config.json` and sends the text along with selected options such as analysis type, token limits, and model choice to OpenAI for processing.

### User Interface
The user interacts with a popup UI (`popup.html` and `popup.css`), where they can select analysis types, input a custom prompt, specify a token limit, and view the results. The extension also includes advanced options for optimizing feed content and loading additional tweets.

### Settings and State Management
The extension saves user preferences (like analysis type and custom prompts) in local storage, restoring them automatically when the extension is opened again.

---

## Installation

1. Clone or download the repository containing the extension's files.
2. Locate the file named `config.example.json` in the root directory of the project.
3. Create a copy of this file and rename it to `config.json`. You can do this using the command line or your file manager:
   ```bash
   cp config.example.json config.json
   ```
4. Enter your OpenAI API key into the `config.json` file where it says `"PASTE_YOUR_API_KEY_HERE"`. Be sure to keep the quotes.
5. Open Chrome and go to `chrome://extensions/`.
6. Enable Developer mode in the top-right corner.
7. Click "Load unpacked" and select the folder containing the extension's files.

---

## Usage

1. Open X.com (Twitter) and navigate to the page you want to analyze (e.g., a user profile, your home timeline, or trending topics).
2. Click on the X Analyzer extension icon in your browser's toolbar.
3. Select the type of analysis you want to perform from the dropdown menu.
4. Optionally:
   - Enter a custom prompt to refine the analysis.
   - Adjust the maximum tokens if needed.
5. Click **Analyze**. The results will be displayed in the popup window.
6. Copy the results to your clipboard if needed or clear the analysis to start a new one.

---

## Advanced Options

- **Custom Prompt**: Allows the user to insert their own prompt.
- **OpenAI Model Selection**: Insert the name of the OpenAI model you want to use here. The default model is `GPT-4o-mini`. For a complete list of OpenAI models, go to [OpenAI Models Documentation](https://platform.openai.com/docs/models/).
- **Optimize Feed Content**: Toggle this to reduce screen space usage by hiding images and shrinking text size. This can improve performance and help load more text content for analysis. It’s recommended to enable this before checking "Load All Tweets" to minimize lag.
- **Load All Tweets**: Enable this option to load all tweets on the page.
  - **Warning**: This may significantly increase resource usage and cause lag or OpenAI token limits to be exceeded. Excessive use might result in an IP ban from X.

---

## Permissions

- **Active Tab**: To access and extract text content from active tabs on X.com.
- **Storage**: To save and restore user preferences.
- **Scripting**: For injecting and executing custom scripts within X.com pages.

---

## File Structure

```
X-Analyzer/
│
├── icons/                     # Icons for the browser extension
│   ├── icon16.png             # 16x16 icon
│   ├── icon48.png             # 48x48 icon
│   └── icon128.png            # 128x128 icon
│
├── LICENSE                    # MIT License file
├── README.md                  # Documentation for the project
├── .gitignore                 # Specifies files/folders to ignore in version control
│
├── manifest.json              # Metadata and configuration for the extension
├── background.js              # Background script for handling API communication
├── content.js                 # Content script for extracting page data
├── popup.html                 # Popup interface for the extension
├── popup.css                  # Styles for the popup interface
├── popup.js                   # Logic for popup interaction
│
├── config.example.json        # Example config file for API key setup
└── config.json (local only)   # Actual config file (excluded from Git, not published)
```

---

## Known Issues

- **Page Breakage**: Enabling "Load All Tweets" will make X glitch out and usually cause high resource usage. The text itself is still loaded and usable, even if the display is broken.
- **Content Optimization**: The feed optimization feature may fail to hide necessary elements or not hide all elements.

---

## Disclaimer

X Analyzer is intended for educational and analytical purposes only. Users are responsible for ensuring their actions comply with the terms of service of X.com, OpenAI, and applicable laws. The developers are not liable for misuse or unauthorized actions.

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---
