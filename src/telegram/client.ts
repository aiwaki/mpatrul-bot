import { Scenes, Telegraf } from "telegraf";

export const bot = new Telegraf<Scenes.WizardContext>(
  process.env.BOT_TOKEN as string
);
