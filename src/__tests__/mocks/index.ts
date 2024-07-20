export const mockedUser = {
  name: "Joana",
  email: "joana@mail.com",
  password: "123456",
  admin: false,
};

export const mockedAdmin = {
  name: "Felipe",
  email: "felipe@mail.com",
  password: "123456",
  admin: true,
};

export const mockedFund = {
  alias: "HGLG11",
  name: "CGHG Logística",
  description: "Fundo imobiliário especialista em galpões logísticos",
  type: "FII",
  sector: "Logística",
};

export const mockedFundToDelete = {
  alias: "PETR4",
  name: "Petrobrás",
  description: "Petrolífera",
  type: "Ação",
  sector: "Estatal",
};

export const mockedIncome = {
  price: 100,
  updated_at: "2022-07-13",
  income: 1,
  fund_alias: "HGLG11",
};
