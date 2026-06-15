import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

export default function Module() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Agent Module</h1>
            <p className="text-slate-600 dark:text-slate-400">Powerful automation for your marketing</p>
          </div>
        </div>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Module Interface</CardTitle>
            <CardDescription>Full functionality coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              This AI agent module is powered by advanced LLM capabilities and is ready for integration.
            </p>
            <Button disabled>Module Coming Soon</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
