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
    const imgURL = "https://imgur.com/a/s8ZBuSD";
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

    const body = `⎯ [(🌷) OWNER INFO (🌷)] ⎯
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

Name   : TanJil Hasan 🎀
UID    : 61579509758592
U.n.   : picchi143

Age    : 𝟷𝟿+
study  : honours
Status : Single

number : 𝟎𝟏𝟕𝟒𝟗𝟑𝟏𝟓𝟏𝟓𝟕
House  : Bangladesh,Dhaka
Relign : Islam


⎯⎯⎯⎯ [ 🔧 BOT ] ⎯⎯⎯⎯
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

👑 Author : 🎀 𝚃 𝙰 𝙽 𝙹 𝙸 𝙻 🎀`;

    message.reply({
      body,
      attachment,
      mentions
    });
  }
};
