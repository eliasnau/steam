"use client";

import {
	Building2,
	Gamepad2Icon,
	ShapesIcon,
	TagIcon,
} from "lucide-react";
import DashboardNavigation from "./nav-main";
import { UserButton } from "./user-button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { NavRoute } from "./nav-main";
import Image from "next/image"
import { Binary } from "@/components/animate-ui/icons/binary";

const dashboardRoutes: NavRoute[] = [
	{
		id: "games",
		title: "Spiele",
		icon: <Gamepad2Icon className="size-4" />,
		link: "/admin/games",
	},
	{
		id: "tags",
		title: "Tags",
		icon: <TagIcon className="size-4" />,
		link: "/admin/tags",
	},
	{
		id: "genre",
		title: "Genre",
		icon: <ShapesIcon className="size-4" />,
		link: "/admin/genres",
	},
	{
		id: "developers",
		title: "Developers",
		icon: <Binary className="size-4" size={16} />,
		link: "/admin/developers",
	},
	{
		id: "publishers",
		title: "Publishers",
		icon: <Building2 className="size-4" />,
		link: "/admin/publishers",
	},
];

export function DashboardSidebar() {
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

	return (
		<Sidebar variant="inset" collapsible="icon">
			<SidebarHeader
				className={cn(
					"flex md:pt-3.5",
					isCollapsed
						? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
						: "flex-row items-center justify-between",
				)}
			>
				<div>
					<Image src={"/logo.svg"} alt={""} width={130} height={130}/>
				</div>
				<div
					className={cn(
						"flex items-center gap-2",
						isCollapsed ? "flex-row md:flex-col-reverse" : "flex-row",
					)}
				>
					<SidebarTrigger />
				</div>
			</SidebarHeader>
			{/* <div className="px-2 pt-4">
				<CommandSearch />
			</div> */}
			<SidebarContent className="gap-4 px-2 py-4">
				<DashboardNavigation routes={dashboardRoutes} />
			</SidebarContent>
			<SidebarFooter className="px-2">
				<UserButton />
			</SidebarFooter>
		</Sidebar>
	);
}
