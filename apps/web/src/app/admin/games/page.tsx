"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Ellipsis, Plus } from "lucide-react";
import Link from "next/link";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	useQueryStates,
} from "nuqs";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Frame, FramePanel } from "@/components/ui/frame";
import { Group, GroupSeparator } from "@/components/ui/group";
import {
	Menu,
	MenuGroup,
	MenuItem,
	MenuPopup,
	MenuTrigger,
} from "@/components/ui/menu";
import { orpc } from "@/utils/orpc";
import {
	Header,
	HeaderActions,
	HeaderContent,
	HeaderDescription,
	HeaderTitle,
} from "../_components/page-header";
import { CreateFromSteamSheet } from "./_components/create-from-steam-sheet";
import GamesTable from "./_components/games-table";

export default function GamesPage() {
	return (
		<Suspense>
			<GamesPageContent />
		</Suspense>
	);
}

function GamesPageContent() {
	const [{ page, limit, search, genreIds }, setPagination] = useQueryStates({
		page: parseAsInteger.withDefault(1),
		limit: parseAsInteger.withDefault(20),
		search: parseAsString.withDefault(""),
		genreIds: parseAsArrayOf(parseAsString).withDefault([]),
	});

	const UUID_REGEX =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

	const validGenreIds =
		genreIds.length > 0
			? genreIds.filter(
					(id) => id && id.trim().length > 0 && UUID_REGEX.test(id),
				)
			: [];

	const { data, isPending, error, refetch } = useQuery(
		orpc.games.list.queryOptions({
			input: {
				page,
				limit,
				search: search || undefined,
				genreIds: validGenreIds.length > 0 ? validGenreIds : undefined,
			},
		}),
	);

	const { data: genresData } = useQuery(
		orpc.genres.getAll.queryOptions({
			input: undefined,
		}),
	);

	const handlePageChange = (newPage: number) => {
		setPagination({ page: newPage });
	};

	const handleLimitChange = (newLimit: number) => {
		setPagination({ page: 1, limit: newLimit });
	};

	const handleSearchChange = (newSearch: string) => {
		setPagination({ page: 1, search: newSearch });
	};

	const handleGenreFilterChange = (newGenreIds: string[]) => {
		const validGenreIds = newGenreIds.filter(
			(id) => id && id.trim().length > 0 && UUID_REGEX.test(id),
		);
		setPagination({ page: 1, genreIds: validGenreIds });
	};

	return (
		<div className="container mx-auto">
			<Header className="mb-4">
				<HeaderContent>
					<HeaderTitle>Spiele</HeaderTitle>
					<HeaderDescription>
						Verwalten Sie alle Spiele in der Datenbank
					</HeaderDescription>
				</HeaderContent>
				<HeaderActions>
					<Group>
						<CreateFromSteamSheet onSuccess={() => refetch()} />
						<GroupSeparator className="bg-primary/72" />
						<Menu>
							<MenuTrigger render={<Button />}>
								<Ellipsis />
							</MenuTrigger>
							<MenuPopup>
								<Link href={"/admin/games/add"}>
									<MenuItem>Manuell erstellen</MenuItem>
								</Link>
							</MenuPopup>
						</Menu>
					</Group>
				</HeaderActions>
			</Header>

			{error ? (
				<Frame>
					<FramePanel>
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<AlertCircle />
								</EmptyMedia>
								<EmptyTitle>Fehler beim Laden der Spiele</EmptyTitle>
								<EmptyDescription>
									{error instanceof Error
										? error.message
										: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut."}
								</EmptyDescription>
							</EmptyHeader>
							<EmptyContent>
								<Button onClick={() => refetch()}>Erneut versuchen</Button>
							</EmptyContent>
						</Empty>
					</FramePanel>
				</Frame>
			) : (
				<GamesTable
					data={data?.data ?? []}
					pagination={
						data?.pagination ?? {
							page,
							limit,
							totalCount: 0,
							totalPages: 0,
							hasNextPage: false,
							hasPreviousPage: false,
						}
					}
					search={search}
					genreIds={genreIds}
					genres={genresData ?? []}
					onSearchChange={handleSearchChange}
					onPageChange={handlePageChange}
					onLimitChange={handleLimitChange}
					onGenreFilterChange={handleGenreFilterChange}
					loading={isPending}
				/>
			)}
		</div>
	);
}
