const fs = require("fs");
const fantasyAPI = 'https://redwans-mid-journey.onrender.com'; // Fantasy API
const realisticAPI = 'https://redwans-realism-api.onrender.com'; // Realistic API
const animeAPI = 'https://redwans-xl-api-1.onrender.com'; // Anime API
const path = require("path");
const axios = require("axios");

// Function to classify the prompt using Stoic GPT API
async function classifyPrompt(prompt) {
  const classificationPrompt = `Classify this prompt as anime, fantasy or realistic: "${prompt}". Ensure that you just reply with the result: anime, fantasy or realistic.`;
  
  const stoicGptApiUrl = `https://www.samirxpikachu.run.place/stoicgpt?query=${encodeURIComponent(classificationPrompt)}`;
  const response = await axios.get(stoicGptApiUrl);
  
  if (response.data && typeof response.data === "string") {
    return response.data.trim(); // Return trimmed response
  } else {
    throw new Error("Classification result is undefined or invalid.");
  }
}

// Function to fetch the image until it's ready
async function fetchImageUntilReady(apiUrl) {
  let imageUrl = null;
  while (!imageUrl) {
    try {
      const response = await axios.get(apiUrl, { timeout: 300000 });
      imageUrl = response.data.imageUrl;
      return imageUrl;
    } catch (error) {
      console.error("Error fetching image, retrying...", error.message);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait before retrying
    }
  }
}

module.exports = {
  config: {
    name: "midjourney",
    aliases: ["mj"],
    author: "Redwan",
    version: "1.0",
    cooldowns: 20,
    role: 1,
    shortDescription: "Generate an image based on a prompt.",
    longDescription: "Generates an image using the provided prompt by classifying it as anime or realistic.",
    category: "ai"
  },

  onStart: async function ({ message, args, api, event }) {
    // Determine the prompt
    let prompt = args.join(" ");
    if (!prompt && event.messageReply) {
      prompt = event.messageReply.body;
    }

    console.log("Prompt:", prompt); // Log the prompt to see if it's being correctly captured

    if (!prompt) {
      return api.sendMessage("❌ | You need to provide a prompt.", event.threadID, event.messageID);
    }

    try {
      // Classify the prompt
      const classificationResult = await classifyPrompt(prompt);
      console.log("Classification Result:", classificationResult); // Log classification result

      // Notify the user that the process is ongoing
      api.sendMessage("🔄 | MidJourney process is ongoing, it might take some time...", event.threadID, event.messageID);

      // Select the appropriate API based on the classification result
      let selectedAPI;
      if (classificationResult.toLowerCase() === "anime") {
        selectedAPI = animeAPI; // Using the Anime API for anime classification
      } else if (classificationResult.toLowerCase() === "realistic") {
        selectedAPI = realisticAPI; // Using the Realistic API for realistic classification
      } else {
        return api.sendMessage("❌ | Classification result is invalid. Please provide a clear prompt.", event.threadID, event.messageID);
      }

      const apiUrl = `${selectedAPI}/generate?prompt=${encodeURIComponent(prompt)}`;
      console.log(`Requesting image generation from URL: ${apiUrl}`);

      // Fetch the image
      const imageUrl = await fetchImageUntilReady(apiUrl);

      if (!imageUrl) {
        return api.sendMessage("❌ | Failed to generate the image. Please try again later.", event.threadID);
      }

      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 300000
      });

      // Save the image to a cache directory
      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const imagePath = path.join(cacheFolderPath, `${Date.now()}_generated_image.png`);
      fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, "binary"));
      const stream = fs.createReadStream(imagePath);

      message.reply({
        body: `✨ | Here is your midjourney generated image with the prompt: "${prompt}"!`,
        attachment: stream
      });

      console.log(`Image generated successfully for prompt: "${prompt}"`);

    } catch (error) {
      console.error("Error during image generation:", error);

      let errorMessage = "❌ | An unexpected error occurred. Please try again later.";
      if (error.response) {
        console.error(`API Error - Status: ${error.response.status}, Data:`, error.response.data);
        errorMessage = "❌ | Error from the API. Try again later.";
      }

      api.sendMessage(errorMessage, event.threadID, event.messageID);
    }
  }
};
