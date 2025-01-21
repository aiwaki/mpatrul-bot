import { Markup, Scenes } from "telegraf";
import { fmt, bold } from "telegraf/format";
import {
  fetchClassification,
  fetchPages,
  PageState,
  updatePageState,
  type Classification,
  type Page,
} from "../../database/pages";
import {
  type CreateMediaRequestParams,
  Media,
  createMedia,
} from "../../services/media";
import {
  type CreateReportRequestParams,
  createReport,
} from "../../services/reports";
import { uploadFile } from "../../utils/uploadFile";
import { getPageScreenshot } from "../../browser/page";
import { Cron } from "croner";

interface PageWithClassification {
  info: Page;
  classification: Classification;
}

interface Action {
  chatId: number;
  page: PageWithClassification;
  expiry: Date;
  messageId?: number;
  userMessageId?: number;
}

let pages: PageWithClassification[] = await getPages();
let actions: Action[] = [];

async function getPages() {
  const fetchedPages = await fetchPages();
  return Promise.all(
    fetchedPages.map(async (page) => ({
      info: page,
      classification: await fetchClassification(page.classify_out_id),
    }))
  );
}

const _fetchPagesCron = new Cron("*/10 * * * *", async () => {
  pages = await getPages();
});

const _cleanupActionsCron = new Cron("* * * * *", () => {
  const now = new Date();
  actions = actions.filter((action) => {
    if (now > action.expiry) {
      cleanupAction(action.chatId);
      return false;
    }
    return true;
  });
});

async function cleanupAction(chatId: number, ctx?: Scenes.WizardContext) {
  const filteredActions = actions.filter((action) => action.chatId === chatId);
  for (const action of filteredActions) {
    if (ctx && action.messageId) {
      try {
        await ctx.telegram.deleteMessage(chatId, action.messageId);
      } catch (err) {
        console.error(`Ошибка удаления сообщения бота: ${err}`);
      }
    }
    if (ctx && action.userMessageId) {
      try {
        await ctx.telegram.deleteMessage(chatId, action.userMessageId);
      } catch (err) {
        console.error(`Ошибка удаления сообщения пользователя: ${err}`);
      }
    }
  }
  actions = actions.filter((action) => action.chatId !== chatId);
}

async function sendPageCard(
  ctx: Scenes.WizardContext,
  page: { info: Page; classification: Classification }
) {
  const message = fmt`
🔍 ${bold("Информация о странице")}

🔗 ${bold("Ссылка")}: ${page.info.url}
✏️ ${bold("Заголовок")}: ${page.info.title}
📝 ${bold("Описание")}: ${page.info.description}
📊 ${bold("Тип контента")}: ${page.classification.label}
    `;

  await ctx.sendChatAction("typing");
  const sentMessage = await ctx.reply(
    message,
    Markup.inlineKeyboard([
      [Markup.button.callback("Подтвердить", "verify")],
      [Markup.button.callback("Скрыть", "hide")],
      [Markup.button.callback("Отмена", "cancel")],
    ])
  );

  return sentMessage.message_id;
}

export const verifyWizard = new Scenes.WizardScene<Scenes.WizardContext>(
  "verify",
  async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) {
      await ctx.sendChatAction("typing");
      await ctx.reply("⚠️ Не удалось определить идентификатор чата.");
      return ctx.scene.leave();
    }

    await cleanupAction(chatId, ctx);

    if (!pages.length) {
      await ctx.sendChatAction("typing");
      await ctx.reply("⚠️ Нет страниц для подтверждения.");
      return ctx.scene.leave();
    }

    const currentPage = pages.shift();
    if (!currentPage) {
      await ctx.sendChatAction("typing");
      await ctx.reply("⚠️ Не удалось получить страницу.");
      return ctx.scene.leave();
    }

    const messageId = await sendPageCard(ctx, currentPage);

    actions.push({
      chatId,
      page: currentPage,
      expiry: new Date(Date.now() + 15 * 60 * 1000),
      messageId,
      userMessageId: ctx.message?.message_id,
    });
    return ctx.wizard.selectStep(0);
  }
);

verifyWizard.action("verify", async (ctx) => {
  const chatId = ctx.chat?.id;
  if (!chatId) {
    await ctx.sendChatAction("typing");
    await ctx.reply("⚠️ Не удалось определить идентификатор чата.");
    return ctx.scene.leave();
  }

  const action = actions.find((action) => action.chatId === chatId);
  if (!action) {
    return ctx.scene.leave();
  }

  try {
    const mediaParams: CreateMediaRequestParams = { format: Media.PNG };
    const mediaResponse = await createMedia(mediaParams, chatId);
    if (mediaResponse.error) throw new Error(mediaResponse.error);

    const pageScreenshot = await getPageScreenshot(action.page.info.url);
    if (!pageScreenshot) {
      await ctx.sendChatAction("typing");
      await ctx.reply("⚠️ Что-то пошло не так.");
      return ctx.scene.leave();
    }

    await uploadFile(mediaResponse.data.upload, pageScreenshot);

    const createRequestParams: CreateReportRequestParams = {
      url: action.page.info.url,
      content: action.page.classification.content,
      isPersonal: true,
      isMedia: false,
      desciption: action.page.info.description,
      photoId: mediaResponse.data.id,
    };
    const reportResponse = await createReport(createRequestParams, chatId);
    if (reportResponse.error) throw new Error(reportResponse.error);

    updatePageState(action.page.info.url, PageState.Reported);
    await cleanupAction(chatId, ctx);
    await ctx.reply("✅ Отчет отправлен.");
  } catch (error) {
    console.error("🚨 Ошибка при обработке данных:", error);

    await ctx.sendChatAction("typing");
    await ctx.reply("⚠️ Ошибка отправки отчета.");
  }
  return ctx.wizard.selectStep(0);
});

verifyWizard.action("hide", async (ctx) => {
  const chatId = ctx.chat?.id;
  if (!chatId) {
    await ctx.sendChatAction("typing");
    await ctx.reply("⚠️ Не удалось определить идентификатор чата.");
    return ctx.scene.leave();
  }

  const action = actions.find((action) => action.chatId === chatId);
  if (!action) {
    return ctx.scene.leave();
  }

  updatePageState(action.page.info.url, PageState.Hidden);
  await cleanupAction(chatId, ctx);
  await ctx.reply("👌 Страница исключена из предложений.");
  return ctx.wizard.selectStep(0);
});

verifyWizard.action("cancel", async (ctx) => {
  const chatId = ctx.chat?.id;
  if (!chatId) {
    await ctx.sendChatAction("typing");
    await ctx.reply("⚠️ Не удалось определить идентификатор чата.");
    return ctx.scene.leave();
  }

  await cleanupAction(chatId, ctx);
  await ctx.reply("👌 Отмена.");
  return ctx.scene.leave();
});
