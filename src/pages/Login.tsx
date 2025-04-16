import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { User, Lock, Bell } from "lucide-react";
import PhysicsBackground from "@/components/PhysicsBackground";
import { PhoneContact } from "@/components/PhoneContact";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState<"" | "student" | "parent" | "admin">("");
  const [loginError, setLoginError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
      return;
    }
    
    const userLoggedIn = localStorage.getItem("userLoggedIn");
    const storedUser = localStorage.getItem("currentUser");
    
    if (userLoggedIn === "true" && storedUser) {
      try {
        const savedUser = JSON.parse(storedUser);
        if (savedUser && savedUser.role) {
          login(savedUser.phone || savedUser.id, savedUser.password || "");
          
          const audio = new Audio("/login-success.mp3");
          audio.volume = 0.5;
          audio.play().catch(e => console.error("Sound play failed:", e));
          
          navigate("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("userLoggedIn");
        localStorage.removeItem("currentUser");
      }
    }
    
    const savedLoginType = localStorage.getItem("loginType");
    const savedPhone = localStorage.getItem("userPhone");
    
    if (savedLoginType) {
      setLoginType(savedLoginType as "" | "student" | "parent" | "admin");
      setPhone(savedPhone || "");
    }
  }, [currentUser, navigate, login]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const audio = new Audio("/notification-sound.mp3");
          audio.volume = 0.5;
          audio.play().catch(e => console.error("Sound play failed:", e));
          
          toast({
            title: "تم تفعيل الإشعارات",
            description: "سوف تتلقى تنبيهات مهمة من التطبيق",
            variant: "default"
          });
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
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
      await requestNotificationPermission();
      
      localStorage.setItem("userLoggedIn", "true");
      
      if (rememberMe) {
        localStorage.setItem("loginType", loginType);
        localStorage.setItem("userPhone", phone);
      } else {
        localStorage.removeItem("loginType");
        localStorage.removeItem("userPhone");
        localStorage.removeItem("userPassword");
      }
      
      const audio = new Audio("/login-success.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Sound play failed:", e));
      
      navigate("/dashboard");
    } else {
      const audio = new Audio("/error-sound.mp3");
      audio.volume = 0.3;
      audio.play().catch(e => console.error("Sound play failed:", e));
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
              <h1 className="text-2xl font-bold text-physics-gold mb-2 font-tajawal">تسجيل الدخول</h1>
              <p className="text-white opacity-80 font-tajawal">يرجى اختيار نوع الحساب</p>
            </div>

            <div className="space-y-4">
              <button
                className="goldBtn w-full shadow-lg font-tajawal"
                onClick={() => setLoginType("admin")}
              >
                دخول المسؤول
              </button>

              <button
                className="goldBtn w-full shadow-lg font-tajawal"
                onClick={() => setLoginType("student")}
              >
                دخول الطالب
              </button>

              <button
                className="goldBtn w-full shadow-lg font-tajawal"
                onClick={() => setLoginType("parent")}
              >
                دخول ولي الأمر
              </button>

              <div className="text-center mt-6">
                <button 
                  onClick={() => navigate("/")}
                  className="text-physics-gold hover:underline font-tajawal"
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
              <h1 className="text-2xl font-bold text-physics-gold mb-2 font-tajawal">
                {loginType === "admin" ? "دخول المسؤول" : loginType === "student" ? "دخول الطالب" : "دخول ولي الأمر"}
              </h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-physics-gold" size={20} />
                <input
                  type="text"
                  className="inputField pr-12 rounded-3xl font-tajawal"
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
                  className="inputField pr-12 rounded-3xl font-tajawal"
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
                <label htmlFor="remember-me" className="mr-2 text-white font-tajawal">
                  تذكرني
                </label>
                
                <div className="flex-1 flex justify-end">
                  <div className="flex items-center text-physics-gold text-sm">
                    <Bell size={16} className="ml-1" />
                    <span className="font-tajawal">سيتم طلب الإشعارات بعد تسجيل الدخول</span>
                  </div>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-500 text-white p-3 rounded-lg text-center font-tajawal">
                  {loginError}
                </div>
              )}

              <button type="submit" className="goldBtn w-full shadow-lg font-tajawal">
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
                  className="text-physics-gold hover:underline font-tajawal"
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
