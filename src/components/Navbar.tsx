import { Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container mx-auto px-4">
        {/* Top section */}
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-gaming rounded-lg flex items-center justify-center shadow-glow-primary">
              <span className="text-2xl font-bold text-primary-foreground">G</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-gaming bg-clip-text text-transparent">
              GameTopUp
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search for games..."
                className="pl-10 bg-secondary border-border focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Account Button */}
          <Link to="/signin">
            <Button variant="default" className="bg-gradient-gaming hover:opacity-90 transition-opacity shadow-glow-primary">
              <User className="mr-2 h-4 w-4" />
              Account
            </Button>
          </Link>
        </div>

        {/* Category Bar */}
        <div className="border-t border-border">
          <div className="flex items-center gap-6 h-12 overflow-x-auto scrollbar-hide">
            {["All Games", "Mobile Legends", "Free Fire", "PUBG Mobile", "Genshin Impact", "Valorant", "Call of Duty"].map((category) => (
              <button
                key={category}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap px-2"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
