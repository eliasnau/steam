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

interface Publisher {
	id: string;
	name: string;
}

interface PublishersSelectorProps {
	value: string[];
	onChange: (publisherIds: string[]) => void;
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

export default function PublishersSelector({
	value,
	onChange,
}: PublishersSelectorProps) {
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounce(searchQuery, 300);

	const { data: searchResults = [], isLoading } = useQuery({
		queryKey: ["publishers", "search", debouncedSearch],
		queryFn: async () => {
			if (!debouncedSearch) {
				return [];
			}
			const result = await client.publishers.getAll();
			const allPublishers = result as Publisher[];
			return allPublishers.filter((publisher) =>
				publisher.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
			);
		},
		enabled: debouncedSearch.length > 0 && open,
	});

	const { data: allPublishers = [] } = useQuery({
		queryKey: ["publishers", "all"],
		queryFn: async () => {
			if (value.length === 0) {
				return [];
			}
			const result = await client.publishers.getAll();
			return result as Publisher[];
		},
		enabled: value.length > 0,
	});

	const handleAdd = (publisherId: string) => {
		if (!value.includes(publisherId)) {
			onChange([...value, publisherId]);
		}
	};

	const handleRemove = (publisherId: string) => {
		onChange(value.filter((id) => id !== publisherId));
	};

	const selectedPublishers = allPublishers.filter((publisher) =>
		value.includes(publisher.id),
	);

	return (
		<div className="space-y-2">
			<Label>Publisher (Optional)</Label>

			<div className="flex flex-wrap items-center gap-2">
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger>
						<Button type="button" variant="outline">
							{selectedPublishers.length > 0
								? `${selectedPublishers.length} ausgewählt`
								: "Publisher auswählen"}
						</Button>
					</DialogTrigger>
					<DialogPopup>
						<DialogHeader>
							<DialogTitle>Publisher auswählen</DialogTitle>
						</DialogHeader>
						<DialogPanel>
							<div className="space-y-4">
								<Input
									type="text"
									placeholder="Publisher suchen..."
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
												Keine Publisher gefunden
											</div>
										) : (
											<ScrollArea className="h-64">
												<div className="space-y-1 pr-4">
													{searchResults.map((publisher) => {
														const isSelected = value.includes(publisher.id);
														return (
															<div
																key={publisher.id}
																className="flex items-center justify-between rounded-md border px-3 py-2"
															>
																<span className="text-sm">{publisher.name}</span>
																{isSelected ? (
																	<Button
																		type="button"
																		variant="outline"
																		size="sm"
																		onClick={() => handleRemove(publisher.id)}
																	>
																		Entfernen
																	</Button>
																) : (
																	<Button
																		type="button"
																		variant="outline"
																		size="sm"
																		onClick={() => handleAdd(publisher.id)}
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

				{selectedPublishers.map((publisher) => (
					<Badge
						key={publisher.id}
						variant="secondary"
						className="cursor-pointer"
						onClick={() => handleRemove(publisher.id)}
					>
						{publisher.name}
					</Badge>
				))}
			</div>
		</div>
	);
}

