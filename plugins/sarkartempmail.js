// Temporary Email Command - POWERED BY Bera

import axios from "axios";

import config from "../config.cjs";

const tempmail = async (m, gss) => {

  const prefix = config.PREFIX;

  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";

  const validCommands = ["tempmail", "tempemail", "tmail"];

  if (validCommands.includes(cmd)) {

    const apiUrl = `https://bk9.fun/tools/tempmail`;

    try {

      await m.React("⏳"); // React with a loading icon

      const response = await axios.get(apiUrl);

      const data = response.data;

      if (data.status && data.BK9) {

        const email = data.BK9[0];

        const sessionId = data.BK9[1];

        const expiry = data.BK9[2];

        const message = `🖥️ *Temporary Email*\n\n📧 Email: ${email}\n🆔 Session ID: ${sessionId}\n⏰ Expiry: ${expiry}\n\n `;

        await gss.sendMessage(

          m.from,

          { text: message },

          { quoted: m }

        );

      } else {

        throw new Error("Invalid response structure from API");

      }

    } catch (error) {

      await gss.sendMessage(

        m.from,

        { text: `❌ Error fetching temporary email: ${error.message}` },

        { quoted: m }

      );

    }

  }

};

export default tempmail;

// POWERED BY BANDAHEALI
