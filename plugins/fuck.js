const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
  name: "fuck",
  alias: ["fk"],
  category: "fun",
  description: "Fuck image command for WhatsApp bot",
  
  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;

      // ===== Reply check =====
      let target;

      if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
        target = msg.message.extendedTextMessage.contextInfo.participant;
      }

      // ===== Mention check =====
      if (!target && msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
      }

      if (!target) {
        return await sock.sendMessage(from, {
          text: "❌ বস যাকে fuck করতে চাও তাকে reply/mention দাও 😵"
        }, { quoted: msg });
      }

      if (target === sender) {
        return await sock.sendMessage(from, {
          text: "🥺 নিজেকে fuck করা যাবে না বস 😹"
        }, { quoted: msg });
      }

      // ===== Create folders =====
      const cachePath = path.join(__dirname, "cache");
      if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

      const bgPath = path.join(cachePath, "fuck_bg.png");

      // ===== Download background =====
      if (!fs.existsSync(bgPath)) {
        const bg = await axios.get(
          "https://i.ibb.co/VJHCjCb/images-2022-08-14-T183802-542.jpg",
          { responseType: "arraybuffer" }
        );

        fs.writeFileSync(bgPath, Buffer.from(bg.data));
      }

      // ===== Profile picture =====
      async function getPfp(jid, file) {
        let url;

        try {
          url = await sock.profilePictureUrl(jid, "image");
        } catch {
          url = "https://i.imgur.com/JP3gFNL.png";
        }

        const data = await axios.get(url, {
          responseType: "arraybuffer"
        });

        fs.writeFileSync(file, Buffer.from(data.data));
      }

      const senderImg = path.join(cachePath, "sender.png");
      const targetImg = path.join(cachePath, "target.png");

      await getPfp(sender, senderImg);
      await getPfp(target, targetImg);

      // ===== Circle avatar =====
      async function circle(img) {
        const image = await jimp.read(img);
        image.circle();
        return image;
      }

      const bg = await jimp.read(bgPath);

      const avt1 = await circle(senderImg);
      const avt2 = await circle(targetImg);

      // ===== Resize & paste =====
      avt1.resize(150, 150);
      avt2.resize(150, 150);

      bg.composite(avt1, 40, 40);
      bg.composite(avt2, 430, 40);

      // ===== Output =====
      const output = path.join(cachePath, `fuck_${Date.now()}.png`);

      await bg.writeAsync(output);

      await sock.sendMessage(from, {
        image: fs.readFileSync(output),
        caption: "😈 FUCK COMPLETED 😹"
      }, { quoted: msg });

      // ===== Cleanup =====
      fs.unlinkSync(senderImg);
      fs.unlinkSync(targetImg);
      fs.unlinkSync(output);

    } catch (err) {
      console.log(err);

      return sock.sendMessage(
        msg.key.remoteJid,
        { text: `❌ Error:\n${err.message}` },
        { quoted: msg }
      );
    }
  }
};
