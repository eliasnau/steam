import { Suspense } from "react";
import GameDetailPageClient from "./page-client";

interface GameDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

async function GameDetailContent({ params }: GameDetailPageProps) {
	const { id } = await params;
	return <GameDetailPageClient id={id} />;
}

export default function GameDetailPage({ params }: GameDetailPageProps) {
	return (
		<Suspense fallback={<div className="dark min-h-screen bg-background" />}>
			<GameDetailContent params={params} />
		</Suspense>
	);
}
