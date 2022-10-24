import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { Db, MongoClient } from 'mongodb';

dotenv.config();

export type IClient = Client | Db;

export interface Connection {
  connect: () => Promise<IClient>;
}

export class PgConnection {
  private static instance: PgConnection;

  user: string;
  host: string;
  database: string;
  password: string;

  private constructor(
    user: string,
    host: string,
    database: string,
    password: string
  ) {
    this.user = user;
    this.host = host;
    this.database = database;
    this.password = password;
  }

  public static getInstance(
    user?: string,
    host?: string,
    database?: string,
    password?: string
  ): PgConnection {
    if (!this.instance) {
      if (user && host && database && password) {
        this.instance = new PgConnection(user, host, database, password);
      } else {
        throw new Error(`It's no possible instantiate`);
      }
    }

    return this.instance;
  }
}

export class ClientPg implements Connection {
  async connect(): Promise<Client> {
    const client = new Client({
      user: PgConnection.getInstance().user,
      host: PgConnection.getInstance().host,
      database: PgConnection.getInstance().database,
      password: PgConnection.getInstance().password,
      port: 5432
    });
    await client.connect();

    return client;
  }
}

export class MongoConnection {
  private static instance: MongoConnection;

  url: string;
  dbname: string;

  private constructor(url: string, dbname: string) {
    this.url = url;
    this.dbname = dbname;
  }

  public static getInstance(url?: string, dbname?: string): MongoConnection {
    if (!this.instance) {
      if (url && dbname) {
        this.instance = new MongoConnection(url, dbname);
      } else {
        throw new Error(`It's no possible instantiate`);
      }
    }

    return this.instance;
  }
}

export class ClientMongo implements Connection {
  async connect(): Promise<Db> {
    const client: MongoClient = await new MongoClient(
      MongoConnection.getInstance().url
    ).connect();

    return client.db(MongoConnection.getInstance().dbname);
  }
}
