import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Shield, Zap, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingCard from "@/components/PricingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

import gameMl from "@/assets/game-ml.jpg";
import gameFreeFire from "@/assets/game-freefire.jpg";
import gamePubg from "@/assets/game-pubg.jpg";
import gameGenshin from "@/assets/game-genshin.jpg";
import gameValorant from "@/assets/game-valorant.jpg";
import gameCod from "@/assets/game-cod.jpg";
import gameHonkai from "@/assets/game-honkai.jpg";
import gameWildRift from "@/assets/game-wildrift.jpg";
import gameApex from "@/assets/game-apex.jpg";

const games = {
  "mobile-legends": {
    name: "Mobile Legends",
    image: gameMl,
    description: "5v5 MOBA action game with epic heroes and real-time battles. Top up diamonds to unlock new heroes, skins, and battle passes.",
    instructions: "Enter your Mobile Legends User ID and Server ID to receive your diamonds instantly.",
  },
  "free-fire": {
    name: "Free Fire",
    image: gameFreeFire,
    description: "Fast-paced battle royale with intense 10-minute matches. Get diamonds to unlock characters, weapon skins, and premium bundles.",
    instructions: "Enter your Free Fire Player ID to top up diamonds directly to your account.",
  },
  "pubg-mobile": {
    name: "PUBG Mobile",
    image: gamePubg,
    description: "The original battle royale experience on mobile. Use UC to get exclusive outfits, weapon skins, and Royale Pass.",
    instructions: "Enter your PUBG Mobile Player ID to receive UC instantly.",
  },
  "genshin-impact": {
    name: "Genshin Impact",
    image: gameGenshin,
    description: "Open-world action RPG with stunning visuals. Get Genesis Crystals to wish for new characters and weapons.",
    instructions: "Enter your UID and select your server to receive Genesis Crystals.",
  },
  "valorant": {
    name: "Valorant",
    image: gameValorant,
    description: "Tactical 5v5 shooter with unique agents. Purchase Valorant Points for premium skins, battle passes, and more.",
    instructions: "Enter your Riot ID to top up Valorant Points.",
  },
  "call-of-duty": {
    name: "Call of Duty",
    image: gameCod,
    description: "Premium FPS experience on mobile. Get COD Points for battle passes, operator skins, and weapon blueprints.",
    instructions: "Enter your Call of Duty Mobile Player ID.",
  },
  "honkai-star-rail": {
    name: "Honkai Star Rail",
    image: gameHonkai,
    description: "Space fantasy RPG adventure. Use Oneiric Shards to unlock characters and Light Cones.",
    instructions: "Enter your UID and server to receive Oneiric Shards.",
  },
  "wild-rift": {
    name: "Wild Rift",
    image: gameWildRift,
    description: "League of Legends on mobile. Get Wild Cores for champions, skins, and event passes.",
    instructions: "Enter your Riot ID to top up Wild Cores.",
  },
  "apex-legends": {
    name: "Apex Legends",
    image: gameApex,
    description: "Hero shooter battle royale. Purchase Apex Coins for legends, skins, and battle passes.",
    instructions: "Enter your EA Account ID to receive Apex Coins.",
  },
};

const pricingTiers = [
  { amount: "50", price: "0.99", bonus: "" },
  { amount: "100", price: "1.99", bonus: "10" },
  { amount: "250", price: "4.99", bonus: "25" },
  { amount: "500", price: "9.99", bonus: "50", popular: true },
  { amount: "1000", price: "19.99", bonus: "150" },
  { amount: "2500", price: "49.99", bonus: "500" },
];

const GameDetail = () => {
  const { gameId } = useParams();
  const { toast } = useToast();
  const game = gameId ? games[gameId as keyof typeof games] : null;
  
  const [selectedPackage, setSelectedPackage] = useState<typeof pricingTiers[0] | null>(null);
  const [userId, setUserId] = useState("");
  const [serverId, setServerId] = useState("");

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Game not found</h1>
          <Link to="/">
            <Button variant="default">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePurchase = () => {
    if (!selectedPackage) {
      toast({
        title: "Select a package",
        description: "Please select a diamond package to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!userId.trim()) {
      toast({
        title: "User ID required",
        description: "Please enter your User ID to complete the purchase.",
        variant: "destructive",
      });
      return;
    }

    // Simulate purchase success
    toast({
      title: "Purchase Successful! 🎉",
      description: `${selectedPackage.amount} diamonds will be credited to your account within 5 minutes.`,
    });

    // Reset form
    setSelectedPackage(null);
    setUserId("");
    setServerId("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[40vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={game.image}
            alt={game.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-8">
          <Link to="/" className="mb-4">
            <Button variant="secondary" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Games
            </Button>
          </Link>
          <h1 className="text-5xl font-bold text-foreground mb-2">{game.name}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">{game.description}</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-card border-border">
            <Zap className="h-10 w-10 text-primary mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-2">Instant Delivery</h3>
            <p className="text-sm text-muted-foreground">
              Receive your diamonds within 5 minutes, guaranteed.
            </p>
          </Card>
          <Card className="p-6 bg-card border-border">
            <Shield className="h-10 w-10 text-primary mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-2">100% Safe</h3>
            <p className="text-sm text-muted-foreground">
              Secure payment processing and account protection.
            </p>
          </Card>
          <Card className="p-6 bg-card border-border">
            <Clock className="h-10 w-10 text-primary mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-2">24/7 Support</h3>
            <p className="text-sm text-muted-foreground">
              Our support team is always ready to help you.
            </p>
          </Card>
        </div>

        {/* Pricing Tiers */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">Select Package</h2>
          <p className="text-muted-foreground mb-6">Choose the diamond package that suits your needs</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {pricingTiers.map((tier) => (
              <div
                key={tier.amount}
                onClick={() => setSelectedPackage(tier)}
                className="cursor-pointer"
              >
                <PricingCard
                  amount={tier.amount}
                  price={tier.price}
                  bonus={tier.bonus}
                  popular={tier.popular}
                  onSelect={() => setSelectedPackage(tier)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Purchase Form */}
        <Card className="p-8 bg-card border-border max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-2">Complete Your Purchase</h2>
          <p className="text-sm text-muted-foreground mb-6">{game.instructions}</p>

          <div className="space-y-6">
            {selectedPackage && (
              <div className="p-4 bg-secondary rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Selected Package</p>
                    <p className="text-xl font-bold text-foreground">
                      {selectedPackage.amount} Diamonds
                      {selectedPackage.bonus && (
                        <span className="text-sm text-accent ml-2">+{selectedPackage.bonus} Bonus</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold bg-gradient-gaming bg-clip-text text-transparent">
                      ${selectedPackage.price}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID *</Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="Enter your User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="bg-secondary border-border focus:border-primary"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serverId">Server ID (if applicable)</Label>
                <Input
                  id="serverId"
                  type="text"
                  placeholder="Enter your Server ID"
                  value={serverId}
                  onChange={(e) => setServerId(e.target.value)}
                  className="bg-secondary border-border focus:border-primary"
                  maxLength={50}
                />
              </div>
            </div>

            <Button
              onClick={handlePurchase}
              disabled={!selectedPackage || !userId.trim()}
              className="w-full bg-gradient-gaming hover:opacity-90 transition-opacity shadow-glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Purchase
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By completing this purchase, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default GameDetail;
