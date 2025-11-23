import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import GameCard from "@/components/GameCard";
import Footer from "@/components/Footer";

import gameMl from "@/assets/game-ml.jpg";
import gameGenshin from "@/assets/game-genshin.jpg";
import gameValorant from "@/assets/voucher-steam.jpg";

const Index = () => {
  const location = useLocation();

  useEffect(() => {

    if (location.hash === "#popular-games") {
      const section = document.getElementById("popular-games");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  const slugify = (name) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const imageMap = {
    "mobile-legends": gameMl,
    "genshin-impact": gameGenshin,
    "steam-wallet": gameValorant,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/games");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load games");
      }
      return json.games;
    },
  });

  const games = (data || []).map((game) => {
    const slug = slugify(game.nama_kategori);
    return {
      name: game.nama_kategori,
      image: imageMap[slug] || gameMl,
      slug,
      category: game.membutuhkan_gameid ? undefined : "voucher",
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroBanner />
      <main className="container mx-auto px-4 py-12">
        <section id="popular-games">
          <h2 className="text-3xl font-bold mb-8 text-foreground">Popular Games</h2>

          {isLoading && <p className="text-muted-foreground">Loading games...</p>}
          {isError && <p className="text-destructive">Failed to load games.</p>}

          {!isLoading && !isError && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <GameCard
                  key={game.slug}
                  name={game.name}
                  image={game.image}
                  slug={game.slug}
                  category={game.category}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;