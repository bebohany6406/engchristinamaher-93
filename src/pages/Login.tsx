
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { User, Lock } from "lucide-react";
import PhysicsBackground from "@/components/PhysicsBackground";
import { PhoneContact } from "@/components/PhoneContact";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState<"" | "student" | "parent" | "admin">("");
  const [loginError, setLoginError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Check for saved login information on component mount
  useEffect(() => {
    const savedLoginType = localStorage.getItem("loginType");
    const savedPhone = localStorage.getItem("userPhone");
    const savedPassword = localStorage.getItem("userPassword");
    
    if (savedLoginType) {
      setLoginType(savedLoginType as "" | "student" | "parent" | "admin");
      setPhone(savedPhone || "");
      setPassword(savedPassword || "");
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    // Validate login based on login type
    if (loginType === "admin" && !phone.startsWith("AdminAPP")) {
      setLoginError("اسم المستخدم غير صحيح لحساب المسؤول");
      return;
    } else if (loginType === "student" && phone.startsWith("AdminAPP")) {
      setLoginError("رقم الهاتف غير صحيح لحساب الطالب");
      return;
    } else if (loginType === "parent" && phone.startsWith("AdminAPP")) {
      setLoginError("رقم الهاتف غير صحيح لحساب ولي الأمر");
      return;
    }
    
    const success = login(phone, password);
    
    if (success) {
      // Save login information if "remember me" is checked
      if (rememberMe) {
        localStorage.setItem("loginType", loginType);
        localStorage.setItem("userPhone", phone);
        localStorage.setItem("userPassword", password);
      } else {
        // Clear any saved login information
        localStorage.removeItem("loginType");
        localStorage.removeItem("userPhone");
        localStorage.removeItem("userPassword");
      }
      
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <PhysicsBackground />
      <PhoneContact />
      
      {loginType === "" ? (
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Logo />
              <h1 className="text-2xl font-bold text-physics-gold mb-2">تسجيل الدخول</h1>
              <p className="text-white opacity-80">يرجى اختيار نوع الحساب</p>
            </div>

            <div className="space-y-4">
              <button
                className="goldBtn w-full"
                onClick={() => setLoginType("admin")}
              >
                دخول المسؤول
              </button>

              <button
                className="goldBtn w-full"
                onClick={() => setLoginType("student")}
              >
                دخول الطالب
              </button>

              <button
                className="goldBtn w-full"
                onClick={() => setLoginType("parent")}
              >
                دخول ولي الأمر
              </button>

              <div className="text-center mt-6">
                <button 
                  onClick={() => navigate("/")}
                  className="text-physics-gold hover:underline"
                >
                  العودة للصفحة الرئيسية
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <Logo />
              <h1 className="text-2xl font-bold text-physics-gold mb-2">
                {loginType === "admin" ? "دخول المسؤول" : loginType === "student" ? "دخول الطالب" : "دخول ولي الأمر"}
              </h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
                <input
                  type="text"
                  className="inputField pr-12"
                  placeholder={loginType === "admin" ? "اسم المستخدم" : "رقم الهاتف"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
                <input
                  type="password"
                  className="inputField pr-12"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-me"
                  className="w-4 h-4 accent-physics-gold"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="mr-2 text-white">
                  تذكرني
                </label>
              </div>

              {loginError && (
                <div className="bg-red-500/20 text-white p-3 rounded-lg text-center">
                  {loginError}
                </div>
              )}

              <button type="submit" className="goldBtn w-full">
                تسجيل الدخول
              </button>
              
              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => { 
                    setLoginType("");
                    setLoginError("");
                    setPhone("");
                    setPassword(""); 
                  }}
                  className="text-physics-gold hover:underline"
                >
                  العودة لاختيار نوع الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
