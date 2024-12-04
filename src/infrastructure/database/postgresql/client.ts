import { Pool, PoolConfig } from "pg";
import { CONFIG } from "../../../config";

class PostgresClient {
  private static instance: PostgresClient;
  private readonly pool: Pool;

  private constructor() {
    const poolConfig: PoolConfig = {
      host: CONFIG.DATABASE.POSTGRESQL.HOST,
      port: CONFIG.DATABASE.POSTGRESQL.PORT,
      user: CONFIG.DATABASE.POSTGRESQL.USER,
      password: CONFIG.DATABASE.POSTGRESQL.PASSWORD,
      database: CONFIG.DATABASE.POSTGRESQL.NAME,
      max: CONFIG.DATABASE.POSTGRESQL.MAX_CONNECTIONS,
      idleTimeoutMillis: CONFIG.DATABASE.POSTGRESQL.IDLE_TIMEOUT,
      ssl: CONFIG.DATABASE.POSTGRESQL.SSL
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
    };

    this.pool = new Pool(poolConfig);

    this.pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
      process.exit(-1);
    });
  }

  public static getInstance(): PostgresClient {
    if (!PostgresClient.instance) {
      PostgresClient.instance = new PostgresClient();
    }
    return PostgresClient.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async checkConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      await client.query("SELECT 1");
      client.release();
      return true;
    } catch (error) {
      console.error("Database connection error:", error);
      return false;
    }
  }

  public async closePool(): Promise<void> {
    await this.pool.end();
  }
}

export const postgresClient = PostgresClient.getInstance();
export const pool = postgresClient.getPool();
