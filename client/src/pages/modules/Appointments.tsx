import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Calendar, Clock, AlertCircle } from "lucide-react";

interface Appointment {
  id: string;
  leadName: string;
  time: string;
  confirmation: string;
}

export default function Appointments() {
  const [leadName, setLeadName] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [businessName, setBusinessName] = useState("Your Business");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedConfirmation, setSelectedConfirmation] = useState("");

  const generateMutation = trpc.appointments.generateConfirmation.useMutation({
    onSuccess: (data: any) => {
      const confirmation = data.message || "Confirmation generated";
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        leadName,
        time: appointmentTime,
        confirmation,
      };
      setAppointments([...appointments, newAppointment]);
      setSelectedConfirmation(confirmation);
      toast.success("Appointment booked!");
      setLeadName("");
      setAppointmentTime("");
    },
    onError: () => {
      toast.error("Failed to generate confirmation");
    },
  });

  const handleBook = () => {
    if (!leadName || !appointmentTime) {
      toast.error("Please fill in all fields");
      return;
    }

    generateMutation.mutate({
      leadName,
      appointmentTime,
      businessName,
    });
  };

  return (
    <div className="min-h-screen bg-background dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-white">AI Appointment Setter</h1>
            <p className="text-muted-foreground dark:text-muted-foreground">Automate lead qualification and booking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border dark:border-slate-800">
              <CardHeader>
                <CardTitle>Book Appointment</CardTitle>
                <CardDescription>Generate confirmation and track bookings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="lead">Lead Name *</Label>
                  <Input
                    id="lead"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="John Smith"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="time">Appointment Time *</Label>
                  <Input
                    id="time"
                    type="datetime-local"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="business">Business Name</Label>
                  <Input
                    id="business"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={handleBook}
                  disabled={generateMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Book Appointment
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border dark:border-slate-800">
              <CardHeader>
                <CardTitle>Appointment Tracking</CardTitle>
                <CardDescription>View all booked appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-muted-foreground dark:text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">No appointments yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="p-4 bg-background dark:bg-slate-900 rounded-lg border border-border dark:border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-foreground dark:text-white">{apt.leadName}</p>
                            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                              {new Date(apt.time).toLocaleString()}
                            </p>
                          </div>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            Confirmed
                          </span>
                        </div>
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
                <CardTitle className="text-lg">Confirmation Message</CardTitle>
                <CardDescription>AI-generated</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedConfirmation ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-background dark:bg-slate-900 rounded-lg border border-border dark:border-slate-700 max-h-96 overflow-y-auto">
                      <p className="text-sm text-foreground dark:text-slate-300 whitespace-pre-wrap">
                        {selectedConfirmation}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedConfirmation);
                        toast.success("Copied!");
                      }}
                    >
                      Copy Message
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-muted-foreground dark:text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Confirmation will appear here
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
