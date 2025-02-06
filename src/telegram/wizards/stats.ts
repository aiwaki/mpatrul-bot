import { Scenes } from "telegraf";
import { fmt, bold } from "telegraf/format";
import { getLinkStats, getTopVolunteers } from "../../database/links";
import { fetchToken } from "../../database/chats";

export const statsWizard = new Scenes.WizardScene<Scenes.WizardContext>(
  "stats",
  async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) {
      await ctx.sendChatAction("typing");
      await ctx.reply("⚠️ Не удалось определить идентификатор чата.");
      return ctx.scene.leave();
    }

    const token = await fetchToken(chatId);
    if (!token) {
      await ctx.sendChatAction("typing");
      await ctx.reply("⚠️ Войдите в аккаунт.");
      return ctx.scene.leave();
    }

    try {
      const [
        allTimeStats,
        dailyStats,
        weeklyStats,
        monthlyStats,
        topVolunteers,
      ] = await Promise.all([
        getLinkStats("all"),
        getLinkStats("day"),
        getLinkStats("week"),
        getLinkStats("month"),
        getTopVolunteers(5),
      ]);

      const topVolunteersText = topVolunteers
        .map((volunteer, index) => {
          const username = volunteer.tg_username
            ? `@${volunteer.tg_username}`
            : `ID: ${volunteer.inserted_by}`;
          return `${index + 1}. ${username} — ${volunteer.count}`;
        })
        .join("\n");

      const message = fmt`
📊 ${bold("Статистика всех ссылок")}

📈 ${bold("Всего")}: ${allTimeStats.count}
🔥 ${bold("День")}: ${dailyStats.count}
⚡ ${bold("Неделя")}: ${weeklyStats.count}
🌟 ${bold("Месяц")}: ${monthlyStats.count}

🏆 ${bold("ТОП волонтеров по количеству ссылок")}
${topVolunteersText || "Нет данных"}
      `;

      await ctx.sendChatAction("typing");
      await ctx.reply(message);
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          "🚨 Ошибка при получении статистики ссылок:",
          error.message
        );

        await ctx.sendChatAction("typing");
        return ctx.reply("🚨 Произошла ошибка при получении данных.");
      }
    }

    return ctx.scene.leave();
  }
);
