import { Scenes } from 'telegraf';
import { fmt, bold } from 'telegraf/format';
import { apiClient } from '../../mpatrul/client';
import { fetchToken } from '../../database/api';

export const meWizard = new Scenes.WizardScene<Scenes.WizardContext>(
    'me',
    async (ctx) => {
        const chatId = ctx.chat?.id;
        if (!chatId) {
            await ctx.sendChatAction('typing');
            await ctx.reply('⚠️ Не удалось определить идентификатор чата.');
            return ctx.scene.leave();
        }

        try {
            const response = await apiClient.me(await fetchToken(chatId));
            const data = response.data;
            if (!data) throw ('Token is undefined.');

            const message = fmt`
📝 ${bold('Карточка волонтера')}

👤 ${bold('Имя')}: ${data.name || 'Не указано'}
📅 ${bold('Дата создания')}: ${new Date(data.createdAt).toLocaleString()}
✔️ ${bold('Верифицирован')}: ${data.isVerify ? 'Да' : 'Нет'}
💼 ${bold('Опыт')}: ${data.experience}
🏢 ${bold('Отряд')}: ${data.parent?.name || 'Не указано'}
            `;

            await ctx.sendChatAction('typing');
            await ctx.reply(message);
        } catch (error) {
            await ctx.sendChatAction('typing');
            await ctx.reply('🚨 Произошла ошибка при получении данных.');
        }

        return ctx.scene.leave();
    }
);
