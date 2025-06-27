"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SimpleAuthTest() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/status");
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Auth Status Test</h3>
      <Button onClick={testAuth} disabled={loading} className="w-full mb-4">
        {loading ? "Testing..." : "Test Auth Status"}
      </Button>
      {result && (
        <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">
          {result}
        </pre>
      )}
    </div>
  );
}
