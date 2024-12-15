import { Markup, Scenes } from 'telegraf';
import { fmt, bold } from 'telegraf/format';
import { apiClient } from '../../mpatrul/client';
import { fetchToken, insertLink } from '../../database/api';
import { screenshotPage } from '../../browser/client';

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
            if (!(ctx.message && 'text' in ctx.message)) {
                return ctx.scene.leave();
            }

            const link = ctx.message.text.trim();
            if (!link) {
                await ctx.sendChatAction('typing');
                await ctx.reply('⚠️ Ссылка не может быть пустой. Попробуйте снова.');
                return ctx.wizard.back();
            }

            const token = await fetchToken(chatId)
            if (!token) {
                await ctx.sendChatAction('typing');
                await ctx.reply('⚠️ Войдите в аккаунт.');
                return ctx.scene.leave();
            }

            let response = await apiClient.createLink(link, token);
            if (response.error) throw new Error(response.error);
            const data = response.data;

            const message = fmt`
📄 ${bold('Результаты проверки')}

🔗 ${bold('Ссылка')}: ${data.link.url}
🔄 ${bold('Количество проверок')}: ${data.count}
⏱️ ${bold('Время последней проверки')}: ${data.updatedAt ? new Date(data.updatedAt).toLocaleString() : 'Никогда'}
📜 ${bold('Отчет')}: ${data.report ? '✅ Отправлен' : '❌ Не отправлен'}
                `;

            await ctx.sendChatAction('typing');
            await ctx.reply(message, { parse_mode: 'Markdown' });
            if (data.report) {
                return ctx.scene.leave();
            }

            const alreadyExists = await insertLink(chatId, link)
            if (alreadyExists) {
                await ctx.sendChatAction('typing');
                await ctx.reply('👌 Ссылка уже существует.');
                await ctx.scene.leave();
            }

            const screenshot = await screenshotPage(link)
            response = await apiClient.createReport(
                link,
                "Продажа семян.",
                screenshot,
                token
            );
            if (response.error) throw new Error(response.error);

            await ctx.sendChatAction('typing');
            await ctx.reply('✅ Отчет отправлен.');
            await ctx.scene.leave();
        } catch (error) {
            console.error(error);

            await ctx.sendChatAction('typing');
            await ctx.reply('🚨 Произошла ошибка при получении данных.');
            await ctx.scene.leave();
        }
    }
);

linkWizard.action('cancel', async (ctx) => {
    await ctx.sendChatAction('typing');
    await ctx.reply('👌 Проверка ссылки отменена.');
    await ctx.scene.leave();
});