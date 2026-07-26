import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import type { HubConnection } from "@microsoft/signalr";
import type { User } from "~/api/types/user/user";

export interface Message {
  content: string;
  sender: User;
}

interface ChatProps {
  participants: User[];
  connection: HubConnection | null;
  lobbyId: string;
}

export function Chat({ participants, connection, lobbyId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!connection) return;

    function handleMessageReceived(content: string, userId: string) {
      setMessages((prev) => [
        ...prev,
        {
          content,
          sender: participants.find((p) => p.id === userId)!,
        },
      ]);
    }

    connection.on("MessageReceived", handleMessageReceived);
    return () => {
      connection.off("MessageReceived", handleMessageReceived);
    };
  }, [connection]);

  const chatForm = useForm({
    defaultValues: {
      content: "",
    },
    onSubmit: async ({ value }) => {
      if (!connection) return;
      try {
        await connection.invoke("SendMessage", lobbyId, value.content);
        chatForm.reset();
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    },
  });

  return (
    <div className="w-80 flex flex-col border border-white/10 rounded-xl bg-white/5 overflow-hidden h-150 shrink-0">
      <div className="p-4 border-b border-white/10 font-bold">Lobby Chat</div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.map((m, i) => (
          <div key={i} className="text-sm">
            <span className="font-bold text-gray-300">{m.sender.name}:</span>{" "}
            <span className="text-gray-100">{m.content}</span>
          </div>
        ))}
        {!messages.length && (
          <p className="text-gray-500 text-sm italic">No messages yet.</p>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          chatForm.handleSubmit();
        }}
        className="p-4 border-t border-white/10 flex gap-2"
      >
        <chatForm.Field
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
        <chatForm.Subscribe
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
