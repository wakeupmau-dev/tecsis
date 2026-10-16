export default function Input({
  name,
  label,
  type = "text",
  labelClassName = "font-medium text-[#323232]",
}: {
  name: string;
  label: string;
  type?: string;
  labelClassName?: string;
}) {
  return (
    <div className="relative w-full flex flex-col gap-y-1">
      <label
        className={`px-6 text-[0.9rem] capitalize ${labelClassName} whitespace-nowrap`}
        htmlFor={name}
      >
        {label}
      </label>
      <div className="flex items-end">
        <input
          id={name}
          name={name}
          className="w-full outline-0 h-15 px-5 bg-[#f3f4fa] rounded-full"
          type={type}
        />
      </div>
    </div>
  );
}
