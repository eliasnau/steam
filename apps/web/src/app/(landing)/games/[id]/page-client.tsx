"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { GameDetailClient } from "./game-detail-client";

interface GameDetailPageClientProps {
	id: string;
}

export default function GameDetailPageClient({ id }: GameDetailPageClientProps) {
	const { data: game, isPending, isError } = useQuery(
		orpc.games.getById.queryOptions({
			input: { id },
		}),
	);

	if (isPending) {
		return <div className="dark min-h-screen bg-background" />;
	}

	if (isError || !game) {
		return (
			<div className="dark flex min-h-screen items-center justify-center bg-background px-6 text-center">
				<p className="text-muted-foreground">Spiel nicht gefunden.</p>
			</div>
		);
	}

	return (
		<div className="dark min-h-screen bg-background">
			<GameDetailClient game={game} />
		</div>
	);
}
