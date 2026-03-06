"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Link2Off, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card";
import { Badge } from "@/shadcn/ui/badge";
import { Button } from "@/shadcn/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shadcn/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/ui/dialog";
import { Textarea } from "@/shadcn/ui/textarea";

type RequestStatus = "pending" | "link_sent" | "declined";

type Teacher = {
  id: string;
  name: string;
  email: string;
};

type ClassInfo = {
  id: string;
  name: string;
};

type Subject = {
  id: string;
  name: string;
};

type Term = {
  id: string;
  name: string;
};

type UploadRequest = {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  termId: string;
  requestedAt: string;
  status: RequestStatus;
  link?: string;
};

type UploadRequestsData = {
  teachers: Teacher[];
  classes: ClassInfo[];
  subjects: Subject[];
  terms: Term[];
  uploadRequests: UploadRequest[];
};

const initialData: UploadRequestsData = {
  teachers: [
    { id: "t1", name: "Mr. David Chen", email: "david.chen@greenfield.edu" },
    { id: "t2", name: "Ms. Priya Sharma", email: "priya.sharma@greenfield.edu" },
    { id: "t3", name: "Dr. Amara Osei", email: "amara.osei@greenfield.edu" },
  ],
  classes: [
    { id: "c1", name: "JSS 1A" },
    { id: "c2", name: "JSS 2A" },
    { id: "c3", name: "SS 1A" },
  ],
  subjects: [
    { id: "s1", name: "Mathematics" },
    { id: "s2", name: "Biology" },
    { id: "s3", name: "English Language" },
  ],
  terms: [
    { id: "tm1", name: "First Term 2024/2025" },
    { id: "tm2", name: "Second Term 2024/2025" },
  ],
  uploadRequests: [
    {
      id: "r1",
      teacherId: "t1",
      classId: "c1",
      subjectId: "s1",
      termId: "tm1",
      requestedAt: "2026-02-19T09:10:00.000Z",
      status: "pending",
    },
    {
      id: "r2",
      teacherId: "t2",
      classId: "c2",
      subjectId: "s2",
      termId: "tm1",
      requestedAt: "2026-02-20T10:32:00.000Z",
      status: "pending",
    },
    {
      id: "r3",
      teacherId: "t3",
      classId: "c3",
      subjectId: "s3",
      termId: "tm2",
      requestedAt: "2026-02-18T08:04:00.000Z",
      status: "link_sent",
      link: "https://school.example/upload/8f2b6d1f",
    },
  ],
};

