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
    { name: "Mobile Legends", image: gameMl },
    { name: "Free Fire", image: gameFreeFire },
    { name: "PUBG Mobile", image: gamePubg },
    { name: "Genshin Impact", image: gameGenshin },
    { name: "Valorant", image: gameValorant },
    { name: "Call of Duty", image: gameCod },
    { name: "Honkai Star Rail", image: gameHonkai },
    { name: "Wild Rift", image: gameWildRift },
    { name: "Apex Legends", image: gameApex },
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
            <GameCard key={game.name} name={game.name} image={game.image} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
