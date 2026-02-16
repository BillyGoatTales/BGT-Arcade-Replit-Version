import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FaGamepad } from "react-icons/fa";
import bgtLogo from "@assets/BGT_Logo-removebg-preview_1750797015450.png";


export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: isLogin ? "Welcome back!" : "Welcome to Billy Goat Arcade!",
          description: data.message,
        });
        window.location.href = "/home";
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-deep-purple via-midnight-blue to-deep-purple flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <img 
              src={bgtLogo} 
              alt="Billy Goat Tales Logo" 
              className="w-20 h-20 object-contain animate-neon-pulse"
            />
          </div>
          <h1 className="font-pixel text-3xl text-neon-cyan mb-2 animate-neon-pulse">
            BILLYGOAT ARCADE
          </h1>
          <p className="text-neon-yellow font-retro">#GiversGain</p>
        </div>

        <div className="bg-gradient-to-b from-arcade-dark to-midnight-blue border-4 border-neon-cyan rounded-lg p-6 crt-effect">
          <div className="text-center mb-6">
            <h2 className="font-pixel text-xl text-neon-magenta mb-2">
              {isLogin ? "PLAYER LOGIN" : "NEW PLAYER"}
            </h2>
            <p className="text-sm text-gray-300">
              {isLogin ? "Welcome back, trader!" : "Join the revolution!"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-neon-cyan font-pixel text-sm">
                EMAIL
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="arcade-input mt-1"
                placeholder="your@email.com"
              />
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="username" className="text-neon-cyan font-pixel text-sm">
                  USERNAME
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="arcade-input mt-1"
                  placeholder="your_crypto_handle"
                />
              </div>
            )}

            <div>
              <Label htmlFor="password" className="text-neon-cyan font-pixel text-sm">
                PASSWORD
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="arcade-input mt-1"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="arcade-button w-full flex items-center justify-center space-x-3 px-6 py-3 text-neon-green border-neon-green hover:border-neon-yellow"
            >
              <FaGamepad className="text-xl" />
              <span className="font-pixel text-sm">
                {isLoading ? "LOADING..." : isLogin ? "LOGIN" : "REGISTER"}
              </span>
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-400 mb-2">
              {isLogin ? "New to the arcade?" : "Already have an account?"}
            </p>
            <Button
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-neon-yellow hover:text-neon-cyan font-pixel text-sm"
            >
              {isLogin ? "CREATE ACCOUNT" : "LOGIN INSTEAD"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}