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

export const mockedTransaction = {
  value: 100,
  date: "2022/07/13",
  quantity: 2,
  income: 1,
  fundAlias: "HGLG11",
};
