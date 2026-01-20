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

interface Developer {
	id: string;
	name: string;
}

interface DevelopersSelectorProps {
	value: string[];
	onChange: (developerIds: string[]) => void;
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

export default function DevelopersSelector({
	value,
	onChange,
}: DevelopersSelectorProps) {
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounce(searchQuery, 300);

	const { data: searchResults = [], isLoading } = useQuery({
		queryKey: ["developers", "search", debouncedSearch],
		queryFn: async () => {
			if (!debouncedSearch) {
				return [];
			}
			const result = await client.developers.getAll();
			const allDevelopers = result as Developer[];
			return allDevelopers.filter((developer) =>
				developer.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
			);
		},
		enabled: debouncedSearch.length > 0 && open,
	});

	const { data: allDevelopers = [] } = useQuery({
		queryKey: ["developers", "all"],
		queryFn: async () => {
			if (value.length === 0) {
				return [];
			}
			const result = await client.developers.getAll();
			return result as Developer[];
		},
		enabled: value.length > 0,
	});

	const handleAdd = (developerId: string) => {
		if (!value.includes(developerId)) {
			onChange([...value, developerId]);
		}
	};

	const handleRemove = (developerId: string) => {
		onChange(value.filter((id) => id !== developerId));
	};

	const selectedDevelopers = allDevelopers.filter((developer) =>
		value.includes(developer.id),
	);

	return (
		<div className="space-y-2">
			<Label>Entwickler (Optional)</Label>

			<div className="flex flex-wrap items-center gap-2">
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger>
						<Button type="button" variant="outline">
							{selectedDevelopers.length > 0
								? `${selectedDevelopers.length} ausgewählt`
								: "Entwickler auswählen"}
						</Button>
					</DialogTrigger>
					<DialogPopup>
						<DialogHeader>
							<DialogTitle>Entwickler auswählen</DialogTitle>
						</DialogHeader>
						<DialogPanel>
							<div className="space-y-4">
								<Input
									type="text"
									placeholder="Entwickler suchen..."
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
												Keine Entwickler gefunden
											</div>
										) : (
											<ScrollArea className="h-64">
												<div className="space-y-1 pr-4">
													{searchResults.map((developer) => {
														const isSelected = value.includes(developer.id);
														return (
															<div
																key={developer.id}
																className="flex items-center justify-between rounded-md border px-3 py-2"
															>
																<span className="text-sm">{developer.name}</span>
																{isSelected ? (
																	<Button
																		type="button"
																		variant="outline"
																		size="sm"
																		onClick={() => handleRemove(developer.id)}
																	>
																		Entfernen
																	</Button>
																) : (
																	<Button
																		type="button"
																		variant="outline"
																		size="sm"
																		onClick={() => handleAdd(developer.id)}
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

				{selectedDevelopers.map((developer) => (
					<Badge
						key={developer.id}
						variant="secondary"
						className="cursor-pointer"
						onClick={() => handleRemove(developer.id)}
					>
						{developer.name}
					</Badge>
				))}
			</div>
		</div>
	);
}

