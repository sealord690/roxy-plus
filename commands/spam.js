module.exports = {
    name: 'spam',
    description: 'Spam a message (1-100 times)',
    async execute(message, args, client) {

        if (!args.length)
            return message.channel.send('Usage: !spam <1-100> <message>');

        const count = parseInt(args[0]);

        if (isNaN(count) || count < 1 || count > 100)
            return message.channel.send('Number must be between 1 and 100.');

        const text = args.slice(1).join(' ');
        if (!text)
            return message.channel.send('Provide a message to spam.');

        for (let i = 0; i < count; i++) {
            try {
                await message.channel.send(text);
                await new Promise(r => setTimeout(r, 150)); // 150ms safer for selfbot
            } catch (err) {
                console.log('Stopped due to rate limit.');
                break;
            }
        }
    }
};
