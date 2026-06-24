interface AvatarProps {
  name: string;
  url?: string | null;
  size?: number;
}

export function Avatar({ name, url, size = 32 }: AvatarProps) {
  const initials = (name || '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-brand-light text-brand-purple flex items-center justify-center font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}
