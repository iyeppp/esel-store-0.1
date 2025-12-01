import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const AdminCategoryReport = () => {
  const { role } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-category-report"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/admin/reports/by-category", {
        headers: role ? { "x-admin-role": role } : {},
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load category report");
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
          <h1 className="text-3xl font-bold text-foreground">Category Performance Report</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Profit and omzet aggregated per game category (successful transactions only).
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
                  <th className="py-2 pr-4">Game Category</th>
                  <th className="py-2 pr-4">Total Items Sold</th>
                  <th className="py-2 pr-4">Total Omzet</th>
                  <th className="py-2 pr-4">Total Profit</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.nama_kategori} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-4 font-medium">{row.nama_kategori}</td>
                    <td className="py-2 pr-4">{row.total_item_terjual}</td>
                    <td className="py-2 pr-4">{formatCurrency(row.total_omzet_kategori)}</td>
                    <td className="py-2 pr-4 font-semibold text-emerald-400">
                      {formatCurrency(row.total_profit_kategori)}
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

export default AdminCategoryReport;
