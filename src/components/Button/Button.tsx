import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";
import styles from "./Button.module.scss";

interface CommonProps {
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  children: ReactNode;
}

interface ButtonAsButtonProps
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  to?: never;
}

interface ButtonAsLinkProps extends CommonProps {
  to: string;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export const Button = ({ variant = "primary", icon, children, ...rest }: ButtonProps) => {
  const className = `${styles.Button} ${styles[variant]}`;
  const content = (
    <>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{children}</span>
    </>
  );

  if ("to" in rest && rest.to) {
    return (
      <Link to={rest.to} className={className}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button type={type} className={className} {...buttonProps}>
      {content}
    </button>
  );
};

export default Button;
