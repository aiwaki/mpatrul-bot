import { bot } from './client.ts'
import './scenes.ts'
import './commands.ts'
import './start.ts'

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))