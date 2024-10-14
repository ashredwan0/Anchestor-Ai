const axios = require('axios');
let isGaeOn = true; // Initial state: 'gae' command is active

// Function to get the base API URL from a GitHub-hosted JSON file
const baseApiUrl = async () => {
  const base = await axios.get(`https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`);
  return base.data.api;
};

module.exports = {
  config: {
    name: "gae",  
    aliases: ["gae", "nigga"],  
    version: "1.0.2",  
    author: "redwan",  
    countDown: 0,
    role: 0,
    description: "Replies to all messages when it's on, and can be turned on/off.",
    category: "chat",
    guide: {
      en: "Type 'gae on' to activate or 'gae off' to deactivate the bot. It will reply to messages when activated."
    }
  },
  
  // Main function that handles incoming commands
  onStart: async ({ api, event, args }) => {
    const link = `${await baseApiUrl()}/baby`;  
    const message = args.join(" ").toLowerCase();  

    try {
      if (message === "gae off") {
        isGaeOn = false;
        return api.sendMessage("Gae bot has been deactivated.", event.threadID, event.messageID);
      }

      if (message === "gae on") {
        isGaeOn = true;
        return api.sendMessage("Gae bot is now active.", event.threadID, event.messageID);
      }

      if (!isGaeOn) {
        return; // Do nothing if the bot is off
      }

      if (message) {
        const response = await axios.get(`${link}?text=${message}`);
        const reply = response.data.reply || "Sorry, I couldn't understand that.";
        return api.sendMessage(`${reply}`, event.threadID, event.messageID);
      } else {
        return api.sendMessage("Hi, I am here to help you!", event.threadID, event.messageID);
      }
      
    } catch (error) {
      console.error("Error:", error);
      return api.sendMessage("Oops, something went wrong!", event.threadID, event.messageID);
    }
  },

  // New onChat function to handle messages
  onChat: async ({ api, event, args }) => {
    if (!isGaeOn) return; // Only respond if the bot is active

    const link = `${await baseApiUrl()}/baby`;  
    const message = event.body.toLowerCase(); // Get the incoming message

    try {
      const response = await axios.get(`${link}?text=${message}`);
      const reply = response.data.reply || "Sorry, I couldn't understand that."; // Fallback response
      return api.sendMessage(`${reply}`, event.threadID, event.messageID);
    } catch (error) {
      console.error("Error:", error);
      return api.sendMessage("Oops, something went wrong!", event.threadID, event.messageID);
    }
  }
};
