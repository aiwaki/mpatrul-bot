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

export const CONTENTS = [
  {
    title: "Пропаганда или распространения наркотиков",
    value: ReportType.Propaganda,
  },
  {
    title: "Жестокое обращение, суицид",
    value: ReportType.Abuse,
  },
  {
    title: "Криминальные субкультуры",
    value: ReportType.CrimanalSubciltures,
  },
  {
    title: "Экстремизм, терроризм, ультрарадикальные субкультуры",
    value: ReportType.RadicalSubciltures,
  },
  {
    title: "Колумбайн",
    value: ReportType.Colimbine,
  },
  {
    title: "Кибербуллинг",
    value: ReportType.Cyberbullying,
  },
  {
    title: "Вербовка",
    value: ReportType.Recruitment,
  },
  {
    title: "Дискредитация ВС РФ",
    value: ReportType.DiscreditingArmed,
  },
  // {
  //   title: "Детская порнография",
  //   value: ReportType.ChildPorn,
  // },
  // {
  //   title: "Экстремизм",
  //   value: ReportType.Extremism,
  // },
];
