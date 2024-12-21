import { Markup, Scenes } from 'telegraf';
import { fmt, bold } from 'telegraf/format';
import { fetchToken, insertLink } from '../../database/api';
import { screenshotPage } from '../../browser/pages';
import { createLink, type CreateLinkRequestParams } from '../../services/links';
import { createReport, type CreateReportRequestParams } from '../../services/reports';
import { ReportType } from '../../utils/constants';
import { createMedia, Media, type CreateMediaRequestParams } from '../../services/media';
import { uploadFile } from '../../utils/uploadFile';

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

            const url = ctx.message.text.trim();
            if (!url) {
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

            const createLinkParams: CreateLinkRequestParams = { url }
            const linkResponse = await createLink(createLinkParams, chatId);
            if (linkResponse.error) throw new Error(linkResponse.error);
            const data = linkResponse.data;

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

            const mediaParams: CreateMediaRequestParams = {
                format: Media.PNG
            };
            const mediaResponse = await createMedia(mediaParams, chatId);
            if (mediaResponse.error) throw new Error(mediaResponse.error);

            const screenshot = await screenshotPage(url);
            await uploadFile(mediaResponse.data.upload, screenshot);

            /*             const createRequestParams: CreateReportRequestParams = {
                            url: site.url,
                            content: classifyOut.content,
                            isPersonal: true,
                            isMedia: false,
                            desciption: site.description || classifyOut.label,
                            photoId: mediaResponse.data.id,
                        };
                        const reportResponse = await createReport(createRequestParams, chatId);
                        if (reportResponse.error) throw new Error(reportResponse.error);
            
                        await insertLink(chatId, site.url); // В начале создаём и проверяем на существование, потом обновляем */

            await ctx.sendChatAction('typing');
            await ctx.reply('✅ Отчет отправлен.');
            await ctx.scene.leave();
        } catch (error) {
            console.error('🚨 Ошибка при проверке ссылки или отправке отчета:', error);

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