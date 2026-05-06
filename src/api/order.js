const API_BASE = "/api/orders";
function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function submitOrder(cart) {
  const res = await fetch(`${API_BASE}/submit`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
    items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
    })),
  })
  });

  if (!res.ok) {
    throw new Error("Failed to submit order");
  }

  return res.json();
}