import { Form as BaseForm, Input as BaseInput } from "@base-ui/react";
import { useForm } from "@tanstack/react-form";

import { type } from "arktype";
import { use, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import type { Me, User } from "~/api/types/user";

import { UserCard } from "~/components/user-card";
import { LobbyContext } from "~/contexts";
import { ActionButton } from "../action-button";

export interface Message {
  id?: string;
  content: string;
  sender: User | Me;
}

export function Chat() {
  const { lobby, connection } = use(LobbyContext);
  const { user } = useOutletContext<{ user: Me | null }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const participantsRef = useRef(lobby?.participants ?? []);
  useEffect(() => {
    participantsRef.current = lobby?.participants ?? [];
  }, [lobby?.participants]);

  useEffect(() => {
    if (!connection) return;

    function handleMessageReceived(userId: string, content: string) {
      setMessages((prev) => {
        const sender = participantsRef.current.find(
          (p) => p.user.id === userId,
        )?.user;
        if (!sender) return prev;

        // Basic deduplication if it echoes back
        if (sender.id === user?.id) {
          const isDuplicate = prev.some(
            (m) => m.sender.id === user?.id && m.content === content,
          );
          if (isDuplicate) return prev;
        }
        return [...prev, { content, sender }];
      });
    }

    connection.on("MessageReceived", handleMessageReceived);
    return () => {
      connection.off("MessageReceived", handleMessageReceived);
    };
  }, [connection]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const form = useForm({
    defaultValues: {
      content: "",
    },
    onSubmit: async ({ value }) => {
      if (!connection || !lobby?.id) return;
      const content = value.content;
      form.reset();

      const tempId = crypto.randomUUID();

      // Optimistic update
      if (user) {
        setMessages((prev) => [...prev, { id: tempId, content, sender: user }]);
      }

      try {
        await connection.invoke("SendMessage", lobby.id, content);
      } catch (error) {
        console.error(error);
        window.dispatchEvent(
          new CustomEvent("globalerror", {
            detail:
              error instanceof Error ? error.message : "Failed to send message",
          }),
        );
        // Revert message on failure
        if (user) {
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
        }
        form.setFieldValue("content", content);
      }
    },
  });

  return (
    <div className="flex flex-col border border-muted-border rounded-xl bg-muted overflow-hidden h-150 shrink-0">
      <div className="p-4 border-b border-muted-border font-bold">Chat</div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-2"
      >
        {messages.map((m, i) => (
          <div key={i} className="text-sm flex items-start gap-2">
            <UserCard user={m.sender} className="shrink-0" />
            <span className="wrap-break-word mt-1">{m.content}</span>
          </div>
        ))}
      </div>
      <BaseForm
        ref={formRef}
        onSubmit={(e: React.SyntheticEvent) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="p-4 border-t border-muted-border flex gap-2"
      >
        <form.Field
          name="content"
          validators={{
            onChange: type("string > 0"),
          }}
          children={(field) => (
            <BaseInput
              name={field.name}
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                field.handleChange(e.target.value)
              }
              placeholder="Say something..."
              className="flex-1 bg-black/10 dark:bg-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          )}
        />
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <ActionButton type="submit" disabled={!canSubmit || isSubmitting}>
              Send
            </ActionButton>
          )}
        />
      </BaseForm>
    </div>
  );
}
