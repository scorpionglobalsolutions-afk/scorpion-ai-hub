import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, AlertCircle } from "lucide-react";

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  scheduledTime: string;
  status: "scheduled" | "published" | "failed";
}

export default function Scheduler() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("linkedin");
  const [scheduledTime, setScheduledTime] = useState("");

  const handleSchedule = () => {
    if (!content || !scheduledTime) {
      return;
    }

    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      platform,
      content,
      scheduledTime,
      status: "scheduled",
    };

    setPosts([...posts, newPost]);
    setContent("");
    setScheduledTime("");
  };

  return (
    <div className="min-h-screen bg-background dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-white">Social Media Scheduler</h1>
            <p className="text-muted-foreground dark:text-muted-foreground">Schedule posts across multiple platforms</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border dark:border-slate-800">
              <CardHeader>
                <CardTitle>Schedule Post</CardTitle>
                <CardDescription>Create and schedule content for multiple platforms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <select
                      id="platform"
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="mt-2 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-card dark:bg-slate-900"
                    >
                      <option value="linkedin">LinkedIn</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter/X</option>
                      <option value="instagram">Instagram</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="time">Schedule Time</Label>
                    <Input
                      id="time"
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Post Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your post content here..."
                    className="mt-2 h-24"
                  />
                </div>

                <Button
                  onClick={handleSchedule}
                  disabled={!content || !scheduledTime}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule Post
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border dark:border-slate-800">
              <CardHeader>
                <CardTitle>Content Calendar</CardTitle>
                <CardDescription>View all scheduled posts</CardDescription>
              </CardHeader>
              <CardContent>
                {posts.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-muted-foreground dark:text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      No scheduled posts yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <div key={post.id} className="p-4 bg-background dark:bg-slate-900 rounded-lg border border-border dark:border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-foreground dark:text-white capitalize">
                              {post.platform}
                            </p>
                            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                              {new Date(post.scheduledTime).toLocaleString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            post.status === "scheduled"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                              : post.status === "published"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          }`}>
                            {post.status}
                          </span>
                        </div>
                        <p className="text-sm text-foreground dark:text-slate-300 line-clamp-2">
                          {post.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-border dark:border-slate-800 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Schedule Summary</CardTitle>
                <CardDescription>Overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between p-2 bg-background dark:bg-slate-900 rounded">
                    <span>Total Posts</span>
                    <span className="font-bold">{posts.length}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-background dark:bg-slate-900 rounded">
                    <span>Scheduled</span>
                    <span className="font-bold">{posts.filter(p => p.status === "scheduled").length}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-background dark:bg-slate-900 rounded">
                    <span>Published</span>
                    <span className="font-bold">{posts.filter(p => p.status === "published").length}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-background dark:bg-slate-900 rounded">
                    <span>Platforms</span>
                    <span className="font-bold">{new Set(posts.map(p => p.platform)).size}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
