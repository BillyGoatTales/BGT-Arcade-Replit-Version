import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Game from "@/pages/game";
import Profile from "@/pages/profile";
import CharacterPage from "@/pages/CharacterPage";
import Pricing from "@/pages/pricing";
import Affiliate from "@/pages/affiliate";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import FeedbackPage from "@/pages/feedback";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? Home : Landing} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/home" component={Home} />
      <Route path="/profile" component={Profile} />
      <Route path="/character" component={CharacterPage} />
      <Route path="/game/:slug" component={Game} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/affiliate" component={Affiliate} />
      <Route path="/feedback" component={FeedbackPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
