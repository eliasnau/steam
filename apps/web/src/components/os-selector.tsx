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

interface OperatingSystem {
	id: string;
	name: string;
}

interface OSSelectorProps {
	value: string[];
	onChange: (osIds: string[]) => void;
}

export default function OSSelector({
	value,
	onChange,
}: OSSelectorProps) {
	const { data: operatingSystems = [], isLoading } = useQuery({
		queryKey: ["operatingSystems"],
		queryFn: async () => {
			const result = await client.operatingSystems.getAll();
			return result as OperatingSystem[];
		},
	});

	const selectedOS = operatingSystems.filter((os) => value.includes(os.id));

	const handleToggle = (osId: string, checked: boolean) => {
		if (checked) {
			onChange([...value, osId]);
		} else {
			onChange(value.filter((id) => id !== osId));
		}
	};

	return (
		<div className="space-y-2">
			<Label>Betriebssysteme (Optional)</Label>

			<div className="flex flex-wrap items-center gap-2">
				<Menu>
					<MenuTrigger render={<Button variant="outline" type="button" />}>
						{selectedOS.length > 0
							? `${selectedOS.length} ausgewählt`
							: "Betriebssysteme auswählen"}
					</MenuTrigger>
					<MenuPopup>
						{isLoading ? (
							<div className="px-2 py-1.5 text-muted-foreground text-sm">
								Lädt...
							</div>
						) : operatingSystems.length === 0 ? (
							<div className="px-2 py-1.5 text-muted-foreground text-sm">
								Keine Betriebssysteme verfügbar
							</div>
						) : (
							operatingSystems.map((os) => (
								<MenuCheckboxItem
									key={os.id}
									checked={value.includes(os.id)}
									onCheckedChange={(checked) =>
										handleToggle(os.id, checked)
									}
									variant="switch"
								>
									{os.name}
								</MenuCheckboxItem>
							))
						)}
					</MenuPopup>
				</Menu>

				{selectedOS.map((os) => (
					<Badge key={os.id} variant="secondary">
						{os.name}
					</Badge>
				))}
			</div>
		</div>
	);
}

