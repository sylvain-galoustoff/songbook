import type { InputHTMLAttributes } from "react";
import type { IconType } from "react-icons";
import { IoText } from "react-icons/io5";
import styles from "./TextField.module.scss";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: IconType;
}

export const TextField = ({
  label,
  id,
  icon: Icon = IoText,
  ...props
}: TextFieldProps) => {
  return (
    <div className={styles.TextField}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.field}>
        <Icon size={24} className={styles.icon} />
        <input id={id} className={styles.input} {...props} />
      </div>
    </div>
  );
};

export default TextField;
