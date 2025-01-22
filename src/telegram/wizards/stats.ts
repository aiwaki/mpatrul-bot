import { Scenes } from "telegraf";
import { fmt, bold } from "telegraf/format";
import { getLinkStats } from "../../database/links";

export const statsWizard = new Scenes.WizardScene<Scenes.WizardContext>(
  "stats",
  async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) {
      await ctx.sendChatAction("typing");
      await ctx.reply("⚠️ Не удалось определить идентификатор чата.");
      return ctx.scene.leave();
    }

    try {
      const [allTimeStats, dailyStats, weeklyStats, monthlyStats] =
        await Promise.all([
          getLinkStats("all"),
          getLinkStats("day"),
          getLinkStats("week"),
          getLinkStats("month"),
        ]);

      const message = fmt`
📊 ${bold("Статистика всех ссылок")}

📈 ${bold("Всего")}: ${allTimeStats.count}
🔥 ${bold("День")}: ${dailyStats.count}
⚡ ${bold("Неделя")}: ${weeklyStats.count}
🌟 ${bold("Месяц")}: ${monthlyStats.count}
      `;

      await ctx.sendChatAction("typing");
      await ctx.reply(message);
    } catch (error) {
      console.error("🚨 Ошибка при получении статистики ссылок:", error);

      await ctx.sendChatAction("typing");
      await ctx.reply("🚨 Произошла ошибка при получении данных.");
    }

    return ctx.scene.leave();
  }
);
