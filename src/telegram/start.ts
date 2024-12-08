import { bot } from './client.js'
import { fmt, bold } from 'telegraf/format'
import { insertChat } from '../database/server.js'

bot.start(async ctx => {
    await insertChat(ctx.chat)

    await ctx.reply(
        fmt`
    ${bold('Добро пожаловать!')}
`,
    )
})