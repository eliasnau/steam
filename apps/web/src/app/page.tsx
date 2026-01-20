import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@repo/auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({
		headers: await headers(),
	});

  if (session) return redirect("/admin")
  return (
    <>
      <div>SteamDB</div>
      <Link href="/sign-in" passHref>
        <Button>
          <span>Anmelden</span>
        </Button>
      </Link>
      <Link href="/sign-up" passHref>
        <Button>
          <span>Registrieren</span>
        </Button>
      </Link>
    </>
  );
}
