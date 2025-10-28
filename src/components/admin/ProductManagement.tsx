import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

type Product = {
  id: string;
  name: string;
  category: 'pasabuy' | 'onhand' | 'sale';
  price: number;
  cost: number;
  stock: number;
  image: string;
  description: string;
  estimatedArrival?: string;
};

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [purchasingProduct, setPurchasingProduct] = useState<Product | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'pasabuy' | 'onhand' | 'sale'>('pasabuy');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');

  // Purchase form state
  const [purchaseQuantity, setPurchaseQuantity] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [supplier, setSupplier] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      id: editingProduct?.id,
      name,
      category,
      price: parseFloat(price),
      cost: parseFloat(cost),
      stock: parseInt(stock),
      image,
      description,
      estimatedArrival: category === 'pasabuy' ? estimatedArrival : undefined,
    };

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/products`,
        {
          method: editingProduct ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(productData),
        }
      );

      if (response.ok) {
        toast.success(editingProduct ? 'Product updated!' : 'Product created!');
        setDialogOpen(false);
        resetForm();
        fetchProducts();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('An error occurred');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price.toString());
    setCost(product.cost.toString());
    setStock(product.stock.toString());
    setImage(product.image);
    setDescription(product.description);
    setEstimatedArrival(product.estimatedArrival || '');
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/products/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Product deleted!');
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('An error occurred');
    }
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchasingProduct) return;

    const purchaseData = {
      productId: purchasingProduct.id,
      quantity: parseInt(purchaseQuantity),
      costPerUnit: parseFloat(purchaseCost),
      supplier,
      totalCost: parseInt(purchaseQuantity) * parseFloat(purchaseCost),
    };

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/products/purchase`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(purchaseData),
        }
      );

      if (response.ok) {
        toast.success('Product purchase recorded!');
        setPurchaseDialogOpen(false);
        resetPurchaseForm();
        fetchProducts();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to record purchase');
      }
    } catch (error) {
      console.error('Error recording purchase:', error);
      toast.error('An error occurred');
    }
  };

  const handlePurchaseClick = (product: Product) => {
    setPurchasingProduct(product);
    setPurchaseCost(product.cost.toString());
    setPurchaseDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setName('');
    setCategory('pasabuy');
    setPrice('');
    setCost('');
    setStock('');
    setImage('');
    setDescription('');
    setEstimatedArrival('');
  };

  const resetPurchaseForm = () => {
    setPurchasingProduct(null);
    setPurchaseQuantity('');
    setPurchaseCost('');
    setSupplier('');
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      pasabuy: 'bg-yellow-100 text-yellow-800',
      onhand: 'bg-green-100 text-green-800',
      sale: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={colors[category as keyof typeof colors] || ''}>
        {category.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-gray-900">Product Management</h2>
          <p className="text-gray-600">Manage your inventory and product catalog</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Edit the product details below' : 'Enter the product details below'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pasabuy">Pasabuy Items (Pre-order)</SelectItem>
                      <SelectItem value="onhand">On-hand (Ready to Ship)</SelectItem>
                      <SelectItem value="sale">Sale/Clearance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₱)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost (₱)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {category === 'pasabuy' && (
                <div className="space-y-2">
                  <Label htmlFor="estimatedArrival">Estimated Arrival Date</Label>
                  <Input
                    id="estimatedArrival"
                    type="date"
                    value={estimatedArrival}
                    onChange={(e) => setEstimatedArrival(e.target.value)}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Profit Margin</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      No products found. Add your first product to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <div>{product.name}</div>
                            {product.description && (
                              <div className="text-gray-500 truncate max-w-xs">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(product.category)}</TableCell>
                      <TableCell>₱{product.price.toLocaleString()}</TableCell>
                      <TableCell>₱{product.cost.toLocaleString()}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        ₱{(product.price - product.cost).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePurchaseClick(product)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Purchase Stock"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={(open) => {
        setPurchaseDialogOpen(open);
        if (!open) resetPurchaseForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase Stock</DialogTitle>
            <DialogDescription>
              Record a purchase for {purchasingProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePurchase} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purchase-quantity">Quantity</Label>
              <Input
                id="purchase-quantity"
                type="number"
                min="1"
                value={purchaseQuantity}
                onChange={(e) => setPurchaseQuantity(e.target.value)}
                placeholder="Enter quantity"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase-cost">Cost per Unit (₱)</Label>
              <Input
                id="purchase-cost"
                type="number"
                step="0.01"
                min="0"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(e.target.value)}
                placeholder="Enter cost per unit"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Enter supplier name"
                required
              />
            </div>

            {purchaseQuantity && purchaseCost && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Total Cost:</strong> ₱{(parseInt(purchaseQuantity) * parseFloat(purchaseCost)).toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPurchaseDialogOpen(false);
                  resetPurchaseForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                Record Purchase
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}