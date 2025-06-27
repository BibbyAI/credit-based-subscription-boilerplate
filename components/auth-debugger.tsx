"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthDebugger() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/status");
      const data = await response.json();
      setAuthStatus(data);
    } catch (error) {
      setAuthStatus({ error: "Failed to check auth status", details: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Auth Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={checkAuth} disabled={loading} className="w-full">
          {loading ? "Checking..." : "Check Auth Status"}
        </Button>

        {authStatus && (
          <div className="p-4 bg-muted rounded-lg">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(authStatus, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>This will help debug authentication issues.</p>
          <p>Try logging in and then click "Check Auth Status"</p>
        </div>
      </CardContent>
    </Card>
  );
}
