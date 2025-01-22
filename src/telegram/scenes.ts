import { bot } from "./client";
import { Scenes, session } from "telegraf";
import { linkWizard } from "./wizards/link";
import { meWizard } from "./wizards/me";
import { signinWizard } from "./wizards/signin";
import { verifyWizard } from "./wizards/verify";
import { statsWizard } from "./wizards/stats";

const stage = new Scenes.Stage<Scenes.WizardContext>([
  linkWizard,
  meWizard,
  signinWizard,
  verifyWizard,
  statsWizard,
]);

bot.use(session());
bot.use(stage.middleware());
