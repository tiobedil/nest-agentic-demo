export type Product = { id: string; name: string; price: number; image: string }
const products: Product[] = [
  { id: "1", name: "Roseau Chair", price: 299, image: "https://picsum.photos/seed/1/400/300" },
  { id: "2", name: "Oak Table", price: 599, image: "https://picsum.photos/seed/2/400/300" },
  { id: "3", name: "Linen Lamp", price: 129, image: "https://picsum.photos/seed/3/400/300" },
]
export async function fetchProducts(): Promise<Product[]> {
  await new Promise(r => setTimeout(r, 400));
  return products;
}
export async function fetchProduct(id: string) {
  await new Promise(r => setTimeout(r, 300));
  return products.find(p=>p.id===id) ?? null;
}
