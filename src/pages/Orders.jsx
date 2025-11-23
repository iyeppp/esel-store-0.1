import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const Orders = () => {
  const { customer } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders", customer?.pelangganid ?? "guest"],
    queryFn: async () => {
      const baseUrl = "http://localhost:5000/api/orders";
      const url = customer?.pelangganid
        ? `${baseUrl}?customerId=${customer.pelangganid}`
        : baseUrl;

      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load orders");
      }
      return json.orders;
    },
  });

  const orders = data || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-6">Recent Orders</h1>

        {isLoading && <p className="text-muted-foreground">Loading orders...</p>}
        {isError && <p className="text-destructive">Failed to load orders.</p>}

        {!customer && !isLoading && !isError && (
          <p className="mb-4 text-sm text-muted-foreground">
            You are viewing all recent orders. Sign in to see only your own orders.
          </p>
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <p className="text-muted-foreground">No orders found.</p>
        )}

        {!isLoading && !isError && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.invoice_number + order.nama_produk} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Invoice: <span className="font-mono">{order.invoice_number}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(order.tanggal_transaksi).toLocaleString()}
                  </p>
                  <p className="text-sm text-foreground font-medium mt-1">
                    {order.game} - {order.nama_produk} x{order.jumlah}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    UID: {order.target_uid} | Nickname: {order.target_nickname}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Payment</p>
                  <p className="text-sm text-foreground font-medium">{order.pembayaran}</p>
                  <p className="text-xs text-muted-foreground mt-2">Status: {order.status_transaksi}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
