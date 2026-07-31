import { useState, useEffect, use, useRef } from "react";
import { RealtimeContext } from "~/contexts";
import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import type { User } from "~/api/types/user/user";
import { LobbyContext } from "~/contexts";
import { UserCard } from "~/components/user-card";

export interface Message {
  content: string;
  sender: User;
}

export function Chat() {
  const { lobby } = use(LobbyContext);
  const { connection } = use(RealtimeContext);
  const [messages, setMessages] = useState<Message[]>([]);

  const participantsRef = useRef(lobby?.participants || []);
  useEffect(() => {
    participantsRef.current = lobby?.participants || [];
  }, [lobby?.participants]);

  useEffect(() => {
    if (!connection) return;

    function handleMessageReceived(userId: string, content: string) {
      setMessages((prev) => {
        const sender = participantsRef.current.find(
          (p) => p.user.id === userId,
        )?.user;
        if (!sender) return prev;

        return [...prev, { content, sender }];
      });
    }

    connection.on("MessageReceived", handleMessageReceived);
    return () => {
      connection.off("MessageReceived", handleMessageReceived);
    };
  }, [connection]);

  const form = useForm({
    defaultValues: {
      content: "",
    },
    onSubmit: async ({ value }) => {
      if (!connection || !lobby?.id) return;
      try {
        await connection.invoke("SendMessage", lobby.id, value.content);
        form.reset();
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    },
  });

  return (
    <div className="flex flex-col border border-white/10 rounded-xl bg-white/5 overflow-hidden h-150 shrink-0">
      <div className="p-4 border-b border-white/10 font-bold">Chat</div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.map((m, i) => (
          <div key={i} className="text-sm flex items-start gap-2">
            <UserCard user={m.sender} size="sm" className="shrink-0" />
            <span className="text-gray-800 wrap-break-word mt-1">
              {m.content}
            </span>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="p-4 border-t border-white/10 flex gap-2"
      >
        <form.Field
          name="content"
          validators={{
            onChange: type("string > 0"),
          }}
          children={(field) => (
            <input
              name={field.name}
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Say something..."
              className="flex-1 bg-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          )}
        />
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-sm transition-colors disabled:opacity-50"
            >
              Send
            </button>
          )}
        />
      </form>
    </div>
  );
}
