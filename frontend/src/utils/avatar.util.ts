/* =========================
   GET INITIALS (e.g. John Doe → JD)
========================= */
export const getInitials = (name?: string) => {
  if (!name) return "?";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/* =========================
     CONSISTENT COLOR BY NAME
  ========================= */
export const getAvatarColor = (name?: string) => {
  if (!name) return "bg-gray-400";

  const colors = [
    "bg-teal-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
