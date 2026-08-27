import { Agentation } from "agentation"
import { useEffect, useState } from "react"
import { fetchProducts, type Product } from "@/lib/api/mock"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag } from "lucide-react"

export default function App() {
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => { fetchProducts().then(setProducts) }, [])
  return (
    <>
      <div className="min-h-screen bg-background p-8 font-sans">
        <h1 className="text-3xl font-bold flex items-center gap-2"><ShoppingBag className="size-7" /> Roseau Demo</h1>
        <p className="text-muted-foreground mt-2">Vite + React + Tailwind + shadcn + Plus Jakarta Sans + Lucide + Mock API</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {products.map(p => (
            <Card key={p.id}>
              <CardHeader><CardTitle>{p.name}</CardTitle></CardHeader>
              <CardContent>
                <img src={p.image} alt={p.name} className="rounded-md w-full" />
                <p className="mt-2 font-medium">${p.price}</p>
                <Button className="mt-2 w-full">Add to cart</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Agentation />
    </>
  )
}
