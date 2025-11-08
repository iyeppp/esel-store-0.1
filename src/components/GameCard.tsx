import { Link } from "react-router-dom";

interface GameCardProps {
  name: string;
  image: string;
  slug: string;
}

const GameCard = ({ name, image, slug }: GameCardProps) => {
  return (
    <Link to={`/game/${slug}`} className="group cursor-pointer block">
      <div className="relative overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:border-primary hover:shadow-glow-primary hover:scale-105">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-lg font-bold text-foreground">{name}</h3>
          <p className="text-sm text-primary mt-1">Top Up Now →</p>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
