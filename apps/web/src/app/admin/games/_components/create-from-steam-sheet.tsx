"use client";

import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Check, ExternalLink, Loader2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetClose,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetPanel,
	SheetPopup,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { client } from "@/utils/orpc";

interface CreatedGameData {
	id: string;
	steamId: number;
	name: string;
	price: string | null;
	releasedAt: string;
	rating: number;
	image: string | null;
	shortDescription: string | null;
	website: string | null;
}

interface CreateFromSteamSheetProps {
	onSuccess?: () => void;
}

function extractSteamAppId(input: string): number | null {
	const trimmed = input.trim();

	const direct = Number.parseInt(trimmed, 10);
	if (!Number.isNaN(direct) && direct > 0) return direct;

	const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;

	try {
		const url = new URL(normalized);
		const path = url.pathname;

		const match =
			path.match(/\/app\/(\d+)(?:\/|$)/i) ??
			path.match(/\/apps?\/(\d+)(?:\/|$)/i);

		if (!match) return null;

		const id = Number.parseInt(match[1]!, 10);
		return Number.isNaN(id) || id <= 0 ? null : id;
	} catch {
		const match =
			trimmed.match(/\/app\/(\d+)(?:\/|$)/i) ??
			trimmed.match(/\/apps?\/(\d+)(?:\/|$)/i);

		if (!match) return null;

		const id = Number.parseInt(match[1]!, 10);
		return Number.isNaN(id) || id <= 0 ? null : id;
	}
}

export function CreateFromSteamSheet({ onSuccess }: CreateFromSteamSheetProps) {
	const [open, setOpen] = useState(false);
	const [steamId, setSteamId] = useState("");
	const [createdGame, setCreatedGame] = useState<CreatedGameData | null>(null);

	const parsedSteamId = useMemo(() => extractSteamAppId(steamId), [steamId]);

	const createMutation = useMutation({
		mutationFn: async (steamId: number) => {
			const result = await client.games.createFromSteam({ steamId });
			return result;
		},
		onSuccess: (data) => {
			setCreatedGame(data.game as CreatedGameData);
			setSteamId("");
			onSuccess?.();
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (parsedSteamId) {
			createMutation.mutate(parsedSteamId);
		}
	};

	const handleClose = () => {
		setOpen(false);
		setTimeout(() => {
			setCreatedGame(null);
			setSteamId("");
			createMutation.reset();
		}, 200);
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			handleClose();
		} else {
			setOpen(newOpen);
		}
	};

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<SheetTrigger render={<Button />}>Von Steam erstellen</SheetTrigger>
			<SheetPopup>
				<SheetHeader>
					<SheetTitle>
						{createdGame ? "Spiel erstellt" : "Spiel von Steam erstellen"}
					</SheetTitle>
					<SheetDescription>
						{createdGame
							? "Das Spiel wurde erfolgreich zur Datenbank hinzugefügt."
							: "Geben Sie eine Steam App ID oder eine SteamDB/Steam URL ein, um ein Spiel automatisch zu erstellen."}
					</SheetDescription>
				</SheetHeader>

				<SheetPanel>
					{createdGame ? (
						<div className="space-y-4">
							<div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-700 dark:text-green-400">
								<Check className="h-5 w-5" />
								<span className="font-medium">Spiel erfolgreich erstellt!</span>
							</div>

							{createdGame.image && (
								<div className="overflow-hidden rounded-lg border">
									<img
										src={createdGame.image}
										alt={createdGame.name}
										className="h-auto w-full object-cover"
									/>
								</div>
							)}

							<div className="space-y-3">
								<div>
									<div className="font-medium text-muted-foreground text-sm">
										Name
									</div>
									<p className="font-semibold text-base">{createdGame.name}</p>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div>
										<div className="font-medium text-muted-foreground text-sm">
											Steam ID
										</div>
										<p className="text-base">{createdGame.steamId}</p>
									</div>
									<div>
										<div className="font-medium text-muted-foreground text-sm">
											Preis
										</div>
										<p className="text-base">
											{createdGame.price
												? `${createdGame.price}€`
												: "Kostenlos"}
										</p>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div>
										<div className="font-medium text-muted-foreground text-sm">
											Veröffentlicht
										</div>
										<p className="text-base">
											{new Date(createdGame.releasedAt).toLocaleDateString(
												"de-DE",
											)}
										</p>
									</div>
									<div>
										<div className="font-medium text-muted-foreground text-sm">
											Bewertung
										</div>
										<p className="text-base">{createdGame.rating} / 6</p>
									</div>
								</div>

								{createdGame.shortDescription && (
									<div>
										<div className="font-medium text-muted-foreground text-sm">
											Beschreibung
										</div>
										<p className="text-muted-foreground text-sm">
											{createdGame.shortDescription}
										</p>
									</div>
								)}

								{createdGame.website && (
									<div>
										<div className="font-medium text-muted-foreground text-sm">
											Website
										</div>
										<a
											href={createdGame.website}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-1 text-primary text-sm hover:underline"
										>
											{createdGame.website}
											<ExternalLink className="h-3 w-3" />
										</a>
									</div>
								)}
							</div>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<label
									htmlFor="steamId"
									className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Steam App ID oder URL
								</label>
								<Input
									id="steamId"
									type="text"
									placeholder="z.B. 730 oder https://steamdb.info/app/730/charts/"
									value={steamId}
									onChange={(e) => setSteamId(e.target.value)}
									disabled={createMutation.isPending}
									required
								/>
								<p className="text-muted-foreground text-xs">
									Beispiele: steamdb.info/app/730/charts/ oder
									store.steampowered.com/app/730/
								</p>
							</div>

							{createMutation.error && (
								<div className="flex gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm">
									<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
									<div>
										<div className="font-semibold">Fehler</div>
										<div className="text-destructive/90">
											{createMutation.error instanceof Error
												? createMutation.error.message
												: "Ein unbekannter Fehler ist aufgetreten"}
										</div>
									</div>
								</div>
							)}
						</form>
					)}
				</SheetPanel>

				<SheetFooter>
					{createdGame ? (
						<>
							<SheetClose render={<Button variant="outline" />}>
								Schließen
							</SheetClose>
							<Button
								onClick={handleClose}
								render={
									<Link href={`/admin/games/${createdGame.steamId}` as Route} />
								}
							>
								<ExternalLink />
								Details anzeigen
							</Button>
						</>
					) : (
						<>
							<SheetClose
								render={<Button variant="outline" />}
								disabled={createMutation.isPending}
							>
								Abbrechen
							</SheetClose>
							<Button
								onClick={handleSubmit}
								disabled={createMutation.isPending || !parsedSteamId}
							>
								{createMutation.isPending && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Erstellen
							</Button>
						</>
					)}
				</SheetFooter>
			</SheetPopup>
		</Sheet>
	);
}