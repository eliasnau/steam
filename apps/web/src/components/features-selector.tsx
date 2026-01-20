"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Menu,
	MenuCheckboxItem,
	MenuPopup,
	MenuTrigger,
} from "@/components/ui/menu";
import { client } from "@/utils/orpc";

interface Category {
	id: string;
	name: string;
}

interface FeaturesSelectorProps {
	value: string[];
	onChange: (categoryIds: string[]) => void;
}

export default function FeaturesSelector({
	value,
	onChange,
}: FeaturesSelectorProps) {
	const { data: categories = [], isLoading } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const result = await client.categories.getAll();
			return result as Category[];
		},
	});

	const selectedCategories = categories.filter((cat) => value.includes(cat.id));

	const handleToggle = (categoryId: string, checked: boolean) => {
		if (checked) {
			onChange([...value, categoryId]);
		} else {
			onChange(value.filter((id) => id !== categoryId));
		}
	};

	return (
		<div className="space-y-2">
			<Label>Features (Optional)</Label>

			<div className="flex flex-wrap items-center gap-2">
				<Menu>
					<MenuTrigger render={<Button variant="outline" type="button" />}>
						{selectedCategories.length > 0
							? `${selectedCategories.length} ausgewählt`
							: "Features auswählen"}
					</MenuTrigger>
					<MenuPopup>
						{isLoading ? (
							<div className="px-2 py-1.5 text-muted-foreground text-sm">
								Lädt...
							</div>
						) : categories.length === 0 ? (
							<div className="px-2 py-1.5 text-muted-foreground text-sm">
								Keine Features verfügbar
							</div>
						) : (
							categories.map((category) => (
								<MenuCheckboxItem
									key={category.id}
									checked={value.includes(category.id)}
									onCheckedChange={(checked) =>
										handleToggle(category.id, checked)
									}
									variant="switch"
								>
									{category.name}
								</MenuCheckboxItem>
							))
						)}
					</MenuPopup>
				</Menu>

				{selectedCategories.map((category) => (
					<Badge key={category.id} variant="secondary">
						{category.name}
					</Badge>
				))}
			</div>
		</div>
	);
}
