import sqlite3 from "sqlite3";

const DB_SOURCE = process.env.DATABASE_URL ?? ":memory:";

const SQL_CREATE_TABLES = `
    CREATE TABLE IF NOT EXISTS "users" (
	"id"	varchar NOT NULL,
	"name"	varchar(50) NOT NULL,
	"email"	varchar(50) NOT NULL UNIQUE,
	"password"	varchar(120) NOT NULL,
	PRIMARY KEY("id")
);
    CREATE TABLE IF NOT EXISTS "funds" (
	"id"	varchar NOT NULL,
	"alias"	varchar(10) NOT NULL UNIQUE,
	"name"	varchar(50) NOT NULL,
	"description"	varchar(300),
	"type"	varchar(50) NOT NULL,
	"sector"	varchar(50),
	PRIMARY KEY("id")
);
    CREATE TABLE IF NOT EXISTS "transactions" (
	"id"	varchar NOT NULL,
	"price"	decimal(10, 2) NOT NULL,
	"bought_at"	date NOT NULL,
	"userId"	varchar,
	"fundId"	varchar,
	PRIMARY KEY("id")
);
`;

const database = new sqlite3.Database(DB_SOURCE, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  }
  database.exec(SQL_CREATE_TABLES, (err) => {
    if (err) {
      console.error(err.message);
      throw err;
    }
  });
});
