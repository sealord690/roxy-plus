module.exports = {
    name: "music",
    description: "Extra music controls",
    async execute(client, message, args) {
        const player = client.manager.players.get(message.guild.id);
        if (!player) return message.reply("No music is playing.");

        const sub = args[0];

        if (!sub) {
            return message.reply("Use: pause | resume | volume | nowplaying | loop");
        }

        if (sub === "pause") {
            player.pause(true);
            return message.channel.send("⏸️ Music paused.");
        }

        if (sub === "resume") {
            player.pause(false);
            return message.channel.send("▶️ Music resumed.");
        }

        if (sub === "volume") {
            const vol = Number(args[1]);
            if (!vol || vol < 1 || vol > 9999)
                return message.reply("Provide volume between 1 - 9999.");

            player.setVolume(vol);
            return message.channel.send(`🔊 Volume set to ${vol}%`);
        }

        if (sub === "nowplaying") {
            if (!player.queue.current)
                return message.reply("Nothing is playing.");

            const track = player.queue.current;

            return message.channel.send(
                `🎵 Now Playing:\n` +
                `Title: ${track.title}\n` +
                `Author: ${track.author}`
            );
        }

        if (sub === "loop") {
            const mode = !player.trackRepeat;
            player.setTrackRepeat(mode);
            return message.channel.send(mode ? "🔁 Loop enabled." : "➡️ Loop disabled.");
        }

        message.reply("Invalid option.");
    }
};
