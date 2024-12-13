import { bot } from './client.ts'
import { Scenes, session } from "telegraf";
import { linkWizard } from './wizards/link.ts'
import { meWizard } from './wizards/me.ts'
import { signinWizard } from './wizards/signin.ts';

const stage = new Scenes.Stage<Scenes.WizardContext>([linkWizard, meWizard, signinWizard]);

bot.use(session());
bot.use(stage.middleware());