import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email.trim()) {
      setMessage("Email is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("http://localhost:5000/api/customers/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to sign in");
      }

      login(data.customer);
      setMessage(`Welcome back, ${data.customer.nama_client || "Customer"}. Redirecting...`);

      // Redirect ke halaman utama setelah sedikit delay
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-gaming rounded-lg flex items-center justify-center shadow-glow-primary">
            <span className="text-3xl font-bold text-primary-foreground">G</span>
          </div>
          <span className="text-3xl font-bold bg-gradient-gaming bg-clip-text text-transparent">GameTopUp</span>
        </Link>

        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground mb-6">Sign in to your account to continue</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" className="bg-secondary border-border focus:border-primary" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <Button disabled={isSubmitting} className="w-full bg-gradient-gaming hover:opacity-90 transition-opacity shadow-glow-primary disabled:opacity-50">
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {message && <p className="mt-4 text-sm text-muted-foreground text-center">{message}</p>}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account? <Link to="/signup" className="text-primary hover:underline font-medium">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn