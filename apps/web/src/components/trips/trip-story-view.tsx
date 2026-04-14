"use client";

import { motion } from "framer-motion";
import { CalendarDots, MapPin, Path, ShareNetworkIcon, Users } from "@phosphor-icons/react";
import { DEFAULT_IMAGE_PLACEHOLDER_URL, DEFAULT_USER_AVATAR_URL } from "@/lib/constants";
import Link from "next/link";
import { Button } from "../ui/button";
import { toast } from "sonner";

type StoryParticipant = {
  id: string;
  name: string;
  avatar: string | null;
  tags: string[];
};

type StoryVisitedPlace = {
  id: string;
  name: string;
  category: string;
  dayNumber: number | null;
  visitedAt: string;
  previewImage: string | null;
};

type TripStoryViewProps = {
  trip: {
    id: string;
    title: string;
    description: string | null;
    coverImage: string | null;
    startDate: string | null;
    endDate: string | null;
    startPoint: string | null;
    transportMode: string | null;
    transportNotes: string | null;
    dateFlexibility: "FIXED" | "MAY_CHANGE";
    participants: StoryParticipant[];
    visitedPlaces: StoryVisitedPlace[];
  };
};

function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function calculateTripDays(startDate: string | null, endDate: string | null) {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export function TripStoryView({ trip }: TripStoryViewProps) {
  const tripDays = calculateTripDays(trip.startDate, trip.endDate);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative"
      >
        <div>

          <div
            role="img"
            aria-label={`${trip.title} cover`}
            className="relative z-0 h-[380px] w-full bg-cover bg-center md:h-[540px]"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.45) 42%, rgba(0, 0, 0, 0.15) 72%, rgba(0, 0, 0, 0) 100%), url(${trip.coverImage || DEFAULT_IMAGE_PLACEHOLDER_URL})`,
            }}
          />
          <div className="absolute top-0 right-0 p-4 text-foreground md:p-6">
            <Button
              asChild
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/trips/${trip.id}/story`);
                toast.success("Link copied to clipboard");
              }}
              aria-label="Open shareable trip story"
              className="rounded-full border border-border bg-primary h-14 w-14 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ShareNetworkIcon className="h-8 w-8 P-2" weight="bold" />
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-20 h-32 bg-linear-to-b from-primary/35 via-primary/10 to-transparent blur-3xl" />
        <div className="relative z-30 mx-auto -mt-16 w-full max-w-5xl overflow-visible px-6 md:-mt-52 md:px-8">
          {/* <div className="pointer-events-none absolute top-10 left-1/2 -z-40 h-24 w-120 -translate-x-1/2 rounded-full bg-primary/55 blur-[80px]" /> */}
          <div className="rounded-2xl border border-border border-t-primary/50 border-t-4 border-r-primary/50 border-r-6 bg-card/95 p-5 backdrop-blur-sm md:p-7">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.4 }}
              className="flex justify-center items-center w-full"
            >
              <span className="inline-flex rounded-full text-center justify-center items-center border border-primary/35 bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <span className="text-primary">Konw</span> our Journey through Travel With Me
              </span>
            </motion.span>
       
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.55 }}
              className="my-6 text-center wrap-break-word text-3xl font-bold tracking-tight text-transparent md:text-6xl bg-linear-to-r from-primary via-primary/80 to-primary bg-clip-text drop-shadow-[0_6px_24px_rgba(14,116,144,0.35)]"
            >
              {trip.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.55 }}
              className="mt-2 max-w-4xl whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              {trip.description || "A shared chapter from this journey."}
            </motion.p>
          </div>
        </div>
      </motion.section>

      <div className="mx-auto mt-6 grid w-full max-w-5xl gap-8 px-6 pb-8 md:px-8 md:pb-10">
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="grid gap-3 rounded-2xl"
        >
          <h2 className="text-lg font-semibold text-center">At a Glance</h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { label: "Crew Size", value: `${trip.participants.length}` },
              { label: "Visited Stops", value: `${trip.visitedPlaces.length}` },
              { label: "Trip Days", value: tripDays ? `${tripDays}` : "Not set" },
              {
                label: "Date Plan",
                value: trip.dateFlexibility === "MAY_CHANGE" ? "Flexible" : "Fixed",
              },
            ].map((item) => (
              <motion.div
                key={item.label}
                variants={sectionVariants}
                className="rounded-xl border border-border bg-primary text-primary-foreground px-4 py-3"
              >
                <p className="font-bold uppercase tracking-wide text-primary-foreground">{item.label}</p>
                <p className="mt-1 text-xl font-semibold">{item.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="grid gap-3 rounded-2xl border border-border bg-card p-5"
        >
          <h2 className="text-lg font-semibold">Trip Logistics</h2>
          <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            <p className="inline-flex items-center gap-2">
              <CalendarDots className="h-4 w-4 text-primary" />
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </p>
            <p className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {trip.startPoint || "Start point not set"}
            </p>
            <p className="inline-flex items-center gap-2">
              <Path className="h-4 w-4 text-primary" />
              {trip.transportMode || "Transport mode not set"}
            </p>
            <p>
              Date plan:{" "}
              <span className="text-foreground">
                {trip.dateFlexibility === "MAY_CHANGE" ? "Flexible" : "Fixed"}
              </span>
            </p>
          </div>
          {trip.transportNotes ? (
            <p className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
              {trip.transportNotes}
            </p>
          ) : null}
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="grid gap-5 rounded-2xl"
        >
          <h2 className="gap-2 text-3xl font-semibold text-center my-4 tracking-tight">
            Crew Mates
          </h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-4 md:grid-cols-2"
          >
            {trip.participants.map((participant) => (
              <motion.div
                key={participant.id}
                variants={sectionVariants}
                className="group relative overflow-hidden rounded-2xl border border-primary/35 bg-primary/15 px-4 py-4 shadow-[-7px_-7px_14px_rgba(255,255,255,0.5),7px_7px_14px_rgba(14,116,144,0.3)] transition-transform duration-300 hover:-translate-y-0.5 dark:bg-primary/15 dark:shadow-[-7px_-7px_14px_rgba(255,255,255,0.02),7px_7px_14px_rgba(0,0,0,0.45)]"
              >
                <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-primary/30 blur-2xl dark:bg-primary/20" />
                <div className="relative z-10 flex min-w-0 items-center gap-3">
                  <div className="rounded-full bg-primary/20 p-1 shadow-[inset_2px_2px_4px_rgba(14,116,144,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] dark:bg-primary/20 dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.03)]">
                    <img
                      src={participant.avatar || DEFAULT_USER_AVATAR_URL}
                      alt={participant.name}
                      className="h-12 w-12 rounded-full border border-black/5 object-cover dark:border-white/10"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {participant.name}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {(participant.tags.length > 0 ? participant.tags : ["Crew Member"]).map((tag) => (
                        <span
                          key={`${participant.id}-${tag}`}
                          className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-4 rounded-2xl"
        >
          <h2 className="text-3xl font-semibold text-center my-4">Journey Timeline</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {trip.visitedPlaces.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-background px-3 py-4 text-sm text-muted-foreground">
                No locations were added yet.
              </p>
            ) : (
              trip.visitedPlaces.map((place, index) => (
                <motion.article
                  key={place.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-background"
                >
                  <img
                    src={place.previewImage || DEFAULT_IMAGE_PLACEHOLDER_URL}
                    alt={place.name}
                    className="h-56 w-full bg-white/30 backdrop-blur-3xl object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-background via-background/45 to-transparent" />
                  <div className="absolute top-3 right-3 rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Stop {index + 1}
                  </div>
                  <div className="absolute right-0 bottom-0 left-0 grid gap-1 p-4">
                    <p className="text-lg font-semibold text-foreground">{place.name}</p>
                    <p className="text-xs text-foreground/90">
                      Day {place.dayNumber ?? "-"} · {place.category.toLowerCase().replaceAll("_", " ")}
                    </p>
                    <p className="text-xs text-foreground/80">
                      {new Date(place.visitedAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.article>
              ))
            )}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
