import { Markup, Scenes } from 'telegraf';
import { fmt, bold } from 'telegraf/format';
import { apiClient } from '../../mpatrul/client';
import { fetchToken } from '../../database/api';

export const linkWizard = new Scenes.WizardScene<Scenes.WizardContext>(
    'link',
    async (ctx) => {
        await ctx.sendChatAction('typing');
        await ctx.reply(
            '👋 Для проверки ссылки, отправьте ее одним сообщением без форматирования.',
            Markup.inlineKeyboard([
                [Markup.button.callback('Отмена', 'cancel')],
            ])
        );
        return ctx.wizard.next();
    },
    async (ctx) => {
        const chatId = ctx.chat?.id;
        if (!chatId) {
            await ctx.sendChatAction('typing');
            await ctx.reply('⚠️ Не удалось определить идентификатор чата.');
            return ctx.scene.leave();
        }

        try {
            if (ctx.message && 'text' in ctx.message) {
                const link = ctx.message.text.trim();
                if (!link) {
                    await ctx.sendChatAction('typing');
                    await ctx.reply('⚠️ Ссылка не может быть пустой. Попробуйте снова.');
                    return ctx.wizard.back();
                }

                const response = await apiClient.createLink(link, await fetchToken(chatId));
                const data = response.data;
                if (!data) throw new Error('Token is undefined.');

                const message = fmt`
📄 ${bold('Результаты проверки')}

🔗 ${bold('Ссылка')}: ${data.link.url}
🔄 ${bold('Количество проверок')}: ${data.count}
⏱️ ${bold('Время последней проверки')}: ${data.updatedAt ? new Date(data.updatedAt).toLocaleString() : 'Никогда'}
📜 ${bold('Отчет')}: ${data.report ? '✅ Отправлен' : '❌ Не отправлен'}
                `;

                await ctx.sendChatAction('typing');
                await ctx.reply(message, { parse_mode: 'Markdown' });
            }
        } catch (error) {
            console.error(error);
            await ctx.sendChatAction('typing');
            await ctx.reply('🚨 Произошла ошибка при получении данных.');
        }

        await ctx.sendChatAction('typing');
        await ctx.reply(
            fmt`
📤 Отправляем отчет?

Описание и скриншот будут созданы автоматически.
            `,
            Markup.inlineKeyboard([
                [Markup.button.callback('Да', 'report')],
                [Markup.button.callback('Нет', 'no-report')],
            ])
        );
    }
);

linkWizard.action('report', async (ctx) => {
    await ctx.sendChatAction('typing');
    await ctx.reply('✅ Отчет отправлен.');
    await ctx.scene.leave();
});

linkWizard.action('no-report', async (ctx) => {
    await ctx.sendChatAction('typing');
    await ctx.reply('👌 Отчет не отправлен.');
    await ctx.scene.leave();
});

linkWizard.action('cancel', async (ctx) => {
    await ctx.sendChatAction('typing');
    await ctx.reply('👌 Проверка ссылки отменена.');
    await ctx.scene.leave();
});