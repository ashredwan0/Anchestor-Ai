const axios = require('axios');
const emojiRegex = require("emoji-regex");
const regex = emojiRegex();
const randomStickers = [
  "1747083968936188", "1747084802269438", "1747088982269020", "526214684778630",
  "193082931210644", "526220691444696", "1841028499283259", "526224694777629",
  "1747090242268894", "1747087128935872", "1747085962269322", "1747086582269260",
  "1747085735602678", "1747092188935366", "1747082038936381", "1747085322269386",
  "1747084572269461", "1747081105603141", "1747082232269695", "1747081465603105",
  "1747083702269548", "1747082948936290", "1747089445602307", "1747091025602149"
];

const randomIndex = () => Math.floor(Math.random() * randomStickers.length);
const sticker = () => randomStickers[randomIndex()];
const J = ['What do you want from me now👽💔', 'Hello 👽'];
const randomMessage = () => J[Math.floor(Math.random() * J.length)];

async function handleReply(message, content, event) {
  try {
    const emojis = content.match(regex);
    if (emojis) {
      const emoji = emojis[0];
      message.reaction(emoji, event.messageID);
    }
    message.reply(content, (error, replyMessage) => {
      if (error) {
        message.reaction("😴", event.messageID);
        return console.error("Error:", error);
      }

      global.GoatBot.onReply.set(replyMessage.messageID, {
        commandName: "سونا",
        messageID: replyMessage.messageID,
        author: event.senderID,
        type: "سونا",
      });
    });
  } catch (error) {
    message.reaction("😴", event.messageID);
    console.error('Reply Error:', error);
  }
}

async function fetchChatResponse(question, event) {
  try {
    const response = await axios.post('https://chat-issam.onrender.com/chat', {
      userId: `${event.senderID}||sona`,
      message: question,
      model: 'sona'
    });
    return response.data.messages[response.data.messages.length - 1].content;
  } catch (error) {
    throw new Error('Chat Fetch Error');
  }
}

module.exports = {
  config: {
    name: 'itachi',
    version: '1.0',
    author: 'jerky',
    countDown: 5,
    role: 0,
    shortDescription: '',
    longDescription: '',
    category: '',
  },

  onStart: async ({ api, event, args, message }) => {
    if (args.length < 1) {
      return message.reply(randomMessage(), async () => {
        await message.reply({ sticker: sticker() });
      });
    }

    const question = args.join(' ');

    if (args[0] === "حذف") {
      return axios.post('https://chat-issam.onrender.com/clear', {
        chatId: `${event.senderID}||sona`
      })
        .then(response => {
          console.log(response.data);
          message.reply("تم 🙂🚮");
        })
        .catch(error => {
          message.reaction("😴", event.messageID);
          console.error('Clear Error:', error);
        });
    }

    try {
      const chatResponse = await fetchChatResponse(question, event);
      await handleReply(message, chatResponse, event);
    } catch (error) {
      message.reaction("😴", event.messageID);
    }
  },

  onReply: async ({ api, event, args, message }) => {
    if (args.length < 1) {
      return message.reply(randomMessage(), async () => {
        await message.reply({ sticker: sticker() });
      });
    }

    const question = args.join(' ');

    try {
      const chatResponse = await fetchChatResponse(question, event);
      await handleReply(message, chatResponse, event);
    } catch (error) {
      message.reaction("😴", event.messageID);
    }
  }
};
