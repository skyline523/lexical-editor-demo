import './Input.css';

export default function TextInput({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
}) {
  return (
    <div className="Input__wrapper">
      <label className="Input__label">{label}</label>
      <input
        type={type}
        className="Input__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
    </div>
  );
}
