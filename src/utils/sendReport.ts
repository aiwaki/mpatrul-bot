import { getPageScreenshot, type PageInfo } from "../browser/page";
import {
  createMedia,
  Media,
  type CreateMediaRequestParams,
} from "../services/media";
import {
  type CreateReportRequestParams,
  createReport,
} from "../services/reports";
import { uploadFile } from "./uploadFile";
import { type CreateLinkRequestParams, createLink } from "../services/links";

export const sendReport = async (
  chatId: number,
  pageInfo: PageInfo
): Promise<void> => {
  const createLinkParams: CreateLinkRequestParams = { url: pageInfo.url };
  const linkResponse = await createLink(createLinkParams, chatId);
  if (linkResponse.error) {
    throw new Error(linkResponse.error);
  }
  const { data } = linkResponse;

  if (data.report) {
    throw new Error("Report already exists");
  }

  const pageScreenshot = await getPageScreenshot(pageInfo.url);
  if (!pageScreenshot) {
    throw new Error("Error getting page screenshot");
  }

  const mediaParams: CreateMediaRequestParams = {
    format: Media.PNG,
  };
  const mediaResponse = await createMedia(mediaParams, chatId);
  if (mediaResponse.error) {
    throw new Error(mediaResponse.error);
  }

  await uploadFile(mediaResponse.data.upload, pageScreenshot);

  const createRequestParams: CreateReportRequestParams = {
    url: pageInfo.url,
    content: pageInfo.classifyOut.content,
    isPersonal: true,
    isMedia: false,
    desciption: pageInfo.description,
    photoId: mediaResponse.data.id,
  };
  const reportResponse = await createReport(createRequestParams, chatId);
  if (reportResponse.error) {
    throw new Error(reportResponse.error);
  }
};
