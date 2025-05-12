
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
