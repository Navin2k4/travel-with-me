import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Users,
  Receipt,
  MapPinLine,
  Coins,
  CalendarBlank,
  AirplaneTilt,
  Bus,
  Car,
  Train,
  Bicycle,
  Boat,
  PersonSimpleWalk,
  NavigationArrow
} from "@phosphor-icons/react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import { DEFAULT_USER_AVATAR_URL } from "@/lib/constants";

type ParticipantView = {
  id: string;
  name: string;
  avatar: string | null;
  tags: Array<{ id: string; label: string }>;
};

type ExpenseView = {
  id: string;
  title: string;
  notes: string | null;
  paidById: string;
  paidByName: string;
  splitType: "EQUAL" | "EXACT_AMOUNT" | "PERCENTAGE" | "SHARES";
  paymentMode: "CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "WALLET" | "OTHER";
  category: string;
  customCategory: string | null;
  amount: number;
  currency: string;
  splits: Array<{
    userName: string;
    amount: number;
    percentageBp: number | null;
    shares: number | null;
  }>;
};

type TripDashboardTabProps = {
  trip: {
    id: string;
    title: string;
    description: string | null;
    coverImage: string | null;
    status: "PLANNING" | "STARTED" | "ONGOING" | "ENDED";
    startPoint: string | null;
    dateFlexibility: "FIXED" | "MAY_CHANGE";
    transportMode: "FLIGHT" | "TRAIN" | "BUS" | "CAR" | "BIKE" | "SHIP" | "WALK" | "OTHER" | null;
    transportNotes: string | null;
    startDate: string | null;
    endDate: string | null;
  };
  participants: ParticipantView[];
  expenses: ExpenseView[];
  totalSpend: number;
  expenseByCategory: Array<{
    category: string;
    total: number;
    count: number;
    subcategories: Array<{ name: string; total: number; count: number }>;
  }>;
  totalVisitedPlaces: number;
  averagePlaceRating: number | null;
};

function getTransportIcon(mode: string | null) {
  switch (mode) {
    case "FLIGHT": return <AirplaneTilt weight="fill" className="text-muted-foreground" />;
    case "TRAIN": return <Train weight="fill" className="text-muted-foreground" />;
    case "BUS": return <Bus weight="fill" className="text-muted-foreground" />;
    case "CAR": return <Car weight="fill" className="text-muted-foreground" />;
    case "BIKE": return <Bicycle weight="fill" className="text-muted-foreground" />;
    case "SHIP": return <Boat weight="fill" className="text-muted-foreground" />;
    case "WALK": return <PersonSimpleWalk weight="fill" className="text-muted-foreground" />;
    default: return <NavigationArrow weight="fill" className="text-muted-foreground" />;
  }
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NA";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
}

