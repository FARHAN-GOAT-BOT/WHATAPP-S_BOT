const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  name: "dog",
  alias: ["kukur"],
  category: "fun",
  description: "Dog meme edit 🐶",

  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;

      let target;

      // ===== Reply Target =====
      if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
        target =
          msg.message.extendedTextMessage.contextInfo.participant;
      }

      // ===== Mention Target =====
      if (
        !target &&
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
          ?.length > 0
      ) {
        target =
          msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
      }

      if (!target) {
        return await sock.sendMessage(
          from,
          {
            text: "🐶 কুকুর বানাতে হলে কাউকে mention/reply দাও!"
          },
          { quoted: msg }
        );
      }

      // ===== Wait Message =====
      await sock.sendMessage(
        from,
        {
          text: "⏳ দাঁড়া মামা, কুকুর বানাইতেছি..."
        },
        { quoted: msg }
      );

      // ===== Cache Folder =====
      const cacheDir = path.join(__dirname, "cache");

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      // ===== Background Image =====
      const bgPath = path.join(cacheDir, "dog_bg.jpeg");

      if (!fs.existsSync(bgPath)) {
        const bgRes = await axios.get(
          "https://i.imgur.com/PLpn3ID.jpeg",
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
      const pfpSize = 85;

      const x = 160;
      const y = 115;

      ctx.save();

      // Shadow
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 10;

      // Circle Crop
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

      // ===== Save Output =====
      const output = path.join(
        cacheDir,
        `dog_${Date.now()}.png`
      );

      fs.writeFileSync(
        output,
        canvas.toBuffer("image/png")
      );

      // ===== Username =====
      const name =
        target.split("@")[0];

      // ===== Send Result =====
      await sock.sendMessage(
        from,
        {
          image: fs.readFileSync(output),
          caption:
            `🐶 এই যে দেখ নতুন কুকুর হাজির!\n\n` +
            `নাম: @${name} 😂\n` +
            `সবাই বলো ভাউ ভাউ! 🐕`,
          mentions: [target]
        },
        { quoted: msg }
      );

      // ===== Cleanup =====
      setTimeout(() => {
        fs.unlink(output).catch(() => {});
      }, 5000);

    } catch (err) {
      console.log(err);

      return sock.sendMessage(
        msg.key.remoteJid,
        {
          text:
            "❌ মামা কুকুরটা পালাইছে!\n\n" +
            err.message
        },
        { quoted: msg }
      );
    }
  }
};
