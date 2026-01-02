require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');

const client = new Client({
    checkUpdate: false
});

client.commands = new Map();

function loadAllowedUsers() {
    try {
        const allowedPath = path.join(__dirname, 'data', 'allowed.json');
        if (!fs.existsSync(allowedPath)) {
            const defaultData = { allowedUsers: [] };
            fs.writeFileSync(allowedPath, JSON.stringify(defaultData, null, 2));
            return defaultData.allowedUsers;
        }
        const data = JSON.parse(fs.readFileSync(allowedPath, 'utf8'));
        return data.allowedUsers || [];
    } catch (error) {
        console.error('Error loading allowed users:', error);
        return [];
    }
}

function isAllowedUser(userId) {
    const allowedUsers = loadAllowedUsers();
    return allowedUsers.includes(userId);
}

const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        try {
            const command = require(path.join(commandsPath, file));
            if (command.name) {
                client.commands.set(command.name, command);
            }
        } catch (error) {
            console.error('Error loading command ' + file + ':', error);
        }
    }
}

const dashboard = require('./dashboard/index');

client.on('ready', () => {
    console.log('Logged in as ' + client.user.tag);
    console.log('User ID: ' + client.user.id);
    console.log('Roxy+ is ready!');
    console.log('Loaded ' + client.commands.size + ' commands');

    // Start Dashboard
    dashboard(client);
});

// AFK & Logging Logic
const respondedUsers = new Set();
// Clear responded users every 1 hour
setInterval(() => respondedUsers.clear(), 3600000);

client.on('messageCreate', async (message) => {
    try {
        if (!message.author) return;

        // --- AFK & LOGGING SYSTEM ---
        const mentionsMe = message.mentions.users.has(client.user.id);
        const isDm = message.channel.type === 'DM';

        if ((mentionsMe || isDm) && message.author.id !== client.user.id) {

            // Read Settings
            const afkPath = path.join(__dirname, 'data', 'afk.json');
            const logPath = path.join(__dirname, 'data', 'afklog.json');

            let afkData = { isOn: false, reason: '', logsEnabled: false };
            if (fs.existsSync(afkPath)) {
                afkData = JSON.parse(fs.readFileSync(afkPath, 'utf8'));
            }

            // 1. LOGGING (If enabled)
            if (afkData.logsEnabled) {
                let logs = [];
                if (fs.existsSync(logPath)) {
                    logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
                }

                let cleanContent = message.content;

                // 1. Clean User Mentions <@ID> or <@!ID>
                cleanContent = cleanContent.replace(/<@!?(\d+)>/g, (match, id) => {
                    const user = client.users.cache.get(id);
                    return user ? `@${user.username}` : match;
                });

                // 2. Clean Role Mentions <@&ID>
                cleanContent = cleanContent.replace(/<@&(\d+)>/g, (match, id) => {
                    const role = message.guild ? message.guild.roles.cache.get(id) : null;
                    return role ? `@${role.name}` : match;
                });

                // 3. Clean Channel Mentions <#ID>
                cleanContent = cleanContent.replace(/<#(\d+)>/g, (match, id) => {
                    const channel = client.channels.cache.get(id);
                    return channel ? `#${channel.name}` : match;
                });

                // 4. Clean Custom Emojis <:name:ID>
                cleanContent = cleanContent.replace(/<a?:(\w+):(\d+)>/g, ':$1:');

                const logEntry = {
                    id: Date.now().toString(),
                    user: message.author.tag,
                    userId: message.author.id,
                    channel: isDm ? 'DM' : message.channel.name || 'Unknown',
                    guild: message.guild ? message.guild.name : 'Direct Message',
                    content: cleanContent,
                    time: new Date().toLocaleString(),
                    link: message.url
                };

                logs.unshift(logEntry);
                if (logs.length > 50) logs = logs.slice(0, 50);
                fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
            }

            // 2. AFK REPLY
            if (afkData.isOn && !respondedUsers.has(message.author.id)) {
                const reason = afkData.reason || "I'm currently AFK.";
                try {
                    await message.reply(`**[AFK]** ${reason}`);
                    respondedUsers.add(message.author.id);
                } catch (err) {
                    console.error('Failed to reply to AFK ping:', err);
                }
            }
        }

        // --- COMMAND HANDLER ---
        const prefix = process.env.PREFIX || '!';
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (!isAllowedUser(message.author.id)) {
            return;
        }

        const command = client.commands.get(commandName);
        if (!command) return;

        await command.execute(message, args, client);
    } catch (error) {
        console.error('Error in messageCreate:', error);
    }
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

if (!process.env.TOKEN) {
    console.error('Error: TOKEN not found in .env file');
    process.exit(1);
}

client.login(process.env.TOKEN).catch(error => {
    console.error('Failed to login:', error.message);
    process.exit(1);
});
