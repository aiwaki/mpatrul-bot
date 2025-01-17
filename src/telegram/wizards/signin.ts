import { Scenes, Markup } from 'telegraf';
import { fmt, link } from 'telegraf/format';
import { signIn, type SignInRequestParams } from '../../services/identity';
import { fetchToken, updateLogin, updatePassword, fetchLogin, updateToken } from '../../database/chats';

export const signinWizard = new Scenes.WizardScene<Scenes.WizardContext>(
    'signin',
    async (ctx) => {
        try {
            const chatId = ctx.chat?.id;
            if (!chatId) {
                await ctx.sendChatAction('typing');
                await ctx.reply('⚠️ Не удалось определить идентификатор чата.');
                return ctx.scene.leave();
            }

            await ctx.sendChatAction('typing');
            await ctx.reply(
                fmt`
                👋 Для входа используйте свой аккаунт ${link(
                    'Молодежного патруля',
                    'https://mpatrul.vercel.app/'
                )}.
                `
            );

            const token = await fetchToken(chatId);
            if (!token) {
                await ctx.sendChatAction('typing');
                await ctx.reply('👤 Отправьте ваш логин одним сообщением без форматирования.');
                return ctx.wizard.next();
            }

            await ctx.sendChatAction('typing');
            await ctx.reply(
                '🔄 Вы уже вошли в аккаунт. Хотите войти ещё раз?',
                Markup.inlineKeyboard([
                    [Markup.button.callback('Да', 'start-signin')],
                    [Markup.button.callback('Нет', 'no-signin')],
                ])
            );
        } catch (error) {
            console.error('🚨 Неожиданная ошибка во время процесса входа:', error);

            await ctx.sendChatAction('typing');
            await ctx.reply('❌ Произошла неожиданная ошибка. Попробуйте снова.');
            return ctx.scene.leave();
        }
    },
    async (ctx) => {
        const chatId = ctx.chat?.id;
        if (!chatId) {
            await ctx.sendChatAction('typing');
            await ctx.reply('⚠️ Не удалось определить идентификатор чата.');
            return ctx.scene.leave();
        }

        if (!(ctx.message && 'text' in ctx.message)) {
            return ctx.scene.leave();
        }

        const login = ctx.message.text.trim();
        if (!login) {
            await ctx.sendChatAction('typing');
            await ctx.reply('⚠️ Логин не может быть пустым. Попробуйте снова.');
            return ctx.wizard.back();
        }
        await updateLogin(chatId, login);

        await ctx.sendChatAction('typing');
        await ctx.reply('🔒 Отправьте ваш пароль одним сообщением без форматирования.');
        return ctx.wizard.next();
    },
    async (ctx) => {
        const chatId = ctx.chat?.id;
        if (!chatId) {
            await ctx.sendChatAction('typing');
            await ctx.reply('⚠️ Не удалось определить идентификатор чата.');
            return ctx.scene.leave();
        }

        if (!(ctx.message && 'text' in ctx.message)) {
            return ctx.scene.leave();
        }

        let password = ctx.message.text.trim();
        if (!password) {
            await ctx.sendChatAction('typing');
            await ctx.reply('⚠️ Пароль не может быть пустым. Попробуйте снова.');
            return ctx.wizard.back();
        }
        await updatePassword(chatId, password);

        const login = await fetchLogin(chatId);
        if (!login || !password) {
            await ctx.sendChatAction('typing');
            await ctx.reply('❌ Ошибка: логин или пароль отсутствуют.');
            return ctx.scene.leave();
        }

        try {
            const signInParams: SignInRequestParams = { login, password }
            const loginResponse = await signIn(signInParams, chatId);
            if (loginResponse.error) {
                console.error('🚨 Ошибка входа:', loginResponse.error);

                await ctx.sendChatAction('typing');
                await ctx.reply('❌ Проверьте свои данные и попробуйте снова.');
                return ctx.scene.leave();
            }

            await updateToken(chatId, loginResponse.data.accessToken);

            await ctx.sendChatAction('typing');
            await ctx.reply('✅ Вход выполнен успешно!');
        } catch (error) {
            console.error('🚨 Ошибка при выполнении входа:', error);

            await ctx.sendChatAction('typing');
            await ctx.reply('❌ Произошла ошибка при входе. Попробуйте снова.');
        }

        return ctx.scene.leave();
    }
);

signinWizard.action('no-signin', async (ctx) => {
    await ctx.sendChatAction('typing');
    await ctx.reply('👌 Хорошо, вы остались в текущем аккаунте.');
    await ctx.scene.leave();
});

signinWizard.action('start-signin', async (ctx) => {
    await ctx.sendChatAction('typing');
    await ctx.reply('👤 Отправьте ваш логин одним сообщением без форматирования.');
    return ctx.wizard.selectStep(1);
});
