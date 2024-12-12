import { Composer, Scenes, Markup } from 'telegraf';
import { apiClient } from '../../mpatrul/client.ts';
import { fetchLogin, fetchPassword, hasToken, updateLogin, updatePassword, updateToken } from '../../database/api.ts';

export const signinWizard = new Scenes.WizardScene<Scenes.WizardContext>(
    'signin',
    async (ctx) => {
        try {
            const chatId = ctx.chat?.id;
            if (!chatId) {
                await ctx.reply('❌ Не удалось определить идентификатор чата.');
                return ctx.scene.leave();
            }

            const token = (await hasToken(chatId)).mpatrul_token;
            if (token) {
                await ctx.reply(
                    '🔄 Вы уже вошли в аккаунт. Хотите войти ещё раз?',
                    Markup.inlineKeyboard([
                        [Markup.button.callback('Да', 'start-signin')],
                        [Markup.button.callback('Нет', 'no-signin')],
                    ])
                );
            } else {
                await ctx.reply('📧 Пожалуйста, введите ваш логин:');
                return ctx.wizard.next();
            }
        } catch (error) {
            console.error('Неожиданная ошибка во время процесса входа:', error);
            await ctx.reply('❌ Произошла неожиданная ошибка. Попробуйте снова.');
            return ctx.scene.leave();
        }
    },
    async (ctx) => {
        const chatId = ctx.chat?.id;
        if (!chatId) {
            await ctx.reply('❌ Не удалось определить идентификатор чата.');
            return ctx.scene.leave();
        }
        if (ctx.message && 'text' in ctx.message) {
            const login = ctx.message.text.trim();
            if (!login) {
                await ctx.reply('❌ Логин не может быть пустым. Попробуйте снова.');
                return ctx.wizard.back();
            }
            await updateLogin(chatId, login);
        }
        await ctx.reply('🔒 Пожалуйста, введите ваш пароль:');
        return ctx.wizard.next();
    },
    async (ctx) => {
        const chatId = ctx.chat?.id;
        if (!chatId) {
            await ctx.reply('❌ Не удалось определить идентификатор чата.');
            return ctx.scene.leave();
        }
        if (ctx.message && 'text' in ctx.message) {
            const password = ctx.message.text.trim();
            if (!password) {
                await ctx.reply('❌ Пароль не может быть пустым. Попробуйте снова.');
                return ctx.wizard.back();
            }
            await updatePassword(chatId, password);
        }

        const login = (await fetchLogin(chatId)).mpatrul_login
        const password = (await fetchPassword(chatId)).mpatrul_password

        if (!login || !password) {
            await ctx.reply('❌ Ошибка: логин или пароль отсутствуют.');
            return ctx.scene.leave();
        }

        try {
            const loginResponse = await apiClient.signIn(login, password);

            if (!loginResponse.data) {
                console.error('Ошибка входа:', loginResponse.error);
                await ctx.reply('❌ Проверьте свои данные и попробуйте снова.');
                return ctx.scene.leave();
            }

            await updateToken(chatId, loginResponse.data.accessToken);
            await ctx.reply('✅ Вход выполнен успешно!');
        } catch (error) {
            console.error('Ошибка при выполнении входа:', error);
            await ctx.reply('❌ Произошла ошибка при входе. Попробуйте снова.');
        }

        return ctx.scene.leave();
    }
);

signinWizard.action('no-signin', async (ctx) => {
    await ctx.reply('👌 Хорошо, вы остались в текущем аккаунте.');
    await ctx.scene.leave();
});

signinWizard.action('start-signin', async (ctx) => {
    await ctx.reply('📧 Пожалуйста, введите ваш логин:');
    return ctx.wizard.selectStep(1);
});