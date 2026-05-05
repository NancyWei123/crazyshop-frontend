const API_BASE = "/api/cart";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function addToCart(productId, quantity = 1) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      productId,
      quantity,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to add to cart");
  }

  return res.json();
}

export async function getMyCart() {
  const res = await fetch(`${API_BASE}/my`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to get cart");
  }

  return res.json();
}

export async function updateCartItem(cartItemId, quantity) {
  const res = await fetch(`${API_BASE}/${cartItemId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      quantity,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to update cart item");
  }

  return res.json();
}

export async function removeCartItem(cartItemId) {
  const res = await fetch(`${API_BASE}/${cartItemId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to remove cart item");
  }
}

export async function clearCart() {
  const res = await fetch(`${API_BASE}/clear`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to clear cart");
  }
}