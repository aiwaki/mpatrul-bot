import { bot } from './client'

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
    },
    {
        command: '/verify',
        description: 'Подтвердить отправку отчета',
    }
])

const commands = ["signin", "me", "link", "verify"];

commands.forEach((command) => {
    bot.command(command, async (ctx) => {
        await ctx.scene.enter(command);
    });
});