import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

export default function DatabaseReactivation() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Database Reactivation</h1>
            <p className="text-slate-600 dark:text-slate-400">Revive dormant leads with personalized sequences</p>
          </div>
        </div>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Database Reactivation Module</CardTitle>
            <CardDescription>Coming soon - Upload CSV, clean data, generate sequences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              This module will allow you to upload old lead lists, automatically clean them, and generate personalized reactivation sequences powered by AI.
            </p>
            <Button disabled>Module Coming Soon</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
