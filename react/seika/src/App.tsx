import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import DashboardPage from "./pages/dashboard";
import OnBoarding from "./pages/onboarding";
import LoginPage from "./pages/login";
import SignUpPage from "./pages/signup";


function App() {
  return (
      <Routes>
        <Route element={<IndexPage />} path="/" />
        <Route element={<DashboardPage />} path="/dashboard" />
        <Route element={<OnBoarding />} path="/onboarding" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<SignUpPage />} path="/signup" />

        <Route element={<DocsPage />} path="/docs" />
        <Route element={<PricingPage />} path="/pricing" />
        <Route element={<BlogPage />} path="/blog" />
        <Route element={<AboutPage />} path="/about" />
      </Routes>
  );
}

export default App;
