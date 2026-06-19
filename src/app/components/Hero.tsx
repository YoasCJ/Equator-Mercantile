import { ArrowRight, Check } from "lucide-react";
import { Button } from "./ui/button";

export function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1716816211590-c15a328a5ff0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJpb3VzJTIwc3BpY2VzJTIwYXJyYW5nZW1lbnR8ZW58MXx8fHwxNzgxODYzMzkyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Premium Indonesian Spices"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-3xl">
          {/* Gold accent line */}
          <div className="w-16 h-1 bg-[#B8956A] mb-8" />

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Connecting Indonesian Commodities with Global Markets
          </h1>

          <p className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed">
            Premium Indonesian spices and coconut-based commodities sourced directly from
            trusted suppliers.
          </p>

          {/* Key features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#B8956A]/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-[#B8956A]" />
              </div>
              <span className="text-gray-300 text-sm">Direct Sourcing</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#B8956A]/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-[#B8956A]" />
              </div>
              <span className="text-gray-300 text-sm">Quality Assurance</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#B8956A]/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-[#B8956A]" />
              </div>
              <span className="text-gray-300 text-sm">Export Documentation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#B8956A]/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-[#B8956A]" />
              </div>
              <span className="text-gray-300 text-sm">Trusted Suppliers</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              onClick={() => scrollToSection("products")}
              className="bg-[#B8956A] hover:bg-[#9A7E54] text-white group"
            >
              Explore Products
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("contact")}
              className="border-white text-white hover:bg-white/10"
            >
              Request Quotation
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2">
          <span className="text-white/60 text-xs uppercase tracking-wider">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/60 to-transparent" />
        </div>
      </div>
    </section>
  );
}
