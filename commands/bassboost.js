module.exports = {
    name: 'bassboost',
    description: 'Enable or disable bassboost filter',
    async execute(message, args, client) {

        if (!message.guild)
            return message.channel.send('```This command only works in servers```');

        // Check if lavalink exists
        if (!client.lavalink)
            return message.channel.send('```Lavalink not connected```');

        const queue = client.queueManager.get(message.guild.id);
        if (!queue || !queue.nowPlaying)
            return message.channel.send('```No music is currently playing```');

        const voiceState = client.voiceStates[message.guild.id];
        if (!voiceState)
            return message.channel.send('```Bot is not connected to voice```');

        // Disable bassboost
        if (args[0] && args[0].toLowerCase() === 'off') {
            queue.filters = {};
        } else {
            queue.filters = {
                equalizer: [
                    { band: 0, gain: 0.6 },
                    { band: 1, gain: 0.7 },
                    { band: 2, gain: 0.7 },
                    { band: 3, gain: 0.6 },
                    { band: 4, gain: 0.5 }
                ]
            };
        }

        try {
            await client.lavalink.updatePlayer(
                message.guild.id,
                queue.nowPlaying,
                voiceState,
                {
                    volume: queue.volume,
                    filters: queue.filters
                }
            );

            message.channel.send(
                args[0] && args[0].toLowerCase() === 'off'
                    ? '```Bassboost disabled```'
                    : '```Bassboost enabled```'
            );

        } catch (err) {
            console.error('[Bassboost Error]:', err);
            message.channel.send('```Failed to apply filter```');
        }
    }
};
