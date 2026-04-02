import { MessageCircle, Mail, Info } from 'lucide-react';
import { motion } from 'motion/react';

import logoWhite from '../assets/Ewhite.png'
import logoBlack from '../assets/Eblack.png'

import charcoal1 from '../assets/INI1.png'
import charcoal2 from '../assets/INI2.png'
import charcoal3 from '../assets/INI3.png'

export default function App() {
  return (
    <div className="w-full min-h-screen relative" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* FIXED BACKGROUND WITH GRADIENTS */}
      <div className="fixed inset-0 bg-black -z-10">
        {/* Top-Left Gradient */}
        <div 
          className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
            filter: 'blur(150px)',
          }}
        />
        {/* Bottom-Right Gradient */}
        <div 
          className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
            filter: 'blur(150px)',
          }}
        />
      </div>

      {/* SLIDE 1: HERO SECTION */}
      <section className="w-full min-h-screen text-white flex items-center justify-center px-8">
        <div className="text-center space-y-8">
          <motion.div 
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-white/5 flex items-center justify-center">
              <img
                src={logoWhite}
                alt="Equator Mercantile Logo"
                className="w-full h-full object-contain p-4"
              />
            </div>
          </motion.div>
          <motion.h1 
            className="text-6xl md:text-8xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            EQUATOR
          </motion.h1>
          <motion.p 
            className="text-lg md:text-2xl font-thin tracking-[0.3em] uppercase"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          >
            PT Equator Mercantile Indonesia
          </motion.p>
        </div>
      </section>

      {/* SLIDE 2: IDENTITY SECTION */}
      <section className="w-full min-h-screen text-white flex items-center justify-center px-8 md:px-16">
        <motion.div 
          className="max-w-7xl w-full grid md:grid-cols-2 gap-12 md:gap-16 items-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold">Our Identity</h2>
            <p className="text-lg md:text-xl font-thin leading-relaxed">
              We are a premier trading gateway operating in the resource-rich Indonesian equator. 
              Our commitment to excellence and transparency positions us as a trusted partner in 
              the global commodity market.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-72 h-72 md:w-96 md:h-96 rounded-3xl overflow-hidden bg-white/5 flex items-center justify-center">
              <img
                src={logoWhite}
                alt="Equator Mercantile Identity"
                className="w-full h-full object-contain p-12"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* SLIDE 3: PRODUCT SECTION */}
      <section className="w-full min-h-screen text-white flex items-center justify-center px-8 md:px-16 py-16">
        <div className="max-w-7xl w-full space-y-12">
          <motion.h2 
            className="text-4xl md:text-6xl font-bold text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            Premium Charcoal
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="rounded-3xl overflow-hidden bg-white/5 aspect-square"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <img
                src={charcoal1}
                alt="Premium Charcoal Product 1"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div 
              className="rounded-3xl overflow-hidden bg-white/5 aspect-square"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <img
                src={charcoal2}
                alt="Premium Charcoal Product 2"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div 
              className="rounded-3xl overflow-hidden bg-white/5 aspect-square"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <img
                src={charcoal3}
                alt="Premium Charcoal Product 3"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          <motion.div 
            className="bg-white/5 rounded-2xl p-8 md:p-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold mb-6">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-thin text-lg">
              <div>
                <p className="font-bold mb-2">Fixed Carbon</p>
                <p>70-75%</p>
              </div>
              <div>
                <p className="font-bold mb-2">Ash Content</p>
                <p>&lt;5%</p>
              </div>
              <div>
                <p className="font-bold mb-2">Moisture</p>
                <p>10-15% (Adjustable)</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SLIDE 4: CONTACT SECTION */}
      <section className="w-full min-h-screen flex items-center justify-center px-8 md:px-16 py-16">
        <motion.div 
          className="bg-white text-black rounded-[48px] p-12 md:p-16 max-w-4xl w-full space-y-10"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-black/5 flex items-center justify-center">
                <img
                  src={logoBlack}
                  alt="Equator Mercantile Logo"
                  className="w-full h-full object-contain p-3"
                />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">Start a Partnership</h2>
            <p className="text-lg md:text-xl font-thin">
              Connect with us to explore premium commodity trading opportunities
            </p>
          </div>

          <div className="space-y-4">
            {/* WhatsApp Button */}
            <motion.a
              href="https://wa.me/6282139945557"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-4 w-full bg-black text-white rounded-2xl px-8 py-5 font-bold text-lg shadow-lg"
              whileHover={{ 
                scale: 1.02, 
                y: -2,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageCircle className="w-6 h-6" />
              WhatsApp Business Inquiry
            </motion.a>

            {/* Sales Email Button */}
            <motion.a
              href="mailto:sales@equatormercantile.com"
              className="flex items-center justify-center gap-4 w-full border-2 border-black text-black rounded-2xl px-8 py-5 font-bold text-lg shadow-md"
              whileHover={{ 
                scale: 1.02, 
                y: -2,
                backgroundColor: '#000000',
                color: '#ffffff',
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Mail className="w-6 h-6" />
              Sales Department
            </motion.a>

            {/* Info Email Button */}
            <motion.a
              href="mailto:info@equatormercantile.com"
              className="flex items-center justify-center gap-4 w-full border-2 border-black text-black rounded-2xl px-8 py-5 font-bold text-lg shadow-md"
              whileHover={{ 
                scale: 1.02, 
                y: -2,
                backgroundColor: '#000000',
                color: '#ffffff',
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Info className="w-6 h-6" />
              General Info
            </motion.a>
          </div>

          <p className="text-center text-sm font-thin text-black/60 pt-6">
            PT Equator Mercantile Indonesia © 2026
          </p>
        </motion.div>
      </section>
    </div>
  );
}