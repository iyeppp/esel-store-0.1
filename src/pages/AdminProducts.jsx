import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const { role } = useAuth();

  const adminHeaders = {
    "Content-Type": "application/json",
    ...(role ? { "x-admin-role": role } : {}),
  };

  const [newProduct, setNewProduct] = useState({
    categoryId: "",
    name: "",
    sku: "",
    costPrice: "",
    sellPrice: "",
    description: "",
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/categories", {
        headers: adminHeaders,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to load categories");
      return json.categories;
    },
  });

  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/admin/products", {
        headers: adminHeaders,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to load products");
      return json.products;
    },
  });

  const categories = categoriesData || [];
  const products = productsData || [];

  const createMutation = useMutation({
    mutationFn: async () => {
      const body = {
        categoryId: Number(newProduct.categoryId),
        name: newProduct.name.trim(),
        sku: newProduct.sku.trim() || null,
        costPrice: newProduct.costPrice ? Number(newProduct.costPrice) : 0,
        sellPrice: Number(newProduct.sellPrice),
        description: newProduct.description.trim() || null,
      };

      const res = await fetch("http://localhost:5000/api/admin/products", {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to create product");
      return json.product;
    },
    onSuccess: () => {
      setNewProduct({ categoryId: "", name: "", sku: "", costPrice: "", sellPrice: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, product }) => {
      const body = {
        categoryId: Number(product.kategoriid),
        name: product.nama_produk.trim(),
        sku: product.sku?.trim() || null,
        costPrice: product.harga_modal_aktual ? Number(product.harga_modal_aktual) : 0,
        sellPrice: Number(product.harga_jual_aktual),
        description: product.deskripsi?.trim() || null,
      };

      const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to update product");
      return json.product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, {
        method: "DELETE",
        headers: role ? { "x-admin-role": role } : {},
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to delete product");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newProduct.categoryId || !newProduct.name.trim() || !newProduct.sellPrice) return;
    createMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Admin - Products</h1>

        <Card className="p-4 space-y-3">
          <h2 className="font-semibold mb-1">Add New Product</h2>
          <form className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end" onSubmit={handleCreate}>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Category</label>
              <select
                className="border rounded px-2 py-1 text-sm bg-background"
                value={newProduct.categoryId}
                onChange={(e) => setNewProduct((p) => ({ ...p, categoryId: e.target.value }))}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.kategoriid} value={cat.kategoriid}>
                    {cat.nama_kategori}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs text-muted-foreground">Name</label>
              <Input
                value={newProduct.name}
                onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                placeholder="Product name"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">SKU</label>
              <Input
                value={newProduct.sku}
                onChange={(e) => setNewProduct((p) => ({ ...p, sku: e.target.value }))}
                placeholder="(optional)"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Cost Price</label>
              <Input
                type="number"
                value={newProduct.costPrice}
                onChange={(e) => setNewProduct((p) => ({ ...p, costPrice: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Sell Price *</label>
              <Input
                type="number"
                value={newProduct.sellPrice}
                onChange={(e) => setNewProduct((p) => ({ ...p, sellPrice: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="md:col-span-6 flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Description</label>
              <Input
                value={newProduct.description}
                onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))}
                placeholder="Short description (optional)"
              />
            </div>
            <div className="md:col-span-6 flex justify-end">
              <Button type="submit" disabled={createMutation.isLoading || !newProduct.categoryId || !newProduct.name.trim() || !newProduct.sellPrice}>
                {createMutation.isLoading ? "Saving..." : "Add Product"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-3">Existing Products</h2>

          {isLoading && <p className="text-muted-foreground">Loading products...</p>}
          {isError && <p className="text-destructive">Failed to load products.</p>}

          {!isLoading && !isError && products.length === 0 && (
            <p className="text-muted-foreground">No products found.</p>
          )}

          {!isLoading && !isError && products.length > 0 && (
            <div className="space-y-3">
              {products.map((prod) => (
                <ProductRow
                  key={prod.produkid}
                  product={prod}
                  categories={categories}
                  onUpdate={(updated) => updateMutation.mutate({ id: prod.produkid, product: updated })}
                  onDelete={() => deleteMutation.mutate(prod.produkid)}
                />
              ))}
            </div>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
};

const ProductRow = ({ product, categories, onUpdate, onDelete }) => {
  const [local, setLocal] = useState({ ...product });

  const handleChange = (field, value) => {
    setLocal((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate(local);
  };

  return (
    <div className="flex flex-col gap-3 border rounded-md p-3">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <span className="text-xs text-muted-foreground font-mono">ID: {local.produkid}</span>
        <select
          className="border rounded px-2 py-1 text-sm bg-background"
          value={local.kategoriid}
          onChange={(e) => handleChange("kategoriid", Number(e.target.value))}
        >
          {categories.map((cat) => (
            <option key={cat.kategoriid} value={cat.kategoriid}>
              {cat.nama_kategori}
            </option>
          ))}
        </select>
        <Input
          className="max-w-xs"
          value={local.nama_produk}
          onChange={(e) => handleChange("nama_produk", e.target.value)}
        />
        <Input
          className="max-w-[120px]"
          value={local.sku || ""}
          onChange={(e) => handleChange("sku", e.target.value)}
          placeholder="SKU"
        />
      </div>
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <Input
          type="number"
          className="max-w-[140px]"
          value={local.harga_modal_aktual || ""}
          onChange={(e) => handleChange("harga_modal_aktual", e.target.value)}
          placeholder="Cost"
        />
        <Input
          type="number"
          className="max-w-[140px]"
          value={local.harga_jual_aktual || ""}
          onChange={(e) => handleChange("harga_jual_aktual", e.target.value)}
          placeholder="Sell *"
        />
        <Input
          className="flex-1"
          value={local.deskripsi || ""}
          onChange={(e) => handleChange("deskripsi", e.target.value)}
          placeholder="Description"
        />
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={handleSave}>
            Save
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
