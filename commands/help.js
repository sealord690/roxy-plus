module.exports = {
    name: 'help',
    description: 'List all available commands',
    async execute(message, args, client) {
        const commands = Array.from(client.commands.values());

        let helpMessage = '**Roxy+ Commands:**\n\n';

        commands.forEach(cmd => {
            helpMessage += `**${cmd.name}** - ${cmd.description}\n`;
        });

        message.reply(helpMessage);
    }
};
