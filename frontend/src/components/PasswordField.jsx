/**
 * PasswordField — toggle-able password input.
 */
export default function PasswordField({ value, onChange, label = 'Encryption Password (optional)', disabled }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Leave blank for no encryption"
        disabled={disabled}
        autoComplete="new-password"
      />
      <p style={{ fontSize: 12, color: '#8888a8', marginTop: 6 }}>
        🔒 AES-256-CBC with scrypt key derivation
      </p>
    </div>
  );
}
