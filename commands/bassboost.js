module.exports = {
    name: "bassboost",
    description: "Enable or disable bass boost filter",
    async execute(client, message, args) {

        const player = client.manager.players.get(message.guild.id);
        if (!player) return message.reply("No music is playing.");

        // Turn OFF bassboost
        if (args[0] && args[0].toLowerCase() === "off") {
            player.setEqualizer([]);
            return message.channel.send("🎚️ Bassboost disabled.");
        }

        // Strong bass preset
        player.setEqualizer([
            { band: 0, gain: 0.6 },
            { band: 1, gain: 0.67 },
            { band: 2, gain: 0.67 },
            { band: 3, gain: 0.6 },
            { band: 4, gain: 0.5 },
            { band: 5, gain: 0.45 },
            { band: 6, gain: 0.3 },
            { band: 7, gain: 0.15 },
            { band: 8, gain: 0.1 },
            { band: 9, gain: 0.05 },
            { band: 10, gain: 0.0 },
            { band: 11, gain: 0.0 },
            { band: 12, gain: 0.0 },
            { band: 13, gain: 0.0 },
            { band: 14, gain: 0.0 }
        ]);

        message.channel.send("🔊 Bassboost enabled.");
    }
};
