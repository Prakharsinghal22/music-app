import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "./context/user-context";
import { PlayerProvider } from "./context/player-context";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import Search from "@/pages/search";
import LikedSongs from "@/pages/liked-songs";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/liked-songs" component={LikedSongs} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <PlayerProvider>
          <TooltipProvider>
            <Toaster />
            <Layout>
              <Router />
            </Layout>
          </TooltipProvider>
        </PlayerProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
