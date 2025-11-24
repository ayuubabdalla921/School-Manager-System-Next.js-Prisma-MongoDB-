"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";

const initialThreads = [
  {
    id: "1",
    subject: "Welcome to the new term",
    snippet: "Reminder: please check your homeroom assignments.",
    unread: true,
    participants: ["Admin"],
    updatedAt: "Today • 09:40 AM",
    messages: [
      {
        id: "m1",
        sender: "Admin Office",
        role: "ADMIN",
        time: "09:30 AM",
        content:
          "Welcome everyone! Please make sure your class rosters are updated before Friday.",
      },
      {
        id: "m2",
        sender: "You",
        role: "TEACHER",
        time: "09:35 AM",
        content:
          "Thanks for the reminder. Grade 6 rosters have been verified.",
      },
    ],
  },
  {
    id: "2",
    subject: "Parent request – Grade 7",
    snippet: "Could you please share this week’s study topics?",
    unread: false,
    participants: ["Parent - Ahmed"],
    updatedAt: "Yesterday",
    messages: [
      {
        id: "m3",
        sender: "Parent - Ahmed",
        role: "PARENT",
        time: "Yesterday • 05:50 PM",
        content:
          "Hello, can you share the topics for Grade 7 Science this week?",
      },
      {
        id: "m4",
        sender: "You",
        role: "TEACHER",
        time: "Yesterday • 06:15 PM",
        content:
          "Hi Ahmed, this week we are covering ecosystems. I will attach the worksheet tomorrow.",
      },
    ],
  },
  {
    id: "3",
    subject: "Student Council update",
    snippet: "Agenda for next Monday’s meeting inside.",
    unread: false,
    participants: ["Student Council"],
    updatedAt: "Mon",
    messages: [
      {
        id: "m5",
        sender: "Student Council",
        role: "STUDENT",
        time: "Mon • 04:00 PM",
        content:
          "Hi teachers! Monday we will plan the science fair. Let us know if you have requirements.",
      },
    ],
  },
];

export default function MessagesPage() {
  const [threads, setThreads] = useState(initialThreads);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeThreadId, setActiveThreadId] = useState(initialThreads[0].id);
  const [draft, setDraft] = useState("");

  const filteredThreads = useMemo(() => {
    return threads.filter((thread) => {
      const matchesSearch =
        thread.subject.toLowerCase().includes(search.toLowerCase()) ||
        thread.snippet.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ? true : filter === "unread" ? thread.unread : true;

      return matchesSearch && matchesFilter;
    });
  }, [threads, search, filter]);

  const activeThread =
    filteredThreads.find((thread) => thread.id === activeThreadId) ||
    filteredThreads[0] ||
    null;

  const handleSelectThread = (threadId) => {
    setActiveThreadId(threadId);
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId ? { ...thread, unread: false } : thread
      )
    );
  };

  const handleSendMessage = () => {
    if (!draft.trim() || !activeThread) return;
    const newMessage = {
      id: crypto.randomUUID(),
      sender: "You",
      role: "TEACHER",
      time: "Just now",
      content: draft.trim(),
    };

    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === activeThread.id
          ? {
              ...thread,
              snippet: newMessage.content,
              updatedAt: "Just now",
              messages: [...thread.messages, newMessage],
            }
          : thread
      )
    );
    setDraft("");
  };

  return (
    <div className="space-y-6 px-3 py-4 text-slate-900 dark:text-slate-100 sm:px-6 sm:py-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Collaboration
        </p>
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review your latest conversations and stay aligned with students,
          teachers and parents.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Inbox
            </CardTitle>
            <CardDescription>Pick a thread to view details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setFilter("unread")}
              >
                Unread
              </Button>
            </div>

            <div className="space-y-2 overflow-y-auto">
              {filteredThreads.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500 dark:border-slate-700">
                  No messages found.
                </p>
              ) : (
                filteredThreads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => handleSelectThread(thread.id)}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition hover:border-blue-400 ${
                      thread.id === activeThread?.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <p className="font-medium">{thread.subject}</p>
                      {thread.unread && (
                        <Badge variant="outline" className="text-xs">
                          Unread
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {thread.updatedAt}
                    </p>
                    <p className="mt-2 truncate text-sm text-slate-600 dark:text-slate-300">
                      {thread.snippet}
                    </p>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
          {activeThread ? (
            <>
              <CardHeader className="space-y-1">
                <CardTitle>{activeThread.subject}</CardTitle>
                <CardDescription>
                  Participants: {activeThread.participants.join(", ")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex h-full flex-col gap-4">
                <div className="h-64 overflow-y-auto rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  {activeThread.messages.map((message) => (
                    <div key={message.id} className="mb-4">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{message.sender}</p>
                        <Badge variant="outline">{message.role}</Badge>
                        <p className="text-xs text-slate-500">{message.time}</p>
                      </div>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                        {message.content}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type your response..."
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSendMessage}
                      disabled={!draft.trim()}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardHeader className="text-center">
              <CardTitle>Select a conversation</CardTitle>
              <CardDescription>
                Choose a thread from the list to start reading and replying.
              </CardDescription>
            </CardHeader>
          )}
        </Card>
      </section>
    </div>
  );
}
