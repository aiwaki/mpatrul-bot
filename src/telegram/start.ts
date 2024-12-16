import { bot } from './client';
import { fmt, bold } from 'telegraf/format';
import { insertChat } from '../database/api';

bot.start(async (ctx) => {
    await insertChat(ctx.chat);
    await ctx.reply(
        fmt`
🎉 ${bold('Добро пожаловать!')}

🚀 Вы готовы начать? Используйте команды, чтобы взаимодействовать с ботом.
        `
    );
});
