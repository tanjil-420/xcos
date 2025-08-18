module.exports = {
  config: {
    name: "owner",
    version: 2.1,
    author: "〲 T A N J I L ツ",
    longDescription: "Info about bot and owner",
    category: "Special",
    guide: {
      en: "{p}{n}",
    },
  },

  onStart: async function ({ api, event, usersData, message }) {
    const imgURL = "https://files.catbox.moe/s6ju49.jpg";
    const attachment = await global.utils.getStreamFromURL(imgURL);

    const id = event.senderID;
    const userData = await usersData.get(id);
    const name = userData.name;
    const mentions = [{ id, tag: name }];

    const info = {
      botName: "✨YOUR 卝 চুন্নি✨",
      prefix: "/",
      ownerName: "〲 T A N J I L ツ",
      gender: "Male",
      number: "𝟎𝟏𝟕𝟒𝟗𝟑𝟏𝟓𝟏𝟓𝟕",
      age: "𝟏𝟗 ±",
      relationship: "𝐒𝐢𝐧𝐠𝐥𝐞",
      study: "𝐈𝐧𝐭𝐞𝐫 𝟑",
      location: "𝐃𝐡𝐚𝐤𝐚",
    };

    const body = `
┏━━━━━━━━━━━┓
┃ 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 ┃
┗━━━━━━━━━━━┛

👤 𝗛𝗲𝗹𝗹𝗼: ${name}
🤖 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲: ${info.botName}
📎 𝗣𝗿𝗲𝗳𝗶𝘅: ${info.prefix}

👑 𝗢𝘄𝗻𝗲𝗿: ${info.ownerName}
🚹 𝗚𝗲𝗻𝗱𝗲𝗿: ${info.gender}
📱 𝗡𝘂𝗺𝗯𝗲𝗿: ${info.number}
🎂 𝗔𝗴𝗲: ${info.age}

❤️ 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻: ${info.relationship}
🏫 𝗦𝘁𝘂𝗱𝘆: ${info.study}
📍 𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻: ${info.location}

━━━━━━━━━━━━━━━`;

    message.reply({
      body,
      attachment,
      mentions
    });
  }
};
