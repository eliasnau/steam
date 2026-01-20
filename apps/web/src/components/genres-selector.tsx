"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Dialog,
	DialogClose,
	DialogFooter,
	DialogHeader,
	DialogPanel,
	DialogPopup,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { client } from "@/utils/orpc";

interface Genre {
	id: string;
	name: string;
}

interface GenresSelectorProps {
	value: string[];
	onChange: (genreIds: string[]) => void;
}

function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

export default function GenresSelector({
	value,
	onChange,
}: GenresSelectorProps) {
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounce(searchQuery, 300);

	const { data: searchResults = [], isLoading } = useQuery({
		queryKey: ["genres", "search", debouncedSearch],
		queryFn: async () => {
			if (!debouncedSearch) {
				return [];
			}
			const result = await client.genres.getAll();
			const allGenres = result as Genre[];
			return allGenres.filter((genre) =>
				genre.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
			);
		},
		enabled: debouncedSearch.length > 0 && open,
	});

	const { data: allGenres = [] } = useQuery({
		queryKey: ["genres", "all"],
		queryFn: async () => {
			if (value.length === 0) {
				return [];
			}
			const result = await client.genres.getAll();
			return result as Genre[];
		},
		enabled: value.length > 0,
	});

	const handleAdd = (genreId: string) => {
		if (!value.includes(genreId)) {
			onChange([...value, genreId]);
		}
	};

	const handleRemove = (genreId: string) => {
		onChange(value.filter((id) => id !== genreId));
	};

	const selectedGenres = allGenres.filter((genre) => value.includes(genre.id));

	return (
		<div className="space-y-2">
			<Label>Genres (Optional)</Label>

			<div className="flex flex-wrap items-center gap-2">
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger>
						<Button type="button" variant="outline">
							{selectedGenres.length > 0
								? `${selectedGenres.length} ausgewählt`
								: "Genres auswählen"}
						</Button>
					</DialogTrigger>
					<DialogPopup>
						<DialogHeader>
							<DialogTitle>Genres auswählen</DialogTitle>
						</DialogHeader>
						<DialogPanel>
							<div className="space-y-4">
								<Input
									type="text"
									placeholder="Genre suchen..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>

								{debouncedSearch && (
									<div className="space-y-2">
										{isLoading ? (
											<div className="px-2 py-1.5 text-muted-foreground text-sm">
												Lädt...
											</div>
										) : searchResults.length === 0 ? (
											<div className="px-2 py-1.5 text-muted-foreground text-sm">
												Keine Genres gefunden
											</div>
										) : (
											<ScrollArea className="h-64">
												<div className="space-y-1 pr-4">
													{searchResults.map((genre) => {
														const isSelected = value.includes(genre.id);
														return (
															<div
																key={genre.id}
																className="flex items-center justify-between rounded-md border px-3 py-2"
															>
																<span className="text-sm">{genre.name}</span>
																{isSelected ? (
																	<Button
																		type="button"
																		variant="outline"
																		size="sm"
																		onClick={() => handleRemove(genre.id)}
																	>
																		Entfernen
																	</Button>
																) : (
																	<Button
																		type="button"
																		variant="outline"
																		size="sm"
																		onClick={() => handleAdd(genre.id)}
																	>
																		Hinzufügen
																	</Button>
																)}
															</div>
														);
													})}
												</div>
											</ScrollArea>
										)}
									</div>
								)}
							</div>
						</DialogPanel>

						<DialogFooter>
							<DialogClose>
								<Button type="button" variant="outline">
									Fertig
								</Button>
							</DialogClose>
						</DialogFooter>
					</DialogPopup>
				</Dialog>

				{selectedGenres.map((genre) => (
					<Badge
						key={genre.id}
						variant="secondary"
						className="cursor-pointer"
						onClick={() => handleRemove(genre.id)}
					>
						{genre.name}
					</Badge>
				))}
			</div>
		</div>
	);
}
