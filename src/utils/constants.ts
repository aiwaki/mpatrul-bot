export const BASE_URL = "https://mpatrul-api.ru";

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
  Abuse = "Жестокое обращение, суицид или обсуждение самоповреждений",
  CrimanalSubciltures = "Криминальные субкультуры, воровские понятия",
  RadicalSubciltures = "Экстремизм, терроризм, ультрарадикальные субкультуры",
  Colimbine = "Колумбайн или связанные идеологии",
  Cyberbullying = "Кибербуллинг, угрозы или унижения",
  Recruitment = "Вербовка и преступные организации",
  DiscreditingArmed = "Дискредитация вооруженных сил Российской Федерации",
  // ChildPorn = "Детская порнография",
  // Extremism = "Экстремизм",
}

export const CONTEXTS: Record<string, ReportType> = {
  [ReportText.Propaganda]: ReportType.Propaganda,
  [ReportText.Abuse]: ReportType.Abuse,
  [ReportText.CrimanalSubciltures]: ReportType.CrimanalSubciltures,
  [ReportText.RadicalSubciltures]: ReportType.RadicalSubciltures,
  [ReportText.Colimbine]: ReportType.Colimbine,
  [ReportText.Cyberbullying]: ReportType.Cyberbullying,
  [ReportText.Recruitment]: ReportType.Recruitment,
  [ReportText.DiscreditingArmed]: ReportType.DiscreditingArmed,
};

export const REPORTS = [
  ReportText.Propaganda,
  ReportText.Abuse,
  ReportText.CrimanalSubciltures,
  ReportText.RadicalSubciltures,
  ReportText.Colimbine,
  ReportText.Cyberbullying,
  ReportText.Recruitment,
  ReportText.DiscreditingArmed,
  // ReportText.ChildPorn,
  // ReportText.Extremism
];

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

export const QUERIES = [
  // Пропаганда или распространение наркотиков
  "купить кристаллы мефедрона оптом",
  "купить закладки с ЛСД -рецепты",
  "купить автоцветущие семена конопли для быстрого урожая",
  "синтетические наркотики OR реагенты купить",
  "приобрести мефедрон срочно и дешево",
  "фотопериодные семена конопли купить",
  "семена конопли Афганки купить",
  "семена конопли Сатива купить",

  // Жестокое обращение, суицид или обсуждение самоповреждений
  "методы самоповреждения без следов",
  "безболезненные методы самоубийства",
  "как организовать психологическое насилие в отношениях советы",
  "группы для подростков с самоповреждениями",

  // Криминальные субкультуры, воровские понятия
  "как набить блатные татуировки и узнать их значение",
  "как вор в законе принимает новичка",
  "кодекс воровской чести",
  "сленг воровского мира",
  "традиции и правила блатной субкультуры",

  // Экстремизм, терроризм, ультрарадикальные субкультуры
  "где купить компоненты для самодельной взрывчатки в России",
  "манифесты радикальных националистов",
  "как присоединиться к джихаду в России",
  "группы антисемитских экстремистов",
  "сайты для радикализации молодежи",

  // Колумбайн или связанные идеологии
  "идеология Эрика Харриса и Дилана Клиболда",
  "школа колумбайн вдохновение",
  "где скачать манифест колумбайнера",
  "сообщества поклонников колумбайна",
  "как повторить колумбайн в России",

  // Кибербуллинг, угрозы или унижения
  "анонимные угрозы через Tor",
  "кибербуллинг через фейковый аккаунт",
  "где найти группы для унижения людей",
  "как организовать травлю в сети",
  "создание фальшивых переписок для шантажа",

  // Вербовка и преступные организации
  "как войти в круги бандитских группировок",
  "как стать частью ОПГ",
  "вступить в братву",
  "как присоединиться к наркокартелю",
  "как попасть на воровскую сходку",
  "методы интеграции в криминальные сообщества",
  "как стать бойцом банд",
  "вступление в воровские кланы",
  "как войти в круги рэкетиров",
  "как стать членом группировки вымогателей",

  // Дискредитация вооруженных сил Российской Федерации
  "фейковые новости о потерях ВС РФ",
  "скандалы в российской армии 2025",
  "коррупция в вооруженных силах России",
  "негативные отзывы о службе в армии РФ",
  "проблемы с дисциплиной в российских военных подразделениях",
];
