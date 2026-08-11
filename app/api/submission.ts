import { useMutation } from "@tanstack/react-query";
import { CrudApi, fetchApi } from ".";
import { queryKeys } from "./query-keys";
import type {
  CreateSubmission,
  Submission,
  SubmissionUpdate,
  SubmissionUpload,
} from "./types/submission";

export class SubmissionApi extends CrudApi<
  Submission,
  CreateSubmission,
  SubmissionUpdate
> {
  useUploadUrl = () => {
    return useMutation({
      mutationFn: async ({
        extension,
        contentType,
      }: {
        extension: string;
        contentType: string;
      }): Promise<SubmissionUpload> => {
        const params = new URLSearchParams({ extension, contentType });
        return fetchApi<SubmissionUpload>(
          `/submissions/upload?${params.toString()}`,
        );
      },
    });
  };
}

export const {
  useCreate: useCreateSubmission,
  useUpdate: useUpdateSubmissionValue,
  useDelete: useDeleteSubmission,
  useUploadUrl,
} = new SubmissionApi("/submissions", queryKeys.submissions);
