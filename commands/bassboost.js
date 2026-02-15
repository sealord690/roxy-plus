module.exports = {
    name: 'bassboost',
    description: 'Enable or disable bass boost',
    async execute(message, args, client) {

        if (!client.manager) 
            return message.reply('Music system not initialized.');

        const player = client.manager.players.get(message.guild.id);
        if (!player)
            return message.reply('No music is playing.');

        // Disable bassboost
        if (args[0] && args[0].toLowerCase() === 'off') {
            player.setEqualizer([]);
            return message.reply('🎚️ Bassboost disabled.');
        }

        // Enable bassboost
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
            { band: 9, gain: 0.05 }
        ]);

        message.reply('🔊 Bassboost enabled.');
    }
};
