import { IoThumbsDownSharp, IoThumbsUpSharp } from "react-icons/io5";
import styles from "./ChatBubble.module.css";

export default function ChatBubble() {
  return (
    <div className={`${styles.wrapper} ${styles.notMe}`}>
      <div className={styles.chatBubble}>
        <div className={styles.header}>Sylvain</div>
        <div className={styles.message}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </div>
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
