import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/api-client";
import { queryKeys } from "./query-keys";
import type { CreateSubmission } from "./types/submission/create-submission";
import type { SubmissionUpload } from "./types/submission/submission-upload";
import type { UpdateSubmission } from "./types/submission/update-submission";

async function getUploadUrl(
  extension: string,
  contentType: string,
): Promise<SubmissionUpload> {
  const response = await fetchWithAuth(
    `/submissions/upload?extension=${extension}&contentType=${encodeURIComponent(contentType)}`,
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export function useUploadUrl() {
  return useMutation({
    mutationFn: ({
      extension,
      contentType,
    }: {
      extension: string;
      contentType: string;
    }) => getUploadUrl(extension, contentType),
  });
}

async function createSubmission(data: CreateSubmission) {
  const response = await fetchWithAuth("/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

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
  const response = await fetchWithAuth(`/submissions/${params.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.data),
  });

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

async function deleteSubmission(id: string) {
  const response = await fetchWithAuth(`/submissions/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useDeleteSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubmission,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissions.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissions.lists(),
      });
    },
  });
}
