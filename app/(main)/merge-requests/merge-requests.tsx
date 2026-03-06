"use client";

import { useMemo, useState } from "react";
import { CheckCheck, GitMerge, RotateCcw, XCircle } from "lucide-react";
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

type MergeStatus = "pending" | "merged" | "changes_requested";

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

type MergeRequest = {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  termId: string;
  requestedAt: string;
  changedStudents: number;
  changedScores: number;
  status: MergeStatus;
  reviewedAt?: string;
  reviewerNote?: string;
};

type MergeRequestsData = {
  teachers: Teacher[];
  classes: ClassInfo[];
  subjects: Subject[];
  terms: Term[];
  mergeRequests: MergeRequest[];
};

const initialData: MergeRequestsData = {
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
  mergeRequests: [
    {
      id: "m1",
      teacherId: "t1",
      classId: "c1",
      subjectId: "s1",
      termId: "tm1",
      requestedAt: "2026-02-21T09:15:00.000Z",
      changedStudents: 14,
      changedScores: 27,
      status: "pending",
    },
    {
      id: "m2",
      teacherId: "t2",
      classId: "c2",
      subjectId: "s2",
      termId: "tm1",
      requestedAt: "2026-02-22T10:20:00.000Z",
      changedStudents: 9,
      changedScores: 15,
      status: "pending",
    },
    {
      id: "m3",
      teacherId: "t3",
      classId: "c3",
      subjectId: "s3",
      termId: "tm2",
      requestedAt: "2026-02-20T08:40:00.000Z",
      changedStudents: 12,
      changedScores: 21,
      status: "merged",
      reviewedAt: "2026-02-20T11:06:00.000Z",
    },
    {
      id: "m4",
      teacherId: "t1",
      classId: "c1",
      subjectId: "s1",
      termId: "tm2",
      requestedAt: "2026-02-19T07:25:00.000Z",
      changedStudents: 6,
      changedScores: 9,
      status: "changes_requested",
      reviewedAt: "2026-02-19T09:42:00.000Z",
      reviewerNote: "Recheck CA2 scores for three students before re-submitting.",
    },
  ],
};

