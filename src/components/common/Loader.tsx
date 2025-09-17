export default function Loader({ size = 40 }: { size?: number }) {
  return (
    <div
      className="loader"
      style={{ width: `${size}px`, height: `${size}px`, borderWidth: `${Math.max(2, Math.round(size / 10))}px` }}
    />
  );
}
