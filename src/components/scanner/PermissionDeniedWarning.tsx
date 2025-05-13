
import React from "react";

export function PermissionDeniedWarning() {
  return (
    <div className="mt-4 p-3 bg-red-500/20 text-white rounded-lg text-sm text-center">
      تم رفض الوصول للكاميرا. يرجى تفعيل الكاميرا من إعدادات الجهاز ثم المحاولة مرة أخرى.
    </div>
  );
}
