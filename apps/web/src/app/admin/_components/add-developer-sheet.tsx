"use client";

import { ORPCError } from "@orpc/client";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const addDeveloperMutation = async (data: { name: string }) => {
	const result = await client.developers.create(data);
	return result;
};

interface AddDeveloperSheetProps {
	trigger?: ReactNode;
	renderTrigger?:
		| React.ReactElement
		| ((props: any, state: any) => React.ReactElement);
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onCreated?: (developer: { id: string; name: string }) => void;
}

export default function AddDeveloperSheet({
	trigger,
	renderTrigger,
	open,
	onOpenChange,
	onCreated,
}: AddDeveloperSheetProps) {
	const mutation = useMutation({
		mutationFn: addDeveloperMutation,
		onSuccess: (data) => {
			toast.success(
				`Entwickler "${data.developer.name}" erfolgreich erstellt!`,
			);
			form.reset();
			onCreated?.(data.developer);
			if (onOpenChange) {
				onOpenChange(true);
			}
		},
		onError: (error: Error) => {
			let errorMessage = "Der Entwickler konnte nicht erstellt werden";

			if (error instanceof ORPCError) {
				if (error.code === "UNAUTHORIZED") {
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
			name: "",
		},
		onSubmit: async ({ value }) => {
			mutation.mutate(value);
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(1, "Name ist erforderlich"),
			}),
		},
	});

	const isSubmitting = mutation.isPending;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			{!renderTrigger && !trigger && <SheetTrigger />}
			{renderTrigger && trigger && <SheetTrigger render={renderTrigger}>{trigger}</SheetTrigger>}
			<SheetPopup side="right" inset>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="flex h-full flex-col"
				>
					<SheetHeader>
						<SheetTitle>Neuen Entwickler erstellen</SheetTitle>
						<SheetDescription>
							Füge einen neuen Entwickler zur Datenbank hinzu.
						</SheetDescription>
					</SheetHeader>
					<SheetPanel>
						<form.Field name="name">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Entwickler Name</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="z.B. Valve"
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
					</SheetPanel>

					<SheetFooter>
						<SheetClose
							render={
								<Button
									type="button"
									variant="outline"
									disabled={isSubmitting}
								/>
							}
						>
							Abbrechen
						</SheetClose>
						<form.Subscribe
							selector={(state) => ({
								canSubmit: state.canSubmit,
								isSubmitting: state.isSubmitting,
							})}
						>
							{(state) => (
								<Button
									type="submit"
									disabled={
										!state.canSubmit || state.isSubmitting || isSubmitting
									}
								>
									{state.isSubmitting || isSubmitting
										? "Wird erstellt..."
										: "Entwickler erstellen"}
								</Button>
							)}
						</form.Subscribe>
					</SheetFooter>
				</form>
			</SheetPopup>
		</Sheet>
	);
}
