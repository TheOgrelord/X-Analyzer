// Function to extract all text content from the feed
function getFeedText() {
  const feedContainer = document.querySelector('div[aria-label="Timeline: Your Home Timeline"]');
  if (!feedContainer) {
    console.error("No feed container found.");
    return '';
  }
  return feedContainer.innerText;
}

// Function to extract text from a profile page
function getAllProfileText() {
  const contentSection = document.querySelector(
    '#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div.css-175oi2r.r-kemksi.r-1kqtdi0.r-1ua6aaf.r-th6na.r-1phboty.r-16y2uox.r-184en5c.r-1abdc3e.r-1lg4w6u.r-f8sm7e.r-13qz1uu.r-1ye8kvj'
  );

  if (!contentSection) {
    console.error("No content section found on this profile page.");
    return '';
  }

  const combinedText = contentSection.innerText;
  console.log("Extracted combined text from profile content:", combinedText);

  return combinedText;
}

// Function to extract text from replies to a specific tweet
function getRepliesText() {
  const repliesContainer = document.querySelector('div[aria-label="Timeline: Conversation"]');
  if (!repliesContainer) {
    console.error("No replies container found.");
    return '';
  }
  return repliesContainer.innerText;
}

// Function to extract text from trending topics or search results
function getTrendsText() {
  const trendsContainer = document.querySelector('div[aria-label="Timeline: Search feed"]');
  if (!trendsContainer) {
    console.error("No trends container found.");
    return '';
  }
  return trendsContainer.innerText;
}

// Listener to respond to messages from the popup or background scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);
  
  if (request.action === "extractProfile") {
    let extractedText = "";

    switch (request.contentType) {
      case "profile":
        extractedText = getAllProfileText();
        break;
      case "feed":
        extractedText = getFeedText();
        break;
      case "replies":
        extractedText = getRepliesText();
        break;
      case "trends":
        extractedText = getTrendsText();
        break;
      default:
        console.error("Unknown content type requested:", request.contentType);
        sendResponse({ error: "Unknown content type" });
        return;
    }

    if (!extractedText) {
      sendResponse({ error: "No content found or extracted" });
    } else {
      console.log("Extracted text to be sent:", extractedText);
      sendResponse({ profileText: extractedText });
    }
  }
});
