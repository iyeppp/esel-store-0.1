import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [newRequiresGameId, setNewRequiresGameId] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/categories");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load categories");
      }
      return json.categories;
    },
  });

  const categories = data || [];

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), requiresGameId: newRequiresGameId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to create category");
      }
      return json.category;
    },
    onSuccess: () => {
      setNewName("");
      setNewRequiresGameId(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name, requiresGameId }) => {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, requiresGameId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update category");
      }
      return json.category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete category");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Admin - Categories</h1>

        <Card className="p-4">
          <h2 className="font-semibold mb-3">Add New Category</h2>
          <form className="flex flex-col md:flex-row gap-3 items-center" onSubmit={handleCreate}>
            <Input
              placeholder="Category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="max-w-xs"
            />
            <div className="flex items-center gap-2">
              <input
                id="requires-game-id"
                type="checkbox"
                checked={newRequiresGameId}
                onChange={(e) => setNewRequiresGameId(e.target.checked)}
              />
              <label htmlFor="requires-game-id" className="text-sm text-muted-foreground">
                Requires Game ID/UID
              </label>
            </div>
            <Button type="submit" disabled={createMutation.isLoading || !newName.trim()}>
              {createMutation.isLoading ? "Saving..." : "Add Category"}
            </Button>
          </form>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-3">Existing Categories</h2>

          {isLoading && <p className="text-muted-foreground">Loading categories...</p>}
          {isError && <p className="text-destructive">Failed to load categories.</p>}

          {!isLoading && !isError && categories.length === 0 && (
            <p className="text-muted-foreground">No categories found.</p>
          )}

          {!isLoading && !isError && categories.length > 0 && (
            <div className="space-y-3">
              {categories.map((cat) => (
                <CategoryRow
                  key={cat.kategoriid}
                  category={cat}
                  onUpdate={updateMutation.mutate}
                  onDelete={deleteMutation.mutate}
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

const CategoryRow = ({ category, onUpdate, onDelete }) => {
  const [name, setName] = useState(category.nama_kategori);
  const [requiresGameId, setRequiresGameId] = useState(!!category.membutuhkan_gameid);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 border rounded-md p-3">
      <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3">
        <span className="text-xs text-muted-foreground font-mono">ID: {category.kategoriid}</span>
        <Input
          className="max-w-xs"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <input
            id={`requires-${category.kategoriid}`}
            type="checkbox"
            checked={requiresGameId}
            onChange={(e) => setRequiresGameId(e.target.checked)}
          />
          <label
            htmlFor={`requires-${category.kategoriid}`}
            className="text-sm text-muted-foreground"
          >
            Requires Game ID
          </label>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdate({ id: category.kategoriid, name: name.trim(), requiresGameId })}
          disabled={!name.trim()}
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(category.kategoriid)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default AdminCategories;
