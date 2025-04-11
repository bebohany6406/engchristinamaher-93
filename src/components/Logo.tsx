
import { Book } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="h-16 w-16 bg-physics-gold rounded-full flex items-center justify-center">
        <Book className="h-8 w-8 text-physics-navy" />
      </div>
      <h1 className="text-2xl font-bold text-physics-gold mr-3">فيزياء الثانوية</h1>
    </div>
  );
}
