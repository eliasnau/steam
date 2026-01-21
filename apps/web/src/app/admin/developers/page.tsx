"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
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
import { orpc } from "@/utils/orpc";
import AddDeveloperSheet from "../_components/add-developer-sheet";
import {
	Header,
	HeaderActions,
	HeaderContent,
	HeaderDescription,
	HeaderTitle,
} from "../_components/page-header";
import DevelopersTable from "./_components/developers-table";

export default function DevelopersPage() {
	return (
		<Suspense>
			<DevelopersPageContent />
		</Suspense>
	);
}

function DevelopersPageContent() {
	const [{ page, limit, search }, setPagination] = useQueryStates({
		page: parseAsInteger.withDefault(1),
		limit: parseAsInteger.withDefault(20),
		search: parseAsString.withDefault(""),
	});

	const { data, isPending, error, refetch } = useQuery(
		orpc.developers.list.queryOptions({
			input: {
				page,
				limit,
				search: search || undefined,
			},
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

	return (
		<div className="container mx-auto py-8">
			<Header>
				<HeaderContent>
					<HeaderTitle>Entwickler</HeaderTitle>
					<HeaderDescription>
						Verwalten Sie alle Entwickler in der Datenbank
					</HeaderDescription>
				</HeaderContent>
				<HeaderActions>
					<AddDeveloperSheet
						renderTrigger={<Button />}
						trigger={"Neuen Entwickler erstellen"}
					/>
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
								<EmptyTitle>Fehler beim Laden der Entwickler</EmptyTitle>
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
				<DevelopersTable
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
					onSearchChange={handleSearchChange}
					onPageChange={handlePageChange}
					onLimitChange={handleLimitChange}
					loading={isPending}
				/>
			)}
		</div>
	);
}
