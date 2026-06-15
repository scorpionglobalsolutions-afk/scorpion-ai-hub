import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { MessageSquare, Plus, Trash2 } from "lucide-react";

interface SequenceStep {
  id: string;
  channel: "email" | "sms";
  delay: number;
  content: string;
}

export default function FollowUpSequences() {
  const [campaignName, setCampaignName] = useState("");
  const [steps, setSteps] = useState<SequenceStep[]>([]);
  const [currentChannel, setCurrentChannel] = useState<"email" | "sms">("email");
  const [currentDelay, setCurrentDelay] = useState(0);

  const generateMutation = trpc.sequences.generateStep.useMutation({
    onSuccess: (data: any) => {
      const content = data.content || "Failed to generate";
      const newStep: SequenceStep = {
        id: Date.now().toString(),
        channel: currentChannel,
        delay: currentDelay,
        content,
      };
      setSteps([...steps, newStep]);
      toast.success("Copy generated!");
    },
    onError: () => {
      toast.error("Failed to generate copy");
    },
  });

  const handleGenerateStep = () => {
    if (!campaignName) {
      toast.error("Enter campaign name first");
      return;
    }

    generateMutation.mutate({
      stepNumber: steps.length + 1,
      leadName: "Lead",
      channel: currentChannel,
      previousContext: campaignName,
    });
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
    toast.success("Step removed");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Multi-Channel Follow-Up</h1>
            <p className="text-slate-600 dark:text-slate-400">Build persistent outreach sequences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Sequence Builder</CardTitle>
                <CardDescription>Create multi-step email and SMS sequences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="campaign">Campaign Name *</Label>
                  <Input
                    id="campaign"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Summer Sales Campaign"
                    className="mt-2"
                  />
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h3 className="font-medium mb-3">Add Sequence Step</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="channel">Channel</Label>
                      <select
                        id="channel"
                        value={currentChannel}
                        onChange={(e) => setCurrentChannel(e.target.value as "email" | "sms")}
                        className="mt-2 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                      >
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="delay">Days Delay</Label>
                      <Input
                        id="delay"
                        type="number"
                        value={currentDelay}
                        onChange={(e) => setCurrentDelay(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateStep}
                    disabled={generateMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Spinner className="w-4 h-4 mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Generate & Add Step
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Sequence Steps ({steps.length})</CardTitle>
                <CardDescription>Your multi-channel follow-up flow</CardDescription>
              </CardHeader>
              <CardContent>
                {steps.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No steps added yet. Generate your first step above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {steps.map((step, idx) => (
                      <div key={step.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              Step {idx + 1}: {step.channel.toUpperCase()} (Day {step.delay})
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStep(step.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {step.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-slate-200 dark:border-slate-800 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Sequence Summary</CardTitle>
                <CardDescription>Overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded">
                    <span>Total Steps</span>
                    <span className="font-bold">{steps.length}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded">
                    <span>Email Steps</span>
                    <span className="font-bold">{steps.filter((s) => s.channel === "email").length}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded">
                    <span>SMS Steps</span>
                    <span className="font-bold">{steps.filter((s) => s.channel === "sms").length}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded">
                    <span>Total Duration</span>
                    <span className="font-bold">
                      {Math.max(0, ...steps.map((s) => s.delay))} days
                    </span>
                  </div>
                </div>
                <Button className="w-full mt-4" disabled={steps.length === 0}>
                  Activate Sequence
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
