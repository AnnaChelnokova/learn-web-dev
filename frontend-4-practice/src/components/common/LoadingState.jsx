const placeholderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "220px",
  width: "100%",
  padding: "40px 16px",
  color: "var(--color-text-muted, #6B7280)",
  fontSize: "16px",
  textAlign: "center",
};

export function LoadingState({ message = "Загрузка..." }) {
  return (
    <div className="loading-state" style={placeholderStyle}>
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({ message = "Данных нет" }) {
  return (
    <div
      className="empty-state"
      style={{
        ...placeholderStyle,
        color: "#DC2626",
      }}
    >
      <span>{message}</span>
    </div>
  );
}
