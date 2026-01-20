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

const addOperatingSystemMutation = async (data: { name: string }) => {
	const result = await client.operatingSystems.create(data);
	return result;
};

interface AddOperatingSystemSheetProps {
	trigger?: ReactNode;
	renderTrigger?:
		| React.ReactElement
		| ((props: any, state: any) => React.ReactElement);
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onCreated?: (operatingSystem: { id: string; name: string }) => void;
}

export default function AddOperatingSystemSheet({
	trigger,
	renderTrigger,
	open,
	onOpenChange,
	onCreated,
}: AddOperatingSystemSheetProps) {
	const mutation = useMutation({
		mutationFn: addOperatingSystemMutation,
		onSuccess: (data) => {
			toast.success(
				`Betriebssystem "${data.operatingSystem.name}" erfolgreich erstellt!`,
			);
			form.reset();
			onCreated?.({
				id: data.operatingSystem.id,
				name: data.operatingSystem.name,
			});
			if (onOpenChange) {
				onOpenChange(true);
			}
		},
		onError: (error: Error) => {
			let errorMessage = "Das Betriebssystem konnte nicht erstellt werden";

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
			{trigger && <SheetTrigger>{trigger}</SheetTrigger>}
			{renderTrigger && <SheetTrigger render={renderTrigger} />}
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
						<SheetTitle>Neues Betriebssystem erstellen</SheetTitle>
						<SheetDescription>
							Füge ein neues Betriebssystem zur Datenbank hinzu.
						</SheetDescription>
					</SheetHeader>
					<SheetPanel>
						<form.Field name="name">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Betriebssystem Name</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="z.B. Windows"
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
						<SheetClose>
							<Button type="button" variant="outline" disabled={isSubmitting}>
								Abbrechen
							</Button>
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
										: "Betriebssystem erstellen"}
								</Button>
							)}
						</form.Subscribe>
					</SheetFooter>
				</form>
			</SheetPopup>
		</Sheet>
	);
}
