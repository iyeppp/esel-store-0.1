import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const OrderDetail = () => {
  const { invoiceNumber } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["order-detail", invoiceNumber],
    queryFn: async () => {
      const res = await fetch(`http://localhost:5000/api/orders/invoice/${invoiceNumber}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load order detail");
      }
      return json.rows;
    },
    enabled: !!invoiceNumber,
  });

  const rows = data || [];
  const header = rows[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Order Detail</h1>
            {invoiceNumber && (
              <p className="text-sm text-muted-foreground mt-1">Invoice: <span className="font-mono">{invoiceNumber}</span></p>
            )}
          </div>
          <Link to="/orders">
            <Button variant="outline">Back to Orders</Button>
          </Link>
        </div>

        {isLoading && <p className="text-muted-foreground">Loading order detail...</p>}
        {isError && <p className="text-destructive">Failed to load order detail.</p>}

        {!isLoading && !isError && !header && (
          <p className="text-muted-foreground">Order not found.</p>
        )}

        {!isLoading && !isError && header && (
          <div className="space-y-4">
            <Card className="p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Invoice: <span className="font-mono">{header.invoice_number}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Date: {new Date(header.tanggal_transaksi).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Status: <span className="font-medium text-foreground">{header.status_transaksi}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Payment: <span className="font-medium text-foreground">{header.pembayaran}</span>
              </p>
            </Card>

            <Card className="p-4 space-y-2">
              <h2 className="text-lg font-semibold text-foreground mb-2">Items</h2>
              <div className="space-y-3">
                {rows.map((row) => (
                  <div
                    key={row.nama_produk + row.target_uid}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-border/60 last:border-0 pb-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {row.game} - {row.nama_produk} x{row.jumlah}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        UID: {row.target_uid} | Nickname: {row.target_nickname}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>
                        Price: Rp{Number(row.harga_jual_saat_transaksi || 0).toLocaleString("id-ID")}
                      </p>
                      <p>
                        Subtotal: Rp{Number(row.subtotal_item || row.harga_jual_saat_transaksi || 0).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetail;
