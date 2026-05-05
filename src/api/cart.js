const CART_BASE_URL = "/api/cart";

export async function addToCart(productId, quantity) {
  const token = localStorage.getItem("token");

  const response = await fetch(CART_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({
      productId,
      quantity,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to add product to cart");
  }

  return response.json();
}