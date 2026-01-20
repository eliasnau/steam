"use client";

import { ORPCError } from "@orpc/client";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import FranchiseSelector from "@/components/franchise-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { client } from "@/utils/orpc";

const addGameMutation = async (data: {
	steamId: number;
	name: string;
	price: string;
	publishedAt: string;
	playerCountAllTime: string;
	rating: number;
	image?: string;
	genres?: string[];
	features?: string[];
	operatingSystems?: string[];
	franchiseId?: string;
}) => {
	const result = await client.games.create(data);
	return result;
};

export default function AddGameForm() {
	const router = useRouter();

	const mutation = useMutation({
		mutationFn: addGameMutation,
		onSuccess: (data) => {
			const params = new URLSearchParams({
				name: data.game.name,
				steamId: data.game.steamId.toString(),
				id: data.game.id,
			});
			router.push(`/admin/add/success?${params.toString()}`);
		},
		onError: (error: Error) => {
			let errorMessage = "Das Spiel konnte nicht hinzugefügt werden";

			if (error instanceof ORPCError) {
				if (error.code === "CONFLICT") {
					errorMessage = "Ein Spiel mit dieser Steam ID existiert bereits";
				} else if (error.code === "BAD_REQUEST") {
					errorMessage =
						error.message ||
						"Ungültige Eingabedaten. Bitte überprüfen Sie Ihre Eingaben.";
				} else if (error.code === "UNAUTHORIZED") {
					errorMessage = "Sie haben keine Berechtigung für diese Aktion";
				} else if (error.message) {
					errorMessage = error.message;
				}
			}

			toast.error(errorMessage);
		},
	});

	const form = useForm({
		defaultValues: {
			steamId: "",
			name: "",
			price: "",
			publishedAt: "",
			playerCountAllTime: "",
			rating: 1,
			franchiseId: "",
			image: "",
			genres: "",
			features: "",
			operatingSystems: "",
		},
		onSubmit: async ({ value }) => {
			const data = {
				steamId: Number.parseInt(value.steamId),
				name: value.name,
				price: value.price,
				publishedAt: value.publishedAt,
				playerCountAllTime: value.playerCountAllTime,
				rating: value.rating,
				image: value.image || undefined,
				genres: value.genres
					? value.genres
							.split(",")
							.map((id) => id.trim())
							.filter((id) => id.length > 0)
					: undefined,
				features: value.features
					? value.features
							.split(",")
							.map((id) => id.trim())
							.filter((id) => id.length > 0)
					: undefined,
				operatingSystems: value.operatingSystems
					? value.operatingSystems
							.split(",")
							.map((id) => id.trim())
							.filter((id) => id.length > 0)
					: undefined,
				franchiseId:
					value.franchiseId && value.franchiseId !== ""
						? value.franchiseId
						: undefined,
			};
			mutation.mutate(data);
		},
		validators: {
			onSubmit: z.object({
				steamId: z.string().min(1, "Steam ID ist erforderlich"),
				name: z.string().min(1, "Spielname ist erforderlich"),
				price: z.string().min(1, "Preis ist erforderlich"),
				publishedAt: z
					.string()
					.min(1, "Veröffentlichungsdatum ist erforderlich"),
				playerCountAllTime: z.string().min(1, "Spieleranzahl ist erforderlich"),
				rating: z
					.number()
					.min(1, "Bewertung muss mindestens 1 sein")
					.max(6, "Bewertung darf höchstens 6 sein"),
				franchiseId: z.string(),
				image: z.string(),
				genres: z.string().optional(),
				features: z.string().optional(),
				operatingSystems: z.string().optional(),
			}),
		},
	});

	const isSubmitting = mutation.isPending;

	return (
		<div className="mx-auto w-full max-w-2xl p-6">
			<h1 className="mb-6 text-center font-bold text-3xl">
				Neues Spiel hinzufügen
			</h1>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-6"
			>
				<div>
					<form.Field name="steamId">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Steam ID</Label>
								<Input
									id={field.name}
									name={field.name}
									type="number"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="z.B. 730"
									disabled={isSubmitting}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Spielname</Label>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="z.B. Counter-Strike 2"
									disabled={isSubmitting}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="price">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Preis</Label>
								<Input
									id={field.name}
									name={field.name}
									type="text"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="z.B. 29.99"
									disabled={isSubmitting}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="publishedAt">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Veröffentlichungsdatum</Label>
								<Input
									id={field.name}
									name={field.name}
									type="date"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={isSubmitting}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="playerCountAllTime">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Spieleranzahl (Gesamt)</Label>
								<Input
									id={field.name}
									name={field.name}
									type="text"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="z.B. 1000000"
									disabled={isSubmitting}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="rating">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Bewertung (1-6)</Label>
								<Input
									id={field.name}
									name={field.name}
									type="number"
									min="1"
									max="6"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(Number.parseInt(e.target.value) || 1)
									}
									placeholder="z.B. 5"
									disabled={isSubmitting}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="franchiseId">
						{(field) => (
							<FranchiseSelector
								value={field.state.value || undefined}
								onChange={(franchiseId) => {
									field.handleChange(franchiseId || "");
								}}
							/>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="image">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Bild-URL (Optional)</Label>
								<Input
									id={field.name}
									name={field.name}
									type="url"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={isSubmitting}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="genres">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									Genre IDs (Optional, komma-getrennt)
								</Label>
								<Input
									id={field.name}
									name={field.name}
									type="text"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="z.B. 123e4567-e89b-12d3-a456-426614174000, 223e4567-e89b-12d3-a456-426614174001"
									disabled={isSubmitting}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="features">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									Feature IDs (Optional, komma-getrennt)
								</Label>
								<Input
									id={field.name}
									name={field.name}
									type="text"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="z.B. 323e4567-e89b-12d3-a456-426614174000, 423e4567-e89b-12d3-a456-426614174001"
									disabled={isSubmitting}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="operatingSystems">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									Betriebssystem IDs (Optional, komma-getrennt)
								</Label>
								<Input
									id={field.name}
									name={field.name}
									type="text"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="z.B. 523e4567-e89b-12d3-a456-426614174000, 623e4567-e89b-12d3-a456-426614174001"
									disabled={isSubmitting}
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<form.Subscribe
					selector={(state) => ({
						canSubmit: state.canSubmit,
						isSubmitting: state.isSubmitting,
					})}
				>
					{(state) => (
						<Button
							type="submit"
							className="w-full"
							disabled={!state.canSubmit || state.isSubmitting || isSubmitting}
						>
							{state.isSubmitting || isSubmitting
								? "Spiel wird hinzugefügt..."
								: "Spiel hinzufügen"}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}
