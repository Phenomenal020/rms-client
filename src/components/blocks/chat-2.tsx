"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar"
import { Bubble, BubbleContent } from "@/shadcn/ui/bubble"
import { Button } from "@/shadcn/ui/button"
import { Input } from "@/shadcn/ui/input"
import { Message, MessageContent } from "@/shadcn/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/shadcn/ui/message-scroller"
import { cn } from "@/lib/utils"
import { Send } from "lucide-react"

type ChatMessage = { id: number; from: "me" | "them"; text: string }

type Conversation = {
  id: string
  name: string
  avatar: string
  preview: string
  time: string
}

const conversations: Conversation[] = [
  {
    id: "mara",
    name: "Mara Lin",
    avatar: "https://i.pravatar.cc/80?img=32",
    preview: "Anything you would change before we ship?",
    time: "9:43 AM",
  },
  {
    id: "leo",
    name: "Leo Tanaka",
    avatar: "https://i.pravatar.cc/80?img=12",
    preview: "The API docs are live now.",
    time: "Tue",
  },
  {
    id: "owen",
    name: "Owen Reyes",
    avatar: "https://i.pravatar.cc/80?img=53",
    preview: "Thanks for the quick review!",
    time: "Mon",
  },
]

const seed: Record<string, ChatMessage[]> = {
  mara: [
    { id: 1, from: "them", text: "Did you look at the new onboarding flow?" },
    { id: 2, from: "me", text: "Just did. The empty states are a nice touch." },
    { id: 3, from: "them", text: "Anything you would change before we ship?" },
  ],
  leo: [
    { id: 1, from: "them", text: "Pushed the v2 API reference." },
    { id: 2, from: "them", text: "The API docs are live now." },
  ],
  owen: [
    { id: 1, from: "me", text: "Left a few notes on your PR." },
    { id: 2, from: "them", text: "Thanks for the quick review!" },
  ],
}

export default function ChatBlock() {
  const [threads, setThreads] = React.useState(seed)
  const [activeId, setActiveId] = React.useState(conversations[0].id)
  const [draft, setDraft] = React.useState("")
  const nextId = React.useRef(1000)

  const active =
    conversations.find((c) => c.id === activeId) ?? conversations[0]
  const messages = threads[activeId]

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    const id = nextId.current++
    setThreads((prev) => ({
      ...prev,
      [activeId]: [...prev[activeId], { id, from: "me", text }],
    }))
    setDraft("")
  }

  return (
    <section className="flex w-full items-center justify-center bg-muted/30 px-6 py-16 text-foreground">
      <div className="grid h-[560px] w-full max-w-3xl grid-cols-1 overflow-hidden rounded-lg border border-border bg-background sm:grid-cols-[240px_1fr]">
        <div className="hidden flex-col border-r border-border sm:flex">
          <div className="border-b border-border p-4">
            <h2 className="font-heading text-sm font-semibold">Messages</h2>
          </div>
          <ul className="flex flex-1 flex-col overflow-y-auto">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(conversation.id)
                    setDraft("")
                  }}
                  aria-pressed={conversation.id === activeId}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-border p-3 text-left transition-colors",
                    conversation.id === activeId
                      ? "bg-muted"
                      : "hover:bg-muted/50"
                  )}
                >
                  <Avatar className="size-9 shrink-0">
                    <AvatarImage
                      src={conversation.avatar}
                      alt={conversation.name}
                      className="grayscale"
                    />
                    <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {conversation.name}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {conversation.time}
                      </span>
                    </div>
                    <span className="truncate text-xs text-muted-foreground">
                      {conversation.preview}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-w-0 flex-col">
          <MessageScrollerProvider
            key={activeId}
            autoScroll
            defaultScrollPosition="end"
          >
            <div className="flex items-center gap-3 border-b border-border p-4">
              <Avatar className="size-8">
                <AvatarImage
                  src={active.avatar}
                  alt={active.name}
                  className="grayscale"
                />
                <AvatarFallback>{active.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold">{active.name}</span>
            </div>

            <MessageScroller className="flex-1">
              <MessageScrollerViewport>
                <MessageScrollerContent className="gap-4 p-4">
                  {messages.map((message) => (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={String(message.id)}
                      scrollAnchor={message.from === "me"}
                    >
                      <Message align={message.from === "me" ? "end" : "start"}>
                        <MessageContent>
                          <Bubble
                            variant={
                              message.from === "me" ? "default" : "muted"
                            }
                          >
                            <BubbleContent>{message.text}</BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  ))}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>

            <form
              onSubmit={send}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                aria-label="Message"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!draft.trim()}
                aria-label="Send message"
              >
                <Send className="size-4" aria-hidden="true" />
              </Button>
            </form>
          </MessageScrollerProvider>
        </div>
      </div>
    </section>
  )
}
