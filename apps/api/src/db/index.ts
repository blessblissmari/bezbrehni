import { MemoryRepository } from "./memory";
import type { Repository } from "./types";
import { YdbRepository } from "./ydb";

let instance: Repository | null = null;

export async function getRepo(): Promise<Repository> {
  if (instance) return instance;
  const endpoint = process.env.YDB_ENDPOINT;
  const database = process.env.YDB_DATABASE;
  const useMemory = process.env.BEZBREHNI_DB === "memory" || !endpoint || !database;
  instance = useMemory
    ? new MemoryRepository()
    : new YdbRepository(endpoint!, database!);
  await instance.init();
  return instance;
}

export type { Repository } from "./types";
