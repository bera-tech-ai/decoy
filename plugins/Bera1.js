
import moment from 'moment-timezone';
import fs from 'fs';
import os from 'os';
import pkg, { prepareWAMessageMedia } from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../config.cjs';

const alive = async (m, sock) => {
  const prefix = config.PREFIX;
  const mode = config.MODE;
  const pushName = m.pushName || 'User';

  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === "menu") {
    await m.React('⏳'); // React with a loading icon
    // Calculate uptime

    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / (24 * 3600));
    const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    
    // Get real time
    const realTime = moment().tz("Asia/Karachi").format("HH:mm:ss");
    const xtime = moment.tz("Asia/Karachi").format("HH:mm:ss");
    const xdate = moment.tz("Asia/Karachi").format("DD/MM/YYYY");
    const time2 = moment().tz("Asia/Karachi").format("HH:mm:ss");
let pushwish = "";

if (time2 < "05:00:00") {
  pushwish = `Good Morning 🌄`;
} else if (time2 < "11:00:00") {
  pushwish = `Good Morning 🌄`;
} else if (time2 < "15:00:00") {
  pushwish = `Good Afternoon 🌅`;
} else if (time2 < "18:00:00") {
  pushwish = `Good Evening 🌃`;
} else if (time2 < "19:00:00") {
  pushwish = `Good Evening 🌃`;
} else {
  pushwish = `Good Night 🌌`;
}

    const aliveMessage = `╭┈───────────────•*
*⇆𝙷𝙴𝙻𝙻𝙾 ⇆* *${pushName}*
             _${pushwish}_
*⇆ ✨ ʙᴇʀᴀ ᴛᴇᴄʜ ᴄᴏᴍᴍᴀɴᴅ ʟɪsᴛ  ✨ ⇆*
*╰┈───────────────•*
*╭┈───────────────•* 
*│  ◦* 𝙱𝙾𝚃 𝙽𝙰𝙼𝙴: ʙᴇʀᴀ ᴛᴇᴄʜ ʙᴏᴛ
*│  ◦* 𝚅𝙴𝚁𝚂𝙸𝙾𝙽: 1.0
*│  ◦* 𝙳𝙴𝚅: ʙʀᴜᴄᴇ ʙᴇʀᴀ
*│  ◦* 𝙿𝚁𝙴𝙵𝙸𝚇: *${prefix}*
*│  ◦* 𝙼𝙾𝙳𝙴: *${mode}*
*│  ◦* 𝚄𝙿𝚃𝙸𝙼𝙴: *${days}d ${hours}h ${minutes}m ${seconds}s*
*│  ◦* 𝙲𝚄𝚁𝚁𝙴𝙽𝚃 𝚃𝙸𝙼𝙴: *${realTime}*
*╰┈───────────────•*
*♡︎•━━━━━━☻︎━━━━━━•♡︎*
*[ • *👻𝗕𝗘𝗥𝗔 𝗧𝗘𝗖𝗛 𝗕𝗢𝗧👻* • ]*
*╭┈───────────────•*
*┋*🫡𝗥𝗘𝗚𝗔𝗥𝗗𝗦 𝗕𝗥𝗨𝗖𝗘 𝗕𝗘𝗥𝗔🫡*
*╰┈───────────────•*
*[ •  𝙾𝚆𝙽𝙴𝚁 𝙲𝙼𝙳  ‎• ]*
*╭┈───────────────•*
*┋*${prefix}𝙱𝙻𝙾𝙲𝙺
*┋*${prefix}𝚄𝙽𝙱𝙻𝙾𝙲𝙺
*┋*${prefix}𝙹𝙾𝙸𝙽
*┋*${prefix}𝙻𝙴𝙰𝚅𝙴
*┋*${prefix}𝚂𝙴𝚃𝚅𝙰𝚁
*┋*${prefix}𝚁𝙴𝚂𝚃𝙰𝚁𝚃
*┋*${prefix}𝙿𝙿
*┋*${prefix}𝚁𝚎𝚜𝚝𝚊𝚛𝚝
*┋*${prefix}𝙾𝚠𝚗𝚎𝚛𝚁𝚎𝚊𝚌𝚝
*┋*${prefix}𝙷𝚎𝚊𝚛𝚝𝚁𝚎𝚊𝚌𝚝
*┋*${prefix}𝙹𝚘𝚒𝚗
*┋*${prefix}𝙻𝚎𝚏𝚝 
*┋*${prefix}𝙱𝚛𝚘𝚊𝚍𝚌𝚊𝚜𝚝 
*┋*${prefix}𝚅𝚟  
*┋*${prefix}𝚅𝚟2
*┋*${prefix}𝙳𝚎𝗅
*┋*${prefix}𝚂𝚊𝚟𝚎
*┋*${prefix}ʀᴇᴘᴏʀᴛ
*┋*${prefix}ᴊɪᴅ  
*┋*${prefix}
*┋*${prefix}𝙳𝚎𝗅
*┋*${prefix}𝚂𝚊𝚟𝚎
*╰┈───────────────•*
*[ •  𝚂𝙴𝙰𝚁𝙲𝙷 𝙲𝙼𝙳  ‎• ]*
*╭┈───────────────•*
*┋*${prefix}𝚈𝚃𝚂
*┋*${prefix}𝙶𝙾𝙾𝙶𝙻𝙴
*┋*${prefix}𝙸𝙼𝙳
*┋*${prefix}𝙸𝙼𝙶
*┋*${prefix}𝚆𝙴𝙰𝚃𝙷𝙴𝚁
*┋*${prefix}𝙿𝙻𝙰𝚈𝚂𝚃𝙾𝚁𝙴
*┋*${prefix}𝙽𝙴𝚆𝚂
*╰┈───────────────•*
*[ •  𝙰𝙸 𝙲𝙼𝙳   ‎• ]*
*╭┈───────────────•*
*┋*${prefix}ʙʟᴀᴄᴋʙᴏxᴀɪ
*┋*${prefix}ɢᴘᴛ
*┋*${prefix}ᴠɪsɪᴛ
*┋*${prefix}ᴅᴇғɪɴᴇ
*╰┈───────────────•*
*╭───❍「 *👻ᴄʜʀɪsᴛɪᴀɴ ᴍᴇɴᴜ👻* 」*
*│*  *${prefix}ʙɪʙʟᴇ
*│*  *${prefix}ʙɪʙʟᴇʟʟɪsᴛ
*╰───────────❍* 
*╭───❍「 *👻ɪsʟᴀᴍɪᴄ ᴍᴇɴᴜ👻* 」*
*│*  *${prefix}𝚂𝚞𝚛𝚊𝚑𝚊𝚞𝚍𝚒𝚘
*│*  *${prefix}𝚂𝚞𝚛𝚊𝚑𝚞𝚛𝚍𝚞
*│*  *${prefix}𝙰𝚜𝚖𝚊𝚞𝚕𝚑𝚞𝚜𝚗𝚊
*│*  *${prefix}𝙿𝚛𝚘𝚙𝚑𝚎𝚝𝚗𝚊𝚖𝚎
*╰───────────❍* 
*╭━❮   *𝙲𝙾𝙽𝚅𝙴𝚁𝚃𝙴𝚁*    ❯━╮*
*┃* ${prefix}𝙰𝚃𝚃𝙿
*┃* ${prefix}ᴜʀʟ
*┃* ${prefix}𝙰𝚃𝚃𝙿3
*┃* ${prefix}𝙴𝙱𝙸𝙽𝙰𝚁𝚈
*┃* ${prefix}𝙳𝙱𝙸𝙽𝙰𝚁𝚈
*┃* ${prefix}𝙴𝙼𝙾𝙹𝙸𝙼𝙸𝚇
*┃* ${prefix}𝙼𝙿3
*╰━━━━━━━━━━━━━━━⪼*
*[ • DOWNLOADER-CMD  ‎• ]*
*╭┈───────────────•*
*┋*${prefix}ғʙ
*┋*${prefix}ɪɴꜱᴛᴀ
*┋*${prefix}ᴠɪᴅᴇᴏ
*┋*${prefix}ɢᴅʀɪᴠᴇ
*┋*${prefix}ᴛᴡɪᴛᴛᴇʀ
*┋*${prefix}𝚝𝚒𝚔𝚝𝚘𝚔
*┋*${prefix}ᴍᴇᴅɪᴀғɪʀᴇ
*┋*${prefix}ꜱᴏɴɢ
*┋*${prefix}ᴠɪᴅᴇᴏ
*┋*${prefix}ᴀᴘᴋ
*┋*${prefix}𝚃𝚃𝙰𝚄𝙳𝙸𝙾*
*╰┈───────────────•*
 ╭───❍「 *👻ʟᴏɢᴏ ᴍᴇɴᴜ👻* 
*┋*${prefix}𝗅𝗈𝗀𝗈
*┋*${prefix}hacker
*┋*${prefix}𝖻𝗅𝖺𝖼𝗄𝗉𝗂𝗇𝗄
*┋*${prefix}𝗀𝗈𝗌𝗌𝗒𝗌𝗂𝗅𝗏𝖾𝗋
*┋*${prefix}𝗇𝖺𝗋𝗎𝗋𝗈
*┋*${prefix}𝖽𝗂𝗀𝗂𝗍𝖺𝗅𝗀𝗅𝗂𝗍𝖼𝗁
*┋*${prefix}𝗉𝗂𝗑𝖾𝗅𝗀𝗅𝗂𝗍𝖼𝗁
*┋*${prefix}𝗌𝗍𝖺𝗋
*┋*${prefix}𝗌𝗆𝗈𝗄𝖾
*┋*${prefix}𝖻𝖾𝖺𝗋
*┋*${prefix}𝗇𝖾𝗈𝗇𝖽𝖾𝗏𝗂𝗅
*┋*${prefix}𝗌𝖼𝗋𝖾𝖾𝗇
*┋*${prefix}𝗇𝖺𝗍𝗎𝗋𝖾
*┋*${prefix}𝖽𝗋𝖺𝗀𝗈𝗇𝖻𝖺𝗅𝗅
*┋*${prefix}𝖿𝗈𝗀𝗀𝗒𝗀𝗅𝖺𝗌𝗌
*┋*${prefix}𝗇𝖾𝗈𝗇𝗅𝗂𝗀𝗁𝗍
*┋*${prefix}𝖼𝖺𝗌𝗍𝗅𝖾𝗉𝗈𝗉
*┋*${prefix}𝖿𝗋𝗈𝗓𝖾𝗇𝖼𝗁𝗋𝗂𝗌𝗍𝗆𝖺𝗌
*┋*${prefix}𝖿𝗈𝗂𝗅𝖻𝖺𝗅𝗅𝗈𝗈𝗇
*┋*${prefix}𝖼𝗈𝗅𝗈𝗋𝖿𝗎𝗅𝗉𝖺𝗂𝗇𝗍
*┋*${prefix}𝖺𝗆𝖾𝗋𝗂𝖼𝖺𝗇𝖿𝗅𝖺𝗀
*┋*${prefix}water
*┋*${prefix}𝗇𝖾𝗈𝗇𝖽𝖾𝗏𝗂𝗅
*┋*${prefix}underwater
*┋*${prefix}dragonfire
*┋*${prefix}bokeh
*┋*${prefix}snow
*┋*${prefix}sand3d
*┋*${prefix}pubg
*┋*${prefix}horror
*┋*${prefix}blood
*┋*${prefix}bulb
*┋*${prefix}graffiti
*┋*${prefix}thunder
*┋*${prefix}thunder1
*┋*${prefix}womensday
*┋*${prefix}Valentine
*┋*${prefix}graffiti2
*┋*${prefix}queencard
*┋*${prefix}galaxy
*┋*${prefix}pentakill 
*┋*${prefix}birthdayflower
*┋*${prefix}zodiac 
*┋*${prefix}water3D 
*┋*${prefix}textlight 
*┋*${prefix}wall
*┋*${prefix}gold
*┋*${prefix}glow
*┋*${prefix}team
*┋*${prefix}rotation
*┋*${prefix}paint
*┋*${prefix}avatar
*┋*${prefix}typography
*┋*${prefix}tattoo
*┋*${prefix}luxury
*┋*${prefix}logo
*╭┈───────────────•*
*┋*🫡𝗥𝗘𝗚𝗔𝗥𝗗𝗦 𝗕𝗥𝗨𝗖𝗘 𝗕𝗘𝗥𝗔🫡*
*╰┈───────────────•*
*[ •  GROUP-CMD  ‎• ]*
*╭┈──────────────•*
*┋*${prefix}ᴅᴇʟ <ʀᴇᴘʟʏ ғᴏʀ ᴅᴇʟᴇᴛᴇ sᴍs>
*┋*${prefix}ᴀᴅᴅ
*┋*${prefix}ᴋɪᴄᴋ
*┋*${prefix}ᴡᴇʟᴄᴏᴍᴇ 𝚘𝚗
*┋*${prefix}ᴡᴇʟᴄᴏᴍᴇ 𝚘𝚏𝚏
*┋*${prefix}ᴘʀᴏᴍᴏᴛᴇ
*┋*${prefix}ᴅᴇᴍᴏᴛᴇ
*┋*${prefix}ᴛᴀɢᴀʟʟ
*┋*${prefix}𝚑𝚒𝚍𝚎𝚝𝚊𝚐
*┋*${prefix}ɪɴᴠɪᴛᴇ
*┋*${prefix}ᴍᴜᴛᴇ
*┋*${prefix}ᴜɴᴍᴜᴛᴇ
*┋*${prefix}ɢʀᴏᴜᴘᴏᴘᴇɴ
*┋*${prefix}ɢʀᴏᴜᴘᴄʟᴏsᴇ
*┋*${prefix}ɢʀᴏᴜᴘɪɴғᴏ
*┋*${prefix}ᴅᴇʟ
*┋*${prefix}ᴍᴜᴛᴇ
*┋*${prefix}ᴜɴᴍᴜᴛᴇ
*┋*${prefix}ᴘᴏʟʟ
*┋*${prefix}ᴅᴇ
*╰┈───────────────•*
*[ •  𝙰𝚄𝙳𝙸𝙾 𝙲𝙼𝙳  ‎• ]*
*╭┈───────────────•*
*┋*${prefix}𝙳𝙴𝙴𝙿
*┋*${prefix}𝙱𝙰𝚂𝚂
*┋*${prefix}𝚁𝙾𝙱𝙾𝚃
*┋*${prefix}𝚁𝙴𝚅𝙴𝚁𝚂𝙴
*┋*${prefix}𝚂𝙻𝙾𝚆
*┋*${prefix}𝚂𝙼𝙾𝙾𝚃𝙷
*┋*${prefix}𝙽𝙸𝙶𝙷𝚃𝙲𝙾𝚁𝙴
*╰┈───────────────•*
*[ • ☣ 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝙲𝙼𝙳 ☣ ‎• ]*
*╭┈───────────────•*
*┋*${prefix}𝙳𝙰𝙽𝙲𝙴
*┋*${prefix}𝙿𝙾𝙺𝙴
*┋*${prefix}𝚆𝙸𝙽𝙺
*┋*${prefix}𝙷𝙰𝙿𝙿
*┋*${prefix}𝙺𝙸𝙲𝙺
*┋*${prefix}𝙺𝙸𝙻𝙻
*┋*${prefix}𝚂𝙻𝙰𝙿
*┋*${prefix}𝙱𝙸𝚃𝙴
*┋*${prefix}𝙽𝙾𝙼
*┋*${prefix}𝙷𝙸𝙶𝙷𝙵𝙸𝚅𝙴
*┋*${prefix}𝚆𝙰𝚅𝙴
*┋*${prefix}𝚂𝙼𝙸𝙻𝙴
*┋**${prefix}𝙱𝙻𝚄𝚂𝙷
*┋*${prefix}𝚈𝙴𝙴𝚃
*┋*${prefix}𝙱𝙾𝙽𝙺
*┋*${prefix}𝚂𝙼𝚄𝙶
*┋*${prefix}𝙿𝙰𝚃
*┋*${prefix}𝙻𝙸𝙲𝙺
*┋*${prefix}𝙺𝙸𝚂𝚂
*┋*${prefix}𝙰𝚆𝙾𝙾
*┋*${prefix}𝙷𝚄𝙶
*┋*${prefix}𝙲𝚁𝚈
*┋*${prefix}𝙲𝚄𝙳𝙳𝙻𝙴
*┋*${prefix}𝙱𝚄𝙻𝙻𝚈
*╰┈───────────────•*
*[ •  𝙾𝚃𝙷𝙴𝚁 𝙲𝙼𝙳  ‎• ]*
*╭┈───────────────•*
*┋*${prefix}𝙵𝙰𝙽𝙲𝚈
*┋*${prefix}𝙴𝙱𝙸𝙽𝙰𝚁𝚈
*┋*${prefix}𝙳𝙱𝙸𝙽𝙰𝚁𝚈
*┋*${prefix}𝙶𝙴𝚃
*┋*${prefix}𝙵𝙴𝚃𝙲𝙷
*┋*${prefix}𝚄𝙿𝙳𝙰𝚃𝙴𝙽𝙾𝚆
*┋*${prefix}𝙼𝙿3
*┋*${prefix}TTS
*┋*${prefix}SHORTEN
*┋*${prefix}TEMPMAIL
*┋*${prefix}CHECKMAIL
*┋*${prefix}ᴀʙᴏᴜᴛ
*┋*${prefix}ᴍᴜᴛᴇ
*┋*${prefix}ᴘʀᴏғɪʟᴇ
*┋*${prefix}ᴇʟᴇᴍᴇɴᴛs
*┋*${prefix}ᴘᴘ
*╰┈───────────────•*
*[ •  𝚂𝚃𝙰𝙻𝙺𝙴𝚁 𝙲𝙼𝙳  ‎• ]*
*╭┈───────────────•*
*┋*${prefix}𝙶𝙸𝚃𝚂𝚃𝙰𝙻𝙺
*┋*${prefix}𝚃𝙸𝙺𝚂𝚃𝙰𝙻𝙺
*┋*${prefix}𝙽𝙿𝙼𝚂𝚃𝙰𝙻𝙺
*┋*${prefix}𝙿𝙾𝙿𝙸𝙽𝙵𝙾
*┋*${prefix}𝙻𝙾𝙾𝙺𝚄𝙿
*┋*${prefix}WACHANNEL
*╰┈───────────────•*
*╭───❍「 *ᴏᴛʜᴇʀ ᴍᴇɴᴜ* ]*
*│ * *${prefix}𝙿𝚒𝚗𝚐
*│ * *${prefix}𝙰𝚋𝚘𝚞𝚝
*│ * *${prefix}𝚛𝚎𝚙𝚘
*│ * *${prefix}𝙰𝚕𝚒𝚟𝚎
*│ * *${prefix}𝚄𝚛𝚕
*│ * *${prefix}𝚂𝚎𝚗𝚍𝚖𝚎
*╰───────────❍* 
*[ • 𝙷𝙴𝚁𝙾𝙺𝚄 𝙲𝙻𝙸𝙴𝙽𝚃 ‎• ]*
*╭┈───────────────•*
*┋*${prefix}𝙼𝙾𝙳𝙴 <𝙿𝚄𝙱𝙻𝙸𝙲/𝙿𝚁𝙸𝚅𝙰𝚃𝙴>
*┋*${prefix}𝙿𝚁𝙴𝙵𝙸𝚇 <𝚂𝚈𝙼𝙱𝙾𝙻>
*┋*${prefix}𝙰𝚄𝚃𝙾𝚂𝚅𝙸𝙴𝚆 <𝙾𝙽/𝙾𝙵𝙵>
*┋*${prefix}𝙰𝚄𝚃𝙾𝚁𝙴𝙰𝙲𝚃 <𝙾𝙽/𝙾𝙵𝙵>
*┋*${prefix}𝙰𝙻𝚆𝙰𝚈𝚂𝙾𝙽𝙻𝙸𝙽𝙴 <𝙾𝙽/𝙾𝙵𝙵>
*┋*${prefix}𝙰𝚄𝚃𝙾𝚁𝙴𝙰𝙳 <𝙾𝙽/𝙾𝙵𝙵>
*┋*${prefix}𝙰𝚄𝚃𝙾𝙱𝙻𝙾𝙲𝙺 <𝙾𝙽/𝙾𝙵𝙵>
*┋*${prefix}𝙰𝙽𝚃𝙸𝙲𝙰𝙻𝙻 <𝙾𝙽/𝙾𝙵𝙵>
*┋*${prefix}𝙰𝚄𝚃𝙾𝚁𝙴𝙲𝙾𝚁𝙳𝙸𝙽𝙶 <𝙾𝙽/𝙾𝙵𝙵>
*┋*${prefix}𝙰𝚄𝚃𝙾𝚃𝚈𝙿𝙸𝙽𝙶 <𝙾𝙽/𝙾𝙵𝙵>
*╰┈───────────────•*
🌐 𝗠𝗢𝗥𝗘 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 𝗖𝗢𝗠𝗜𝗡𝗚 𝗦𝗢𝗢𝗡! 🌐`;

    await m.React('✅'); // React with a success icon

    sock.sendMessage(
      m.from,
      {
        text: aliveMessage,
        contextInfo: {
          isForwarded: false,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363315115438245@newsletter',
            newsletterName: "𝗕𝗘𝗥𝗔 𝗧𝗘𝗖𝗛 𝗕𝗢𝗧",
            serverMessageId: -1,
          },
          forwardingScore: 999, // Score to indicate it has been forwarded
          externalAdReply: {
            title: "✨ 𝗕𝗘𝗥𝗔 𝗧𝗘𝗖𝗛 𝗕𝗢𝗧 ✨",
            body: "BERA TECH BOT MENU",
            thumbnailUrl: 'https://files.catbox.moe/ld9uw5.jpg', // Add thumbnail URL if required
            sourceUrl: 'https://files.catbox.moe/tdhhl5.mp3', // Add source URL if necessary
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m }
    );
  }
};

export default alive;
