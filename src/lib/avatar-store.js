import { promises as fs } from "fs";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "data", "avatars.json");

async function ensureStore() {
  try {
    await fs.access(STORE_PATH);
  } catch (error) {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, "{}", "utf8");
  }
}

async function readStore() {
  await ensureStore();
  try {
    const data = await fs.readFile(STORE_PATH, "utf8");
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Unable to read avatar store", error);
    return {};
  }
}

async function writeStore(store) {
  await ensureStore();
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function getAvatar(userId) {
  if (!userId) return "";
  const store = await readStore();
  return store[userId] || "";
}

export async function setAvatar(userId, value) {
  if (!userId) return;
  const store = await readStore();
  if (value) {
    store[userId] = value;
  } else {
    delete store[userId];
  }
  await writeStore(store);
}
