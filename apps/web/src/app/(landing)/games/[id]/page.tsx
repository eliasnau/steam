import { notFound } from "next/navigation";
import { Suspense } from "react";
import { client, orpc } from "@/utils/orpc";
import { GameDetailClient } from "./game-detail-client";

interface PageProps {
	params: Promise<{ id: string }>;
}

async function GameDetailContent({ params }: PageProps) {
	const { id } = await params;

	try {
		const game = await client.games.getById({
			id,
		});

		return (
			<div className="dark min-h-screen bg-background">
				<GameDetailClient game={game} />
			</div>
		);
	} catch (error) {
		notFound();
	}
}

export default function GameDetailPage({ params }: PageProps) {
	return (
		<Suspense fallback={<div className="dark min-h-screen bg-background" />}>
			<GameDetailContent params={params} />
		</Suspense>
	);
}
