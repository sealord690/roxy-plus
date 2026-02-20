const fs = require('fs');
const path = require('path');

const favsFile = path.join(__dirname, '../data/playlists.json');

function loadFavs() {
    if (!fs.existsSync(favsFile)) {
        fs.writeFileSync(favsFile, '{}');
    }
    const data = JSON.parse(fs.readFileSync(favsFile, 'utf8'));
    if (!data.fav) {
        data.fav = [];
        saveFavs(data);
    }
    return data;
}

function saveFavs(data) {
    fs.writeFileSync(favsFile, JSON.stringify(data, null, 2));
}

module.exports = {
    name: 'fav',
    aliases: ['favorite', 'favourite'],
    category: 'Music',
    description: 'Manage favorites: `fav`, `fav list`, `fav remove`',
    usage: 'fav [list|remove]',
    async execute(message, args, client) {
        const data = loadFavs();
        const action = args[0] ? args[0].toLowerCase() : 'add';

        try {
            switch (action) {
                case 'add':
                    const queue = client.queueManager.get(message.guild.id);
                    if (!queue || !queue.nowPlaying) {
                        return message.channel.send('No music is currently playing to add to favorites!');
                    }

                    const track = queue.nowPlaying;
                    const exists = data.fav.find(s => s.uri === track.info.uri);

                    if (exists) {
                        return message.channel.send(`**${track.info.title}** is already in your favorites!`);
                    }

                    data.fav.push({
                        title: track.info.title,
                        uri: track.info.uri,
                        author: track.info.author
                    });
                    saveFavs(data);

                    message.channel.send(`❤️ Added **${track.info.title}** to favorites!`);
                    break;

                case 'list':
                    if (data.fav.length === 0) {
                        return message.channel.send('Your favorite list is empty.');
                    }

                    let listMsg = '```\n╭─[ FAVORITES ]─╮\n\n';
                    data.fav.forEach((song, i) => {
                        listMsg += `  ${i + 1}. ${song.title}\n`;
                    });
                    listMsg += '\n╰───────────────╯\n```';
                    message.channel.send(listMsg);
                    break;

                case 'remove':
                    if (data.fav.length === 0) {
                        return message.channel.send('Your favorite list is already empty.');
                    }

                    let rmList = '```\n╭─[ FAVORITES TO REMOVE ]─╮\n\n';
                    data.fav.forEach((song, i) => {
                        rmList += `  ${i + 1}. ${song.title}\n`;
                    });
                    rmList += '\n╰─────────────────────────╯\n```';
                    await message.channel.send(rmList);
                    await message.channel.send('send the song number in chat which you want to remove.');

                    const filter = m => !m.author.bot && m.author.id === message.author.id && !isNaN(m.content);
                    const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });

                    collector.on('collect', m => {
                        const index = parseInt(m.content) - 1;
                        if (index < 0 || index >= data.fav.length) {
                            return message.channel.send('are you fucking dumb ?');
                        }

                        const removed = data.fav.splice(index, 1);
                        saveFavs(data);
                        message.channel.send(`Removed **${removed[0].title}** from favorites.`);
                    });

                    collector.on('end', collected => {
                        if (collected.size === 0) {
                            message.channel.send('bruhh');
                        }
                    });
                    break;

                default:
                    message.channel.send('Use `!fav` (adds playing song), `!fav list`, or `!fav remove`.');
                    break;
            }
        } catch (error) {
            console.error('Fav Error:', error);
            message.channel.send('fucked.');
        }
    }
};
