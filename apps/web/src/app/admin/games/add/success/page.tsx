import { auth } from "@repo/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { forbidden, redirect, unauthorized } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function AddGameSuccessPage({
	searchParams,
}: {
	searchParams: Promise<{ name?: string; steamId?: string; id?: string }>;
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const data = await auth.api.userHasPermission({
		body: {
			userId: session?.user.id,
			permissions: { game: ["create"] },
		},
	});

	if (!session?.user) {
		return unauthorized();
	}

	if (!data.success) {
		return forbidden();
	}

	const params = await searchParams;

	if (!params.name || !params.steamId) {
		return redirect("/admin/add");
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-6">
			<div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 text-center shadow-lg">
				<div className="space-y-2">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
						<svg
							className="h-8 w-8 text-green-600 dark:text-green-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<h1 className="font-bold text-2xl">Spiel erfolgreich erstellt!</h1>
				</div>

				<div className="space-y-2 rounded-md bg-muted p-4">
					<p className="font-semibold text-lg">{params.name}</p>
					<p className="text-muted-foreground text-sm">
						Steam ID: {params.steamId}
					</p>
					{params.id && (
						<p className="font-mono text-muted-foreground text-xs">
							ID: {params.id}
						</p>
					)}
				</div>

				<div className="space-y-3">
					<Link href="/admin/add" className="block">
						<Button className="w-full" size="lg">
							Weiteres Spiel hinzufügen
						</Button>
					</Link>
					<Link href="/" className="block">
						<Button variant="outline" className="w-full" size="lg">
							Zur Startseite
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
