import { Mail, Phone, MapPin, Linkedin } from "lucide-react";
import logo from "../../imports/Desain_tanpa_judul__26_-1.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const productCategories = [
    "Cloves",
    "Nutmeg",
    "Black Pepper",
    "White Pepper",
    "Cardamom",
    "Cinnamon",
    "Turmeric Powder",
    "Coconut Shell Charcoal",
    "Coconut Charcoal Briquettes",
  ];

  return (
    <footer className="bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img src={logo} alt="Equator Mercantile Indonesia" className="h-12 w-12" />
              <div>
                <div className="text-lg font-semibold tracking-tight">Equator Mercantile</div>
                <div className="text-xs text-gray-400 tracking-wide">INDONESIA</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Premium Indonesian commodity sourcing and export company connecting global markets
              with quality suppliers.
            </p>
            <div className="w-12 h-1 bg-[#B8956A]" />
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-white mb-4">Products</h3>
            <ul className="space-y-2">
              {productCategories.slice(0, 6).map((product, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection("products")}
                    className="text-sm text-gray-400 hover:text-[#B8956A] transition-colors"
                  >
                    {product}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("home")}
                  className="text-sm text-gray-400 hover:text-[#B8956A] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-sm text-gray-400 hover:text-[#B8956A] transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("products")}
                  className="text-sm text-gray-400 hover:text-[#B8956A] transition-colors"
                >
                  Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-sm text-gray-400 hover:text-[#B8956A] transition-colors"
                >
                  Contact
                </button>
              </li>
              <li>
                <a
                  href="https://www.equatormercantile.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-[#B8956A] transition-colors"
                >
                  Official Website
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://wa.me/6282139945557"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#B8956A] transition-colors group"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>+62 821-3994-5557</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@equatormercantile.com"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#B8956A] transition-colors group"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>info@equatormercantile.com</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Blitar, East Java, Indonesia</span>
              </li>
              <li>
                <a
                  href="https://linkedin.com/company/equator-mercantile-indonesia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#B8956A] transition-colors group"
                >
                  <Linkedin className="w-4 h-4 flex-shrink-0" />
                  <span>LinkedIn</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} Equator Mercantile Indonesia. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-400 hover:text-[#B8956A] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-[#B8956A] transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Gold accent line at the very bottom */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#B8956A] to-transparent" />
    </footer>
  );
}
