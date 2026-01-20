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

interface Tag {
	id: string;
	name: string;
}

interface TagsSelectorProps {
	value: string[];
	onChange: (tagIds: string[]) => void;
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

export default function TagsSelector({
	value,
	onChange,
}: TagsSelectorProps) {
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounce(searchQuery, 300);

	const { data: searchResults = [], isLoading } = useQuery({
		queryKey: ["tags", "search", debouncedSearch],
		queryFn: async () => {
			if (!debouncedSearch) {
				return [];
			}
			const result = await client.tags.getAll();
			const allTags = result as Tag[];
			return allTags.filter((tag) =>
				tag.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
			);
		},
		enabled: debouncedSearch.length > 0 && open,
	});

	const { data: allTags = [] } = useQuery({
		queryKey: ["tags", "all"],
		queryFn: async () => {
			if (value.length === 0) {
				return [];
			}
			const result = await client.tags.getAll();
			return result as Tag[];
		},
		enabled: value.length > 0,
	});

	const handleAdd = (tagId: string) => {
		if (!value.includes(tagId)) {
			onChange([...value, tagId]);
		}
	};

	const handleRemove = (tagId: string) => {
		onChange(value.filter((id) => id !== tagId));
	};

	const selectedTags = allTags.filter((tag) => value.includes(tag.id));

	return (
		<div className="space-y-2">
			<Label>Tags (Optional)</Label>

			<div className="flex flex-wrap items-center gap-2">
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger>
						<Button type="button" variant="outline">
							{selectedTags.length > 0
								? `${selectedTags.length} ausgewählt`
								: "Tags auswählen"}
						</Button>
					</DialogTrigger>
					<DialogPopup>
						<DialogHeader>
							<DialogTitle>Tags auswählen</DialogTitle>
						</DialogHeader>
						<DialogPanel>
							<div className="space-y-4">
								<Input
									type="text"
									placeholder="Tag suchen..."
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
												Keine Tags gefunden
											</div>
										) : (
											<ScrollArea className="h-64">
												<div className="space-y-1 pr-4">
													{searchResults.map((tag) => {
														const isSelected = value.includes(tag.id);
														return (
															<div
																key={tag.id}
																className="flex items-center justify-between rounded-md border px-3 py-2"
															>
																<span className="text-sm">{tag.name}</span>
																{isSelected ? (
																	<Button
																		type="button"
																		variant="outline"
																		size="sm"
																		onClick={() => handleRemove(tag.id)}
																	>
																		Entfernen
																	</Button>
																) : (
																	<Button
																		type="button"
																		variant="outline"
																		size="sm"
																		onClick={() => handleAdd(tag.id)}
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

				{selectedTags.map((tag) => (
					<Badge
						key={tag.id}
						variant="secondary"
						className="cursor-pointer"
						onClick={() => handleRemove(tag.id)}
					>
						{tag.name}
					</Badge>
				))}
			</div>
		</div>
	);
}

