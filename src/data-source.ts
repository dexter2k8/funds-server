import sqlite3 from "sqlite3";
import "dotenv/config";

const DB_SOURCE =
  process.env.NODE_ENV === "test" ? ":memory:" : process.env.DATABASE_URL ?? "db.sqlite";

export const SQL_CREATE_TABLES = `
    CREATE TABLE IF NOT EXISTS "users" (
	"id"	VARCHAR NOT NULL,
	"name"	VARCHAR(50) NOT NULL,
	"email"	VARCHAR(50) NOT NULL UNIQUE,
	"password"	VARCHAR(120) NOT NULL,
	"admin"	BOOLEAN NOT NULL DEFAULT (0),
	PRIMARY KEY("id")
);
    CREATE TABLE IF NOT EXISTS "funds" (
	"alias"	VARCHAR(10) NOT NULL UNIQUE,
	"name"	VARCHAR(50) NOT NULL,
	"description"	VARCHAR(200),
	"type"	VARCHAR(10) NOT NULL,
	"sector"	VARCHAR(50),
	PRIMARY KEY("alias")
);
    CREATE TABLE IF NOT EXISTS "transactions" (
	"id"	VARCHAR NOT NULL,
	"value"	DECIMAL(10, 2) NOT NULL,
	"date"	DATE NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	"quantity"	DECIMAL(10, 0) NOT NULL,
	"income"	DECIMAL(10, 2) DEFAULT (0),
	"fundAlias"	VARCHAR NOT NULL,
	"userId"	VARCHAR NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY("fundAlias") REFERENCES "funds"("alias") ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
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

export default database;
