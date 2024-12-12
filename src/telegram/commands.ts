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
        description: 'Проверить ссылку',
    },
    {
        command: '/report',
        description: 'Отправить отчет',
    },
])

const commands = ["signin", "me", "link", "report"];

commands.forEach((command) => {
    bot.command(command, async (ctx) => {
        await ctx.scene.enter(command);
    });
});