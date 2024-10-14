const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "giji",
    aliases: ["gijijourney"],
    version: "1.0",
    author: "Arfan Mahim | Mahi",//modified by mahi 
    countDown: 5,
    role: 0,
    longDescription: "Text to Image",
    category: 'ai',
    guide: {
      en: "{pn} prompt"
    }
  },
  onStart: async function ({ api, args, message, event }) {
    try {
      let prompt = args.join(" ");
      let imageUrl = `https://ts-ai-api-shuddho.onrender.com/api/animagine?prompt=${encodeURIComponent(prompt)}`;
      const waitingMessage = await message.reply("Please wait...⏳");
      message.reaction('⏳', event.messageID);

      await message.reply({
        body: `✅ IMAGE GENERATED FROM NIJI!\n\nYOUR PROMPT: ${prompt}`,
        attachment: await getStreamFromURL(imageUrl)
      });

      message.unsend(waitingMessage.messageID);
      await message.reaction('✅', event.messageID);
    } catch (error) {
      console.error(error);
      message.reply("An error occurred.");
      message.reaction('❌', event.messageID);
    }
  }
};
