import * as discord from 'discord.js'
import run from './run'
import log from './lib/logger'

main()

async function main() {
    const client = new discord.Client()

    client.on('ready', () => {
        log.info(`Logged in as ${client.user.tag}`)
    })

    client.on('message', async msg => {
        const TRIGGER = '!run'
        if (!msg.content.startsWith(TRIGGER) && !msg.content.endsWith(TRIGGER)) {
            return
        }

        const content = msg.content
        const extracted = content.match(/```(?:js)?([\s\S]+)```/)
        if (!!extracted) {
            const [, source] = extracted
            log.info(`Running code: ${source}`)
            const start = Date.now()
            try {
                const { stdout, stderr } = await run(source)
                const end = Date.now()
                const totalTime = end - start

                const output = [` Program took ${totalTime}ms to complete.`]
                if (stdout) {
                    output.push(`stdout: \`\`\`\n${stdout}\`\`\``)
                }
                if (stderr) {
                    output.push(`stderr: \`\`\`\n${stderr}\`\`\``)
                }

                await msg.reply(output.join('\n'))
            } catch (err) {
                await msg.reply(`Encountered an error while trying to run program: \`\`\`${err}\`\`\``)
            }
        }
    })

    await client.login(process.env.NAIAD_DISCORD_TOKEN)
}
