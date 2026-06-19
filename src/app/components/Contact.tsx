import { Mail, Phone, MapPin, Linkedin, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useState } from "react";
import { toast } from "sonner";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create WhatsApp message
    const whatsappMessage = `*New Inquiry from ${formData.name}*\n\nCompany: ${formData.company}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage:\n${formData.message}`;
    const whatsappUrl = `https://wa.me/6282139945557?text=${encodeURIComponent(whatsappMessage)}`;
    
    window.open(whatsappUrl, '_blank');
    toast.success("Redirecting to WhatsApp...");
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      company: "",
      phone: "",
      message: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-24 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="w-16 h-1 bg-[#B8956A] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A0A0A] mb-4">
            Contact Us
          </h2>
          <p className="text-lg text-[#717171] max-w-3xl mx-auto leading-relaxed">
            Get in touch with our team for inquiries, quotations, or partnership opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-[#0A0A0A] mb-6">Get In Touch</h3>
              <p className="text-[#717171] leading-relaxed mb-8">
                Reach out to us for commodity sourcing inquiries, product specifications, or any
                questions about our export services.
              </p>
            </div>

            {/* Contact details */}
            <div className="space-y-6">
              <a
                href="https://wa.me/6282139945557"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-[#B8956A]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#B8956A] transition-colors">
                  <Phone className="w-5 h-5 text-[#B8956A] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="font-medium text-[#0A0A0A] mb-1">WhatsApp</div>
                  <div className="text-[#717171] group-hover:text-[#B8956A] transition-colors">
                    +62 821-3994-5557
                  </div>
                </div>
              </a>

              <a
                href="mailto:info@equatormercantile.com"
                className="flex items-start gap-4 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-[#B8956A]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#B8956A] transition-colors">
                  <Mail className="w-5 h-5 text-[#B8956A] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="font-medium text-[#0A0A0A] mb-1">Email</div>
                  <div className="text-[#717171] group-hover:text-[#B8956A] transition-colors">
                    info@equatormercantile.com
                  </div>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#B8956A]/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#B8956A]" />
                </div>
                <div>
                  <div className="font-medium text-[#0A0A0A] mb-1">Location</div>
                  <div className="text-[#717171]">Blitar, East Java, Indonesia</div>
                </div>
              </div>

              <a
                href="https://linkedin.com/company/equator-mercantile-indonesia"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-[#B8956A]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#B8956A] transition-colors">
                  <Linkedin className="w-5 h-5 text-[#B8956A] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="font-medium text-[#0A0A0A] mb-1">LinkedIn</div>
                  <div className="text-[#717171] group-hover:text-[#B8956A] transition-colors">
                    Equator Mercantile Indonesia
                  </div>
                </div>
              </a>
            </div>

            {/* Business hours */}
            <div className="bg-white p-6 border border-black/5 rounded-lg">
              <h4 className="font-semibold text-[#0A0A0A] mb-3">Business Hours</h4>
              <div className="space-y-2 text-sm text-[#717171]">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-medium text-[#0A0A0A]">8:00 AM - 5:00 PM WIB</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium text-[#0A0A0A]">8:00 AM - 1:00 PM WIB</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium text-[#0A0A0A]">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 border border-black/5 rounded-lg">
            <h3 className="text-xl font-semibold text-[#0A0A0A] mb-6">Send Us a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-2"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="mt-2"
                  placeholder="ABC Trading Co."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-2"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-2"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="mt-2 min-h-[150px]"
                  placeholder="Tell us about your product requirements, order quantity, and any specific needs..."
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#B8956A] hover:bg-[#9A7E54] text-white group"
              >
                Send Message via WhatsApp
                <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              <p className="text-xs text-[#717171] text-center">
                By submitting this form, you'll be redirected to WhatsApp to complete your inquiry.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
