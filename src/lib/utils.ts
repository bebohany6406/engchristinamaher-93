import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGradeDisplay(grade: "first" | "second" | "third"): string {
  switch (grade) {
    case "first":
      return "الصف الأول الثانوي";
    case "second":
      return "الصف الثاني الثانوي";
    case "third":
      return "الصف الثالث الثانوي";
    default:
      return "";
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function generateRandomCode(): string {
  // Random 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateRandomPassword(): string {
  // تعديل لتوليد كلمة مرور من 5 أرقام مختلفة
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  // خلط الأرقام
  const shuffled = [...digits].sort(() => 0.5 - Math.random());
  // أخذ أول 5 أرقام
  return shuffled.slice(0, 5).join('');
}

export function getPerformanceClass(performanceIndicator: string): string {
  switch (performanceIndicator) {
    case "excellent":
      return "text-green-400";
    case "good":
      return "text-blue-400";
    case "average":
      return "text-yellow-400";
    case "poor":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

// تحسين وظائف حفظ البيانات ومزامنتها

// Save data to localStorage with enhanced synchronization
export function saveDataWithExpiration(key: string, value: any, expirationDays: number = 30) {
  const expirationMs = expirationDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  const item = {
    value: value,
    expiry: new Date().getTime() + expirationMs,
    lastModified: new Date().getTime(),
    deviceId: getDeviceId()
  };
  localStorage.setItem(key, JSON.stringify(item));
  
  // Here we would implement cloud sync if available
  // syncToCloud(key, item);
}

// Get data from localStorage with expiration check and sync verification
export function getDataWithExpiration(key: string) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    // Try to get from cloud storage if available
    // return getFromCloud(key);
    return null;
  }
  
  const item = JSON.parse(itemStr);
  const now = new Date().getTime();
  
  // Check if the item has expired
  if (now > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  
  // Check if there's a newer version available from another device
  // checkForNewerVersion(key, item.lastModified);
  
  return item.value;
}

// Generate a unique device ID if not already set
export function getDeviceId() {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = 'device_' + new Date().getTime() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

// Enhanced data synchronization function
export function syncData(key: string, data: any) {
  // Store data locally with proper metadata
  const expirationDays = 30; // Default expiration
  saveDataWithExpiration(key, data, expirationDays);
  
  // For cloud synchronization, we would need a backend service
  // This would typically involve:
  // 1. Check for internet connection
  // 2. Send data to backend storage with version tracking
  // 3. Handle conflicts with merge strategy
  // 4. Implement offline-first approach with background sync
  
  // Basic demo implementation (in real app, replace with actual backend sync)
  const syncIndicator = localStorage.getItem('sync_indicator') || '{}';
  const syncStatus = JSON.parse(syncIndicator);
  syncStatus[key] = {
    lastSync: new Date().getTime(),
    status: 'synced'
  };
  localStorage.setItem('sync_indicator', JSON.stringify(syncStatus));
  
  // Force other browser tabs to check for updates
  try {
    localStorage.setItem('sync_trigger', new Date().getTime().toString());
  } catch (e) {
    console.error("Failed to trigger sync:", e);
  }
}

// Setup listeners for cross-tab synchronization
export function setupCrossBrowserSync() {
  window.addEventListener('storage', (event) => {
    if (event.key === 'sync_trigger') {
      // Another tab has updated data, refresh relevant data
      console.log("Data updated in another tab, refreshing data");
      // Here we would reload specific data that might have changed
    }
  });
}
