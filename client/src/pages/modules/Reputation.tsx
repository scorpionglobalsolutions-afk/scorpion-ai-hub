import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Star, ThumbsUp, AlertCircle } from "lucide-react";

export default function Reputation() {
  const [review, setReview] = useState("");
  const [sentiment, setSentiment] = useState<"positive" | "negative">("positive");
  const [generatedResponse, setGeneratedResponse] = useState("");

  const generateMutation = trpc.reputation.generateResponse.useMutation({
    onSuccess: (data: any) => {
      const content = data.draftResponse || "Failed to generate";
      setGeneratedResponse(typeof content === "string" ? content : JSON.stringify(content));
      toast.success("Response generated!");
    },
    onError: () => {
      toast.error("Failed to generate response");
    },
  });

  const handleGenerate = () => {
    if (!review) {
      toast.error("Please paste a review");
      return;
    }

    generateMutation.mutate({
      clientId: 1,
      reviewText: review,
      rating: sentiment === "positive" ? 5 : 1,
      businessName: "Your Business",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 text-white">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reputation Management</h1>
            <p className="text-slate-600 dark:text-slate-400">Generate professional review responses instantly</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Generate Review Response</CardTitle>
                <CardDescription>Craft professional responses to customer reviews</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={sentiment === "positive"}
                      onChange={() => setSentiment("positive")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Positive Review</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={sentiment === "negative"}
                      onChange={() => setSentiment("negative")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Negative Review</span>
                  </label>
                </div>

                <div>
                  <label className="text-sm font-medium">Review Text *</label>
                  <Textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Paste the customer review here..."
                    className="mt-2 h-32"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Generate Response
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Response Guidelines</CardTitle>
                <CardDescription>Best practices for review responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>Thank the reviewer and acknowledge their feedback</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>Address specific concerns mentioned in the review</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>Offer solutions or explain improvements made</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                    <span>Avoid being defensive or argumentative</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                    <span>Never ask for review removal or changes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-slate-200 dark:border-slate-800 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Response Preview</CardTitle>
                <CardDescription>AI-generated reply</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedResponse ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 max-h-96 overflow-y-auto">
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {generatedResponse}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedResponse);
                        toast.success("Copied to clipboard!");
                      }}
                    >
                      Copy Response
                    </Button>
                    <Button className="w-full">
                      Post Response
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Responses will appear here
                    </p>
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
