import { IoThumbsDownSharp, IoThumbsUpSharp } from "react-icons/io5";
import styles from "./ChatBubble.module.css";
import type { CommentType } from "../../types/Comment";

interface ChatBubbleProps {
  comment: CommentType;
}

export default function ChatBubble({ comment }: ChatBubbleProps) {
  return (
    <div className={`${styles.wrapper} ${styles.notMe}`}>
      <div className={styles.chatBubble}>
        <div className={styles.header}>{comment.userName}</div>
        <div className={styles.message}>{comment.message}</div>
        <div className={styles.likesWrapper}>
          <div className={`${styles.likeIcon}`}>
            <IoThumbsDownSharp className={styles.thumb} />
          </div>
          <div className={`${styles.likeIcon}`}>
            <IoThumbsUpSharp className={styles.thumb} />
          </div>
        </div>
      </div>
    </div>
  );
}
