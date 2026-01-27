import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getLandingData } from "@/server/get-landing-data";
import { Hero } from "./_components/hero";
import { LandingGamesTable } from "./_components/landing-games-table";
import { LandingStats } from "./_components/landing-stats";
import { Suspense } from "react";

export default async function HomePage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const data = await getLandingData();

	return (
		<div className="dark min-h-screen bg-background">
			<main>
				<Hero
					totalGames={Number(data.stats?.totalGames) || 0}
					totalGenres={data.topGenres.length}
					totalTags={data.popularTags.length}
					totalDevelopers={data.topDevelopers.length}
				/>
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
			</main>
		</div>
	);
}
