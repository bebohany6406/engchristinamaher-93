
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
  // Generate a stronger random password with 8 characters including letters, numbers, and symbols
  const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';  // Avoiding confusing characters
  const lowercaseChars = 'abcdefghjkmnpqrstuvwxyz';   // Avoiding confusing characters
  const numberChars = '23456789';                     // Avoiding confusing numbers
  const symbolChars = '!@#$%^&*';
  
  const allChars = uppercaseChars + lowercaseChars + numberChars + symbolChars;
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
  password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
  password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
  password += symbolChars.charAt(Math.floor(Math.random() * symbolChars.length));
  
  // Fill the rest of the password
  for (let i = 0; i < 4; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
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

// Save data to localStorage with expiration
export function saveDataWithExpiration(key: string, value: any, expirationDays: number = 30) {
  const expirationMs = expirationDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  const item = {
    value: value,
    expiry: new Date().getTime() + expirationMs
  };
  localStorage.setItem(key, JSON.stringify(item));
}

// Get data from localStorage with expiration check
export function getDataWithExpiration(key: string) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  
  const item = JSON.parse(itemStr);
  const now = new Date().getTime();
  
  // Check if the item has expired
  if (now > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  
  return item.value;
}

// Ensure data synchronization between devices
export function syncData(key: string, data: any) {
  // Store data locally
  saveDataWithExpiration(key, data);
  
  // Here you would typically implement a method to sync with a server
  // For now, we're using local storage which is device-specific
  // In a real application, you would integrate with a database or cloud storage
  
  // Example of how you might implement this with a real backend:
  // api.syncData(key, data).catch(err => {
  //   console.error("Failed to sync data:", err);
  //   // Store failed sync attempts for retry later
  //   const failedSyncs = getDataWithExpiration("failedSyncs") || [];
  //   failedSyncs.push({ key, data, timestamp: new Date().getTime() });
  //   saveDataWithExpiration("failedSyncs", failedSyncs);
  // });
}
