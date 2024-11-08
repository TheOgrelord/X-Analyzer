let apiKey = null;

// Function to load the API key from config.json
function loadApiKey() {
  return fetch(chrome.runtime.getURL('config.json'))
    .then((response) => response.json())
    .then((config) => {
      if (config && config.apiKey) {
        apiKey = config.apiKey;
        console.log("API key successfully loaded in background script.");
      } else {
        console.error("Error: API key not found in config.json.");
      }
    })
    .catch((error) => {
      console.error("Error loading API key from config.json:", error);
    });
}

// Load the API key as soon as the background script is initialized
loadApiKey();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in background script:", request);

  if (request.action === "analyzeProfile") {
    if (!apiKey) {
      console.error("Error: API key is not loaded.");
     
      sendResponse("Error: API key not loaded.");
      return true; // Return true to indicate async response
    }

    if (!request.profileText || !request.analysisType) {
      console.error("Error: Received incomplete or invalid profile text or analysis type in background script.");
      sendResponse("Error: Incomplete profile text or analysis type received.");
      return true; // Return true to indicate async response
    }

    console.log("Profile text received for analysis:", request.profileText);
    console.log("Analysis type received:", request.analysisType);
    console.log("Content type received:", request.contentType);
    console.log("Custom prompt received:", request.customPrompt);
    console.log("Model received:", request.model);

    // Use the provided token limit or a default value of 800
    const maxTokens = request.maxTokens || 800;
    const selectedModel = request.model || "gpt-4o-mini"; // Default to "gpt-4o-mini"

    analyzeWithOpenAI(request.profileText, request.analysisType, request.contentType, request.customPrompt, apiKey, maxTokens, selectedModel)
      .then((analysisResult) => {
        console.log("Analysis result:", analysisResult);
        sendResponse(analysisResult);
      })
      .catch((error) => {
        console.error("Unexpected error during analysis:", error);
        sendResponse(`Error: Unexpected error during analysis. Details: ${error.message || error}`);
      });

    return true; // Return true to indicate the response is asynchronous
  } else {
    console.error("Error: Unknown action received in background script.");
    sendResponse("Error: Unknown action received.");
    return true;
  }
});

async function analyzeWithOpenAI(profileText, analysisType, contentType, customPrompt, apiKey, maxTokens, selectedModel) {
  // Create the prompt based on the custom prompt, analysis type, and content type
  let prompt = `Content Type: ${contentType}\n`;

  if (customPrompt && customPrompt.length > 0) {
    // If a custom prompt is provided, use it instead of the default prompt
    prompt += `${customPrompt}\n\n${profileText}`;
  } else {
    switch (analysisType) {
      case "marketing":
        prompt += `Analyze this Twitter ${contentType} text and identify key interests and demographics for targeted marketing strategies:\n\n${profileText}`;
        break;
      case "competitor":
        prompt += `Analyze this Twitter ${contentType} text to identify key topics, interests, and potential strategic priorities of the competitor:\n\n${profileText}`;
        break;
      case "sentiment":
        prompt += `Analyze this Twitter ${contentType} text and provide a sentiment analysis of the recent tweets and ${contentType} content:\n\n${profileText}`;
        break;
      case "audience":
        prompt += `Analyze this Twitter ${contentType} text to describe the likely audience and their interests based on the ${contentType}'s content and engagement:\n\n${profileText}`;
        break;
      case "securityaudit":
        prompt += `Analyze this Twitter ${contentType} text to provide a security audit of the subject of the ${contentType} in question and recommend best practices:\n\n${profileText}`;
        break;
      case "twittertrend":
        prompt += `Analyze this Twitter ${contentType} text and identify recent sentiments, recurring topics, and emerging themes in the content:\n\n${profileText}`;
        break;
      case "political":
        prompt += `Analyze this Twitter ${contentType} text and identify key political themes and positions that the ${contentType} supports or opposes:\n\n${profileText}`;
        break;
      case "influencer":
        prompt += `Analyze this Twitter ${contentType} text to determine the key topics and areas of influence. Identify if the ${contentType} has significant reach in these areas:\n\n${profileText}`;
        break;
      case "recruitment":
        prompt += `Analyze this Twitter ${contentType} text to identify the key professional interests, skills, and expertise of the subject of the ${contentType}:\n\n${profileText}`;
        break;
      case "reputation":
        prompt += `Analyze this Twitter ${contentType} text to assess the ${contentType}'s current reputation based on its posts and audience engagement:\n\n${profileText}`;
        break;
      case "research":
        prompt += `Analyze this Twitter ${contentType} text and provide an overview of common social or cultural themes in the ${contentType}'s content:\n\n${profileText}`;
        break;
      case "frauddetection":
        prompt += `Analyze this Twitter ${contentType} text and scan for fraudulent activity and suspicious behavior:\n\n${profileText}`;
        break;
      default:
        prompt += `Analyze this Twitter ${contentType} text:\n\n${profileText}`;
    }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: selectedModel, // Use the user-specified model or default
        messages: [
          { role: "system", content: "You are a Twitter analyst." },
          { role: "user", content: prompt }
        ],
        max_tokens: maxTokens // Use the passed max tokens value
      })
    });

    console.log("OpenAI API response status:", response.status, response.statusText);

    if (!response.ok) {
      console.error("OpenAI API request failed with status:", response.status, response.statusText);
      return `Error: OpenAI API request failed with status ${response.status} ${response.statusText}`;
    }

    const data = await response.json();

    if (data.error) {
      console.error("OpenAI API error:", data.error.message);
      return `Error: ${data.error.message}`;
    } else {
      console.log("Received response from OpenAI API:", data.choices[0].message.content.trim());
      return data.choices[0].message.content.trim();
    }
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return 'Error: Failed to retrieve information from OpenAI.';
  }
}