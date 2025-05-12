
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase, checkSupabaseConnection, reinitializeSupabase } from '@/lib/supabase';

export const SupabaseSetup = () => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');

  useEffect(() => {
    // Check if Supabase connection is already working
    const checkConnection = async () => {
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
    };
    
    // Load saved values from localStorage if they exist
    const savedUrl = localStorage.getItem('SUPABASE_URL');
    const savedKey = localStorage.getItem('SUPABASE_ANON_KEY');
    
    if (savedUrl) setSupabaseUrl(savedUrl);
    if (savedKey) setSupabaseKey(savedKey);
    
    checkConnection();
  }, []);

  const saveCredentials = () => {
    // Store in localStorage
    localStorage.setItem('SUPABASE_URL', supabaseUrl);
    localStorage.setItem('SUPABASE_ANON_KEY', supabaseKey);
    
    // Reinitialize Supabase client with new credentials
    reinitializeSupabase();
    
    // Test connection after saving
    testConnection();
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      // If we're testing with new credentials without saving first, use them temporarily
      if (supabaseUrl !== localStorage.getItem('SUPABASE_URL') || 
          supabaseKey !== localStorage.getItem('SUPABASE_ANON_KEY')) {
        
        // Store temporarily for testing
        localStorage.setItem('SUPABASE_URL', supabaseUrl);
        localStorage.setItem('SUPABASE_ANON_KEY', supabaseKey);
        
        // Reinitialize client for testing
        reinitializeSupabase();
      }
      
      // Try a simple query to test the connection
      const { data, error } = await supabase.from('students').select('count');
      if (error) throw error;
      
      setConnectionMessage('✅ تم الاتصال بنجاح! يمكنك الآن استخدام Supabase في تطبيقك.');
      setIsConnected(true);
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      setConnectionMessage('❌ فشل الاتصال. الرجاء التحقق من بيانات الاعتماد والمحاولة مرة أخرى.');
      setIsConnected(false);
    } finally {
      setIsTesting(false);
    }
  };

  if (isConnected) {
    return (
      <Alert className="bg-green-50 border-green-200 mb-6">
        <AlertDescription>
          ✅ تم الاتصال بـ Supabase بنجاح.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto mb-8">
      <CardHeader>
        <CardTitle>إعداد Supabase</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">رابط Supabase</label>
          <Input
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            placeholder="https://your-project-id.supabase.co"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">مفتاح Supabase Anon</label>
          <Input
            value={supabaseKey}
            onChange={(e) => setSupabaseKey(e.target.value)}
            placeholder="your-anon-key"
            type="password"
          />
        </div>
        {connectionMessage && (
          <Alert className={isConnected ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
            <AlertDescription>{connectionMessage}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button 
          variant="outline"
          onClick={testConnection}
          disabled={!supabaseUrl || !supabaseKey || isTesting}
        >
          {isTesting ? 'جاري الاختبار...' : 'اختبار الاتصال'}
        </Button>
        <Button 
          onClick={saveCredentials}
          disabled={!supabaseUrl || !supabaseKey}
        >
          حفظ وتطبيق
        </Button>
      </CardFooter>
    </Card>
  );
};
