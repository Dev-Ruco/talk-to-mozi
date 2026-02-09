import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import CategoriesPage from "./pages/CategoriesPage";
import ChatPage from "./pages/ChatPage";
import SavedPage from "./pages/SavedPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLoginPage from "./admin/pages/AdminLoginPage";
import AdminDashboard from "./admin/pages/AdminDashboard";
import PipelinePage from "./admin/pages/PipelinePage";
import SourcesPage from "./admin/pages/SourcesPage";
import AdsPage from "./admin/pages/AdsPage";
import AgentPage from "./admin/pages/AgentPage";
import TeamPage from "./admin/pages/TeamPage";
import SettingsPage from "./admin/pages/SettingsPage";
import ArticleEditorPage from "./admin/pages/ArticleEditorPage";
import MediaPage from "./admin/pages/MediaPage";
import ArticlesPage from "./admin/pages/ArticlesPage";

// Create QueryClient outside component to prevent recreation on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/artigo/:id" element={<ArticlePage />} />
          <Route path="/categoria/:categoryId" element={<CategoryPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/guardados" element={<SavedPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/pipeline" element={<PipelinePage />} />
          <Route path="/admin/articles" element={<ArticlesPage />} />
          <Route path="/admin/sources" element={<SourcesPage />} />
          <Route path="/admin/ads" element={<AdsPage />} />
          <Route path="/admin/agent" element={<AgentPage />} />
          <Route path="/admin/team" element={<TeamPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
          <Route path="/admin/article/:id" element={<ArticleEditorPage />} />
          <Route path="/admin/media" element={<MediaPage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
