
import React from "react";
import { Calendar, Check, X, AlertCircle } from "lucide-react";

interface AttendanceFilterProps {
  selectedFilter: "all" | "present" | "absent" | "unrecorded";
  onFilterChange: (filter: "all" | "present" | "absent" | "unrecorded") => void;
}

export function AttendanceFilter({ selectedFilter, onFilterChange }: AttendanceFilterProps) {
  return (
    <div className="bg-physics-dark border border-physics-navy rounded-lg p-3 mb-6">
      <h3 className="text-physics-gold font-medium mb-2 text-center">فلتر الحضور</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => onFilterChange("all")}
          className={`py-2 px-3 rounded-lg flex items-center justify-center text-sm transition-colors ${
            selectedFilter === "all" 
              ? "bg-physics-gold text-physics-dark font-bold"
              : "bg-physics-navy/80 text-white hover:bg-physics-navy"
          }`}
        >
          <Calendar size={15} className="ml-1" />
          <span>الجميع</span>
        </button>
        
        <button
          onClick={() => onFilterChange("present")}
          className={`py-2 px-3 rounded-lg flex items-center justify-center text-sm transition-colors ${
            selectedFilter === "present" 
              ? "bg-green-600 text-white font-bold"
              : "bg-physics-navy/80 text-white hover:bg-physics-navy"
          }`}
        >
          <Check size={15} className="ml-1" />
          <span>الحاضرون</span>
        </button>
        
        <button
          onClick={() => onFilterChange("absent")}
          className={`py-2 px-3 rounded-lg flex items-center justify-center text-sm transition-colors ${
            selectedFilter === "absent" 
              ? "bg-red-600 text-white font-bold"
              : "bg-physics-navy/80 text-white hover:bg-physics-navy"
          }`}
        >
          <X size={15} className="ml-1" />
          <span>الغائبون</span>
        </button>

        <button
          onClick={() => onFilterChange("unrecorded")}
          className={`py-2 px-3 rounded-lg flex items-center justify-center text-sm transition-colors ${
            selectedFilter === "unrecorded" 
              ? "bg-amber-600 text-white font-bold"
              : "bg-physics-navy/80 text-white hover:bg-physics-navy"
          }`}
        >
          <AlertCircle size={15} className="ml-1" />
          <span>لم يسجل</span>
        </button>
      </div>
    </div>
  );
}
