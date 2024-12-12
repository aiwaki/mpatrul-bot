import { bot } from './client.ts'
import { Scenes, session } from "telegraf";
import { linkWizard } from './wizards/link.ts'
import { meWizard } from './wizards/me.ts'
import { reportWizard } from './wizards/report.ts'
import { signinWizard } from './wizards/signin.ts';

const stage = new Scenes.Stage<Scenes.WizardContext>([linkWizard, meWizard, reportWizard, signinWizard]);

bot.use(session());
bot.use(stage.middleware());