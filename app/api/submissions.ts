import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import type { CreateSubmission } from "./types/submission/create-submission";
import type { SubmissionUpload } from "./types/submission/submission-upload";
import type { UpdateSubmission } from "./types/submission/update-submission";

async function getUploadUrl(extension: string): Promise<SubmissionUpload> {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/submissions/upload?extension=${extension}`,
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export function useUploadUrl(extension: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.submissions.upload(extension),
    queryFn: () => getUploadUrl(extension),
    enabled,
  });
}

async function createSubmission(data: CreateSubmission) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/submissions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubmission,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissions.lists(),
      });
    },
  });
}

async function updateSubmissionValue(params: {
  id: string;
  data: UpdateSubmission;
}) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/submissions/${params.id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params.data),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useUpdateSubmissionValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSubmissionValue,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissions.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissions.lists(),
      });
    },
  });
}
