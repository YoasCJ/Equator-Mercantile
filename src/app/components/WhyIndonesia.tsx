import { Globe2, TrendingUp, MapPin, Award } from "lucide-react";

export function WhyIndonesia() {
  const highlights = [
    {
      icon: Award,
      title: "World's Largest Spice Producer",
      description: "One of the world's leading producers of cloves, nutmeg, and pepper.",
    },
    {
      icon: TrendingUp,
      title: "Rich Agricultural Resources",
      description: "Abundant natural resources and ideal growing conditions.",
    },
    {
      icon: MapPin,
      title: "Strategic Trade Location",
      description: "Positioned along major international shipping routes.",
    },
    {
      icon: Globe2,
      title: "Reliable Commodity Supply",
      description: "Consistent year-round production and supply capabilities.",
    },
  ];

  return (
    <section className="py-24 bg-[#0A0A0A] text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#B8956A] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#B8956A] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="w-16 h-1 bg-[#B8956A] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Why Indonesia?</h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Indonesia's strategic position and natural resources make it an ideal source for
            premium commodities.
          </p>
        </div>

        {/* Highlights grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((highlight, index) => (
            <div key={index} className="group text-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-[#B8956A]/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#B8956A] transition-colors duration-300">
                <highlight.icon className="w-8 h-8 text-[#B8956A] group-hover:text-white transition-colors duration-300" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-3">{highlight.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{highlight.description}</p>

              {/* Decorative line */}
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#B8956A] to-transparent mx-auto mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-20 pt-16 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#B8956A] mb-2">#1</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                Cloves Producer
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#B8956A] mb-2">#2</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                Nutmeg Producer
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#B8956A] mb-2">Top 5</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                Pepper Producer
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
