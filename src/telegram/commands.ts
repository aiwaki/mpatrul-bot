import { bot } from "./client";

bot.telegram.setMyCommands([
  {
    command: "/start",
    description: "Новый диалог",
  },
  {
    command: "/signin",
    description: "Вход в систему",
  },
  {
    command: "/me",
    description: "Карточка волонтера",
  },
  {
    command: "/link",
    description: "Проверить ссылку и отправить отчет",
  },
  {
    command: "/verify",
    description: "Проверить найденную страницу",
  },
  {
    command: "/stats",
    description: "Получить статистику всех ссылок",
  },
]);

const commands = ["signin", "me", "link", "verify", "stats"];

commands.forEach((command) => {
  bot.command(command, async (ctx) => {
    await ctx.scene.enter(command);
  });
});
