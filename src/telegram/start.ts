import { bot } from './client.ts'
import { fmt, bold } from 'telegraf/format'
import { insertChat } from '../database/api.ts'

bot.start(async ctx => {
    await insertChat(ctx.chat)
    await ctx.reply(
        fmt`
    ${bold('Добро пожаловать!')}
`,
    )
})