import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LanguageSelect from "@/pages/language-select";
import MapPage from "@/pages/map-page";
import VenueDetail from "@/pages/venue-detail";
import AuthPage from "@/pages/auth-page";
import VendorDashboard from "@/pages/vendor-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import PaymentPage from "@/pages/payment-page";
import PaymentSuccess from "@/pages/payment-success";
import PaymentFailed from "@/pages/payment-failed";
import NotFound from "@/pages/not-found";
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
        },
    },
});
function Router() {
    return (<Switch>
      <Route path="/" component={LanguageSelect}/>
      <Route path="/map" component={MapPage}/>
      <Route path="/venue/:id" component={VenueDetail}/>
      <Route path="/login" component={AuthPage}/>
      <Route path="/payment" component={PaymentPage}/>
      <Route path="/payment-success" component={PaymentSuccess}/>
      <Route path="/payment-failed" component={PaymentFailed}/>
      <Route path="/vendor/dashboard" component={VendorDashboard}/>
      <Route path="/admin/dashboard" component={AdminDashboard}/>
      <Route component={NotFound}/>
    </Switch>);
}
function App() {
    return (<QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>);
}
export default App;
