import { useState } from "react";
import { useNavigate } from "react-router";
import { useCreateLobby } from "~/api/lobbies";
import { useGenres, genresQueryOptions } from "~/api/genres";
import { getQueryClient } from "~/lib/query-client";
import { QueryBoundary } from "~/components/query-boundary";

export async function clientLoader() {
  await getQueryClient().prefetchQuery(genresQueryOptions());
}

export default function CreateLobby() {
  const navigate = useNavigate();
  const createLobbyMutation = useCreateLobby();
  const genresQuery = useGenres();

  const [formData, setFormData] = useState({
    name: "",
    genreId: "",
    participantLimit: 10,
    submissionTimeLimit: 10,
  });

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    try {
      const createdLobbyId = await createLobbyMutation.mutateAsync({
        name: formData.name,
        genreId: formData.genreId,
        participantLimit: Number(formData.participantLimit),
        submissionTimeLimit: `00:${String(formData.submissionTimeLimit).padStart(2, '0')}:00`,
      });
      navigate(`/lobbies/${createdLobbyId}`);
    } catch (error) {
      console.error("Failed to create lobby", error);
    }
  }

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-2xl flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Create New Lobby</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="font-medium">Lobby Name</label>
          <input 
            type="text" 
            required 
            className="border p-2"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="font-medium">Genre</label>
          <QueryBoundary 
            query={genresQuery}
            loadingFallback={
              <select disabled className="border p-2">
                <option>Loading genres...</option>
              </select>
            }
          >
            {(genres) => (
              <select 
                required
                className="border p-2"
                value={formData.genreId}
                onChange={(e) => setFormData({...formData, genreId: e.target.value})}
              >
                <option value="">Select a genre</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>
            )}
          </QueryBoundary>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium">Participant Limit</label>
          <input 
            type="number" 
            min="2"
            required 
            className="border p-2"
            value={formData.participantLimit}
            onChange={(e) => setFormData({...formData, participantLimit: Number(e.target.value)})}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium">Submission Deadline (minutes)</label>
          <input 
            type="number"
            min="3"
            max="30"
            required 
            className="border p-2"
            value={formData.submissionTimeLimit}
            onChange={(e) => setFormData({...formData, submissionTimeLimit: Number(e.target.value)})}
          />
        </div>

        <button 
          type="submit" 
          disabled={createLobbyMutation.isPending}
          className="mt-4 p-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          {createLobbyMutation.isPending ? 'Creating...' : 'Create Lobby'}
        </button>

        {createLobbyMutation.isError && (
          <p className="text-red-600">Error: {createLobbyMutation.error.message}</p>
        )}
      </form>
    </main>
  );
}
