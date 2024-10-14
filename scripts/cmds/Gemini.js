const axios = require('axios');
const cookie = 'g.a000gggofsT-eH4KIvq359t2PSkOCpfqw50IE922AbLD-vn8M1oZ5clc36fJT8D_mWe8eXtQEwACgYKAZgSAQASFQHGX2Mix0E7IgxI48h5sQo6YgKwjBoVAUF8yKpG8zgsWay_nGUmv-fyG61J0076';
const storage = {};
const is_ai_know_all_users_names = false;

module.exports.config = {
  name: "gemini",
  version: "1.0",
  role: 0,
  author: "Mesbah Bb'e",
  coolDown: 0,
  description: {
    en: "ask question from ai"
  },
  category: "ai",
  guide: {
    en: "{pn} <prompt>",
  }
};

module.exports.clearHistory = function () {
  global.GoatBot.onReply.clear();
};

async function clean(userID) {
  if (storage[userID]) {
    delete storage[userID];
    return true;
  }
  return true;
}

async function voice(answer) {
  const api = `https://apiv3-2l3o.onrender.com/tts?text=${encodeURIComponent(answer)}&voice=1`;
  return await axios.get(api, { responseType: 'stream' });
}

async function processRequest(api, event, args, usersData, message) {
  const question = args.join(' ');
  if (!question) {
    return message.reply("Please provide a question first.", event.threadID, event.messageID);
  }

  message.reaction(" ⏰", event.messageID);
  const processing = await api.sendMessage("Processing your request. Please wait a few seconds...", event.threadID);

  const userName = await usersData.getName(event.senderID);
  const userID = event.senderID;

  if (!storage[userID]) {
    storage[userID] = is_ai_know_all_users_names ? `${userName}.\n` : '';
  }
  storage[userID] += `${question}.\n`;

  const startTime = Date.now();
  let apiUrl = `https://rehatdesu.xyz/api/llm/gemini?query=${encodeURIComponent(question)}&uid=${userID}&cookie=${cookie}`;
  if (event.type === "message_reply") {
    const imageUrl = event.messageReply.attachments[0]?.url;
    if (imageUrl) {
      apiUrl += `&attachment=${encodeURIComponent(imageUrl)}`;
    }
  }

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const endTime = Date.now();
    const seconds = ((endTime - startTime) / 1000).toFixed(2);

    const answer = response.data.message;
    const reply = `𐌌𐌄𐌔𐌁ꫝ𐋅 𐌔ꫝ𐋄𐋄\n━━━━━━━━━━━━━━━━━━━\n𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻: ${question}\n━━━━━━━━━━━━━━━━━━━\n𝗔𝗻𝘀𝘄𝗲𝗿: ${answer}\n\n━━━━━━━━━━━━━━━━━━━\n𝗣𝗿𝗼𝗰𝗲𝘀𝘀𝗶𝗻𝗴 𝗧𝗶𝗺𝗲: ${seconds}`;

    const voiceAnswer = await voice(answer);
    message.reply({
      body: reply,
      attachment: voiceAnswer.data
    }, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          author: event.senderID,
          messageID: info.messageID,
          results: response.data,
        });
        message.reaction("✅", event.messageID);
      }
    });
  } catch (error) {
    console.error(error);
    message.reply("An error occurred while processing your request.");
    message.reaction("❌", event.messageID);
  }
}

module.exports.onStart = async function ({ api, event, args, usersData, message }) {
  if (args[0] === 'clear') {
    this.clearHistory();
    const clear = await axios.get(`https://rehatdesu.xyz/api/llm/gemini?query=clear&uid=${event.senderID}&cookie=${cookie}`);
    message.reply(`Error: ${error.message}`);
  }
  await processRequest(api, event, args, usersData, message);
};

module.exports.onReply = async function ({ api, event, args, usersData, Reply, message }) {
  let { author } = Reply;
  if (author !== event.senderID) return;
  await processRequest(api, event, args, usersData, message);
};
