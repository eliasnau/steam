import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { forbidden, redirect, unauthorized } from "next/navigation";
import AddGameForm from "./_components/add-game-form";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const data = await auth.api.userHasPermission({
		body: {
			userId: session?.user.id,
			permissions: { "game": ["create"] }
		},
	});

	if (!session?.user) {
		return unauthorized()
	}

	if(!data.success) {
		return forbidden();
	}

	return (
		<div>
			<h1>Neues Spiel hinzufügen</h1>
			<AddGameForm />
		</div>
	);
}
