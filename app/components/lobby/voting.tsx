import { use, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import type { LobbyPlaybackItem } from "~/api/types/lobby-playback-item";
import type { Me } from "~/api/types/user";
import { AudioPlayer } from "~/components/lazy-audio-player";
import { LobbyContext } from "~/contexts";
import { VoteForm } from "./vote-form";

export function Voting() {
  const { lobby } = use(LobbyContext);
  const { user } = useOutletContext<{ user: Me | null }>();

  const currentPlaybackItem = lobby?.currentPlaybackItem;
  const participation = lobby?.participants.find((p) => p.user.id === user?.id);

  const [history, setHistory] = useState<LobbyPlaybackItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentPlaybackItem) {
      setHistory((prev) => {
        if (
          prev.find((p) => p.submissionId === currentPlaybackItem.submissionId)
        )
          return prev;
        return [...prev, currentPlaybackItem];
      });
    }
  }, [currentPlaybackItem]);

  useEffect(() => {
    if (scrollRef.current) {
      // Small timeout to allow render before scrolling
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [history]);

  return (
    <div className="flex flex-col gap-6 h-full max-h-200">
      <div className="flex flex-col items-center gap-2 shrink-0">
        <h2 className="text-xl font-bold text-center">Voting Phase</h2>
      </div>

      <div className="relative flex-1 flex flex-col min-h-125">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto flex flex-col gap-6 pb-8 pt-16 px-2 scroll-smooth [mask-image:linear-gradient(to_bottom,transparent,black_8rem)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_8rem)]"
        >
          {history.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4 mt-12">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              <p>Waiting for the host to start the next track...</p>
            </div>
          ) : (
            history.map((playback) => {
              const submission = lobby?.submissions.find(
                (s) => s.id === playback.submissionId,
              );
              if (!submission) return null;

              const isCurrent =
                submission.id === currentPlaybackItem?.submissionId;

              return (
                <div
                  key={submission.id}
                  className={`bg-muted p-6 rounded-xl border border-muted-border flex flex-col gap-6 shadow-xl transition-all duration-700 ease-out ${
                    isCurrent
                      ? "opacity-100 scale-100 filter-none"
                      : "opacity-40 scale-95 grayscale"
                  }`}
                >
                  <div className="font-semibold text-xl text-center">
                    {isCurrent ? "Currently Playing: " : "Played: "}
                    <span
                      className={
                        isCurrent ? "text-yellow-400" : "text-gray-400"
                      }
                    >
                      {
                        lobby?.participants.find(
                          (p) => p.id === submission.participationId,
                        )?.user.name
                      }
                    </span>
                  </div>

                  <AudioPlayer
                    src={submission.value}
                    className="w-full"
                    syncStartAt={isCurrent ? playback.startedAt : undefined}
                    hideControls={true}
                  />

                  <div
                    className={`border-t border-muted-border pt-6 mt-2 flex flex-col items-center transition-opacity duration-500 opacity-100`}
                  >
                    <p className="text-sm text-gray-400 mb-4 font-semibold uppercase tracking-wider">
                      Rate this submission
                    </p>
                    {(() => {
                      const existingScore = participation?.scores?.find(
                        (score) => score.submissionId === submission.id,
                      );
                      return (
                        <VoteForm
                          submissionId={submission.id}
                          lobbyId={lobby?.id ?? ""}
                          isOwnTrack={
                            submission.participationId === participation?.id
                          }
                          existingScoreId={existingScore?.id}
                          existingScoreValue={
                            existingScore?.value
                              ? Number(existingScore.value)
                              : undefined
                          }
                          onVote={() => {}}
                        />
                      );
                    })()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
