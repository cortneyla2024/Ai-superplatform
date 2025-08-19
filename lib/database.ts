import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dataDir = path.join(process.cwd(), 'data');

export async function ensureFileExists(fileName: string) {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    const filePath = path.join(dataDir, fileName);
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify([]), 'utf8');
    }
  } catch (error) {
    console.error(`Error ensuring file ${fileName} exists:`, error);
  }
}

export async function readData(fileName: string) {
  const filePath = path.join(dataDir, fileName);
  await ensureFileExists(fileName);
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

export async function writeData(fileName: string, data: any) {
  const filePath = path.join(dataDir, fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function createUser(userData: any) {
  const users = await readData('users.json');
  const newUser = { id: uuidv4(), ...userData };
  users.push(newUser);
  await writeData('users.json', users);
  return newUser;
}

export async function getUserByUsername(username: string) {
  const users = await readData('users.json');
  return users.find((user: any) => user.username === username);
}

export async function getUserById(id: string) {
  const users = await readData('users.json');
  return users.find((user: any) => user.id === id);
}

export async function createSession(userId: string) {
  const sessions = await readData('sessions.json');
  const token = uuidv4();
  const newSession = {
    token,
    userId,
    expiry: Date.now() + 24 * 60 * 60 * 1000,
  };
  sessions.push(newSession);
  await writeData('sessions.json', sessions);
  return newSession;
}

export async function getSessionByToken(token: string) {
  const sessions = await readData('sessions.json');
  const session = sessions.find((s: any) => s.token === token);
  if (session && session.expiry > Date.now()) {
    return session;
  }
  return null;
}
