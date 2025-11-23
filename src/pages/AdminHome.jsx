import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const tiles = [
  {
    title: "Orders",
    description: "Review and update pending transactions.",
    href: "/admin/orders",
  },
  {
    title: "Products",
    description: "Manage game top-up products and pricing.",
    href: "/admin/products",
  },
  {
    title: "Categories",
    description: "Organize games and product categories.",
    href: "/admin/categories",
  },
  {
    title: "Daily Profit Report",
    description: "View omzet and profit summarized per day.",
    href: "/admin/reports/daily",
  },
];

const AdminHome = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quick access to store management tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiles.map((tile) => (
            <Link key={tile.href} to={tile.href} className="block">
              <Card className="p-4 h-full hover:border-primary transition-colors cursor-pointer flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">{tile.title}</h2>
                  <p className="text-sm text-muted-foreground">{tile.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminHome;
