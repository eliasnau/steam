import { auth } from "@repo/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { forbidden, unauthorized } from "next/navigation";
import { Button } from "@/components/ui/button";
import AddCategorySheet from "./_components/add-category-sheet";
import AddFranchiseSheet from "./_components/add-franchise-sheet";
import AddGenreSheet from "./_components/add-genre-sheet";
import AddOperatingSystemSheet from "./_components/add-operating-system-sheet";

export default async function AdminDashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return unauthorized();
	}

	if (session?.user.role !== "admin" && session?.user.role !== "maintainer") {
		return forbidden();
	}

	return (
		<div className="container mx-auto max-w-2xl px-6 py-20">
			<h1 className="mb-8 font-bold text-3xl">Admin</h1>

			<div className="flex flex-col gap-3">
				<Link href="/admin/add">
					<Button variant="outline" className="w-full justify-start" size="lg">
						Spiel hinzufügen
					</Button>
				</Link>

				<AddFranchiseSheet
					renderTrigger={
						<Button
							variant="outline"
							className="w-full justify-start"
							size="lg"
						>
							Franchise hinzufügen
						</Button>
					}
				/>

				<AddGenreSheet
					renderTrigger={
						<Button
							variant="outline"
							className="w-full justify-start"
							size="lg"
						>
							Genre hinzufügen
						</Button>
					}
				/>

				<AddCategorySheet
					renderTrigger={
						<Button
							variant="outline"
							className="w-full justify-start"
							size="lg"
						>
							Feature hinzufügen
						</Button>
					}
				/>

				<AddOperatingSystemSheet
					renderTrigger={
						<Button
							variant="outline"
							className="w-full justify-start"
							size="lg"
						>
							Betriebssystem hinzufügen
						</Button>
					}
				/>
			</div>
		</div>
	);
}
