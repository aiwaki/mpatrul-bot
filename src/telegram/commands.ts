import { bot } from './client.js'

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
        command: '/create',
        description: 'Проверить ссылку и отправить отчет',
    },
])