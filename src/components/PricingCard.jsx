import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const PricingCard = ({ amount, price, bonus, popular, onSelect, currencyLabel = "Diamonds" }) => {
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));

  return (
    <Card
      className={`relative p-6 transition-all duration-300 hover:scale-105 ${
        popular ? "border-primary bg-gradient-to-br from-card to-secondary shadow-glow-primary" : "border-border bg-card hover:border-primary/50"
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-gaming px-4 py-1 rounded-full text-xs font-bold text-primary-foreground shadow-glow-primary">
          MOST POPULAR
        </div>
      )}

      <div className="text-center space-y-4">
        <div>
          <div className="text-3xl font-bold text-foreground mb-1">{amount}</div>
          <div className="text-sm text-muted-foreground">{currencyLabel}</div>
        </div>

        {bonus && (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-accent/20 border border-accent rounded-full text-xs font-semibold text-accent">
            <Check className="h-3 w-3" />+{bonus} Bonus
          </div>
        )}

        <div className="pt-2">
          <div className="text-2xl font-bold bg-gradient-gaming bg-clip-text text-transparent">{formattedPrice}</div>
        </div>

        <Button
          onClick={onSelect}
          className={
            popular
              ? "w-full bg-gradient-gaming hover:opacity-90 transition-opacity shadow-glow-primary"
              : "w-full bg-primary text-primary-foreground hover:bg-primary/90"
          }
        >
          Purchase Now
        </Button>
      </div>
    </Card>
  );
};

export default PricingCard