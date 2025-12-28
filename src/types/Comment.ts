export interface CommentType {
  id: string;
  uid: string;
  userName: string;
  message: string;
  timecode: number;
  createdAt: any;

  likesCount: number;
  dislikesCount: number;

  myVote?: 1 | -1 | null;
}
