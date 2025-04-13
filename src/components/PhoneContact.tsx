
import { useState } from "react";
import { Phone, Copy, X, Plus, Trash } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

export function PhoneContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const { currentUser } = useAuth();
  const [contactNumbers, setContactNumbers] = useState<string[]>([
    "01012345678",
    "01198765432"
  ]);

  const handleCopyNumber = (number: string) => {
    navigator.clipboard.writeText(number).then(() => {
      toast({
        title: "تم نسخ الرقم",
        description: `تم نسخ الرقم ${number} إلى الحافظة`,
      });
    });
  };

  const handleAddNumber = () => {
    if (!newPhone.trim()) return;
    
    // Basic Egyptian phone number validation
    if (!/^01[0-9]{9}$/.test(newPhone)) {
      toast({
        title: "رقم غير صالح",
        description: "برجاء إدخال رقم هاتف مصري صالح",
        variant: "destructive"
      });
      return;
    }
    
    setContactNumbers(prev => [...prev, newPhone]);
    setNewPhone("");
    
    toast({
      title: "تم إضافة الرقم",
      description: `تم إضافة الرقم ${newPhone} بنجاح`,
    });
  };

  const handleDeleteNumber = (index: number) => {
    setContactNumbers(prev => prev.filter((_, i) => i !== index));
    
    toast({
      title: "تم حذف الرقم",
      description: "تم حذف الرقم بنجاح",
    });
  };

  return (
    <>
      <button className="phone-button" onClick={() => setIsOpen(true)}>
        <Phone size={24} />
      </button>

      {isOpen && (
        <div className="phone-modal" onClick={() => setIsOpen(false)}>
          <div className="phone-modal-content" onClick={(e) => e.stopPropagation()}>
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
                  <div className="flex gap-2">
                    <button 
                      className="text-physics-gold hover:text-white transition-colors"
                      onClick={() => handleCopyNumber(number)}
                    >
                      <Copy size={18} />
                    </button>
                    
                    {currentUser?.role === "admin" && (
                      <button 
                        className="text-red-500 hover:text-white transition-colors"
                        onClick={() => handleDeleteNumber(index)}
                      >
                        <Trash size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {currentUser?.role === "admin" && (
                <div className="mt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="inputField"
                      placeholder="أضف رقم تواصل جديد"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                    />
                    <button 
                      className="goldBtn flex-shrink-0 flex items-center justify-center"
                      onClick={handleAddNumber}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
