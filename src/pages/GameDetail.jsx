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
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

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
  "steam-wallet": {
    name: "Steam Wallet",
    image: gameApex,
    description:
      "Top up your Steam Wallet balance to purchase games, DLCs, in-game items, and more across the Steam platform.",
    instructions:
      "Enter your Steam account ID or email associated with your Steam account so we can process the wallet top-up.",
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
  const { customer } = useAuth();

  const game = gameId ? games[gameId] : null;

  const currencyLabel =
    gameId === "genshin-impact"
      ? "Genesis Crystals"
      : gameId === "steam-wallet"
      ? "Steam Wallet"
      : "Diamonds";
  const currencyLabelLower = currencyLabel.toLowerCase();

  const requiresGameId = gameId !== "steam-wallet";

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [userId, setUserId] = useState("");
  const [serverId, setServerId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: productsData } = useQuery({
    queryKey: ["products", gameId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:5000/api/products?gameId=${gameId}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load products");
      }
      return json.products;
    },
    enabled: !!gameId,
  });

  const hasDbProducts = productsData && productsData.length > 0;

  const packages = hasDbProducts
    ? productsData.map((product) => ({
        amount: product.nama_produk,
        price: Number(product.harga_jual_aktual).toString(),
        bonus: "",
        productId: product.produkid || product.produkId,
      }))
    : pricingTiers;

  const { data: paymentMethods } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/payment-methods");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load payment methods");
      }
      return json.methods;
    },
  });

  const [selectedMethodId, setSelectedMethodId] = useState(null);

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

  const handlePurchase = async () => {
    if (!selectedPackage) {
      toast({
        title: "Select a package",
        description: `Please select a ${currencyLabelLower} package to continue.`,
        variant: "destructive",
      });
      return;
    }

    if (!selectedMethodId) {
      toast({
        title: "Select a payment method",
        description: "Please choose a payment method to continue.",
        variant: "destructive",
      });
      return;
    }

    if (requiresGameId && !userId.trim()) {
      toast({
        title: "User ID required",
        description: "Please enter your User ID to complete the purchase.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      gameId,
      packageAmount: selectedPackage.amount,
      price: selectedPackage.price,
      bonus: selectedPackage.bonus ?? "",
      userId: userId.trim(),
      serverId: serverId.trim() || null,
      paymentMethodId: selectedMethodId,
      customerId: customer?.pelangganid ?? null,
      productId: selectedPackage.productId ?? null,
    };

    try {
      setIsSubmitting(true);
      const response = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create transaction");
      }

      toast({
        title: "Purchase Successful!",
        description:
          data.invoiceNumber
            ? `Your order has been created with invoice ${data.invoiceNumber}. ${payload.packageAmount} ${currencyLabelLower} will be credited to your account within 5 minutes.`
            : `${payload.packageAmount} ${currencyLabelLower} will be credited to your account within 5 minutes.`,
      });

      setSelectedPackage(null);
      setUserId("");
      setServerId("");
      setSelectedMethodId(null);
    } catch (error) {
      toast({
        title: "Purchase failed",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong while processing your purchase.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="relative h-[40vh] overflow-hidden">
        <div className="absolute inset-0">
          <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-card border-border">
            <Zap className="h-10 w-10 text-primary mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-2">Instant Delivery</h3>
            <p className="text-sm text-muted-foreground">Receive your {currencyLabelLower} within 5 minutes, guaranteed.</p>
          </Card>
          <Card className="p-6 bg-card border-border">
            <Shield className="h-10 w-10 text-primary mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-2">100% Safe</h3>
            <p className="text-sm text-muted-foreground">Secure payment processing and account protection.</p>
          </Card>
          <Card className="p-6 bg-card border-border">
            <Clock className="h-10 w-10 text-primary mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-2">24/7 Support</h3>
            <p className="text-sm text-muted-foreground">Our support team is always ready to help you.</p>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">Select Package</h2>
          <p className="text-muted-foreground mb-6">Choose the {currencyLabelLower} package that suits your needs</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {packages.map((tier) => (
              <div key={tier.amount} onClick={() => setSelectedPackage(tier)} className="cursor-pointer">
                <PricingCard amount={tier.amount} price={tier.price} bonus={tier.bonus} popular={tier.popular} currencyLabel={currencyLabel} onSelect={() => setSelectedPackage(tier)} />
              </div>
            ))}
          </div>
        </div>

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
                      {selectedPackage.amount} {currencyLabel}
                      {selectedPackage.bonus && (
                        <span className="text-sm text-accent ml-2">+{selectedPackage.bonus} Bonus</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold bg-gradient-gaming bg-clip-text text-transparent">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      }).format(Number(selectedPackage.price || 0))}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {requiresGameId ? (
                <>
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
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No game ID is required for Steam Wallet top up. Please just select a package and payment method.
                </p>
              )}

              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <div className="space-y-2">
                  {paymentMethods?.map((method) => (
                    <button
                      key={method.metodeid}
                      type="button"
                      onClick={() => setSelectedMethodId(method.metodeid)}
                      className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors ${
                        selectedMethodId === method.metodeid
                          ? "border-primary bg-secondary"
                          : "border-border bg-background hover:bg-secondary/60"
                      }`}
                    >
                      <span>{method.nama_metode}</span>
                      {method.biaya_admin > 0 && (
                        <span className="text-xs text-muted-foreground">Admin Rp{Number(method.biaya_admin).toLocaleString("id-ID")}</span>
                      )}
                    </button>
                  ))}
                  {!paymentMethods && (
                    <p className="text-xs text-muted-foreground">Loading payment methods...</p>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handlePurchase}
              disabled={
                isSubmitting ||
                !selectedPackage ||
                !selectedMethodId ||
                (requiresGameId && !userId.trim())
              }
              className="w-full bg-gradient-gaming hover:opacity-90 transition-opacity shadow-glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing..." : "Complete Purchase"}
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

export default GameDetail