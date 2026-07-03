const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const STORE_PATH = path.join(__dirname, "..", "data", "auth-store.json");
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

let state = loadState();

function registerUser(input) {
  const name = normalizeText(input.name);
  const email = normalizeEmail(input.email);
  const workspace = normalizeText(input.workspace);
  const password = typeof input.password === "string" ? input.password : "";

  if (!name || !email || !workspace || password.length < 8) {
    return {
      ok: false,
      status: 400,
      error: "Name, work email, workspace, and an 8 character password are required.",
    };
  }

  if (state.users.some((user) => user.email === email)) {
    return {
      ok: false,
      status: 409,
      error: "A user with this email already exists.",
    };
  }

  const now = new Date().toISOString();
  const user = {
    id: `user_${crypto.randomUUID()}`,
    name,
    email,
    workspace,
    role: "workspace-owner",
    passwordHash: hashPassword(password),
    createdAt: now,
    updatedAt: now,
  };

  state.users.unshift(user);
  const session = createSession(user.id);
  persistState();

  return {
    ok: true,
    status: 201,
    user: publicUser(user),
    session,
  };
}

function loginUser(input) {
  const email = normalizeEmail(input.email);
  const password = typeof input.password === "string" ? input.password : "";
  const user = state.users.find((candidate) => candidate.email === email);

  if (!user || user.passwordHash !== hashPassword(password)) {
    return {
      ok: false,
      status: 401,
      error: "Invalid email or password.",
    };
  }

  const session = createSession(user.id);
  persistState();

  return {
    ok: true,
    status: 200,
    user: publicUser(user),
    session,
  };
}

function getUserBySession(token) {
  if (!token) {
    return null;
  }

  const session = state.sessions.find((item) => item.token === token);

  if (!session || Date.parse(session.expiresAt) <= Date.now()) {
    state.sessions = state.sessions.filter((item) => item.token !== token);
    persistState();
    return null;
  }

  const user = state.users.find((candidate) => candidate.id === session.userId);
  return user ? publicUser(user) : null;
}

function createSession(userId) {
  const session = {
    token: `sess_${crypto.randomUUID()}`,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };

  state.sessions.unshift(session);
  state.sessions = state.sessions.filter((item) => Date.parse(item.expiresAt) > Date.now()).slice(0, 100);
  return session;
}

function loadState() {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      return { users: [], sessions: [] };
    }

    const parsed = JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    };
  } catch {
    return { users: [], sessions: [] };
  }
}

function persistState() {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), "utf8");
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    workspace: user.workspace,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(`kaidon:${password}`).digest("hex");
}

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

module.exports = {
  getUserBySession,
  loginUser,
  registerUser,
};
