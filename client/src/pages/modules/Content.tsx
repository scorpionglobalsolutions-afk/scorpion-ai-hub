import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Zap, FileText, AlertCircle } from "lucide-react";

type ContentType = "blog" | "social" | "newsletter";

export default function Content() {
  const [contentType, setContentType] = useState<ContentType>("blog");
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");

  const blogMutation = trpc.content.generateBlogPost.useMutation({
    onSuccess: (data: any) => {
      const content = data.content || (data.success ? "Blog post generated successfully" : "Failed to generate");
      setGeneratedContent(typeof content === "string" ? content : JSON.stringify(content));
      toast.success("Blog post generated!");
    },
    onError: () => {
      toast.error("Failed to generate blog post");
    },
  });

  const socialMutation = trpc.content.generateSocialCaption.useMutation({
    onSuccess: (data: any) => {
      const content = data.caption || "Failed to generate";
      setGeneratedContent(typeof content === "string" ? content : JSON.stringify(content));
      toast.success("Social caption generated!");
    },
    onError: () => {
      toast.error("Failed to generate caption");
    },
  });

  const newsletterMutation = trpc.content.generateNewsletter.useMutation({
    onSuccess: (data: any) => {
      const content = data.content || (data.success ? "Newsletter generated successfully" : "Failed to generate");
      setGeneratedContent(typeof content === "string" ? content : JSON.stringify(content));
      toast.success("Newsletter generated!");
    },
    onError: () => {
      toast.error("Failed to generate newsletter");
    },
  });

  const handleGenerate = () => {
    if (!topic) {
      toast.error("Please enter a topic");
      return;
    }

    if (contentType === "blog") {
      const keywordArray = keywords ? keywords.split(",").map((k) => k.trim()) : undefined;
      blogMutation.mutate({
        clientId: 1,
        topic,
        keywords: keywordArray,
      });
    } else if (contentType === "social") {
      socialMutation.mutate({
        clientId: 1,
        topic,
        platform: "linkedin",
      });
    } else {
      const highlightsArray = keywords ? keywords.split(",").map((k) => k.trim()) : undefined;
      newsletterMutation.mutate({
        clientId: 1,
        topic,
        highlights: highlightsArray,
      });
    }
  };

  const isPending =
    blogMutation.isPending || socialMutation.isPending || newsletterMutation.isPending;

  return (
    <div className="min-h-screen bg-background dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-white">Content Strategist</h1>
            <p className="text-muted-foreground dark:text-muted-foreground">Generate blog posts, social captions, and newsletters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border dark:border-slate-800">
              <CardHeader>
                <CardTitle>Generate Content</CardTitle>
                <CardDescription>Choose content type and enter your topic</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  {(["blog", "social", "newsletter"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setContentType(type)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        contentType === type
                          ? "bg-indigo-500 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-foreground dark:text-white"
                      }`}
                    >
                      {type === "blog" ? "Blog Post" : type === "social" ? "Social Caption" : "Newsletter"}
                    </button>
                  ))}
                </div>

                <div>
                  <Label htmlFor="topic">Topic *</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., 10 Ways to Improve Your Marketing ROI"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="keywords">Keywords (comma-separated, optional)</Label>
                  <Input
                    id="keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="marketing, ROI, strategy"
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  {isPending ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate {contentType === "blog" ? "Blog Post" : contentType === "social" ? "Caption" : "Newsletter"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border dark:border-slate-800">
              <CardHeader>
                <CardTitle>Content Tips</CardTitle>
                <CardDescription>Best practices for each format</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {contentType === "blog" && (
                    <>
                      <p className="font-medium">Blog Post Best Practices:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground dark:text-muted-foreground">
                        <li>Include compelling headlines and subheadings</li>
                        <li>Aim for 1,500-2,500 words for SEO</li>
                        <li>Use data and real examples</li>
                        <li>Include a clear call-to-action</li>
                      </ul>
                    </>
                  )}
                  {contentType === "social" && (
                    <>
                      <p className="font-medium">Social Caption Best Practices:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground dark:text-muted-foreground">
                        <li>Keep it concise and engaging</li>
                        <li>Include relevant hashtags</li>
                        <li>Add a clear call-to-action</li>
                        <li>Use emojis for visual interest</li>
                      </ul>
                    </>
                  )}
                  {contentType === "newsletter" && (
                    <>
                      <p className="font-medium">Newsletter Best Practices:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground dark:text-muted-foreground">
                        <li>Write a compelling subject line</li>
                        <li>Personalize for your audience</li>
                        <li>Include 3-5 key insights</li>
                        <li>End with a clear next step</li>
                      </ul>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-border dark:border-slate-800 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Content Preview</CardTitle>
                <CardDescription>AI-generated content</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-background dark:bg-slate-900 rounded-lg border border-border dark:border-slate-700 max-h-96 overflow-y-auto">
                      <p className="text-sm text-foreground dark:text-slate-300 whitespace-pre-wrap">
                        {generatedContent}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedContent);
                        toast.success("Copied to clipboard!");
                      }}
                    >
                      Copy Content
                    </Button>
                    <Button className="w-full">
                      Schedule Post
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-muted-foreground dark:text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Content will appear here
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
