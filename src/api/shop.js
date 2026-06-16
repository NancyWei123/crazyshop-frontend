const SHOP_BASE_URL = "/api/shop";
export async function getMyShop() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${SHOP_BASE_URL}/my`, {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!response.ok) {
    throw new Error("You don't have a shop yet");
  }

  return response.json();
}

export async function getProductsInShopById(shopId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${SHOP_BASE_URL}/product/${shopId}`, {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products in shop");
  }

  return response.json();
}

