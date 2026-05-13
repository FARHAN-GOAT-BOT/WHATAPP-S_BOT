const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const ORIGINAL_AUTHOR = "Farhan-Khan";

function verifyAuthor(author) {
  return author === ORIGINAL_AUTHOR;
}

module.exports = {
  name: "chor",
  alias: ["thief"],
  category: "fun",
  description: "Street chor meme 😂",
  author: ORIGINAL_AUTHOR,

  async execute(sock, msg, args) {

    // ===== Author Lock =====
    if (!verifyAuthor(this.author)) {
      return sock.sendMessage(
        msg.key.remoteJid,
        {
          text: "❌ Illegal modification detected!"
        },
        { quoted: msg }
      );
    }

    try {
      const from = msg.key.remoteJid;
      const sender =
        msg.key.participant || msg.key.remoteJid;

      let target = null;

      // ===== Reply Target =====
      if (
        msg.message?.extendedTextMessage
          ?.contextInfo?.participant
      ) {
        target =
          msg.message.extendedTextMessage
            .contextInfo.participant;
      }

      // ===== Mention Target =====
      if (
        !target &&
        msg.message?.extendedTextMessage
          ?.contextInfo?.mentionedJid?.length > 0
      ) {
        target =
          msg.message.extendedTextMessage
            .contextInfo.mentionedJid[0];
      }

      if (!target) {
        return await sock.sendMessage(
          from,
          {
            text:
              "😂 মামা কাউরে mention/reply দে!"
          },
          { quoted: msg }
        );
      }

      // ===== Wait Message =====
      await sock.sendMessage(
        from,
        {
          text: "🚨 চোর ধরতেছি মামা..."
        },
        { quoted: msg }
      );

      // ===== Cache Folder =====
      const cacheDir = path.join(
        __dirname,
        "cache"
      );

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, {
          recursive: true
        });
      }

      // ===== Background =====
      const bgPath = path.join(
        cacheDir,
        "chor_bg.jpeg"
      );

      if (!fs.existsSync(bgPath)) {
        const bgRes = await axios.get(
          "https://i.imgur.com/fO720aw.jpeg",
          {
            responseType: "arraybuffer"
          }
        );

        fs.writeFileSync(
          bgPath,
          Buffer.from(bgRes.data)
        );
      }

      // ===== Profile Picture =====
      let pfp;

      try {
        pfp = await sock.profilePictureUrl(
          target,
          "image"
        );
      } catch {
        pfp =
          "https://i.imgur.com/JP3gFNL.png";
      }

      const pfpRes = await axios.get(pfp, {
        responseType: "arraybuffer"
      });

      // ===== Load Images =====
      const [baseImage, avatarImage] =
        await Promise.all([
          loadImage(bgPath),
          loadImage(Buffer.from(pfpRes.data))
        ]);

      // ===== Canvas =====
      const canvas = createCanvas(
        baseImage.width,
        baseImage.height
      );

      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        baseImage,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // ===== PERFECT POSITION =====
      const pfpSize = 110;

      const x = 370;
      const y = 35;

      ctx.save();

      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 10;

      ctx.beginPath();

      ctx.arc(
        x + pfpSize / 2,
        y + pfpSize / 2,
        pfpSize / 2,
        0,
        Math.PI * 2
      );

      ctx.closePath();

      ctx.clip();

      ctx.drawImage(
        avatarImage,
        x,
        y,
        pfpSize,
        pfpSize
      );

      ctx.restore();

      // ===== Border =====
      ctx.beginPath();

      ctx.arc(
        x + pfpSize / 2,
        y + pfpSize / 2,
        pfpSize / 2,
        0,
        Math.PI * 2
      );

      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffffff";

      ctx.stroke();

      // ===== Save =====
      const output = path.join(
        cacheDir,
        `chor_${Date.now()}.png`
      );

      fs.writeFileSync(
        output,
        canvas.toBuffer("image/png")
      );

      // ===== Username =====
      const name =
        target.split("@")[0];

      // ===== Caption =====
      const caption =
`🚨 রাস্তার চোর ধরা পড়ছে!

নাম: @${name}
আজকের চুরি: ০ টাকা 😂

সবাই সাবধান থাকো ভাই! 🤣`;

      // ===== Send =====
      await sock.sendMessage(
        from,
        {
          image: fs.readFileSync(output),
          caption: caption,
          mentions: [target]
        },
        { quoted: msg }
      );

      // ===== Cleanup =====
      setTimeout(() => {
        fs.unlink(output).catch(() => {});
      }, 5000);

    } catch (e) {
      console.log("CHOR ERROR:", e);

      return sock.sendMessage(
        msg.key.remoteJid,
        {
          text:
            "❌ চোরটা পালাইছে মামা 😭"
        },
        { quoted: msg }
      );
    }
  }
};
