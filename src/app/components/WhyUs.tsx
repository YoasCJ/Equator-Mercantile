import { CheckCircle2, Users, MessageCircle, FileCheck, TrendingUp, Package2 } from "lucide-react";

export function WhyUs() {
  const features = [
    {
      icon: Package2,
      title: "Direct Sourcing",
      description:
        "Connect directly with verified Indonesian suppliers through our extensive network, ensuring competitive pricing and quality products.",
    },
    {
      icon: Users,
      title: "Supplier Verification",
      description:
        "All suppliers undergo rigorous verification processes to ensure reliability, quality standards, and ethical business practices.",
    },
    {
      icon: CheckCircle2,
      title: "Quality Focus",
      description:
        "Comprehensive quality control at every stage, from sourcing to export, meeting international commodity standards.",
    },
    {
      icon: MessageCircle,
      title: "Responsive Communication",
      description:
        "24/7 support with dedicated account managers ensuring quick responses to inquiries and seamless communication.",
    },
    {
      icon: FileCheck,
      title: "Export Documentation Support",
      description:
        "Complete assistance with export documentation, certifications, and compliance requirements for hassle-free international trade.",
    },
    {
      icon: TrendingUp,
      title: "Flexible Supply Solutions",
      description:
        "Scalable supply options tailored to your business needs, from small orders to large-volume contracts.",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="w-16 h-1 bg-[#B8956A] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A0A0A] mb-4">
            Why Work With Us
          </h2>
          <p className="text-lg text-[#717171] max-w-3xl mx-auto leading-relaxed">
            Partnering with Equator Mercantile Indonesia means access to premium commodities,
            reliable service, and professional export support.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white to-gray-50 p-8 border border-black/5 hover:border-[#B8956A]/30 transition-all duration-300 hover:shadow-xl"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-[#B8956A]/10 flex items-center justify-center mb-5 group-hover:bg-[#B8956A] transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-[#B8956A] group-hover:text-white transition-colors duration-300" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-[#0A0A0A] mb-3">{feature.title}</h3>
              <p className="text-sm text-[#717171] leading-relaxed">{feature.description}</p>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#B8956A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Value proposition */}
        <div className="mt-16 bg-gradient-to-r from-[#0A0A0A] to-[#1A1A1A] p-12 rounded-lg text-white text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-1 bg-[#B8956A] mx-auto mb-6" />
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Your Trusted Partner in Indonesian Commodities
            </h3>
            <p className="text-gray-300 leading-relaxed">
              We bridge the gap between Indonesian suppliers and international buyers, providing
              comprehensive sourcing and export solutions that ensure quality, reliability, and
              competitive pricing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
