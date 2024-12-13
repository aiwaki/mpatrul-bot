import { bot } from './client.ts'

bot.telegram.setMyCommands([
    {
        command: '/start',
        description: 'Новый диалог',
    },
    {
        command: '/signin',
        description: 'Вход в систему',
    },
    {
        command: '/me',
        description: 'Карточка волонтера',
    },
    {
        command: '/link',
        description: 'Проверить ссылку и отправить отчет',
    }
])

const commands = ["signin", "me", "link"];

commands.forEach((command) => {
    bot.command(command, async (ctx) => {
        await ctx.scene.enter(command);
    });
});