const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  name: "goru",
  alias: ["cow"],
  category: "fun",
  description: "Turn someone into a goru 🐮",

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
            text: "❗ Tag/reply দাও যাকে গরু বানাতে চাও 🐮"
          },
          { quoted: msg }
        );
      }

      if (target === sender) {
        return await sock.sendMessage(
          from,
          {
            text: "😂 নিজেকে গরু বানানো যাবে না বস!"
          },
          { quoted: msg }
        );
      }

      // ===== Wait Message =====
      await sock.sendMessage(
        from,
        {
          text: "⌛ গরু বানানো হচ্ছে..."
        },
        { quoted: msg }
      );

      // ===== Cache Folder =====
      const cacheDir = path.join(__dirname, "goru_cache");

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const bgPath = path.join(cacheDir, "cow_bg.jpg");

      // ===== Download Background =====
      if (!fs.existsSync(bgPath)) {
        const bg = await axios.get(
          "https://files.catbox.moe/ecebko.jpg",
          {
            responseType: "arraybuffer"
          }
        );

        fs.writeFileSync(bgPath, Buffer.from(bg.data));
      }

      // ===== Get Profile Picture =====
      let pfp;

      try {
        pfp = await sock.profilePictureUrl(target, "image");
      } catch {
        pfp =
          "https://i.imgur.com/JP3gFNL.png";
      }

      const avatarRes = await axios.get(pfp, {
        responseType: "arraybuffer"
      });

      const avatarBuffer = Buffer.from(avatarRes.data);

      // ===== Load Images =====
      const bgImage = await loadImage(bgPath);
      const avatarImage = await loadImage(avatarBuffer);

      // ===== Canvas =====
      const canvas = createCanvas(
        bgImage.width,
        bgImage.height
      );

      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImage, 0, 0);

      // ===== Avatar Position =====
      const avatarSize = 135;

      const headCenterX = 80 + avatarSize / 2;
      const headCenterY = 60 + avatarSize / 2;

      const avatarX =
        headCenterX - avatarSize / 2;

      const avatarY =
        headCenterY - avatarSize / 2;

      // ===== Circle Avatar =====
      ctx.save();

      ctx.beginPath();

      ctx.arc(
        headCenterX,
        headCenterY,
        avatarSize / 2,
        0,
        Math.PI * 2
      );

      ctx.closePath();

      ctx.clip();

      ctx.drawImage(
        avatarImage,
        avatarX,
        avatarY,
        avatarSize,
        avatarSize
      );

      ctx.restore();

      // ===== Border =====
      ctx.beginPath();

      ctx.arc(
        headCenterX,
        headCenterY,
        avatarSize / 2 + 1,
        0,
        Math.PI * 2
      );

      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;

      ctx.stroke();

      // ===== Text =====
      ctx.font = "bold 22px Arial";
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;

      ctx.strokeText("Kire chdna", 40, 45);
      ctx.fillText("Kire chdna", 40, 45);

      // ===== Save Output =====
      const output = path.join(
        cacheDir,
        `goru_${Date.now()}.png`
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
          caption: `🤣🐮 @${name} একদম আসল গরু হয়ে গেছে 😹`,
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
          text: `❌ Error:\n${err.message}`
        },
        { quoted: msg }
      );
    }
  }
};
