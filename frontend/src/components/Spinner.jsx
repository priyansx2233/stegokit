/**
 * Spinner — inline loading spinner.
 */
export default function Spinner({ size = 20, color = '#7c6af7' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid rgba(255,255,255,0.1)`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      display: 'inline-block',
    }} className="spin" />
  );
}