export function UploadRequests() {
  const [data, setData] = useState<UploadRequestsData>(initialData);
  const [declineRequestId, setDeclineRequestId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const pending = useMemo(
    () => data.uploadRequests.filter((request) => request.status === "pending"),
    [data.uploadRequests]
  );
  const linkSent = useMemo(
    () => data.uploadRequests.filter((request) => request.status === "link_sent"),
    [data.uploadRequests]
  );
  const declinedCount = useMemo(
    () => data.uploadRequests.filter((request) => request.status === "declined").length,
    [data.uploadRequests]
  );

  const getTeacher = (teacherId: string) => data.teachers.find((teacher) => teacher.id === teacherId);
  const getClass = (classId: string) => data.classes.find((classInfo) => classInfo.id === classId);
  const getSubject = (subjectId: string) => data.subjects.find((subject) => subject.id === subjectId);
  const getTerm = (termId: string) => data.terms.find((term) => term.id === termId);

  const getRequestById = (requestId: string | null) => {
    if (!requestId) return undefined;
    return data.uploadRequests.find((request) => request.id === requestId);
  };

  const linkGen = () => {
    const token = Math.random().toString(36).slice(2, 10);
    return `https://school.example/upload/${token}`;
  };

  const fmtDate = (value: string) =>
    new Date(value).toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const approveRequest = (requestId: string) => {
    const request = getRequestById(requestId);
    if (!request) return;
    const link = linkGen();

    setData((prev) => ({
      ...prev,
      uploadRequests: prev.uploadRequests.map((entry) =>
        entry.id === request.id ? { ...entry, status: "link_sent", link } : entry
      ),
    }));

    toast.success(`Link generated and sent to ${getTeacher(request.teacherId)?.name || "teacher"}`);
  };

  const copyLink = async (link?: string) => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const revokeLink = (requestId: string) => {
    setData((prev) => ({
      ...prev,
      uploadRequests: prev.uploadRequests.map((entry) =>
        entry.id === requestId ? { ...entry, status: "declined", link: undefined } : entry
      ),
    }));
    toast.success("Upload link revoked");
  };

  const openDeclineDialog = (requestId: string) => {
    setDeclineReason("");
    setDeclineRequestId(requestId);
  };

  const closeDeclineDialog = () => {
    setDeclineReason("");
    setDeclineRequestId(null);
  };

  const sendDecline = () => {
    const request = getRequestById(declineRequestId);
    if (!request) return;

    setData((prev) => ({
      ...prev,
      uploadRequests: prev.uploadRequests.map((entry) =>
        entry.id === request.id ? { ...entry, status: "declined", link: undefined } : entry
      ),
    }));
    toast.success(`Decline email sent to ${getTeacher(request.teacherId)?.name || "teacher"}`);
    closeDeclineDialog();
  };

  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Upload Requests</h1>
        <p className="text-sm text-muted-foreground">Teacher result upload requests</p>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard label="Pending Approval" value={pending.length} />
        <SummaryCard label="Link Sent" value={linkSent.length} />
        <SummaryCard label="Declined" value={declinedCount} />
        <SummaryCard label="Total" value={data.uploadRequests.length} />
      </section>

      <section className="space-y-4">
        <StatusCard title="Pending Approval" subtitle={`${pending.length} awaiting`}>
          {pending.length === 0 ? (
            <EmptyRow message="No pending requests" />
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <Table className="min-w-[920px]">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-center">Teacher</TableHead>
                    <TableHead className="text-center">Class</TableHead>
                    <TableHead className="text-center">Subject</TableHead>
                    <TableHead className="text-center">Term</TableHead>
                    <TableHead className="text-center">Requested</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((request) => (
                    <TableRow key={request.id} className="hover:bg-muted/40">
                      <TableCell className="text-center font-medium whitespace-nowrap">
                        {getTeacher(request.teacherId)?.name || "--"}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {getClass(request.classId)?.name || "--"}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {getSubject(request.subjectId)?.name || "--"}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {getTerm(request.termId)?.name || "--"}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap tabular-nums">
                        {fmtDate(request.requestedAt)}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => approveRequest(request.id)}
                            className="cursor-pointer"
                          >
                            <Send className="w-4 h-4 mr-1.5" />
                            Approve & Send Link
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => openDeclineDialog(request.id)}
                            className="cursor-pointer"
                          >
                            <XCircle className="w-4 h-4 mr-1.5" />
                            Decline
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </StatusCard>

        <StatusCard title="Link Sent" subtitle={`${linkSent.length} awaiting upload`}>
          {linkSent.length === 0 ? (
            <EmptyRow message="No active links" />
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <Table className="min-w-[980px]">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-center">Teacher</TableHead>
                    <TableHead className="text-center">Class</TableHead>
                    <TableHead className="text-center">Subject</TableHead>
                    <TableHead className="text-center">Term</TableHead>
                    <TableHead className="text-center">Upload Link</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linkSent.map((request) => (
                    <TableRow key={request.id} className="hover:bg-muted/40">
                      <TableCell className="text-center font-medium whitespace-nowrap">
                        {getTeacher(request.teacherId)?.name || "--"}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {getClass(request.classId)?.name || "--"}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {getSubject(request.subjectId)?.name || "--"}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {getTerm(request.termId)?.name || "--"}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap font-mono text-xs md:text-sm">
                        {request.link || "--"}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <StatusBadge status={request.status} />
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => copyLink(request.link)}
                            className="cursor-pointer"
                          >
                            <Copy className="w-4 h-4 mr-1.5" />
                            Copy Link
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => revokeLink(request.id)}
                            className="cursor-pointer"
                          >
                            <Link2Off className="w-4 h-4 mr-1.5" />
                            Revoke
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </StatusCard>
      </section>

      <Dialog open={declineRequestId !== null} onOpenChange={(open) => (!open ? closeDeclineDialog() : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Upload Request</DialogTitle>
            <DialogDescription>
              {(() => {
                const activeRequest = getRequestById(declineRequestId);
                const teacher = activeRequest ? getTeacher(activeRequest.teacherId) : undefined;
                return teacher
                  ? `This will notify ${teacher.name} (${teacher.email}) that the request was declined.`
                  : "This will notify the teacher that the request was declined.";
              })()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Reason (optional)</p>
            <Textarea
              value={declineReason}
              onChange={(event) => setDeclineReason(event.target.value)}
              placeholder="Add a reason for the decline..."
              className="min-h-24"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDeclineDialog} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={sendDecline} className="cursor-pointer">
              <XCircle className="w-4 h-4 mr-1.5" />
              Send Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border border-border bg-card transition-colors hover:bg-accent/50">
      <CardContent className="p-4">
        <p className="text-4xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-1 text-sm md:text-base font-semibold text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function StatusCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border border-border bg-card shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg md:text-xl text-foreground">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed p-4 text-center text-muted-foreground">{message}</div>
  );
}

function StatusBadge({ status }: { status: RequestStatus }) {
  if (status === "link_sent") {
    return (
      <Badge className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-sm font-semibold text-emerald-700 shadow-none dark:text-emerald-300">
        Link Sent
      </Badge>
    );
  }

  if (status === "pending") {
    return (
      <Badge className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-sm font-semibold text-amber-700 shadow-none dark:text-amber-300">
        Pending
      </Badge>
    );
  }

  return (
    <Badge className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-0.5 text-sm font-semibold text-rose-700 shadow-none dark:text-rose-300">
      Declined
    </Badge>
  );
}
