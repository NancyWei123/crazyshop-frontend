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
export async function getProductById(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${PRODUCT_BASE_URL}/${id}`, {
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
export async function createProduct(data) {
  const token = localStorage.getItem("token");

  const response = await fetch(PRODUCT_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Create product error:", text);
    throw new Error("Failed to create product");
  }

  return response.json();
}