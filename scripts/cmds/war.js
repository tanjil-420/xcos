const fs = require("fs");
const path = __dirname + "/cache/war.json";

const ADMIN_UID = "61577095705293"; // তোমার UID

module.exports = {
  config: {
    name: "war",
    version: "1.0",
    author: "Amit Max ⚡",
    description: "Tag someone to war-mode and insult them automatically when they chat",
    category: "fun",
    usages: "[on/off @tag]",
    cooldowns: 5,
    role: 0, 
  },

  onStart: async function({ api, event, args }) {
    
    if (event.senderID !== ADMIN_UID) {
      return api.sendMessage(
        "এইটা কি তোর বাপের command নাকি রে? 🤬 হুদাই war করতে আসছোস!🫡",
        event.threadID,
        event.messageID
      );
    }

    const { threadID, messageID, mentions } = event;

    if (!fs.existsSync(path)) fs.writeFileSync(path, "[]", "utf-8");
    let warList;
    try {
      warList = JSON.parse(fs.readFileSync(path, "utf-8"));
    } catch {
      warList = [];
    }

    if (args.length === 0) {
      return api.sendMessage(
        `⚠️ Usage:\n.war on @user - war মোড চালু করবে\n.war off @user - war মোড বন্ধ করবে`,
        threadID,
        messageID
      );
    }

    const command = args[0].toLowerCase();

    if (command !== "on" && command !== "off") {
      return api.sendMessage(
        `⚠️ Usage:\n.war on @user - war মোড চালু করবে\n.war off @user - war মোড বন্ধ করবে`,
        threadID,
        messageID
      );
    }

    if (!mentions || Object.keys(mentions).length === 0) {
      return api.sendMessage(
        `🤓 কারো নাম ট্যাগ করো যাকে war মোডে রাখতে/অপসারণ করতে চাও।`,
        threadID,
        messageID
      );
    }

    const mentionID = Object.keys(mentions)[0];

    if (command === "on") {
      const exists = warList.some(
        e => e.threadID === threadID && e.userID === mentionID
      );

      if (exists) {
        return api.sendMessage(
          `😒 ${mentions[mentionID].replace("@", "")} তো আগেই war মোডে আছে!`,
          threadID,
          messageID
        );
      }

      warList.push({ threadID, userID: mentionID });
      fs.writeFileSync(path, JSON.stringify(warList, null, 2), "utf-8");

      return api.sendMessage(
        `⚔️ ${mentions[mentionID].replace("@", "")} এখন war মোডে! কথা বললেই গালি পাবে!`,
        threadID,
        messageID
      );
    }

    if (command === "off") {
      const updatedList = warList.filter(
        e => !(e.threadID === threadID && e.userID === mentionID)
      );

      fs.writeFileSync(path, JSON.stringify(updatedList, null, 2), "utf-8");

      return api.sendMessage(
        `🥱 ${mentions[mentionID].replace("@", "")} এর war মোড এখন বন্ধ! আর গালি পাবে না।`,
        threadID,
        messageID
      );
    }
  },

  onChat: async function({ api, event }) {
    if (!event.isGroup) return;

    if (!fs.existsSync(path)) return;

    let warList;
    try {
      warList = JSON.parse(fs.readFileSync(path, "utf-8"));
    } catch {
      warList = [];
    }

    const isWar = warList.some(
      e => e.threadID === event.threadID && e.userID === event.senderID
    );

    if (!isWar) return;

    const insults = [
      // তোমার গালি লিস্ট
      "তোর মায়ের ভোঁদার ভেতর থেকে এতো গন্ধ আসে, ছুঁয়ে দেখলে হাত পুড়ে যায়!",
      "তোর বাপের ঠাট্টা থেকেই তুই জন্মেছিস, গুদে মাল পড়ার ভুলেই তুই এসেছিস!",
      "তোর মায়ের ভোদা যেন রিকশার চাকা – সব প্যাসেঞ্জার যায় আসে!",
      "তুই এমন চুদনখোর, তোকে চুদে গরু পর্যন্ত হাঁপায়!",
      "তোর মায়ের দুধ খেতে খেতে তোকে চুষে ফেলছিলাম!",
      "তোর ভোদা এমন ঢিলা, ঢুকলে আওয়াজ হয় না!",
      "তুই তোর বাবার ভেজা কনডম, মায়ের ভোদা থেকে ফসকে জন্মেছিস!",
      "তোর বোনের গুদে গুগল ম্যাপও পথ খুঁজে পায় না!",
      "তুই এমন চোদান্দা, তোকে দেখলেই কুত্তারাও মাল ফেলতে চায়!",
      "তোর মায়ের পেছনে পেছনে চুদি, আর তুই সামনে দাঁড়িয়ে হাত মারিস!",
      "তোর মায়ের গুদে আগুন লাগাইছিলাম, এখন ধোঁয়াতে তুই হাঁপাচ্ছিস!",
      "তোর বোনের গুদে এত ট্রাফিক, পুলিশ পর্যন্ত লস্ট হয়!",
      "তোর জন্মটা হয়েছিলো এক কুকুরের গুদে – ভুলে মানুষ হলি!",
      "তোর মায়ের দুধে বিষ ছিলো, তাই তুই এত বিষাক্ত!",
      "তুই এমন বেকার চুদি, মাল ফেলার আগেই ব্যাটারি শেষ!",
      "তোর মা যখন কুত্তার সাথে করছিল, তুই পাশেই হাত মারছিলি!",
      "তোর বোনকে এমন চুদেছি, ভোদা এখন বাইপাস রাস্তা!",
      "তোর মায়ের গুদে হারিকেন ঢুকিয়ে আলো জ্বালাই!",
      "তোর বাপের ধোন ভাঙ্গা – তুই জন্মেছিস ভুলে!",
      "তুই সেই গুদ, যেটা চোদার পরেও ধোন কাঁদে!",
      "তোর বোনের গুদে হেলিকপ্টারও উড়ে!",
      "তোর মা গুদ দেখিয়ে পয়সা খায়, তুই সেটার দালাল!",
      "তোর মায়ের দুধের দোকান খুলব, নাম হবে 'চুষতে আসো ইনকাম নাও'!",
      "তোর মা আমাকে চোদা ছাড়া ঘুমাতে পারে না!",
      "তোর বোনের গুদে ঢুকতে গিয়ে GPS বন্ধ হয়ে যায়!",
      "তোর মা চুদি আর তুই মিছেমিছি ভাই বলিস!",
      "তোর জন্ম গুদে ধোন না ঢোকানো এক ভুলের ফল!",
      "তোর মায়ের গুদে ফ্যান চালাই – গরম লাগে চুদতে!",
      "তোর বোন চুদতে এত মজা, ভোদা যেন পাম্পারের বালিশ!",
      "তোর মা আমার হোটেলের ফ্রী আইটেম – চাইলে চুদে নে!",
      "তুই তোর মায়ের দুধ খেতে খেতে এখনো দাঁত গজায়নি!",
      "তোর বোনের গুদে LED লাগাবো, রাতেও ঝলমল করবে!",
      "তোর মা বলে ‘চুদো না’, কিন্তু গুদ বলে ‘আরো দাও!’",
      "তুই এমন ন্যাক্কারজনক গুদজন্মা, ধোনও দেখে থামে!",
      "তোর মায়ের গুদে বাজনা বাজাই – ওগো মা গো শুনে হাসে!",
      "তোর বোনের গুদে রাস্তাঘাটের মিটিং বসে!",
      "তোর মা গুদে লেবু চিপে শরবত বানায়!",
      "তুই মায়ের গুদ থেকে পড়ে গিয়ে জলে ভেসে এসেছিস!",
      "তোর মা চোদার সময় ‘ধন্য ধন্য’ বলে!",
      "তোর বোনকে চুদে এমন ছাপ ফেলে গেছি, এখনো ফোটো আসে!",
      "তোর মায়ের গুদে গরম পানি ঢেলে সেদ্ধ করবো!",
      "তোর বাপের ধোনে মরিচ লাগিয়ে মায়ের গুদে ঢুকিয়েছিলাম!",
      "তোর মা বলে – আজ বউ চুদিস না, আমায় চুদ!",
      "তুই এমন গুদ, যা শুধু লজ্জার নাম করে টিকে আছে!",
      "তোর মায়ের গুদে ঘুড়ি ওড়াই!",
      "তুই তো এক ঠান্ডা গুদ – চুদলেও মজা নেই!",
      "তোর বোন আমার ‘daily চোদন লিস্টে’!",
      "তোর মা আমার চোদনে মশা তাড়ায়!",
      "তুই এমন চুদি, মাল পড়ে গেলে ধোন হাসে!",
      "তোর মায়ের গুদে তো লিফট বসাবো – আরাম করে উঠবো!",
      "তোর বোন চোদাতে চোদাতে এখন VIP বান্ধবী!"
    ];

    const pick = () => insults[Math.floor(Math.random() * insults.length)];
    const insultMsg = pick();

    return api.sendMessage(insultMsg, event.threadID, event.messageID);
  },
};
