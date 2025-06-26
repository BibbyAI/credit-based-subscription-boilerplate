"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function AuthTestComponent() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const testAuthStatus = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/auth/status");
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const testSignup = async () => {
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("confirmPassword", password);

      const response = await fetch("/signup", {
        method: "POST",
        body: formData,
      });

      setResult({
        success: response.ok,
        redirected: response.redirected,
        url: response.url,
        status: response.status,
      });
    } catch (error) {
      setResult({ success: false, error: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔧 Authentication Debug Tool</CardTitle>
        <CardDescription>
          Test your authentication setup and debug issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Test Email:</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@example.com"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Test Password:</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password123"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button
            onClick={testSignup}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test Signup
          </Button>
          <Button onClick={testLogin} disabled={loading} size="sm">
            Test Login
          </Button>
          <Button
            onClick={testAuthStatus}
            disabled={loading}
            variant="secondary"
            size="sm"
          >
            Check Auth Status
          </Button>
        </div>

        {result && (
          <Alert
            className={
              result.success
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "SUCCESS" : "ERROR"}
                  </Badge>
                  {result.error && (
                    <span className="text-sm text-red-600">{result.error}</span>
                  )}
                </div>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Instructions:</strong>
          </p>
          <p>1. First test signup to create an account</p>
          <p>2. Then test login with the same credentials</p>
          <p>3. Check auth status to see current session</p>
        </div>
      </CardContent>
    </Card>
  );
}
