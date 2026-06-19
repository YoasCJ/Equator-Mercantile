import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

interface Product {
  name: string;
  image: string;
  origin: string;
  description: string;
  specifications: { label: string; value: string }[];
}

export function Products() {
  const products: Product[] = [
    {
      name: "Cloves",
      image:
        "https://images.unsplash.com/photo-1701191579013-7013090c370e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmllZCUyMGNsb3ZlcyUyMHNwaWNlfGVufDF8fHx8MTc4MTg2MzM5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      origin: "Indonesia",
      description:
        "Premium Indonesian cloves with rich aroma and superior quality, available in multiple grades.",
      specifications: [
        { label: "Grades", value: "AB6, FAQ, Hand Picked" },
        { label: "Moisture", value: "≤ 5%" },
        { label: "Headless", value: "5% - 10%" },
        { label: "Foreign Matter", value: "Low" },
      ],
    },
    {
      name: "Nutmeg",
      image:
        "/Nutmeg.jpg",
      origin: "Indonesia",
      description:
        "High-quality whole nutmeg with excellent oil content and aromatic properties.",
      specifications: [
        { label: "Grades", value: "ABCD, SS" },
        { label: "Moisture", value: "10% - 12%" },
        { label: "Size", value: "80/85" },
      ],
    },
    {
      name: "Black Pepper",
      image:
        "https://images.unsplash.com/photo-1591801058986-9e28e68670f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHBlcHBlciUyMHBlcHBlcmNvcm5zfGVufDF8fHx8MTc4MTg2MzM4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      origin: "Indonesia",
      description: "Premium grade black peppercorns with bold flavor and pungent aroma.",
      specifications: [
        { label: "Grade", value: "550 GL" },
        { label: "Moisture", value: "11% - 13%" },
      ],
    },
    {
      name: "White Pepper",
      image:
        "https://images.unsplash.com/photo-1600728255690-edd070021d02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHBlcHBlciUyMHNwaWNlfGVufDF8fHx8MTc4MTg2MzM4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      origin: "Indonesia",
      description: "FAQ grade white pepper with mild heat and clean flavor profile.",
      specifications: [
        { label: "Grade", value: "FAQ" },
        { label: "Moisture", value: "≤ 13%" },
      ],
    },
    {
      name: "Cardamom",
      image:
        "https://images.unsplash.com/photo-1642255521852-7e7c742ac58f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJkYW1vbSUyMGdyZWVuJTIwcG9kc3xlbnwxfHx8fDE3ODE4NjMzODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      origin: "Indonesia",
      description: "Premium green cardamom pods with high essential oil content.",
      specifications: [
        { label: "Essential Oil", value: "2% - 3%" },
        { label: "Moisture", value: "12% - 14%" },
      ],
    },
    {
      name: "Cinnamon",
      image:
        "/Cinnamon.jpg",
      origin: "Indonesia",
      description: "Indonesian cinnamon available in stick and powder forms.",
      specifications: [
        { label: "Forms", value: "Stick, Powder" },
        { label: "Moisture", value: "12% - 14%" },
      ],
    },
    {
      name: "Turmeric Powder",
      image:
        "https://images.unsplash.com/photo-1606951444141-e5533feb55be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0dXJtZXJpYyUyMHBvd2RlciUyMHNwaWNlfGVufDF8fHx8MTc4MTg2MzM4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      origin: "Indonesia",
      description: "High curcumin content turmeric powder with vibrant color.",
      specifications: [
        { label: "Curcumin Content", value: "5.53%" },
        { label: "Moisture", value: "4.74%" },
      ],
    },
    {
      name: "Coconut Shell Charcoal",
      image:
        "/YAKUMA SUPER SHELL CHARCOAL.jpg",
      origin: "Indonesia",
      description: "Premium coconut shell charcoal with high carbon content.",
      specifications: [
        { label: "Fixed Carbon", value: "≥ 70%" },
        { label: "Ash", value: "≤ 3%" },
        { label: "Moisture", value: "≤ 15%" },
        { label: "Volatile Matter", value: "10% - 15%" },
      ],
    },
    {
      name: "Coconut Charcoal Briquettes",
      image:
        "/Coconut shell briquette charcoal cubes_.jpg",
      origin: "Indonesia",
      description: "High-quality coconut charcoal briquettes for various applications.",
      specifications: [
        { label: "Fixed Carbon", value: "≥ 75%" },
        { label: "Ash", value: "≤ 3%" },
        { label: "Moisture", value: "≤ 8%" },
      ],
    },
  ];

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="products" className="py-24 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="w-16 h-1 bg-[#B8956A] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A0A0A] mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-[#717171] max-w-3xl mx-auto leading-relaxed">
            Premium Indonesian commodities with detailed specifications and quality assurance.
          </p>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <Card className="group cursor-pointer overflow-hidden border-black/5 hover:border-[#B8956A]/30 transition-all duration-300 hover:shadow-xl">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Origin badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/95 px-3 py-1.5 rounded-full">
                      <MapPin className="w-3 h-3 text-[#B8956A]" />
                      <span className="text-xs font-medium text-[#0A0A0A]">{product.origin}</span>
                    </div>

                    {/* Gold accent */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#B8956A]" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-[#0A0A0A] mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-[#717171] mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center gap-2 text-[#B8956A] text-sm font-medium group-hover:gap-3 transition-all">
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </DialogTrigger>

              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-[#0A0A0A]">
                    {product.name}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Image */}
                  <div className="relative h-80 rounded-lg overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-[#717171] leading-relaxed">{product.description}</p>
                  </div>

                  {/* Specifications */}
                  <div>
                    <h4 className="font-semibold text-[#0A0A0A] mb-4">Specifications</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {product.specifications.map((spec, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-1 h-6 bg-[#B8956A] flex-shrink-0" />
                          <div>
                            <div className="text-xs text-[#717171] uppercase tracking-wider">
                              {spec.label}
                            </div>
                            <div className="font-medium text-[#0A0A0A]">{spec.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    onClick={scrollToContact}
                    className="w-full bg-[#B8956A] hover:bg-[#9A7E54] text-white"
                  >
                    Request Quotation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </section>
  );
}
