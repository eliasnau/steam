import { notFound } from "next/navigation";
import { client, orpc } from "@/utils/orpc";
import { GameDetailClient } from "./game-detail-client";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function GameDetailPage({ params }: PageProps) {
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
