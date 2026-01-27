import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { forbidden, redirect, unauthorized } from "next/navigation";
import { Suspense } from "react";
import AddGameForm from "./_components/add-game-form";

async function DashboardPageContent() {
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

	return (
		<div>
			<h1>Neues Spiel hinzufügen</h1>
			<AddGameForm />
		</div>
	);
}

export default function DashboardPage() {
	return (
		<Suspense fallback={<div />}>
			<DashboardPageContent />
		</Suspense>
	);
}
