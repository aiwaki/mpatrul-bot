import { Markup, Scenes } from "telegraf";
import { getPageInfo } from "../../browser/page";
import { fetchToken } from "../../database/chats";
import { insertLink } from "../../database/links";
import { insertClassification, insertPage } from "../../database/pages";
import { sendReport } from "../../utils/sendReport";

export const linkWizard = new Scenes.WizardScene<Scenes.WizardContext>(
  "link",
  async (ctx) => {
    await ctx.sendChatAction("typing");
    await ctx.reply(
      "👋 Для проверки ссылки, отправьте ее одним сообщением без форматирования.",
      Markup.inlineKeyboard([[Markup.button.callback("Отмена", "cancel")]])
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) {
      await ctx.sendChatAction("typing");
      await ctx.reply("⚠️ Не удалось определить идентификатор чата.");
      return ctx.scene.leave();
    }

    try {
      if (!(ctx.message && "text" in ctx.message)) {
        return ctx.scene.leave();
      }

      const url = ctx.message.text.trim();
      const urlRegex = /https?:\/\/[^\s]+/;
      if (!url || !urlRegex.test(url)) {
        await ctx.sendChatAction("typing");
        await ctx.reply("⚠️ Пожалуйста, отправьте корректную ссылку.");
        return ctx.wizard.back();
      }

      const token = await fetchToken(chatId);
      if (!token) {
        await ctx.sendChatAction("typing");
        await ctx.reply("⚠️ Войдите в аккаунт.");
        return ctx.scene.leave();
      }

      const pageInfo = await getPageInfo(url);
      if (!pageInfo) {
        await ctx.sendChatAction("typing");
        await ctx.reply("⚠️ Не удалось получить данные страницы.");
        return ctx.scene.leave();
      }

      await sendReport(chatId, pageInfo);
      await insertLink(chatId, pageInfo.url);

      const classifyOutId = await insertClassification({
        label: pageInfo.classifyOut.label,
        content: pageInfo.classifyOut.content,
        score: pageInfo.classifyOut.score,
      });
      await insertPage({
        title: pageInfo.title,
        description: pageInfo.description,
        url: pageInfo.url,
        classify_out_id: classifyOutId,
      });

      await ctx.sendChatAction("typing");
      await ctx.reply("✅ Отчет отправлен.");
      await ctx.scene.leave();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Report already exists") {
          await ctx.sendChatAction("typing");
          await ctx.reply("✅ Отчет уже существует.");
          return ctx.scene.leave();
        }

        console.error(
          "🚨 Ошибка при проверке ссылки или отправке отчета:",
          error.message
        );
        await ctx.sendChatAction("typing");
        await ctx.reply("🚨 Произошла ошибка при получении данных.");
        return ctx.scene.leave();
      }
    }
  }
);

linkWizard.action("cancel", async (ctx) => {
  await ctx.sendChatAction("typing");
  await ctx.reply("👌 Проверка ссылки отменена.");
  await ctx.scene.leave();
});
