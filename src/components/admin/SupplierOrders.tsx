import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

type ProductSales = {
  productId: string;
  productName: string;
  cost: number;
  price: number;
  totalSold: number;
  totalRevenue: number;
  profitPerUnit: number;
  totalProfit: number;
};

export function SupplierOrders() {
  const [productSales, setProductSales] = useState<ProductSales[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductSales();
  }, []);

  const fetchProductSales = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-793a174e/supplier-report`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProductSales(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching supplier report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totals = productSales.reduce(
    (acc, product) => ({
      totalCost: acc.totalCost + product.cost * product.totalSold,
      totalRevenue: acc.totalRevenue + product.totalRevenue,
      totalProfit: acc.totalProfit + product.totalProfit,
    }),
    { totalCost: 0, totalRevenue: 0, totalProfit: 0 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900">Supplier Orders & Product Performance</h2>
        <p className="text-gray-600">Track product costs, sales, and profitability</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-600">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-orange-600">₱{totals.totalCost.toLocaleString()}</div>
            <p className="text-gray-500 mt-1">Cost of goods sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-green-600">₱{totals.totalRevenue.toLocaleString()}</div>
            <p className="text-gray-500 mt-1">Sales from products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-600">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-blue-600">₱{totals.totalProfit.toLocaleString()}</div>
            <p className="text-gray-500 mt-1">Gross margin</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Sales Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Units Sold</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>Profit per Unit</TableHead>
                  <TableHead>Total Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500">
                      No sales data available yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  productSales.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell>{product.productName}</TableCell>
                      <TableCell>₱{product.cost.toLocaleString()}</TableCell>
                      <TableCell>₱{product.price.toLocaleString()}</TableCell>
                      <TableCell>{product.totalSold}</TableCell>
                      <TableCell className="text-orange-600">
                        ₱{(product.cost * product.totalSold).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-green-600">
                        ₱{product.totalRevenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-blue-600">
                        ₱{product.profitPerUnit.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-blue-600">
                        ₱{product.totalProfit.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
