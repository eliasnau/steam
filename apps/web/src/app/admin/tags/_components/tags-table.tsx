"use client";

import type { InferClientOutputs } from "@orpc/client";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import {
	ChevronDownIcon,
	ChevronUpIcon,
	MoreVerticalIcon,
	SearchIcon,
	TagIcon,
	XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Frame, FramePanel } from "@/components/ui/frame";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectItem,
	SelectPopup,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import type { client } from "@/utils/orpc";

type TagsListResponse = InferClientOutputs<typeof client>["tags"]["list"];
type TagRow = TagsListResponse["data"][number];

interface TagsTableProps {
	data: TagRow[];
	pagination: {
		page: number;
		limit: number;
		totalCount: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
	search: string;
	onSearchChange: (search: string) => void;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
	loading?: boolean;
}

const createColumns = (): ColumnDef<TagRow>[] => [
	{
		accessorKey: "name",
		header: "Name",
	},
	{
		accessorKey: "gameCount",
		header: "Spiele",
		cell: ({ row }) => {
			return <Badge variant="secondary">{row.original.gameCount}</Badge>;
		},
	},
	{
		accessorKey: "createdAt",
		header: "Erstellt am",
		cell: ({ row }) => {
			return new Date(row.original.createdAt).toLocaleDateString("de-DE");
		},
	},
	{
		id: "actions",
		header: "Aktionen",
		enableSorting: false,
		cell: ({ row }) => {
			const tag = row.original;

			return (
				<div className="flex items-center justify-end gap-2">
					<Menu>
						<MenuTrigger
							render={
								<Button size="sm" variant="outline">
									<MoreVerticalIcon />
								</Button>
							}
						/>
						<MenuPopup align="end">
							<MenuItem onClick={() => console.log("Tag ansehen:", tag)}>
								Ansehen
							</MenuItem>
							<MenuItem onClick={() => console.log("Tag bearbeiten:", tag)}>
								Bearbeiten
							</MenuItem>
							<MenuItem
								variant="destructive"
								onClick={() => console.log("Tag löschen:", tag)}
							>
								Löschen
							</MenuItem>
						</MenuPopup>
					</Menu>
				</div>
			);
		},
	},
];

export default function TagsTable({
	data,
	pagination,
	search,
	onSearchChange,
	onPageChange,
	onLimitChange,
	loading = false,
}: TagsTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [localSearch, setLocalSearch] = useState(search);

	const debouncedOnSearchChange = useDebounce(onSearchChange, 300);

	const columns = createColumns();

	useEffect(() => {
		setLocalSearch(search);
	}, [search]);

	const table = useReactTable({
		data: data || [],
		columns,
		pageCount: pagination.totalPages,
		state: {
			sorting,
		},
		enableSortingRemoval: false,
		manualPagination: true,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
	});

	const hasNoTags =
		!loading && !data?.length && !search && pagination.totalCount === 0;

	if (hasNoTags) {
		return (
			<Frame className="relative flex min-w-0 flex-1 flex-col bg-muted/50 bg-clip-padding shadow-black/5 shadow-sm after:pointer-events-none after:absolute after:-inset-[5px] after:-z-1 after:rounded-[calc(var(--radius-2xl)+4px)] after:border after:border-border/50 after:bg-clip-padding lg:rounded-2xl lg:border dark:after:bg-background/72">
				<FramePanel className="py-12">
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<TagIcon />
							</EmptyMedia>
							<EmptyTitle>Noch keine Tags</EmptyTitle>
							<EmptyDescription>
								Fügen Sie Ihren ersten Tag hinzu, um loszulegen.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				</FramePanel>
			</Frame>
		);
	}

	return (
		<div className="">
			<div className="mb-4 flex items-center justify-between gap-2">
				<div className="flex gap-2">
					<InputGroup className="max-w-md">
						<InputGroupAddon>
							<SearchIcon className="size-4" />
						</InputGroupAddon>
						<InputGroupInput
							type="text"
							placeholder="Nach Name suchen..."
							value={localSearch}
							onChange={(event) => {
								const newValue = event.target.value;
								setLocalSearch(newValue);
								debouncedOnSearchChange(newValue);
							}}
						/>
						{localSearch !== "" && (
							<InputGroupAddon
								align="inline-end"
								className="cursor-pointer"
								onClick={() => {
									setLocalSearch("");
									onSearchChange("");
								}}
							>
								<XIcon className="size-4" />
							</InputGroupAddon>
						)}
					</InputGroup>
				</div>

				<div className="flex items-center gap-2">
					{search && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setLocalSearch("");
								onSearchChange("");
							}}
						>
							Filter löschen
						</Button>
					)}
				</div>
			</div>
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow className="hover:bg-transparent" key={headerGroup.id}>
							{headerGroup.headers.map((header, idx) => {
								const isLast = idx === headerGroup.headers.length - 1;
								return (
									<TableHead
										key={header.id}
										className={isLast ? "text-right" : undefined}
									>
										{header.isPlaceholder ? null : header.column.getCanSort() ? (
											<div
												className="flex h-full cursor-pointer select-none items-center justify-between gap-2"
												onClick={header.column.getToggleSortingHandler()}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														header.column.getToggleSortingHandler()?.(e);
													}
												}}
												role="button"
												tabIndex={0}
											>
												{flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
												{{
													asc: (
														<ChevronUpIcon
															aria-hidden="true"
															className="size-4 shrink-0 opacity-80"
														/>
													),
													desc: (
														<ChevronDownIcon
															aria-hidden="true"
															className="size-4 shrink-0 opacity-80"
														/>
													),
												}[header.column.getIsSorted() as string] ?? null}
											</div>
										) : (
											flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)
										)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{loading ? (
						Array.from({ length: pagination.limit }).map((_, idx) => (
							<TableRow key={`skeleton-${idx}`}>
								{columns.map((_column, colIdx) => (
									<TableCell key={`skeleton-${idx}-${colIdx}`} className="py-3">
										<Skeleton className="h-5 w-full" />
									</TableCell>
								))}
							</TableRow>
						))
					) : !table.getRowModel().rows?.length ? (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-32 text-center">
								<div className="flex flex-col items-center justify-center gap-2">
									<p className="text-muted-foreground">
										{search
											? "Keine Tags gefunden, die Ihrer Suche entsprechen."
											: "Keine Ergebnisse gefunden."}
									</p>
									{search && (
										<Button
											size="sm"
											variant="outline"
											onClick={() => {
												setLocalSearch("");
												onSearchChange("");
											}}
										>
											Filter löschen
										</Button>
									)}
								</div>
							</TableCell>
						</TableRow>
					) : (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() ? "selected" : undefined}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					)}
				</TableBody>
				<TableFooter>
					<TableRow>
						<TableCell colSpan={columns.length} className="p-2">
							<div className="flex items-center justify-between gap-2">
								<div className="flex items-center gap-2 whitespace-nowrap">
									<p className="text-muted-foreground text-sm">Zeige</p>
									<Select
										items={[
											{ label: "10", value: 10 },
											{ label: "20", value: 20 },
											{ label: "30", value: 30 },
											{ label: "50", value: 50 },
										]}
										onValueChange={(value) => {
											onLimitChange(value as number);
										}}
										value={pagination.limit}
									>
										<SelectTrigger
											aria-label="Zeilen pro Seite"
											className="w-fit min-w-none"
											size="sm"
										>
											<SelectValue />
										</SelectTrigger>
										<SelectPopup>
											<SelectItem value={10}>10</SelectItem>
											<SelectItem value={20}>20</SelectItem>
											<SelectItem value={30}>30</SelectItem>
											<SelectItem value={50}>50</SelectItem>
										</SelectPopup>
									</Select>
									<span className="text-muted-foreground text-sm">
										von{" "}
										<strong className="font-medium text-foreground">
											{pagination.totalCount}
										</strong>{" "}
										{pagination.totalCount === 1 ? "Tag" : "Tags"}
									</span>
								</div>
								<Pagination className="justify-end">
									<PaginationContent>
										<PaginationItem>
											<span className="text-muted-foreground text-sm">
												Seite {pagination.page} von {pagination.totalPages}
											</span>
										</PaginationItem>
										<PaginationItem>
											<PaginationPrevious
												className="sm:*:[svg]:hidden"
												render={
													<Button
														disabled={!pagination.hasPreviousPage}
														onClick={() => onPageChange(pagination.page - 1)}
														size="sm"
														variant="outline"
													>
														Zurück
													</Button>
												}
											/>
										</PaginationItem>
										<PaginationItem>
											<PaginationNext
												className="sm:*:[svg]:hidden"
												render={
													<Button
														disabled={!pagination.hasNextPage}
														onClick={() => onPageChange(pagination.page + 1)}
														size="sm"
														variant="outline"
													>
														Weiter
													</Button>
												}
											/>
										</PaginationItem>
									</PaginationContent>
								</Pagination>
							</div>
						</TableCell>
					</TableRow>
				</TableFooter>
			</Table>
		</div>
	);
}