export function TripDashboardTab({
  trip,
  participants,
  expenses,
  totalSpend,
  expenseByCategory,
  totalVisitedPlaces,
  averagePlaceRating,
}: TripDashboardTabProps) {
  const visibleMembers = participants.slice(0, 6);
  const remainingMembers = Math.max(participants.length - visibleMembers.length, 0);
  const barRowsBase = expenseByCategory.slice(0, 6).map((group, index) => ({
    key: `bar-${index + 1}`,
    category: group.category,
    amount: group.total,
    color:
      index === 0
        ? "color-mix(in oklch, var(--primary) 90%, transparent)"
        : index === 1
          ? "color-mix(in oklch, var(--primary) 80%, transparent)"
          : index === 2
            ? "color-mix(in oklch, var(--primary) 70%, transparent)"
            : index === 3
              ? "color-mix(in oklch, var(--primary) 60%, transparent)"
              : index === 4
                ? "color-mix(in oklch, var(--primary) 50%, transparent)"
                : "color-mix(in oklch, var(--primary) 40%, transparent)",
  }));
  const remainingTotal = expenseByCategory
    .slice(6)
    .reduce((sum, group) => sum + group.total, 0);
  const barRows = remainingTotal > 0
    ? [
      ...barRowsBase,
      {
        key: "bar-other",
        category: "Other",
        amount: remainingTotal,
        color: "color-mix(in oklch, var(--primary) 30%, transparent)",
      },
    ]
    : barRowsBase;
  const chartConfig: ChartConfig = barRows.reduce<ChartConfig>(
    (config, row) => {
      config[row.key] = {
        label: row.category,
        color: row.color,
      };
      return config;
    },
    {
      amount: {
        label: "Amount",
      },
    },
  );

  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-border">
          <CardContent className="flex h-full flex-col justify-between gap-2 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Spend</span>
              <Coins className="h-5 w-5 text-muted-foreground" weight="fill" />
            </div>
            <div>
              <div className="text-2xl font-semibold tracking-tight text-foreground">{formatCurrency(totalSpend)}</div>
              <div className="mt-1 text-xs text-muted-foreground">{expenses.length} expenses</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex h-full flex-col justify-between gap-2 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Members</span>
              <Users className="h-5 w-5 text-muted-foreground" weight="fill" />
            </div>
            <div>
              <div className="text-2xl font-semibold tracking-tight text-foreground">{participants.length}</div>
              <div className="mt-1 text-xs text-muted-foreground">Active members</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex h-full flex-col justify-between gap-2 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Places Visited</span>
              <MapPinLine className="h-5 w-5 text-muted-foreground" weight="bold" />
            </div>
            <div>
              <div className="text-2xl font-semibold tracking-tight text-foreground">{totalVisitedPlaces}</div>
              <div className="mt-1 text-xs text-muted-foreground">Avg rating: {averagePlaceRating ? averagePlaceRating.toFixed(1) : "N/A"}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex h-full flex-col justify-between gap-2 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <CalendarBlank className="h-5 w-5 text-muted-foreground" weight="bold" />
            </div>
            <div>
              <div className="text-xl font-semibold tracking-tight capitalize text-foreground">{trip.status.toLowerCase()}</div>
              <div className="mt-1 text-xs text-muted-foreground">{trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "No start date"}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-6">
          <div className="overflow-hidden border-border">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Expense Breakdown</h3>
              </div>
              <Badge variant="secondary">
                {expenseByCategory.length} Categories
              </Badge>
            </div>
            <div className="py-4">
              {totalSpend === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 py-8 text-center">
                  <Coins className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">No expenses recorded yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Start adding expenses to see your spending breakdown.</p>
                </div>
              ) : (
                <div>
                  <ChartContainer
                    config={chartConfig}
                    className="h-[320px]"
                  >
                    <BarChart
                      accessibilityLayer
                      data={barRows}
                      layout="vertical"
                      margin={{ left: 0, right: 8 }}
                    >
                      <YAxis
                        dataKey="category"
                        type="category"
                        tickLine={false}
                        tickMargin={8}
                        axisLine={false}
                        hide
                      />
                      <XAxis dataKey="amount" type="number" hide />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            hideLabel
                            formatter={(value, name) => (
                              <div className="flex w-full items-center justify-between gap-2">
                                <span className="text-muted-foreground">{name}</span>
                                <span className="font-medium text-foreground">
                                  {formatCurrency(Number(value))}
                                </span>
                              </div>
                            )}
                          />
                        }
                      />
                      <Bar
                        dataKey="amount"
                        radius={8}
                        fill="var(--color-bar-1)"
                      >
                        {barRows.map((row) => (
                          <Cell key={`cell-${row.key}`} fill={`var(--color-${row.key})`} />
                        ))}
                        <LabelList
                          dataKey="category"
                          position="insideLeft"
                          offset={6}
                          className="fill-foreground text-xs font-medium"
                        />
                        <LabelList
                          dataKey="amount"
                          position="right"
                          offset={8}
                          className="fill-foreground"
                        />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 h-fit">
          <Card className="overflow-hidden border-border">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted/40">
                  {getTransportIcon(trip.transportMode)}
                </div>
                <div>
                  <h2 className="truncate text-lg font-semibold leading-tight text-foreground" title={trip.title}>
                    {trip.title}
                  </h2>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                    {trip.startPoint || "Unknown departure"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarBlank className="h-4 w-4" />
                    Timeline
                  </span>
                  <span className="text-right font-medium text-foreground">
                    {trip.startDate ? new Date(trip.startDate).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : "?"} 
                    {" "}-{" "} 
                    {trip.endDate ? new Date(trip.endDate).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : "?"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <NavigationArrow className="h-4 w-4" />
                    Transport
                  </span>
                  <span className="font-medium capitalize text-foreground">
                    {trip.transportMode?.toLowerCase() || "Not set"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <AirplaneTilt className="h-4 w-4" />
                    Flexibility
                  </span>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                    {trip.dateFlexibility.replace("_", " ")}
                  </span>
                </div>
              </div>
              
              {trip.description && (
                <div className="mt-5 rounded-xl border border-border bg-muted/20 p-3">
                  <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    "{trip.description}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Trip Members</h3>
              </div>
              <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                {participants.length} total
              </span>
            </div>
            <CardContent className="grid gap-4 p-5">
              <AvatarGroup className="grayscale">
                {visibleMembers.map((member) => (
                  <Avatar key={member.id}>
                    <AvatarImage src={member.avatar || DEFAULT_USER_AVATAR_URL} alt={member.name} />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                ))}
                {remainingMembers > 0 ? <AvatarGroupCount>+{remainingMembers}</AvatarGroupCount> : null}
              </AvatarGroup>
              <div className="space-y-1 flex flex-wrap gap-2">
                {visibleMembers.map((member) => (
                  <p key={`member-name-${member.id}`} className="bg-primary/30 w-fit px-2 py-1 rounded-2xl truncate text-sm text-muted-foreground">
                    {member.name}
                  </p>
                ))}
                {remainingMembers > 0 ? (
                  <p className="text-sm text-muted-foreground">and {remainingMembers} more...</p>
                ) : null}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
