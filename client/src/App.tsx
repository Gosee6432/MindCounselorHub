import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import SupervisorProfile from "@/pages/supervisor-profile";
import MyPage from "@/pages/my-page";
import Community from "@/pages/community";
import AdminDashboardComplete from "@/pages/admin-dashboard-complete";
import Register from "@/pages/register";
import RegisterForm from "@/pages/register-form";
import RegisterTrainee from "@/pages/register-trainee";
import RegisterSupervisor from "@/pages/register-supervisor";
import NationalProgram from "@/pages/national-program";
import PsychologyInfo from "@/pages/psychology-info";
import EducationInfo from "@/pages/education-info";
import PsychologyArticle from "@/pages/psychology-article";
import AdminLogin from "@/pages/admin-login";
import AdminMcp from "@/pages/admin-mcp";
import Login from "@/pages/login";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import BecomeCounselor from "@/pages/become-counselor";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/landing" component={Landing} />
      <Route path="/register" component={Register} />
      <Route path="/supervisor/:id" component={SupervisorProfile} />
      <Route path="/become-counselor" component={BecomeCounselor} />
      <Route path="/psychology-info" component={PsychologyInfo} />
      <Route path="/psychology-info/article/:id" component={PsychologyArticle} />
      <Route path="/education-info" component={EducationInfo} />
      <Route path="/community" component={Community} />
      {isAuthenticated && (
        <>
          <Route path="/my-page" component={MyPage} />
        </>
      )}
      <Route path="/admin-dashboard" component={AdminDashboardComplete} />
      <Route path="/admin-dashboard-complete" component={AdminDashboardComplete} />
      <Route path="/register" component={Register} />
      <Route path="/register-form" component={RegisterForm} />
      <Route path="/register-trainee" component={RegisterTrainee} />
      <Route path="/register-supervisor" component={RegisterSupervisor} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin-mcp" component={AdminMcp} />
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
