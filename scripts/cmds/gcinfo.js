const axios = require('axios');
const fs = require('fs-extra');

module.exports = {
  config: {
    name: "gcinfo",
    aliases: [],
    version: "2.1",
    author: "〲T A N J I L ツ ",
    role: 0,
    shortDescription: {
      en: "Show group info"
    },
    longDescription: {
      en: "Displays group name, photo, member stats, admins, emoji, approval mode, and more beautifully"
    },
    category: "Group",
    guide: {
      en: "/gcinfo"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const groupName = threadInfo.threadName || "Unnamed Group";
      const adminIDs = threadInfo.adminIDs.map(i => i.id);
      const admins = threadInfo.userInfo.filter(user => adminIDs.includes(user.id));
      const males = threadInfo.userInfo.filter(u => u.gender === 'MALE').length;
      const females = threadInfo.userInfo.filter(u => u.gender === 'FEMALE').length;
      const totalMembers = threadInfo.participantIDs.length;
      const totalMessages = threadInfo.messageCount || "Unknown";
      const groupEmoji = threadInfo.emoji || "None";
      const groupImage = threadInfo.imageSrc;
      const approvalMode = threadInfo.approvalMode ? "On" : "Off";
      const threadID = event.threadID;

      let adminList = admins.map(ad => `• ${ad.name}`).join("\n┃ ");

      const msg =
`╭━━━━━━━━━━━━━━━━╮
┃          ✨ 𝐍𝐚𝐦𝐞 ✨
┃  
┃          ${groupName} 
┃
┃     𝐓𝐈𝐃 : ${threadID}
┃ 👤 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${totalMembers}
┃ 💬 𝐓𝐨𝐭𝐚𝐥 𝐌𝐚𝐬𝐬𝐞𝐠𝐞𝐬: ${totalMessages}
┃
┃ 🙋🏻‍♀️ 𝐌𝐚𝐥𝐞𝐬: ${males}
┃ 🙋🏼‍♂️ 𝐅𝐞𝐦𝐚𝐥𝐞𝐬: ${females}
┃
┃ 😃 𝐄𝐦𝐨𝐣𝐢: ${groupEmoji}
┃ ✅ 𝐀𝐩𝐩𝐫𝐨𝐯𝐞 𝐌𝐨𝐝𝐞: ${approvalMode}
┃ 
┃ 👑 𝐀𝐃𝐌𝐈𝐍:
┃ ${adminList}
╰━━━━━━━━━━━━━━━━╯`;

      if (groupImage) {
        const path = __dirname + "/tmp.png";
        const res = await axios.get(groupImage, { responseType: "arraybuffer" });
        fs.writeFileSync(path, Buffer.from(res.data, "utf-8"));

        api.sendMessage({
          body: msg,
          attachment: fs.createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path));
      } else {
        api.sendMessage(msg, event.threadID);
      }
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Failed to get group info.", event.threadID);
    }
  }
};
