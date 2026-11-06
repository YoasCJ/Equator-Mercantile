import { InternalApp } from "./InternalApp";
import { Toaster } from "./components/ui/sonner";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Products } from "./components/Products";
import { WhyIndonesia } from "./components/WhyIndonesia";
import { WhyUs } from "./components/WhyUs";
import { ProductGallery } from "./components/ProductGallery";
import { ExportProcess } from "./components/ExportProcess";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

export default function App() {
  if (window.location.pathname.startsWith("/login") || window.location.pathname.startsWith("/dashboard")) return <InternalApp />;
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <About />
      <Products />
      <WhyIndonesia />
      <WhyUs />
      <ProductGallery />
      <ExportProcess />
      <Contact />
      <Footer />
      <Toaster />
    </div>
  );
}
