'use client'

import { motion } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';

const WhatsAppButton = ({ 
  phoneNumber = "923001234567",
  message = "Hello! I'm interested in your services.",
  position = "bottom-right"
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState([]);

  const positionClasses = {
    'bottom-right': 'bottom-8 right-8',
    'bottom-left': 'bottom-8 left-8',
    'top-right': 'top-8 right-8',
    'top-left': 'top-8 left-8'
  };

  const handleClick = () => {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    const newRipple = Date.now();
    setRipples([...ripples, newRipple]);
    setTimeout(() => {
      setRipples(ripples.filter(r => r !== newRipple));
    }, 1000);
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <motion.button
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative group"
        whileTap={{ scale: 0.9 }}
      >
        {/* Pulsing rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full bg-[#25D366]"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{
              scale: isHovered ? [1, 1.4, 1.8] : 1,
              opacity: isHovered ? [0.6, 0.3, 0] : 0.6,
            }}
            transition={{
              duration: 1.5,
              repeat: isHovered ? Infinity : 0,
              delay: i * 0.3,
              ease: "easeOut"
            }}
          />
        ))}

        {/* Click ripples */}
        {ripples.map((ripple) => (
          <motion.div
            key={ripple}
            className="absolute inset-0 rounded-full bg-white"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}

        {/* Main button */}
        <motion.div
          className="relative w-16 h-16 cursor-pointer bg-[#25D366] rounded-full shadow-lg flex items-center justify-center overflow-hidden"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {/* Gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[#25D366] to-[#128C7E]"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%', rotate: 45 }}
            animate={{ x: isHovered ? '200%' : '-100%' }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />

          {/* Icon animation */}
          <motion.div
            className="relative z-10"
            animate={{
              rotate: isHovered ? [0, -10, 10, -10, 0] : 0,
              scale: isHovered ? [1, 1.1, 1] : 1
            }}
            transition={{ duration: 0.5 }}
          >
            <MessageCircle size={32} className="text-white" fill="white" />
          </motion.div>

          {/* Floating particles */}
          {isHovered && [0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-white rounded-full"
              style={{
                left: '50%',
                top: '50%',
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: [0, Math.cos(i * Math.PI / 2) * 30],
                y: [0, Math.sin(i * Math.PI / 2) * 30],
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>

        {/* Tooltip */}
        <motion.div
          className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap"
          initial={{ opacity: 0, x: 10 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            x: isHovered ? 0 : 10
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 flex items-center gap-2">
            <Send size={16} className="text-[#25D366]" />
            <span className="text-gray-800 font-medium text-sm">Chat with us on WhatsApp</span>
            <motion.div
              className="w-2 h-2 bg-[#25D366] rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-white border-r border-b border-gray-200 rotate-[-45deg]" />
        </motion.div>
      </motion.button>
    </div>
  );
};

export default WhatsAppButton;