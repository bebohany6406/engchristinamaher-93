
import { useState } from "react";
import { Phone, Copy, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function PhoneContact() {
  const [isOpen, setIsOpen] = useState(false);
  // Fixed contact numbers as requested
  const contactNumbers = ["01228895553", "01273994390"];

  const handleCopyNumber = (number: string) => {
    navigator.clipboard.writeText(number).then(() => {
      toast({
        title: "تم نسخ الرقم",
        description: `تم نسخ الرقم ${number} إلى الحافظة`,
      });
    });
  };

  return (
    <>
      <button 
        className="phone-button fixed bottom-4 left-4 z-50 bg-physics-gold p-3 rounded-full shadow-lg hover:bg-physics-lightgold transition-colors" 
        onClick={() => setIsOpen(true)}
      >
        <Phone size={24} className="text-physics-navy" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
          <div className="bg-physics-dark rounded-lg p-6 w-full max-w-xs mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-physics-gold">أرقام التواصل</h2>
              <button 
                className="text-gray-400 hover:text-white" 
                onClick={() => setIsOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {contactNumbers.map((number, index) => (
                <div key={index} className="flex items-center justify-between bg-physics-navy p-3 rounded-lg">
                  <span className="text-white">{number}</span>
                  <button 
                    className="text-physics-gold hover:text-white transition-colors"
                    onClick={() => handleCopyNumber(number)}
                  >
                    <Copy size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
