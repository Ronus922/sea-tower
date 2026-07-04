/* join פשוט בלי פתרון קונפליקטים של Tailwind — אל תעבירו ב-className
   utility שמתנגש עם מחלקות הבסיס של הקומפוננטה */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
