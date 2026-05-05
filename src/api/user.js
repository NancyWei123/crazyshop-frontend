const BASE_URL = "/api";

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  }

  throw new Error(data.message || "Login failed");
}

export async function sendVerificationCode(email) {
  const res = await fetch(`${BASE_URL}/users/send-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  }

  throw new Error(data.message || "Failed to send verification code");
}

export async function register(username, email, password, code) {
  const res = await fetch(`${BASE_URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
      code,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    return data;
  }

  throw new Error(data.message || "Register failed");
}