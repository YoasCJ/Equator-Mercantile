import { MessageSquare, Search, FileText, CheckCircle2, FileCheck, Ship } from "lucide-react";

export function ExportProcess() {
  const steps = [
    {
      icon: MessageSquare,
      title: "Inquiry",
      description: "Submit your product requirements and specifications through our contact channels.",
    },
    {
      icon: Search,
      title: "Product Matching",
      description: "Our team identifies suitable suppliers and sources matching your needs.",
    },
    {
      icon: FileText,
      title: "Quotation",
      description: "Receive detailed quotations including product specs, pricing, and terms.",
    },
    {
      icon: CheckCircle2,
      title: "Quality Confirmation",
      description: "Sample verification and quality assurance before finalizing the order.",
    },
    {
      icon: FileCheck,
      title: "Documentation",
      description: "Complete export documentation, certifications, and compliance requirements.",
    },
    {
      icon: Ship,
      title: "Shipment",
      description: "Coordinated logistics and delivery to your destination port.",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="w-16 h-1 bg-[#B8956A] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A0A0A] mb-4">
            Export Process
          </h2>
          <p className="text-lg text-[#717171] max-w-3xl mx-auto leading-relaxed">
            A streamlined process designed to ensure smooth transactions from inquiry to delivery.
          </p>
        </div>

        {/* Timeline - Desktop */}
        <div className="hidden lg:block relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#B8956A] via-[#B8956A] to-transparent" />

          <div className="space-y-16">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-12 ${
                  index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block bg-white p-8 border border-black/5 hover:border-[#B8956A]/30 transition-all duration-300 hover:shadow-xl ${
                      index % 2 === 0 ? "ml-auto" : "mr-auto"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-4 mb-4 ${
                        index % 2 === 0 ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#B8956A]/10 flex items-center justify-center flex-shrink-0">
                        <step.icon className="w-6 h-6 text-[#B8956A]" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#0A0A0A]">
                        {index + 1}. {step.title}
                      </h3>
                    </div>
                    <p className="text-[#717171] leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Center dot */}
                <div className="relative z-10">
                  <div className="w-6 h-6 rounded-full bg-[#B8956A] ring-4 ring-white" />
                </div>

                {/* Spacer */}
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Timeline - Mobile */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-6">
              {/* Line and dot */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-lg bg-[#B8956A]/10 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-6 h-6 text-[#B8956A]" />
                </div>
                {index < steps.length - 1 && (
                  <div className="w-px h-full bg-[#B8956A]/30 mt-4" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <h3 className="text-lg font-semibold text-[#0A0A0A] mb-2">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-sm text-[#717171] leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-[#0A0A0A] to-[#1A1A1A] p-8 rounded-lg">
            <p className="text-white text-lg mb-2">Ready to get started?</p>
            <p className="text-gray-400 text-sm">
              Contact us today to begin your commodity sourcing journey
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
