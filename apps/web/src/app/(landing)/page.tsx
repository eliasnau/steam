import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { Suspense } from "react";
import { getLandingData } from "@/server/get-landing-data";
import { Hero } from "./_components/hero";
import { LandingGamesTable } from "./_components/landing-games-table";
import { LandingStats } from "./_components/landing-stats";

async function HomePageContent() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const data = await getLandingData();

	return (
		<>
			<Hero totalGames={Number(data.stats?.totalGames) || 0} />
			<Suspense>
				<LandingGamesTable />
			</Suspense>
			<LandingStats
				topGenres={data.topGenres}
				popularTags={data.popularTags}
				topDevelopers={data.topDevelopers}
				topRatedGames={data.topRatedGames}
				priceDistribution={data.priceDistribution}
				stats={data.stats}
			/>
		</>
	);
}

export default function HomePage() {
	return (
		<div className="dark min-h-screen bg-background">
			<main className="dark">
				<Suspense fallback={<div className="min-h-screen" />}>
					<HomePageContent />
				</Suspense>
			</main>
		</div>
	);
}
