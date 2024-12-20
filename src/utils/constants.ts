export const BASE_URL = "https://mpatrul-api.ru";

export const ACCOUNT_TYPE: Record<string, string> = {
  "1691aa8d-f819-42f6-b5e1-98f058fee89d": "Работник",
  "02fa5b84-e1cf-4010-b1af-6266c2caebe9": "Волонтер",
};

export enum Role {
  Curator = "9817891f-bf3b-40e3-97c2-bd75acc7e457",
  Squad = "a0086c9e-566c-46a8-87d5-87f7a0c542d7",
  Volunteer = "487c0419-5f55-46bf-bed3-2facbebcb0d0",
}

export const ROLES: Record<string, string> = {
  "9817891f-bf3b-40e3-97c2-bd75acc7e457": "Куратор",
  "a0086c9e-566c-46a8-87d5-87f7a0c542d7": "Отряд",
  "487c0419-5f55-46bf-bed3-2facbebcb0d0": "Волонтер",
};

export enum ReportType {
  Propaganda = "249f1529-5ca5-4bf5-ae2f-cf18ec3c6eb1",
  Abuse = "7c8bf959-53e6-461b-804d-fd3be3034ad8",
  CrimanalSubciltures = "899feb49-46ec-44ab-bfd1-8b6d760420f2",
  RadicalSubciltures = "36051fa2-f169-44cc-8924-ead18ebb2d68",
  Colimbine = "e7538513-a523-4c5a-87d0-7b20d86000e0",
  Cyberbullying = "6633a4d7-241c-4be7-908c-06776ae73a8b",
  Recruitment = "0ce5637e-46ef-4ea8-ae40-5b1f6261a739",
  DiscreditingArmed = "668952e1-09bb-4ae0-9a78-b680f610b3ed",
  // ChildPorn = "48281646-36d9-4095-aa6b-e0ed143e31a2",
  // Extremism = "06ffb02b-25e9-4ca0-b0fb-8a4b94374da8",
}

export enum ReportText {
  Propaganda = "Пропаганда или распространения наркотиков",
  Abuse = "Жестокое обращение, суицид",
  CrimanalSubciltures = "Криминальные субкультуры",
  RadicalSubciltures = "Экстремизм, терроризм, ультрарадикальные субкультуры",
  Colimbine = "Колумбайн",
  Cyberbullying = "Кибербуллинг",
  Recruitment = "Пропаганда или распространения наркотиков",
  DiscreditingArmed = "Дискредитация ВС РФ",
  // ChildPorn = "Детская порнография",
  // Extremism = "Экстремизм",
  Other = "Другое",
}

export const REPORTS = [ReportText.Propaganda, ReportText.Abuse, ReportText.CrimanalSubciltures, ReportText.RadicalSubciltures, ReportText.Colimbine, ReportText.Cyberbullying, ReportText.Recruitment, ReportText.DiscreditingArmed, ReportText.Other]

export const CONTENTS = [
  {
    title: ReportText.Propaganda,
    value: ReportType.Propaganda,
  },
  {
    title: ReportText.Abuse,
    value: ReportType.Abuse,
  },
  {
    title: ReportText.CrimanalSubciltures,
    value: ReportType.CrimanalSubciltures,
  },
  {
    title: ReportText.RadicalSubciltures,
    value: ReportType.RadicalSubciltures,
  },
  {
    title: ReportText.Colimbine,
    value: ReportType.Colimbine,
  },
  {
    title: ReportText.Cyberbullying,
    value: ReportType.Cyberbullying,
  },
  {
    title: ReportText.Recruitment,
    value: ReportType.Recruitment,
  },
  {
    title: ReportText.DiscreditingArmed,
    value: ReportType.DiscreditingArmed,
  },
  // {
  //   title: ReportText.ChildPorn,
  //   value: ReportType.ChildPorn,
  // },
  // {
  //   title: ReportText.Extremism,
  //   value: ReportType.Extremism,
  // },
];
