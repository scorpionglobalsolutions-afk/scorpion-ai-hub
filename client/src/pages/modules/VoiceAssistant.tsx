import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Mic, AlertCircle } from "lucide-react";

export default function VoiceAssistant() {
  const [name, setName] = useState("");
  const [type, setType] = useState<"inbound" | "outbound">("inbound");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [callScript, setCallScript] = useState("");
  const [assistants, setAssistants] = useState<any[]>([]);

  const createMutation = trpc.voiceAssistant.create.useMutation({
    onSuccess: (data: any) => {
      setAssistants([...assistants, data]);
      toast.success("Voice assistant created!");
      setName("");
      setSystemPrompt("");
      setCallScript("");
    },
    onError: () => {
      toast.error("Failed to create assistant");
    },
  });

  const handleCreate = () => {
    if (!name) {
      toast.error("Please enter assistant name");
      return;
    }

    createMutation.mutate({
      clientId: 1,
      name,
      type,
      systemPrompt,
      callScript,
    });
  };

  return (
    <div className="min-h-screen bg-background dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-white">AI Voice Assistant</h1>
            <p className="text-muted-foreground dark:text-muted-foreground">Configure inbound and outbound voice agents</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border dark:border-slate-800">
              <CardHeader>
                <CardTitle>Create Voice Agent</CardTitle>
                <CardDescription>Configure script and behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Assistant Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Lead Qualifier"
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={type === "inbound"}
                      onChange={() => setType("inbound")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Inbound Calls</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={type === "outbound"}
                      onChange={() => setType("outbound")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Outbound Calls</span>
                  </label>
                </div>

                <div>
                  <Label htmlFor="system">System Prompt</Label>
                  <Textarea
                    id="system"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Define the assistant's personality and behavior..."
                    className="mt-2 h-24"
                  />
                </div>

                <div>
                  <Label htmlFor="script">Call Script</Label>
                  <Textarea
                    id="script"
                    value={callScript}
                    onChange={(e) => setCallScript(e.target.value)}
                    placeholder="Opening script for calls..."
                    className="mt-2 h-24"
                  />
                </div>

                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  {createMutation.isPending ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Create Assistant
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border dark:border-slate-800">
              <CardHeader>
                <CardTitle>Objection Handling</CardTitle>
                <CardDescription>AI-generated responses coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-background dark:bg-slate-900 rounded-lg border border-border dark:border-slate-700">
                    <p className="font-medium text-foreground dark:text-white mb-1">Common Objections:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground dark:text-muted-foreground">
                      <li>"I'm not interested"</li>
                      <li>"I don't have time"</li>
                      <li>"What's the cost?"</li>
                      <li>"I need to think about it"</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-border dark:border-slate-800 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Active Assistants</CardTitle>
                <CardDescription>Deployed agents</CardDescription>
              </CardHeader>
              <CardContent>
                {assistants.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-muted-foreground dark:text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      No assistants yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assistants.map((asst) => (
                      <div key={asst.id} className="p-3 bg-background dark:bg-slate-900 rounded-lg border border-border dark:border-slate-700">
                        <p className="font-medium text-foreground dark:text-white text-sm">{asst.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-muted-foreground capitalize">{asst.type} calls</p>
                        <span className="inline-block mt-2 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
