module.exports = {
  config: {
    name: "upx",
aliases: [],
    version: "1.0",
    author: "Tawsif",
    role: 0,
    shortDescription: {
      en: "Displays the total number of users of the bot and check uptime "
    },
    longDescription: {
      en: "Displays the total number of users who have interacted with the bot and check uptime."
    },
    category: "system",
    guide: {
      en: "Use {p}totalusers to display the total number of users of the bot and check uptime."
    }
  },
  onStart: async function ({ api, message, event, args, usersData, threadsData }) {
try {
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const uptime = process.uptime();

      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const uptimeString = `${hours}Hrs ${minutes}min ${seconds}sec`;

      const uptext = (`⏰ | Bot running time\n☞ ${uptimeString}\n\n👪 | Total Users\n☞ ${allUsers.length}\n🌸 | Total threads\n☞ ${allThreads.length}`);
    const edits = ["LOADING..\n[██▒▒▒▒▒▒▒▒]", "LOADING...\n[████▒▒▒▒▒▒]", "LOADING...\n[███████▒▒]","LOADING...\n[█████████]",`${uptext}`];
let msg = await message.reply("LOADING.\n[█▒▒▒▒▒▒▒▒▒]");

edits.forEach((d, i) => setTimeout(() => api.editMessage(`${d}`, msg.messageID), 1000 * i));
    } catch (error) {
      console.error(error);
      api.sendMessage("An error occurred while retrieving data.", event.threadID);
    }
  }
};
