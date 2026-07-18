import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { use, useEffect } from "react";
import { RealtimeContext } from "~/contexts";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Beatok" },
    { name: "description", content: "Welcome to Beatok!" },
  ];
}

export default function Home() {
  const { connection, isConnected } = use(RealtimeContext);

  useEffect(() => {
    if (!connection || !isConnected) {
      console.error("Unable to connect");
      return;
    }

    function onMessageReceived(msg: string) {
      console.log(msg);
    }

    connection.on("MessageReceived", onMessageReceived);
    return () => connection.off("MessageReceived", onMessageReceived);
  }, [connection, isConnected]);

  const handleClick = () =>
    connection
      ?.invoke("SendMessage", { content: "Hello from the client!" })
      .then(() => console.log("Message successfully sent to the server."))
      .catch((err) => console.error("Error invoking SendMessage:", err));

  return (
    <>
      <button onClick={handleClick} disabled={!isConnected}>
        Send message
      </button>
      <Welcome />
    </>
  );
}
