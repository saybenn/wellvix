// /components/ui/Button.js
export default function Button({ children, variant = "solid", ...rest }) {
  const cls = variant === "ghost" ? "button button--ghost" : "button";
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
