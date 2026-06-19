import { Package, Shield, Globe, Users } from "lucide-react";

export function About() {
  const features = [
    {
      icon: Package,
      title: "Commodity Sourcing",
      description:
        "Connecting international buyers with premium Indonesian commodities through our extensive supplier network.",
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description:
        "Rigorous quality control processes ensuring every product meets international standards and specifications.",
    },
    {
      icon: Globe,
      title: "Export Support",
      description:
        "Complete export documentation and logistics support for seamless international trade operations.",
    },
    {
      icon: Users,
      title: "Supplier Network",
      description:
        "Trusted partnerships with verified Indonesian suppliers ensuring reliable commodity supply chains.",
    },
  ];

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="w-16 h-1 bg-[#B8956A] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A0A0A] mb-4">
            About Equator Mercantile
          </h2>
          <p className="text-lg text-[#717171] max-w-3xl mx-auto leading-relaxed">
            A sourcing and export company helping international buyers connect with Indonesian
            suppliers through reliable quality assurance and professional export support.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 bg-white border border-black/5 hover:border-[#B8956A]/30 transition-all duration-300 hover:shadow-lg"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-[#B8956A]/10 flex items-center justify-center mb-6 group-hover:bg-[#B8956A] transition-colors duration-300">
                <feature.icon className="w-7 h-7 text-[#B8956A] group-hover:text-white transition-colors duration-300" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-[#0A0A0A] mb-3">{feature.title}</h3>
              <p className="text-[#717171] leading-relaxed">{feature.description}</p>

              {/* Gold accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B8956A] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Stats section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-black/5">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-[#B8956A] mb-2">9+</div>
            <div className="text-sm text-[#717171] uppercase tracking-wider">Products</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-[#B8956A] mb-2">100%</div>
            <div className="text-sm text-[#717171] uppercase tracking-wider">Indonesian</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-[#B8956A] mb-2">B2B</div>
            <div className="text-sm text-[#717171] uppercase tracking-wider">Focus</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-[#B8956A] mb-2">24/7</div>
            <div className="text-sm text-[#717171] uppercase tracking-wider">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}
