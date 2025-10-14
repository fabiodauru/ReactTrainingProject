export default function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder, accept, multiple,
}: {
  label: string;
  type?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  accept?: string;
  multiple?: boolean;
}) {
  return (
    <div className="mb-4 text-left">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        multiple={multiple}
        accept={accept}
        className="border border-gray-300 p-2 rounded w-full"
      />
    </div>
  );
}