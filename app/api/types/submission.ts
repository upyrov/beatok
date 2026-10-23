export interface CreateSubmission {
  value: string;
  durationSeconds: number;
  lobbyId: string;
}

export interface SubmissionUpdate {
  value: string;
}

export interface SubmissionUpload {
  uploadUrl: string;
  fileKey: string;
}

export interface Submission {
  id: string;
  value: string;
  participationId: string;
  lobbyId: string;
}
