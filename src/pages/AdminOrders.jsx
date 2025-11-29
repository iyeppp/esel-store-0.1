import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const AdminOrders = () => {
  const { role } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/admin/orders?status=Pending", {
        headers: role ? { "x-admin-role": role } : {},
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load orders");
      }
      return json.orders;
    },
  });

  const orders = data || [];

  const updateStatus = async (transaksiId, status) => {
    await fetch(`http://localhost:5000/api/transactions/${transaksiId}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(role ? { "x-admin-role": role } : {}),
      },
      body: JSON.stringify({ status }),
    });
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-6">Admin - Pending Orders</h1>

        {isLoading && <p className="text-muted-foreground">Loading orders...</p>}
        {isError && <p className="text-destructive">Failed to load orders.</p>}

        {!isLoading && !isError && orders.length === 0 && (
          <p className="text-muted-foreground">No pending orders.</p>
        )}

        {!isLoading && !isError && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order.invoice_number + order.nama_produk}
                className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
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
                <div className="flex flex-col items-end gap-2">
                  <p className="text-xs text-muted-foreground">Payment: {order.pembayaran}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => updateStatus(order.transaksiid, "Success")}
                    >
                      Mark as Paid
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive/10"
                      onClick={() => updateStatus(order.transaksiid, "Failed")}
                    >
                      Mark as Failed
                    </Button>
                  </div>
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

export default AdminOrders;
