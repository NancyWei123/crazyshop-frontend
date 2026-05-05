const PRODUCT_BASE_URL = "/api/products";

export async function getAllProducts() {
  const token = localStorage.getItem("token");

  const response = await fetch(PRODUCT_BASE_URL, {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}