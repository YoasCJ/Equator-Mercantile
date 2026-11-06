import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import logo from "../../imports/Desain_tanpa_judul__26_-1.png";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Equator Mercantile Indonesia" className="h-10 w-10" />
            <div className="hidden md:block">
              <div className="text-lg font-semibold tracking-tight text-[#0A0A0A]">
                Equator Mercantile
              </div>
              <div className="text-xs text-[#717171] tracking-wide">INDONESIA</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("home")}
              className="text-sm hover:text-[#B8956A] transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("products")}
              className="text-sm hover:text-[#B8956A] transition-colors"
            >
              Products
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-sm hover:text-[#B8956A] transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-sm hover:text-[#B8956A] transition-colors"
            >
              Contact
            </button>
            <Button
              onClick={() => scrollToSection("contact")}
              className="bg-[#B8956A] hover:bg-[#9A7E54] text-white"
            >
              Request Quotation
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-black/5">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("home")}
                className="text-sm text-left hover:text-[#B8956A] transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("products")}
                className="text-sm text-left hover:text-[#B8956A] transition-colors"
              >
                Products
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-sm text-left hover:text-[#B8956A] transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-sm text-left hover:text-[#B8956A] transition-colors"
              >
                Contact
              </button>
              <Button
                onClick={() => scrollToSection("contact")}
                className="bg-[#B8956A] hover:bg-[#9A7E54] text-white w-full"
              >
                Request Quotation
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
