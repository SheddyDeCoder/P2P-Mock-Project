export default function Container({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "60px 20px",
      }}
    >
      {children}
    </div>
  );
}