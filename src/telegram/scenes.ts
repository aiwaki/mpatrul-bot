import { bot } from './client'
import { Scenes, session } from "telegraf";
import { linkWizard } from './wizards/link'
import { meWizard } from './wizards/me'
import { signinWizard } from './wizards/signin';

const stage = new Scenes.Stage<Scenes.WizardContext>([linkWizard, meWizard, signinWizard]);

bot.use(session());
bot.use(stage.middleware());