export function MergeRequests() {
  const [data, setData] = useState<MergeRequestsData>(initialData);
  const [requestChangesId, setRequestChangesId] = useState<string | null>(null);
  const [reviewerNote, setReviewerNote] = useState("");

  const pending = useMemo(
    () => data.mergeRequests.filter((request) => request.status === "pending"),
    [data.mergeRequests]
  );
  const merged = useMemo(
    () => data.mergeRequests.filter((request) => request.status === "merged"),
    [data.mergeRequests]
  );
  const changesRequested = useMemo(
    () => data.mergeRequests.filter((request) => request.status === "changes_requested"),
    [data.mergeRequests]
  );

  const getTeacher = (teacherId: string) => data.teachers.find((teacher) => teacher.id === teacherId);
  const getClass = (classId: string) => data.classes.find((classInfo) => classInfo.id === classId);
  const getSubject = (subjectId: string) => data.subjects.find((subject) => subject.id === subjectId);
  const getTerm = (termId: string) => data.terms.find((term) => term.id === termId);
  const getRequestById = (requestId: string | null) =>
    requestId ? data.mergeRequests.find((request) => request.id === requestId) : undefined;

  const fmtDate = (value?: string) => {
    if (!value) return "--";
    return new Date(value).toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const approveMerge = (requestId: string) => {
    const request = getRequestById(requestId);
    if (!request) return;

    setData((prev) => ({
      ...prev,
      mergeRequests: prev.mergeRequests.map((entry) =>
        entry.id === request.id
          ? {
              ...entry,
              status: "merged",
              reviewedAt: new Date().toISOString(),
              reviewerNote: undefined,
            }
          : entry
      ),
    }));

    toast.success(`Changes merged for ${getTeacher(request.teacherId)?.name || "teacher"}`);
  };

  const reopenMerge = (requestId: string) => {
    const request = getRequestById(requestId);
    if (!request) return;

    setData((prev) => ({
      ...prev,
      mergeRequests: prev.mergeRequests.map((entry) =>
        entry.id === request.id
          ? {
              ...entry,
              status: "pending",
              reviewedAt: undefined,
            }
          : entry
      ),
    }));

    toast.success("Request moved back to pending approval");
  };

  const openRequestChangesDialog = (requestId: string) => {
    setReviewerNote("");
    setRequestChangesId(requestId);
  };

  const closeRequestChangesDialog = () => {
    setReviewerNote("");
    setRequestChangesId(null);
  };

  const sendRequestChanges = () => {
    const request = getRequestById(requestChangesId);
    if (!request) return;

    setData((prev) => ({
      ...prev,
      mergeRequests: prev.mergeRequests.map((entry) =>
        entry.id === request.id
          ? {
              ...entry,
              status: "changes_requested",
              reviewedAt: new Date().toISOString(),
              reviewerNote: reviewerNote.trim() || undefined,
            }
          : entry
      ),
    }));

    toast.success(`Change request sent to ${getTeacher(request.teacherId)?.name || "teacher"}`);
    closeRequestChangesDialog();
  };

  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Merge Requests</h1>
        <p className="text-sm text-muted-foreground">
          Teacher score updates awaiting merge approval
        </p>
      </section>

   

      <section className="space-y-4">
        <StatusCard title="Pending Approval" subtitle={`${pending.length} awaiting review`}>
          {pending.length === 0 ? (
            <EmptyRow message="No pending merge requests" />
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <Table className="min-w-[1060px]">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-center">Teacher</TableHead>
                    <TableHead className="text-center">Class</TableHead>
                    <TableHead className="text-center">Subject</TableHead>
                    <TableHead className="text-center">Term</TableHead>
                    <TableHead className="text-center">Students Updated</TableHead>
                    <TableHead className="text-center">Score Changes</TableHead>
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
                        {request.changedStudents}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap tabular-nums">
                        {request.changedScores}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap tabular-nums">
                        {fmtDate(request.requestedAt)}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => approveMerge(request.id)}
                            className="cursor-pointer"
                          >
                            <GitMerge className="w-4 h-4 mr-1.5" />
                            Approve Merge
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => openRequestChangesDialog(request.id)}
                            className="cursor-pointer"
                          >
                            <XCircle className="w-4 h-4 mr-1.5" />
                            Request Changes
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

        <StatusCard title="Merged" subtitle={`${merged.length} completed`}>
          {merged.length === 0 ? (
            <EmptyRow message="No merged requests yet" />
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <Table className="min-w-[980px]">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-center">Teacher</TableHead>
                    <TableHead className="text-center">Class</TableHead>
                    <TableHead className="text-center">Subject</TableHead>
                    <TableHead className="text-center">Students Updated</TableHead>
                    <TableHead className="text-center">Score Changes</TableHead>
                    <TableHead className="text-center">Merged At</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {merged.map((request) => (
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
                      <TableCell className="text-center whitespace-nowrap tabular-nums">
                        {request.changedStudents}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap tabular-nums">
                        {request.changedScores}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap tabular-nums">
                        {fmtDate(request.reviewedAt)}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <StatusBadge status={request.status} />
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => reopenMerge(request.id)}
                          className="cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4 mr-1.5" />
                          Move to Pending
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </StatusCard>

        <StatusCard
          title="Changes Requested"
          subtitle={`${changesRequested.length} returned to teachers`}
        >
          {changesRequested.length === 0 ? (
            <EmptyRow message="No change requests sent" />
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <Table className="min-w-[1040px]">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-center">Teacher</TableHead>
                    <TableHead className="text-center">Class</TableHead>
                    <TableHead className="text-center">Subject</TableHead>
                    <TableHead className="text-center">Term</TableHead>
                    <TableHead className="text-center">Note</TableHead>
                    <TableHead className="text-center">Reviewed At</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changesRequested.map((request) => (
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
                      <TableCell className="text-center max-w-[380px] truncate">
                        {request.reviewerNote || "--"}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap tabular-nums">
                        {fmtDate(request.reviewedAt)}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <StatusBadge status={request.status} />
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => approveMerge(request.id)}
                            className="cursor-pointer"
                          >
                            <CheckCheck className="w-4 h-4 mr-1.5" />
                            Merge Now
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => reopenMerge(request.id)}
                            className="cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4 mr-1.5" />
                            Move to Pending
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

      <Dialog
        open={requestChangesId !== null}
        onOpenChange={(open) => (!open ? closeRequestChangesDialog() : null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Merge Changes</DialogTitle>
            <DialogDescription>
              {(() => {
                const activeRequest = getRequestById(requestChangesId);
                const teacher = activeRequest ? getTeacher(activeRequest.teacherId) : undefined;
                return teacher
                  ? `Send revision feedback to ${teacher.name} (${teacher.email}).`
                  : "Send revision feedback to the teacher.";
              })()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Reviewer note (optional)</p>
            <Textarea
              value={reviewerNote}
              onChange={(event) => setReviewerNote(event.target.value)}
              placeholder="Describe what should be corrected before merge..."
              className="min-h-24"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeRequestChangesDialog}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={sendRequestChanges}
              className="cursor-pointer"
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              Send Request
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

function StatusBadge({ status }: { status: MergeStatus }) {
  if (status === "merged") {
    return (
      <Badge className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-sm font-semibold text-emerald-700 shadow-none dark:text-emerald-300">
        Merged
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
      Changes Requested
    </Badge>
  );
}
