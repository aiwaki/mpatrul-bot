import { Scenes } from "telegraf";
import { fmt, bold } from "telegraf/format";
import { getMyProfile } from "../../services/profiles";
import { fetchToken } from "../../database/chats";

export const meWizard = new Scenes.WizardScene<Scenes.WizardContext>(
  "me",
  async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) {
      await ctx.sendChatAction("typing");
      await ctx.reply("⚠️ Не удалось определить идентификатор чата.");
      return ctx.scene.leave();
    }

    try {
      const token = await fetchToken(chatId);
      if (!token) {
        await ctx.sendChatAction("typing");
        await ctx.reply("⚠️ Войдите в аккаунт.");
        return ctx.scene.leave();
      }

      const response = await getMyProfile(undefined, chatId);
      if (response.error) {
        throw new Error(response.error);
      }
      const { data } = response;

      const message = fmt`
📝 ${bold("Карточка волонтера")}

👤 ${bold("Имя")}: ${data.name || "Не указано"}
📅 ${bold("Дата создания")}: ${new Date(data.createdAt).toLocaleString()}
✔️ ${bold("Верифицирован")}: ${data.isVerify ? "Да" : "Нет"}
💼 ${bold("Опыт")}: ${data.experience}
🏢 ${bold("Отряд")}: ${data.parent?.name || "Не указано"}
            `;

      await ctx.sendChatAction("typing");
      await ctx.reply(message);
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          "🚨 Ошибка при получении карточки волонтера:",
          error.message
        );

        await ctx.sendChatAction("typing");
        await ctx.reply("🚨 Произошла ошибка при получении данных.");
      }
    }

    return ctx.scene.leave();
  }
);
