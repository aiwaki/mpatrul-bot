import { bot } from "./client";
import "./scenes";
import "./commands";
import "./start";

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
