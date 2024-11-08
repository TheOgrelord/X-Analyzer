// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const analyzeButton = document.getElementById("analyzeProfileButton");
  const resultContainer = document.getElementById("result");
  const copyButton = document.getElementById("copy");
  const clearButton = document.getElementById("clearAnalysis");
  const analysisTypeSelector = document.getElementById("analysisType");
  const tokenLimitInput = document.getElementById("tokenLimit");
  const toggleContentOptimization = document.getElementById("toggleContentOptimization");
  const toggleDisplayMode = document.getElementById("toggleDisplayMode");
  const advancedOptionsToggle = document.getElementById("advancedOptionsToggle");
  const advancedOptionsContent = document.getElementById("advancedOptionsContent");
  const customPromptInput = document.getElementById("customPrompt");
  const clearCustomPromptButton = document.getElementById("clearCustomPrompt");
  const modelInput = document.getElementById("modelInput"); // New model input

  // Set initial arrow direction
  advancedOptionsToggle.innerHTML = `Advanced Options &#9660;`;

  // Toggle Advanced Options visibility
  advancedOptionsToggle.addEventListener("click", () => {
    const isHidden = advancedOptionsContent.classList.toggle("hidden");
    advancedOptionsToggle.innerHTML = `Advanced Options ${isHidden ? '&#9660;' : '&#9650;'}`;
  });

  // Save settings to local storage
  function saveToLocalStorage(key, value) {
    localStorage.setItem(key, value);
  }

  // Restore settings from local storage
  function restoreFromLocalStorage(key, element) {
    const savedValue = localStorage.getItem(key);
    if (savedValue !== null) {
      element.value = savedValue;
    }
  }

  // Save toggle state to local storage
  function saveToggleState(key, value) {
    localStorage.setItem(key, value);
  }

  // Restore toggle state from local storage
  function restoreToggleState(key, checkboxElement) {
    const savedState = localStorage.getItem(key);
    if (savedState !== null) {
      checkboxElement.checked = savedState === "true";
    }
  }

  // Save AI output to local storage
  function saveAIOutput(text) {
    localStorage.setItem("aiOutputText", text);
  }

  // Restore AI output from local storage
  function restoreAIOutput() {
    const savedText = localStorage.getItem("aiOutputText");
    if (savedText !== null) {
      resultContainer.innerHTML = `<div>${savedText}</div>`;
      copyButton.style.display = "block";
      clearButton.style.display = "block";
    }
  }

  // Restore saved states on page load
  restoreToggleState("optimizeContent", toggleContentOptimization);
  restoreToggleState("loadAllTweets", toggleDisplayMode);
  restoreAIOutput();
  restoreFromLocalStorage("tokenLimitValue", tokenLimitInput);
  restoreFromLocalStorage("analysisType", analysisTypeSelector);
  restoreFromLocalStorage("customPrompt", customPromptInput);
  restoreFromLocalStorage("modelName", modelInput); // Restore model input

  // Detect content type based on the current URL
  function detectContentType(url) {
    if (url.includes("/home") || url === "https://x.com/") {
      return "feed";
    } else if (url.includes("/status/")) {
      return "replies";
    } else if (url.includes("/explore") || url.includes("/trending")) {
      return "trends";
    } else {
      return "profile";
    }
  }

  // Analyze button event listener
  analyzeButton.addEventListener("click", () => {
    resultContainer.innerHTML = "<p>Analyzing profile text, please wait...</p>";

    // Get the active tab and its URL to detect content type
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      const detectedContentType = detectContentType(activeTab.url);

      // Pass the detected content type to the content script
      chrome.tabs.sendMessage(activeTab.id, { action: "extractProfile", contentType: detectedContentType }, (data) => {
        if (chrome.runtime.lastError) {
          console.error("Error in content script communication:", chrome.runtime.lastError.message);
          resultContainer.innerHTML = "<p class='error'>Error: Unable to extract profile text. Refreshing the page may fix this.</p>";
          copyButton.style.display = "none";
          clearButton.style.display = "none";
          return;
        }
        if (!data || !data.profileText) {
          console.error("Error: Received incomplete or invalid profile text.");
          resultContainer.innerHTML = "<p class='error'>Error: Invalid profile text received.</p>";
          copyButton.style.display = "none";
          clearButton.style.display = "none";
          return;
        }

        // Send the extracted text to the background script for AI analysis
        const analysisType = analysisTypeSelector.value;
        const maxTokens = parseInt(tokenLimitInput.value, 10);
        const customPrompt = customPromptInput.value;
        const modelName = modelInput.value.trim() || "gpt-4o-mini"; // Default to gpt-4o-mini if empty

        // Save the values on click
        saveToLocalStorage("tokenLimitValue", maxTokens);
        saveToLocalStorage("analysisType", analysisType);
        saveToLocalStorage("customPrompt", customPrompt);
        saveToLocalStorage("modelName", modelName); // Save model name

        chrome.runtime.sendMessage(
          {
            action: "analyzeProfile",
            profileText: data.profileText,
            analysisType: analysisType,
            contentType: detectedContentType,
            customPrompt: customPrompt,
            maxTokens: maxTokens,
            model: modelName // Pass model name
          },
          (result) => {
            if (chrome.runtime.lastError) {
              console.error("Error in background script communication:", chrome.runtime.lastError.message);
              resultContainer.innerHTML = "<p class='error'>Error: Unable to analyze profile text.</p>";
              copyButton.style.display = "none";
              clearButton.style.display = "none";
              return;
            }
            if (result.startsWith("Error")) {
              console.error("Error in AI analysis:", result);
              resultContainer.innerHTML = `<p class='error'>${result}</p>`;
              copyButton.style.display = "none";
              clearButton.style.display = "none";
            } else {
              resultContainer.innerHTML = `<div>${result}</div>`;
              saveAIOutput(result);
              copyButton.style.display = "block";
              clearButton.style.display = "block";
            }
          }
        );
      });
    });
  });

  // Copy button event listener
  copyButton.addEventListener("click", () => {
    const textToCopy = resultContainer.innerText;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        alert("Text copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy text:", err);
      });
  });

  // Clear button event listener
  clearButton.addEventListener("click", () => {
    // Clear the analysis text from the container
    resultContainer.innerHTML = "";

    // Hide the copy and clear buttons if the analysis is cleared
    copyButton.style.display = "none";
    clearButton.style.display = "none";

    // Clear the saved analysis text in localStorage
    localStorage.removeItem("aiOutputText");
  });

  // Event listener for the Clear button
  clearCustomPromptButton.addEventListener("click", () => {
    customPromptInput.value = ""; // Clear the textarea
    localStorage.removeItem("customPrompt"); // Optionally, clear it from localStorage too
  });

  // Toggle event listener for content optimization
  toggleContentOptimization.addEventListener("change", () => {
    const isChecked = toggleContentOptimization.checked;
    saveToggleState("optimizeContent", isChecked);

    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;

      // Inject or remove styles based on the toggle state
      if (isChecked) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: () => {
            // Refined CSS to hide images, videos, and collapse specific containers
            const style = document.createElement('style');
            style.id = 'optimizeFeedStyle';
            style.textContent = `
              /* Hide specific image and video elements */
              img, video, [data-testid="videoPlayer"], [data-testid="tweetPhoto"], 
              [aria-label="Image"], [data-testid="Tweet-User-Avatar"], 
              .r-14gqq1x {
                display: none !important;
              }

              /* Collapse empty or unwanted "card.wrapper" containers */
              [data-testid="card.wrapper"] div[data-testid="card.layoutLarge.media"] {
                display: none !important;
              }

              /* Set max-width for the feed */
              div, section, article {
                max-width: 5000px !important;
              }

              /* Shrink text size */
              body, p, span, a, li, div, input, textarea {
                font-size: 10px !important;
                line-height: 1.2 !important;
              }
            `;
            document.head.appendChild(style);
          }
        });
      } else {
        // Remove the injected styles if the toggle is turned off
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: () => {
            const style = document.getElementById('optimizeFeedStyle');
            if (style) {
              style.remove();
            }
          }
        });
      }
    });
  });

  // Toggle event listener for display mode
  toggleDisplayMode.addEventListener("change", () => {
    const isChecked = toggleDisplayMode.checked;
    saveToggleState("loadAllTweets", isChecked);

    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;

      // Inject or remove styles based on the toggle state
      if (isChecked) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: () => {
            const style = document.createElement('style');
            style.id = 'toggleDisplayStyle';
            style.textContent = `
              .css-175oi2r {
                display: contents !important;
              }
            `;
            document.head.appendChild(style);
          }
        });
      } else {
        // Remove the injected styles if the toggle is turned off
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: () => {
            const style = document.getElementById('toggleDisplayStyle');
            if (style) {
              style.remove();
            }
          }
        });
      }
    });
  });

});
