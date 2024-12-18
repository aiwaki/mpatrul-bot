import { screenshotPage } from "../browser/pages";
import { insertLink } from "../database/api";
import { API } from "../utils/api";
import { ReportType } from "../utils/constants";
import { type SingleResponse } from "../utils/types";
import { uploadFile } from "../utils/uploadFile";
import { request } from "./base-api";
import { type CreateMediaRequestParams, Media, createMedia } from "./media";

export interface CreateReportRequestParams {
  url: string;
  content: string;
  isPersonal: boolean;
  isMedia: boolean;
  desciption: string;
  photoId: string;
}

export interface Report {
  id: string;
  url: string;
  createdAt: string;
  content: string;
  isPersonal: string;
  desciption: string;
  author: {
    name: string;
  };
  photo: {
    url: string;
  };
}

export const createReport = async (
  params: CreateReportRequestParams, tg_id: number
): Promise<SingleResponse<Report>> => {
  const { data } = await request<SingleResponse<Report>>({
    url: `${API.report}/create`,
    method: "POST",
    data: params
  }, tg_id);

  return data;
};

export const createReportWithAi = async (): Promise<void> => {
  const alreadyExists = await insertLink(chatId, url)
  if (alreadyExists) {
    await ctx.sendChatAction('typing');
    await ctx.reply('👌 Ссылка уже существует.');
    await ctx.scene.leave();
  }

  const screenshot = await screenshotPage(url)

  const mediaParams: CreateMediaRequestParams = {
    format: Media.PNG
  }
  const mediaResponse = await createMedia(mediaParams, chatId)
  if (mediaResponse.error) throw new Error(mediaResponse.error);

  await uploadFile(mediaResponse.data.upload, screenshot)

  const createRequestParams: CreateReportRequestParams = {
    url,
    content: ReportType.Propaganda.toString(),
    isPersonal: true,
    isMedia: false,
    desciption: "Продажа семян.",
    photoId: mediaResponse.data.id,
  }
  const reportResponse = await createReport(createRequestParams, chatId);
  if (reportResponse.error) throw new Error(reportResponse.error);
};