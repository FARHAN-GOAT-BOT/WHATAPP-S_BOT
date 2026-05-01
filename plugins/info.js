const os = require('os');

module.exports = {
  config: {
    name: 'info',
    aliases: ['about', 'admininfo', 'serverinfo'],
    permission: 0,
    prefix: 'both',
    categorie: 'Utilities',
    credit: 'Developed by Mohammad Nayan',
    usages: [`${global.config.PREFIX}info - Show admin and server information.`],
  },
  start: async ({ event, api, message }) => {
    try {
      const uptimeSeconds = process.uptime();
      const uptime = new Date(uptimeSeconds * 1000).toISOString().substr(11, 8);

      const adminListText =
        global.config.admin.length > 0
          ? global.config.admin
              .map((id, i) => `${i + 1}. @${id.split('@')[0]}`)
              .join('\n')
          : 'No admins found.';

      const infoMessage = `╔════•|      ✿      |•════╗
💐আ্ঁস্ঁসা্ঁলা্ঁমু্ঁ💚আ্ঁলা্ঁই্ঁকু্ঁম্ঁ💐
╚════•|      ✿      |•════╝
__________________________________
🌺❀ 𝐁𝐎𝐓_ 𝐈𝐍𝐅𝐎_𝐑𝐌𝐀𝐓𝐈𝐎𝐍 ❀🌺
__________________________________

💠𝐁𝐎𝐓 𝐍𝐀𝐌𝐄💠 :

─꯭𓆩»̶̶͓͓͓̽̽̽𝆠꯭፝֟𝐒𝐈𝐙𝐔𝐊𝐀𝆠꯭፝֟𓆩𝆠፝𝐁𝐀𝐁𝐘𝆠꯭፝֟𝆠꯭፝֟𓆪🐱🩵🪽

🌼𝐁𝐎𝐓 𝐀𝐃𝐌𝐈𝐍🌼:『𝐑𝐉-𝐅𝐀𝐑𝐇𝐀𝐍』

🔥𝐁𝐈𝐎 𝐀𝐃𝐌𝐈𝐍🔥 : [ ⊱༅༎😽💚༅༎⊱


-আমি ভদ্র, বেয়াদব দুটোই🥱✌️

-তুমি যেটা ডি'জার্ভ করো, আমি সেটাই দেখাবো!🙂


⊱༅༎😽💚༅༎⊱ ]

🏠𝐀𝐃𝐃𝐑𝐄𝐒𝐒🏠 :[𝐂𝐇𝐔𝐀𝐃𝐀𝐍𝐆𝐀]
              [𝐁𝐀𝐍𝐆𝐋𝐀𝐃𝐄𝐒𝐇] 

🌺𝐑𝐄𝐋𝐈𝐆𝐈𝐎𝐍🌺 :[𝐈𝐒𝐋𝐀𝐌]

💮𝐆𝐄𝐍𝐃𝐄𝐑💮  :[𝐌𝐀𝐋𝐄]

🌸𝐑𝐄𝐋𝐀𝐓𝐈𝐎𝐍𝐒𝐇𝐈𝐏🌸 :[𝐒𝐈𝐍𝐆𝐋𝐄]

🌼𝐖𝐎𝐑𝐊🌼 :[𝐉𝐎𝐁]

🌷𝐖𝐇𝐀𝐓'𝐒 𝐀𝐏𝐏🌷:[𝟎𝟏𝟗𝟑𝟒𝟔𝟒𝟎𝟎𝟔𝟏]

_________🅲🅾🅽🆃🅰🅲🆃_________

💥𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 𝐈𝐃 (❶)💥 : https://m.me/MR.MUNNA.220

💥𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 𝐈𝐃 (❷)💥 : https://www.facebook.com/MR.MUNNA.220
______________________________
☄️>𝐁𝐎𝐓 𝐏𝐑𝐄𝐅𝐈𝐗 :-  { / } 

👑>𝐎𝐖𝐍𝐄𝐑 :-(𝐌𝐑.𝐅𝐀𝐑𝐇𝐀𝐍)
______________________________

𝐓𝐘𝐏𝐄 /𝐀𝐃𝐌𝐈𝐍:-♻️➟𝐔𝐏𝐓𝐈𝐌𝐄 ♻️

『💚 𝐓𝐇𝐀𝐍𝐊𝐒 𝐅𝐎𝐑 𝐔𝐒𝐈𝐍𝐆 💚』
-------------+++++++++++++-------------`;

      await api.sendMessage(
            event.threadId,
            { image: { url: "https://i.postimg.cc/KYvgLRwv/undefined-Imgur-(1).jpg" }, caption: infoMessage || '' },
            { quoted: event.message }
          );;
    } catch (error) {
      console.error(error);
      await api.sendMessage(event.threadId, '❌ An error occurred while fetching info.', { quoted: event.message });
    }
  },
};
