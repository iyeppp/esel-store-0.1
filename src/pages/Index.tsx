import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import GameCard from "@/components/GameCard";
import Footer from "@/components/Footer";

import gameMl from "@/assets/game-ml.jpg";
import gameFreeFire from "@/assets/game-freefire.jpg";
import gamePubg from "@/assets/game-pubg.jpg";
import gameGenshin from "@/assets/game-genshin.jpg";
import gameValorant from "@/assets/game-valorant.jpg";
import gameCod from "@/assets/game-cod.jpg";
import gameHonkai from "@/assets/game-honkai.jpg";
import gameWildRift from "@/assets/game-wildrift.jpg";
import gameApex from "@/assets/game-apex.jpg";

const Index = () => {
  const games = [
    { name: "Mobile Legends", image: gameMl, slug: "mobile-legends" },
    { name: "Free Fire", image: gameFreeFire, slug: "free-fire" },
    { name: "PUBG Mobile", image: gamePubg, slug: "pubg-mobile" },
    { name: "Genshin Impact", image: gameGenshin, slug: "genshin-impact" },
    { name: "Valorant", image: gameValorant, slug: "valorant" },
    { name: "Call of Duty", image: gameCod, slug: "call-of-duty" },
    { name: "Honkai Star Rail", image: gameHonkai, slug: "honkai-star-rail" },
    { name: "Wild Rift", image: gameWildRift, slug: "wild-rift" },
    { name: "Apex Legends", image: gameApex, slug: "apex-legends" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroBanner />
      
      {/* Games Grid */}
      <main className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-foreground">Popular Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard key={game.slug} name={game.name} image={game.image} slug={game.slug} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
