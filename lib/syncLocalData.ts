// lib/syncLocalData.ts
export async function syncLocalDataToDB(token: string) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

  // Send cart data
  if (cart.length > 0) {
    await fetch("/api/user/cart/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items: cart }),
    });
    localStorage.removeItem("cart");
  }

  // Send wishlist data
  if (wishlist.length > 0) {
    await fetch("/api/user/wishlist/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items: wishlist }),
    });
    localStorage.removeItem("wishlist");
  }
}
