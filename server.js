const express = require("express");
const { client } = require("./bot");

const app = express();
app.use(express.json());

app.post("/register", async (req, res) => {
    const guild = client.guilds.cache.get("SERVER_ID");
    const member = await guild.members.fetch(req.body.discordId);

    await member.roles.add("ROLE_ID");

    res.json({ success: true });
});

app.listen(3000, () => console.log("API running"));
