"use client";

import { useForm } from "@tanstack/react-form";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Frame, FrameFooter, FramePanel } from "@/components/ui/frame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectUrl = searchParams.get("redirectUrl") || "/";
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: () => {
						router.push(redirectUrl);
						toast.success("Sign up successful");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="mb-4">
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Home
					</Link>
				</div>
				<Frame className="relative flex min-w-0 flex-1 flex-col bg-muted/50 bg-clip-padding shadow-black/5 shadow-sm after:pointer-events-none after:absolute after:-inset-[5px] after:-z-1 after:rounded-[calc(var(--radius-2xl)+4px)] after:border after:border-border/50 after:bg-clip-padding lg:rounded-2xl lg:border dark:after:bg-background/72">
					<FramePanel>
						<h1 className="mb-4 font-heading text-2xl">Sign Up</h1>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								form.handleSubmit();
							}}
							className="space-y-3"
						>
							<form.Field
								name="name"
								validators={{
									onBlur: ({ value }) => {
										if (!value) return "Name is required";
										if (value.length < 2)
											return "Name must be at least 2 characters";
										return undefined;
									},
								}}
							>
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Name</Label>
										<Input
											id={field.name}
											name={field.name}
											type="text"
											placeholder="John Doe"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.isTouched &&
											!field.state.meta.isValidating &&
											field.state.meta.errors.length > 0 && (
												<p className="text-destructive text-xs">
													{field.state.meta.errors[0]}
												</p>
											)}
									</div>
								)}
							</form.Field>

							<form.Field
								name="email"
								validators={{
									onBlur: ({ value }) => {
										if (!value) return "Email is required";
										if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
											return "Invalid email address";
										return undefined;
									},
								}}
							>
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Email</Label>
										<Input
											id={field.name}
											name={field.name}
											type="email"
											placeholder="m@example.com"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.isTouched &&
											!field.state.meta.isValidating &&
											field.state.meta.errors.length > 0 && (
												<p className="text-destructive text-xs">
													{field.state.meta.errors[0]}
												</p>
											)}
									</div>
								)}
							</form.Field>

							<form.Field
								name="password"
								validators={{
									onBlur: ({ value }) => {
										if (!value) return "Password is required";
										if (value.length < 8)
											return "Password must be at least 8 characters";
										return undefined;
									},
								}}
							>
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Password</Label>
										<Input
											id={field.name}
											name={field.name}
											type="password"
											placeholder="password"
											autoComplete="new-password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.isTouched &&
											!field.state.meta.isValidating &&
											field.state.meta.errors.length > 0 && (
												<p className="text-destructive text-xs">
													{field.state.meta.errors[0]}
												</p>
											)}
									</div>
								)}
							</form.Field>

							<form.Subscribe
								selector={(state) => [state.canSubmit, state.isSubmitting]}
							>
								{([canSubmit, isSubmitting]) => (
									<Button
										type="submit"
										className="w-full"
										disabled={!canSubmit || isSubmitting}
									>
										{isSubmitting ? (
											<Loader2 size={16} className="animate-spin" />
										) : (
											"Sign Up"
										)}
									</Button>
								)}
							</form.Subscribe>
						</form>
					</FramePanel>

					<FrameFooter className="flex-row items-center justify-center">
						<p className="text-muted-foreground text-sm">
							Already have an account?{" "}
							<Link
								href={
									redirectUrl !== "/"
										? `/sign-in?redirectUrl=${encodeURIComponent(redirectUrl)}`
										: "/sign-in"
								}
								className="text-foreground hover:underline"
							>
								Sign in
							</Link>
						</p>
					</FrameFooter>
				</Frame>
			</div>
		</div>
	);
}
