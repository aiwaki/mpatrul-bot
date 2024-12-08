import { bot } from './client.js'
import './commands.js'
import './start.js'

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))