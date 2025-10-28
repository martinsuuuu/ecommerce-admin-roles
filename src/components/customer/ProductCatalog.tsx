import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ShoppingCart, Clock, Tag, Package } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';

type Product = {
  id: string;
  name: string;
  category: 'pasabuy' | 'onhand' | 'sale';
  price: number;
  stock: number;
  image: string;
  description: string;
  estimatedArrival?: string;
};

type ProductCatalogProps = {
  userId: string;
  onCartUpdate: (count: number) => void;
};

export function ProductCatalog({ userId, onCartUpdate }: ProductCatalogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/products`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch products. Status:', response.status, 'Error:', errorText);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/cart`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ userId, productId, quantity: 1 }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success('Added to cart!');
        onCartUpdate(data.cartCount);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('An error occurred');
    }
  };

  const pasabuyProducts = products.filter((p) => p.category === 'pasabuy' && p.stock > 0);
  const onhandProducts = products.filter((p) => p.category === 'onhand' && p.stock > 0);
  const saleProducts = products.filter((p) => p.category === 'sale' && p.stock > 0);

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-0">
        <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-gray-300" />
            </div>
          )}
          {product.category === 'sale' && (
            <Badge className="absolute top-2 right-2 bg-red-500">SALE</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="mb-2">{product.name}</CardTitle>
        {product.description && (
          <p className="text-gray-600 mb-3">{product.description}</p>
        )}
        <div className="space-y-2">
          <div className="text-green-600">₱{product.price.toLocaleString()}</div>
          <div className="text-gray-500">{product.stock} available</div>
          {product.estimatedArrival && (
            <div className="flex items-center gap-1 text-yellow-600">
              <Clock className="h-4 w-4" />
              <span>Arrives: {new Date(product.estimatedArrival).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={() => addToCart(product.id)}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All ({products.filter((p) => p.stock > 0).length})
          </TabsTrigger>
          <TabsTrigger value="pasabuy">
            <Clock className="mr-1 h-4 w-4" />
            Pasabuy ({pasabuyProducts.length})
          </TabsTrigger>
          <TabsTrigger value="onhand">
            <Package className="mr-1 h-4 w-4" />
            On-hand ({onhandProducts.length})
          </TabsTrigger>
          <TabsTrigger value="sale">
            <Tag className="mr-1 h-4 w-4" />
            Sale ({saleProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products
              .filter((p) => p.stock > 0)
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
          {products.filter((p) => p.stock > 0).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No products available at the moment.
            </div>
          )}
        </TabsContent>

        <TabsContent value="pasabuy" className="mt-6">
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              <strong>Pasabuy Items:</strong> Pre-order items that will arrive in approximately
              30 days. You'll need to pay a deposit within 24 hours of adding to cart.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pasabuyProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {pasabuyProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No pasabuy items available.
            </div>
          )}
        </TabsContent>

        <TabsContent value="onhand" className="mt-6">
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              <strong>On-hand Items:</strong> Ready to ship immediately! Full payment required
              at checkout.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {onhandProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {onhandProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">No on-hand items available.</div>
          )}
        </TabsContent>

        <TabsContent value="sale" className="mt-6">
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              <strong>Sale Items:</strong> Clearance items at very low prices! Limited stock,
              ready to ship.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {saleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {saleProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">No sale items available.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
