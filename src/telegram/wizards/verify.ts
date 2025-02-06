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
import { Cron } from "croner";
import { sendReport } from "../../utils/sendReport";
import { insertLink } from "../../database/links";
import type { PageInfo } from "../../browser/page";
import { CONTEXTS } from "../../utils/constants";
import { fetchToken } from "../../database/chats";

function toPageInfo(page: Page, classification: Classification): PageInfo {
  return {
    title: page.title,
    description: page.description,
    url: page.url,
    classifyOut: {
      label: classification.label,
      content: CONTEXTS[classification.content],
      score: classification.score,
    },
  };
}

interface Action {
  chatId: number;
  page: PageInfo;
  expiry: Date;
  messageId?: number;
  userMessageId?: number;
}

let pages: PageInfo[] = await getPages();
let actions: Action[] = [];

async function getPages() {
  const fetchedPages = await fetchPages();
  return Promise.all(
    fetchedPages.map(async (page) => {
      const classification = await fetchClassification(page.classify_out_id);
      return toPageInfo(page, classification);
    })
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
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Ошибка удаления сообщения бота: ${error.message}`);
        }
      }
    }
    if (ctx && action.userMessageId) {
      try {
        await ctx.telegram.deleteMessage(chatId, action.userMessageId);
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            `Ошибка удаления сообщения пользователя: ${error.message}`
          );
        }
      }
    }
  }
  actions = actions.filter((action) => action.chatId !== chatId);
}

async function sendPageCard(ctx: Scenes.WizardContext, page: PageInfo) {
  const message = fmt`
🔍 ${bold("Информация о странице")}

🔗 ${bold("Ссылка")}: ${page.url}
✏️ ${bold("Заголовок")}: ${page.title}
📝 ${bold("Описание")}: ${page.description}
📊 ${bold("Тип контента")}: ${page.classifyOut.label}
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

    const token = await fetchToken(chatId);
    if (!token) {
      await ctx.sendChatAction("typing");
      await ctx.reply("⚠️ Войдите в аккаунт.");
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
    await sendReport(chatId, action.page);
    await insertLink(chatId, action.page.url);

    updatePageState(action.page.url, PageState.Reported);
    await cleanupAction(chatId, ctx);
    await ctx.reply("✅ Отчет отправлен.");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Report already exists") {
        await ctx.sendChatAction("typing");
        await ctx.reply("✅ Отчет уже существует.");
        return ctx.scene.leave();
      }

      console.error("🚨 Ошибка при отправке отчета:", error.message);
      await ctx.sendChatAction("typing");
      await ctx.reply("🚨 Произошла ошибка при отправке отчета.");
      return ctx.scene.leave();
    }
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

  updatePageState(action.page.url, PageState.Hidden);
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
