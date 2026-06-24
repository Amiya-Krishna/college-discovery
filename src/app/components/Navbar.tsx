// Server Component — cookies yahan read hoti hain, koi "use client" nahi
import { cookies } from "next/headers";
import NavbarClient from "./NavbarClient";

type NavItem = {
  href: string;
  label: string;
};

interface NavbarProps {
  brand?: string;
  links?: NavItem[];
  className?: string;
}

const defaultLinks: NavItem[] = [
  { href: "/colleges", label: "Colleges" },
  { href: "/compare", label: "Compare" },
  { href: "/predict", label: "Predictor" },
  { href: "/saved", label: "Saved" },
];

export default async function Navbar({
  brand = "EduFind",
  links = defaultLinks,
  className = "",
}: NavbarProps) {
  const cookieStore = await cookies();
  const isLoggedIn = Boolean(cookieStore.get("token")?.value);

  return (
    <NavbarClient
      brand={brand}
      links={links}
      className={className}
      isLoggedIn={isLoggedIn}
    />
  );
}