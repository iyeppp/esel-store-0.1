import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const AdminDailyReport = () => {
  const { role } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-daily-report"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/admin/reports/daily", {
        headers: role ? { "x-admin-role": role } : {},
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load daily report");
      }
      return json.rows;
    },
  });

  const rows = data || [];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Daily Profit Report</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Summary of successful transactions, omzet, and profit per day.
          </p>
        </div>

        <Card className="p-4 overflow-x-auto">
          {isLoading && <p className="text-muted-foreground">Loading report...</p>}
          {isError && <p className="text-destructive">Failed to load report.</p>}

          {!isLoading && !isError && rows.length === 0 && (
            <p className="text-muted-foreground">No data available.</p>
          )}

          {!isLoading && !isError && rows.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Successful Transactions</th>
                  <th className="py-2 pr-4">Total Omzet</th>
                  <th className="py-2 pr-4">Total Profit</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.tanggal} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-4">
                      {new Date(row.tanggal).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })}
                    </td>
                    <td className="py-2 pr-4">{row.jumlah_transaksi_berhasil}</td>
                    <td className="py-2 pr-4">{formatCurrency(row.total_omzet)}</td>
                    <td className="py-2 pr-4 font-semibold text-emerald-400">
                      {formatCurrency(row.total_keuntungan_bersih)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDailyReport;
