
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book } from "@/types";
import { useToast } from "@/hooks/use-toast";

const StudentBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchBooks = async () => {
      if (!currentUser?.grade) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("books")
          .select("*")
          .eq("grade", currentUser.grade);

        if (error) {
          throw error;
        }

        // Map the data to match the Book type
        const typedBooks: Book[] = data.map((book: any) => ({
          id: book.id,
          title: book.title,
          url: book.url,
          uploadDate: book.uploadDate,
          grade: book.grade as "first" | "second" | "third"
        }));

        setBooks(typedBooks);
      } catch (error) {
        console.error("Error fetching books:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء تحميل الكتب والملفات",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [currentUser, toast]);

  const handleDownload = (url: string, title: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-center mb-8 text-physics-gold">
        الكتب والملفات
      </h1>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-physics-gold"></div>
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <Card key={book.id} className="bg-physics-dark border-physics-gold/20">
              <div className="p-4 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-physics-navy p-2 rounded-full">
                    <FileText className="text-physics-gold" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{book.title}</h3>
                    <p className="text-sm text-gray-400">
                      تاريخ الإضافة: {new Date(book.uploadDate).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
                <div className="mt-auto">
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2 bg-physics-navy hover:bg-physics-navy/80 text-physics-gold border-physics-gold/20"
                    onClick={() => handleDownload(book.url, book.title)}
                  >
                    <Download size={16} />
                    <span>تحميل الملف</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-white">لا توجد كتب أو ملفات متاحة لصفك الدراسي حالياً</p>
        </div>
      )}
    </div>
  );
};

export default StudentBooks;
