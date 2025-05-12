
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase, checkSupabaseConnection } from '@/lib/supabase';

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
    
    checkConnection();
  }, []);

  const saveCredentials = () => {
    // In a production app, this would be configured in the environment
    // For this demo, we'll store in localStorage temporarily
    localStorage.setItem('SUPABASE_URL', supabaseUrl);
    localStorage.setItem('SUPABASE_ANON_KEY', supabaseKey);
    
    // Reload the page to apply the new credentials
    window.location.reload();
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      // Try a simple query to test the connection
      const { data, error } = await supabase.from('students').select('count');
      if (error) throw error;
      
      setConnectionMessage('✅ Connection successful! You can now use Supabase in your app.');
      setIsConnected(true);
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      setConnectionMessage('❌ Connection failed. Please check your credentials and try again.');
      setIsConnected(false);
    } finally {
      setIsTesting(false);
    }
  };

  if (isConnected) {
    return (
      <Alert className="bg-green-50 border-green-200 mb-6">
        <AlertDescription>
          ✅ Supabase is connected and working properly.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto mb-8">
      <CardHeader>
        <CardTitle>Supabase Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Supabase URL</label>
          <Input
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            placeholder="https://your-project-id.supabase.co"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Supabase Anon Key</label>
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
          {isTesting ? 'Testing...' : 'Test Connection'}
        </Button>
        <Button 
          onClick={saveCredentials}
          disabled={!supabaseUrl || !supabaseKey}
        >
          Save & Reload
        </Button>
      </CardFooter>
    </Card>
  );
};
