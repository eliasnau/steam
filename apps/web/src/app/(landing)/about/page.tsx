import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
	return (
		<div className="relative min-h-screen bg-background">
			<div className="absolute inset-0 -z-10">
				<div className="absolute inset-0 bg-background" />
				<div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
				<div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
				<div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.7_0.2_180_/_0.03)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.7_0.2_180_/_0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
				<div className="absolute top-1/3 left-1/4 h-[600px] w-[600px] rounded-full bg-[#72F5F8]/20 blur-[150px]" />
				<div className="absolute right-1/4 bottom-1/3 h-[400px] w-[400px] rounded-full bg-neon-pink/8 blur-[120px]" />
			</div>

			<div className="mx-auto max-w-4xl px-6 py-24">
				<div className="mb-6">
					<Link href="/">
						<Button
							variant="ghost"
							className="gap-2 text-[#51A9F3] hover:bg-[#72F5F8]/15 hover:text-[#51A9F3]"
						>
							<ArrowLeft className="h-4 w-4" />
							<span className="font-bold text-xs tracking-[0.14em] uppercase">
								Zurück
							</span>
						</Button>
					</Link>
				</div>

				<h1 className="text-center [font-family:var(--font-lemon-milk-bold)] text-4xl tracking-tight md:text-6xl">
					<span className="bg-linear-to-b from-[#51A9F3] to-[#72F5F8] bg-clip-text text-transparent">
						ÜBER DAS PROJEKT
					</span>
				</h1>

				<div className="mx-auto mt-10 space-y-6 rounded-2xl border border-border/50 bg-card/40 p-8 text-muted-foreground text-lg leading-relaxed backdrop-blur-sm">
					<p>
						Digitale Spiele sind in Deutschland zu einer der populärsten
						Freizeitaktivitäten geworden und erobern immer mehr Bildschirme,
						Konsolen, Smartphones und Tablets.
					</p>
					<p>
						Aktuelle Zahlen aus dem Jahr 2025 belegen diese Entwicklung: Rund 54
						Prozent der Deutschen spielen gelegentlich Computerspiele oder
						Videospiele. Besonders in der Altersgruppe der 16- bis 29-Jährigen
						liegt die Quote bei beeindruckenden 89 Prozent, doch auch ältere
						Generationen bleiben nicht außen vor – mehr als 22 Prozent der über
						65-Jährigen greifen noch regelmäßig zu Spielen. Bereits 2022 besaßen
						28,9 Prozent der deutschen Haushalte mindestens eine Spielekonsole,
						was etwa 20,8 Millionen Spielern entspricht. Ergänzt wird dieses
						Bild durch die Smartphone-Plattform, die mit 22,9 Millionen Nutzern
						die beliebteste Gaming-Option darstellt.
					</p>
					<p>
						Da uns Computerspiele faszinieren, kamen wir auf die Idee, unser
						Projekt diesem Thema zu widmen. Wir sehen hierbei eine Chance, aus
						dem Unterricht gesammeltes Wissen über Datenbanken praktisch
						anzuwenden: Wir speichern detaillierte Informationen zu
						Computerspielen wie Titel, Entwickler, Genre, Bewertung, Preis und
						stellen eine Auswertung für den Betrachter in Form von Graphiken
						dar; denn die Datenbank ermöglicht uns nicht nur das einfache
						Hinzufügen und Bearbeiten von Einträgen, sondern auch Such- und
						Filterfunktionen, um z. B. die besten Shooter-Spiele einer Konsole
						schnell zu finden und eigene Statistiken auszuwerten
					</p>
				</div>
			</div>
		</div>
	);
}
