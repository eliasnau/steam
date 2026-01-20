"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Autocomplete,
	AutocompleteEmpty,
	AutocompleteInput,
	AutocompleteItem,
	AutocompleteList,
	AutocompletePopup,
} from "@/components/ui/autocomplete";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPanel,
	DialogPopup,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { client } from "@/utils/orpc";

interface Franchise {
	id: string;
	name: string;
}

interface AutocompleteItem {
	value: string;
	label: string;
	franchise: Franchise;
}

interface FranchiseSelectorProps {
	value?: string;
	onChange: (franchiseId: string | undefined) => void;
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

export default function FranchiseSelector({
	value,
	onChange,
}: FranchiseSelectorProps) {
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounce(searchQuery, 300);

	const { data: franchises = [], isLoading } = useQuery({
		queryKey: ["franchises", debouncedSearch],
		queryFn: async () => {
			const result = await client.franchises.getAll();
			const allFranchises = result as Franchise[];

			if (!debouncedSearch) {
				return allFranchises.slice(0, 10);
			}

			return allFranchises.filter((f) =>
				f.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
			);
		},
		enabled: open,
	});

	const { data: currentFranchise } = useQuery({
		queryKey: ["franchise", value],
		queryFn: async () => {
			if (!value) return null;
			const result = await client.franchises.getAll();
			const allFranchises = result as Franchise[];
			return allFranchises.find((f) => f.id === value) || null;
		},
		enabled: !!value,
	});

	const handleSelect = (item: Franchise | null) => {
		if (item) {
			onChange(item.id);
			setOpen(false);
			setSearchQuery("");
		}
	};

	const handleRemove = () => {
		onChange(undefined);
	};

	const autocompleteItems = franchises.map((f) => ({
		value: f.id,
		label: f.name,
		franchise: f,
	}));

	if (currentFranchise) {
		return (
			<div className="space-y-2">
				<Label>Franchise</Label>
				<div className="flex gap-2">
					<Input value={currentFranchise.name} disabled className="flex-1" />
					<Button
						type="button"
						variant="outline"
						size="icon"
						onClick={handleRemove}
						title="Franchise entfernen"
					>
						<X className="h-4 w-4" />
					</Button>
					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger>
							<Button type="button" variant="outline">
								Ändern
							</Button>
						</DialogTrigger>
						<DialogPopup>
							<DialogHeader>
								<DialogTitle>Franchise zuweisen</DialogTitle>
								<DialogDescription>
									Beginne zu tippen, um nach Franchises zu suchen.
								</DialogDescription>
							</DialogHeader>
							<DialogPanel className="grid gap-4">
								<Autocomplete
									items={autocompleteItems}
									onValueChange={(value) => {
										const selectedFranchise = franchises.find(
											(f) => f.id === value,
										);
										if (selectedFranchise) {
											handleSelect(selectedFranchise);
										}
									}}
								>
									<AutocompleteInput
										placeholder="Franchise suchen..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										showClear
									/>
									<AutocompletePopup>
										<AutocompleteEmpty>
											{isLoading ? "Lädt..." : "Keine Franchises gefunden"}
										</AutocompleteEmpty>
										<AutocompleteList>
											{(item) => (
												<AutocompleteItem key={item.value} value={item.value}>
													{item.label}
												</AutocompleteItem>
											)}
										</AutocompleteList>
									</AutocompletePopup>
								</Autocomplete>
							</DialogPanel>

							<DialogFooter>
								<DialogClose>
									<Button type="button" variant="outline">
										Abbrechen
									</Button>
								</DialogClose>
							</DialogFooter>
						</DialogPopup>
					</Dialog>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<Label>Franchise</Label>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger>
					<Button type="button" variant="outline" className="w-full">
						Franchise zuweisen
					</Button>
				</DialogTrigger>
				<DialogPopup>
					<DialogHeader>
						<DialogTitle>Franchise zuweisen</DialogTitle>
						<DialogDescription>
							Beginne zu tippen, um nach Franchises zu suchen.
						</DialogDescription>
					</DialogHeader>
					<DialogPanel >
						<Autocomplete
							items={autocompleteItems}
							onValueChange={(value) => {
								const selectedFranchise = franchises.find(
									(f) => f.id === value,
								);
								if (selectedFranchise) {
									handleSelect(selectedFranchise);
								}
							}}
						>
							<AutocompleteInput
								placeholder="Franchise suchen..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								showClear
							/>
							<AutocompletePopup>
								<AutocompleteEmpty>
									{isLoading ? "Lädt..." : "Keine Franchises gefunden"}
								</AutocompleteEmpty>
								<AutocompleteList>
									{(item) => (
										<AutocompleteItem key={item.value} value={item.value}>
											{item.label}
										</AutocompleteItem>
									)}
								</AutocompleteList>
							</AutocompletePopup>
						</Autocomplete>
					</DialogPanel>

					<DialogFooter>
						<DialogClose>
							<Button type="button" variant="outline">
								Abbrechen
							</Button>
						</DialogClose>
					</DialogFooter>
				</DialogPopup>
			</Dialog>
		</div>
	);
}
