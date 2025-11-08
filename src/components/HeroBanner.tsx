const HeroBanner = () => {
  return (
    <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero bg-[length:200%_200%] animate-gradient-shift" />
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      
      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
          <span className="bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent">
            Top Up Your Games
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-foreground/90 max-w-2xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Fast, secure, and reliable game credits for all your favorite titles
        </p>
        <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <button className="px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:scale-105 transition-transform shadow-glow-accent">
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
